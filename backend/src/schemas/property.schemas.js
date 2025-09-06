import { z } from 'zod';

export const createPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be less than 2000 characters'),
  location: z.string().min(5, 'Location must be at least 5 characters').max(200, 'Location must be less than 200 characters'),
  city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City must be less than 100 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters').max(100, 'Country must be less than 100 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(500, 'Address must be less than 500 characters'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  price: z.number().positive('Price must be positive'),
  pricePerNight: z.boolean().default(true),
  // Allow either record<boolean> or array of strings
  amenities: z.union([z.record(z.boolean()), z.array(z.string())]).default({}),
  media: z.array(z.object({
    type: z.enum(['image', 'video']),
    url: z.string().url(),
    caption: z.string().optional(),
    isPrimary: z.boolean().default(false)
  })).min(1, 'At least one media file is required'),
  maxGuests: z.number().int().min(1, 'Max guests must be at least 1').max(20, 'Max guests cannot exceed 20'),
  bedrooms: z.number().int().min(1, 'Bedrooms must be at least 1').max(20, 'Bedrooms cannot exceed 20'),
  bathrooms: z.number().int().min(1, 'Bathrooms must be at least 1').max(20, 'Bathrooms cannot exceed 20'),
  propertyType: z.enum(['apartment', 'house', 'villa', 'cabin', 'condo', 'loft', 'studio', 'other']),
  instantBooking: z.boolean().default(false),
  // New UI fields
  initialRating: z.number().min(0).max(5).optional(),
  headerRibbonText: z.string().max(120).optional(),
  headerRibbonPrice: z.number().min(0).optional(),
  nearbyAttractions: z.array(z.string()).optional(),
  videos: z.array(z.string().url()).optional(),
  // Optional mapping to region/destination
  regionId: z.number().int().optional(),
  destinationId: z.number().int().optional(),
  // Seasonal pricing ranges
  pricingRanges: z.array(z.object({
    category: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    rate: z.number().min(0),
    minStay: z.number().int().min(1).optional()
  })).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertyFilterSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minGuests: z.number().int().min(1).optional(),
  maxGuests: z.number().int().min(1).optional(),
  propertyType: z.enum(['apartment', 'house', 'villa', 'cabin', 'condo', 'loft', 'studio', 'other']).optional(),
  amenities: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  instantBooking: z.boolean().optional()
});

export const propertyApprovalSchema = z.object({
  status: z.enum(['LIVE', 'REJECTED', 'SUSPENDED']),
  adminNotes: z.string().max(1000, 'Admin notes must be less than 1000 characters').optional()
});