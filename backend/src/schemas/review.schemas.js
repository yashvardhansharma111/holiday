import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(500, 'Comment must be less than 500 characters'),
  bookingId: z.number().int().optional() // Optional: link to specific booking
});

export const updateReviewSchema = createReviewSchema.partial();

export const reviewFilterSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  verified: z.enum(['true', 'false']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const adminResponseSchema = z.object({
  adminResponse: z.string().min(5, 'Admin response must be at least 5 characters').max(1000, 'Admin response must be less than 1000 characters')
}); 