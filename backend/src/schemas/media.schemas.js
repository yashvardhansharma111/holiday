import { z } from 'zod';

export const uploadFileSchema = z.object({
  file: z.any(), // Multer file object
  caption: z.string().max(200, 'Caption must be less than 200 characters').optional(),
  isPrimary: z.boolean().default(false)
});

export const generatePresignedUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  folder: z.string().optional().default('general')
});

export const deleteFileSchema = z.object({
  fileUrl: z.string().url('File URL must be valid')
});

export const fileInfoSchema = z.object({
  fileUrl: z.string().url('File URL must be valid')
}); 