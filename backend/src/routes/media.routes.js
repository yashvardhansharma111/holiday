import express from 'express';
import multer from 'multer';
import { requireAuth, requireRole } from '../middleware/auth.js';
import S3Service from '../services/s3.service.js';
import prisma from '../db.js';
import { successResponse, errorResponse, ERROR_MESSAGES, HTTP_STATUS } from '../utils/responses.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/ogg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  }
});

// New: Public upload endpoint to consume DB-backed presigned URLs (tokenized)
// Method must be PUT and body is raw binary; content-type must match token's mimeType (best effort)
router.put('/upload/:token', express.raw({ type: '*/*', limit: process.env.MAX_FILE_SIZE || '10mb' }), async (req, res) => {
  try {
    const { token } = req.params;
    const now = new Date();
    const uploadToken = await prisma.uploadToken.findUnique({ where: { token } });
    if (!uploadToken || uploadToken.used || uploadToken.expiresAt <= now) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Invalid or expired upload URL', HTTP_STATUS.BAD_REQUEST)
      );
    }

    const mimeType = req.header('content-type') || uploadToken.mimeType || 'application/octet-stream';
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
    const size = buffer.length;

    await prisma.mediaFile.create({
      data: {
        key: uploadToken.key,
        mimeType,
        size,
        data: buffer,
      },
    });

    await prisma.uploadToken.update({ where: { token }, data: { used: true } });

    return res.status(HTTP_STATUS.CREATED).json(
      successResponse({ key: uploadToken.key, url: `${req.protocol}://${req.get('host')}/api/media/f/${encodeURIComponent(uploadToken.key)}` }, 'File uploaded')
    );
  } catch (error) {
    console.error('Token upload error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to upload file', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
});

// Generate presigned URL for direct upload
router.post('/presigned-url', requireAuth, async (req, res) => {
  try {
    const { fileType, fileName, folder = 'properties' } = req.body;
    
    if (!fileType || !fileName) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('File type and file name are required', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    const presignedData = await S3Service.generatePresignedUrl(fileType, fileName, folder);
    
    res.json(successResponse(presignedData, 'Presigned URL generated successfully'));
  } catch (error) {
    console.error('Generate presigned URL error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to generate presigned URL', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
});

// Upload file directly (for smaller files)
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('No file provided', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Validate file
    S3Service.validateFile(req.file);
    
    // Upload to S3
    const folder = req.body.folder || 'properties';
    const uploadResult = await S3Service.uploadFile(req.file, folder);
    
    res.status(HTTP_STATUS.CREATED).json(
      successResponse(uploadResult, 'File uploaded successfully', HTTP_STATUS.CREATED)
    );
  } catch (error) {
    console.error('File upload error:', error);
    res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse(error.message || 'File upload failed', HTTP_STATUS.BAD_REQUEST)
    );
  }
});

// Upload multiple files
router.post('/upload-multiple', requireAuth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('No files provided', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    if (req.files.length > 10) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Maximum 10 files allowed per upload', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    const folder = req.body.folder || 'properties';
    const uploadResults = [];
    
    for (const file of req.files) {
      try {
        // Validate file
        S3Service.validateFile(file);
        
        // Upload to S3
        const uploadResult = await S3Service.uploadFile(file, folder);
        uploadResults.push(uploadResult);
      } catch (error) {
        console.error(`Failed to upload file ${file.originalname}:`, error);
        uploadResults.push({
          originalName: file.originalname,
          error: error.message
        });
      }
    }
    
    res.status(HTTP_STATUS.CREATED).json(
      successResponse(uploadResults, 'Files uploaded successfully', HTTP_STATUS.CREATED)
    );
  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Multiple file upload failed', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
});

// Delete file from S3
router.delete('/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('File key is required', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Delete from S3
    await S3Service.deleteFile(key);
    
    res.json(successResponse(null, 'File deleted successfully'));
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to delete file', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
});

// Generate view URL for file
router.get('/view/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;
    const { expiresIn = 3600 } = req.query;
    
    if (!key) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('File key is required', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Generate view URL
    const viewUrl = await S3Service.generateViewUrl(key, Number(expiresIn));
    
    res.json(successResponse({ viewUrl, key }, 'View URL generated successfully'));
  } catch (error) {
    console.error('Generate view URL error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to generate view URL', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
});

// Get file information
router.get('/info/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('File key is required', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Generate view URL for metadata
    const viewUrl = await S3Service.generateViewUrl(key, 3600);
    
    const fileInfo = {
      key,
      url: viewUrl,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION
    };
    
    res.json(successResponse(fileInfo, 'File information retrieved successfully'));
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to get file information', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('File too large. Maximum size is 10MB', HTTP_STATUS.BAD_REQUEST)
      );
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Too many files. Maximum 10 files allowed', HTTP_STATUS.BAD_REQUEST)
      );
    }
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse('File upload error', HTTP_STATUS.BAD_REQUEST)
    );
  }
  
  if (error.message) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse(error.message, HTTP_STATUS.BAD_REQUEST)
    );
  }
  
  next(error);
});

export default router; 