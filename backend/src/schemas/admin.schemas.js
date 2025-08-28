import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'AGENT', 'OWNER', 'USER']).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  isActive: z.boolean().optional()
});

export const userFilterSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'AGENT', 'OWNER', 'USER']).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const analyticsFilterSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const deleteUserSchema = z.object({
  reason: z.string().min(5, 'Deletion reason must be at least 5 characters').max(500, 'Deletion reason must be less than 500 characters')
}); 