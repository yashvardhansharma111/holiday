import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(5000).optional(),
  category: z.string().max(100).optional(),
  // Location
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  // Time
  startDateTime: z.string().datetime({ message: 'startDateTime must be an ISO date-time' }),
  endDateTime: z.string().datetime({ message: 'endDateTime must be an ISO date-time' }),
  timezone: z.string().max(100).optional(),
  // Media & tags
  images: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
});

export const updateEventSchema = createEventSchema.partial();
