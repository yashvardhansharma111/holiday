import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export class S3Service {
  // Generate presigned URL for direct upload
  static async generatePresignedUrl(fileType, fileName, folder = 'properties') {
    const key = `${folder}/${uuidv4()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      Expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    try {
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
      return {
        presignedUrl,
        key,
        url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
      };
    } catch (error) {
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  // Delete file from S3
  static async deleteFile(key) {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    try {
      await s3Client.send(command);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Generate presigned URL for viewing/downloading
  static async generateViewUrl(key, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    try {
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      return presignedUrl;
    } catch (error) {
      throw new Error(`Failed to generate view URL: ${error.message}`);
    }
  }

  // Upload file directly (for smaller files)
  static async uploadFile(file, folder = 'properties') {
    const key = `${folder}/${uuidv4()}-${file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    try {
      await s3Client.send(command);
      return {
        key,
        url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        size: file.size,
        type: file.mimetype
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
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
      'video/ogg'
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