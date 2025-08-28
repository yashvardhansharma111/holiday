import { z } from 'zod';

export const createBookingSchema = z.object({
  propertyId: z.number().int().positive('Property ID must be positive'),
  startDate: z.string().datetime('Start date must be a valid date'),
  endDate: z.string().datetime('End date must be a valid date'),
  guests: z.number().int().min(1, 'Guests must be at least 1').max(20, 'Guests cannot exceed 20'),
  specialRequests: z.string().max(500, 'Special requests must be less than 500 characters').optional()
});

export const updateBookingSchema = createBookingSchema.partial();

export const bookingFilterSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minGuests: z.number().int().min(1).optional(),
  maxGuests: z.number().int().min(1).optional()
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(5, 'Cancellation reason must be at least 5 characters').max(500, 'Cancellation reason must be less than 500 characters')
});

export const confirmBookingSchema = z.object({
  adminNotes: z.string().max(1000, 'Admin notes must be less than 1000 characters').optional()
}); 