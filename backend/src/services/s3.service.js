import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db.js';

function getPublicApiBaseUrl() {
  const envUrl = process.env.BACKEND_PUBLIC_URL || process.env.API_PUBLIC_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const port = process.env.PORT || '8000';
  return `http://localhost:${port}`;
}

function buildFileUrl(key) {
  const base = getPublicApiBaseUrl();
  return `${base}/api/media/f/${encodeURIComponent(key)}`;
}

export class S3Service {
  // Generate presigned URL for direct upload (DB-backed)
  static async generatePresignedUrl(fileType, fileName, folder = 'properties') {
    const key = `${folder}/${uuidv4()}-${fileName}`;
    const token = uuidv4().replace(/-/g, '');
    const ttlSec = 900; // 15 minutes
    const expiresAt = new Date(Date.now() + ttlSec * 1000);

    await prisma.uploadToken.create({
      data: {
        token,
        key,
        mimeType: String(fileType),
        size: null,
        expiresAt,
      },
    });

    const presignedUrl = `${getPublicApiBaseUrl()}/api/media/upload/${token}`;
    return {
      presignedUrl,
      key,
      url: buildFileUrl(key),
    };
  }

  // Delete file from DB
  static async deleteFile(key) {
    try {
      await prisma.mediaFile.delete({ where: { key } });
      return true;
    } catch (error) {
      // If not found, treat as success for idempotency
      return true;
    }
  }

  // Generate view URL (DB-backed): return our public URL
  static async generateViewUrl(key, _expiresIn = 3600) {
    return buildFileUrl(key);
  }

  // Upload file directly (multer) into DB
  static async uploadFile(file, folder = 'properties') {
    const key = `${folder}/${uuidv4()}-${file.originalname}`;
    await prisma.mediaFile.create({
      data: {
        key,
        mimeType: file.mimetype,
        size: file.size,
        data: file.buffer,
      },
    });
    return {
      key,
      url: buildFileUrl(key),
      size: file.size,
      type: file.mimetype,
    };
  }

  // Validate file type and size
  static validateFile(file, maxSize = 10 * 1024 * 1024) { // 10MB default
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/ogg',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only images and videos are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
    }

    return true;
  }
}

export default S3Service;
 