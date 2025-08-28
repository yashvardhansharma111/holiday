import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  planId: z.number().int().positive('Plan ID must be positive')
});

export const updateSubscriptionSchema = z.object({
  planId: z.number().int().positive('New plan ID must be positive')
});

export const subscriptionPlanSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters').max(100, 'Plan name must be less than 100 characters'),
  type: z.string().min(2, 'Plan type must be at least 2 characters').max(50, 'Plan type must be less than 50 characters'),
  price: z.number().positive('Price must be positive'),
  durationDays: z.number().int().positive('Duration must be positive'),
  maxProperties: z.number().int().positive('Max properties must be positive'),
  features: z.record(z.any()).default({}),
  isActive: z.boolean().default(true)
});

export const updateSubscriptionPlanSchema = subscriptionPlanSchema.partial(); 