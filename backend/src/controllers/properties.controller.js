import { z } from 'zod';
import prisma from '../db.js';
import { successResponse, errorResponse, ERROR_MESSAGES, HTTP_STATUS } from '../utils/responses.js';
import { S3Service } from '../services/s3.service.js';
import SubscriptionService from '../services/subscription.service.js';
import { 
  createPropertySchema, 
  updatePropertySchema, 
  propertyFilterSchema,
  propertyApprovalSchema 
} from '../schemas/index.js';
import { 
  buildSearchQuery, 
  buildFilterQuery, 
  paginateResults, 
  generatePropertyId 
} from '../utils/responses.js';

// PUBLIC: List live properties with advanced filters
export const listPublic = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search, 
      city, 
      country,
      minPrice, 
      maxPrice, 
      minGuests,
      maxGuests,
      propertyType,
      amenities,
      checkIn,
      checkOut,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build where clause
    const where = { status: 'LIVE' };
    
    // Search functionality
    if (search) {
      const searchQuery = buildSearchQuery(search, ['title', 'description', 'location', 'city']);
      Object.assign(where, searchQuery);
    }
    
    // Location filters
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (country) where.country = { contains: country, mode: 'insensitive' };
    
    // Price filters
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    
    // Guest filters
    if (minGuests || maxGuests) {
      where.maxGuests = {};
      if (minGuests) where.maxGuests.gte = Number(minGuests);
      if (maxGuests) where.maxGuests.lte = Number(maxGuests);
    }
    
    // Property type filter
    if (propertyType) where.propertyType = propertyType;
    
    // Amenities filter
    if (amenities) {
      const amenityArray = Array.isArray(amenities) ? amenities : [amenities];
      amenityArray.forEach(amenity => {
        where.amenities = { ...where.amenities, [amenity]: true };
      });
    }
    
    // Date availability filter
    if (checkIn && checkOut) {
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      
      // Find properties that don't have conflicting bookings
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          status: { in: ['CONFIRMED', 'PENDING'] },
          startDate: { lt: endDate },
          endDate: { gt: startDate }
        },
        select: { propertyId: true }
      });
      
      const conflictingPropertyIds = [...new Set(conflictingBookings.map(b => b.propertyId))];
      if (conflictingPropertyIds.length > 0) {
        where.id = { notIn: conflictingPropertyIds };
      }
    }

    // Get total count for pagination
    const total = await prisma.property.count({ where });
    
    // Get properties with pagination
    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        propertyId: true,
        title: true,
        description: true,
        location: true,
        city: true,
        country: true,
        address: true,
        latitude: true,
        longitude: true,
        price: true,
        pricePerNight: true,
        maxGuests: true,
        bedrooms: true,
        bathrooms: true,
        propertyType: true,
        instantBooking: true,
        amenities: true,
        media: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    // Calculate average ratings
    const propertiesWithRating = properties.map(property => {
      const avgRating = property.reviews.length > 0 
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;
      
      return {
        ...property,
        avgRating: Math.round(avgRating * 10) / 10,
        reviews: undefined // Remove reviews array from response
      };
    });

    const paginatedResults = paginateResults(
      propertiesWithRating, 
      Number(page), 
      Number(limit), 
      total
    );

    res.json(successResponse(paginatedResults, 'Properties retrieved successfully'));
  } catch (error) {
    console.error('List properties error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve properties', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get popular cities
export const getPopularCities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      where: { isPopular: true },
      select: {
        id: true,
        name: true,
        country: true,
        image: true,
        description: true,
        _count: {
          select: {
            properties: {
              where: { status: 'LIVE' }
            }
          }
        }
      },
      orderBy: {
        properties: {
          _count: 'desc'
        }
      },
      take: 10
    });

    res.json(successResponse(cities, 'Popular cities retrieved successfully'));
  } catch (error) {
    console.error('Get popular cities error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve popular cities', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// AGENT/OWNER: Create property
export const createByAgentOrOwner = async (req, res) => {
  try {
    const data = createPropertySchema.parse(req.body);
    const role = req.user.role;

    // Validate subscription for owners
    if (role === 'OWNER') {
      const subscriptionCheck = await SubscriptionService.canListProperty(req.user.id);
      if (!subscriptionCheck.canList) {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          errorResponse(subscriptionCheck.reason, HTTP_STATUS.FORBIDDEN)
        );
      }
    }

    // Validate city exists or create it
    let cityRecord = await prisma.city.findUnique({
      where: { name: data.city }
    });

    if (!cityRecord) {
      cityRecord = await prisma.city.create({
        data: {
          name: data.city,
          country: data.country
        }
      });
    }

    // Create property
    const propertyData = {
      ...data,
      cityId: cityRecord.id,
      status: 'PENDING',
      ownerId: role === 'OWNER' ? req.user.id : null,
      agentId: role === 'AGENT' ? req.user.id : null,
      amenities: data.amenities || {},
      media: data.media || []
    };

    const created = await prisma.property.create({ data: propertyData });
    
    // Generate property ID (1000 + id)
    const propertyId = generatePropertyId(created.id);
    const updated = await prisma.property.update({
      where: { id: created.id },
      data: { propertyId }
    });

    res.status(HTTP_STATUS.CREATED).json(
      successResponse(updated, 'Property created successfully', HTTP_STATUS.CREATED)
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Create property error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to create property', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get property by ID
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        cityRef: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        }
      }
    });

    if (!property) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND)
      );
    }

    // Calculate average rating
    const avgRating = property.reviews.length > 0 
      ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
      : 0;

    const propertyWithRating = {
      ...property,
      avgRating: Math.round(avgRating * 10) / 10
    };

    res.json(successResponse(propertyWithRating, 'Property retrieved successfully'));
  } catch (error) {
    console.error('Get property error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve property', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Update property
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const data = updatePropertySchema.parse(req.body);
    
    // Check if property exists and user has access
    const existingProperty = await prisma.property.findUnique({
      where: { id: Number(id) }
    });

    if (!existingProperty) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND)
      );
    }

    // Check ownership/access
    if (req.user.role !== 'SUPER_ADMIN' && 
        req.user.role !== 'ADMIN' &&
        existingProperty.ownerId !== req.user.id && 
        existingProperty.agentId !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }

    // Update city if changed
    if (data.city && data.city !== existingProperty.city) {
      let cityRecord = await prisma.city.findUnique({
        where: { name: data.city }
      });

      if (!cityRecord) {
        cityRecord = await prisma.city.create({
          data: {
            name: data.city,
            country: data.country || existingProperty.country
          }
        });
      }
      data.cityId = cityRecord.id;
    }

    // Update property
    const updated = await prisma.property.update({
      where: { id: Number(id) },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    res.json(successResponse(updated, 'Property updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Update property error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to update property', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Delete property
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if property exists and user has access
    const existingProperty = await prisma.property.findUnique({
      where: { id: Number(id) }
    });

    if (!existingProperty) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND)
      );
    }

    // Check ownership/access
    if (req.user.role !== 'SUPER_ADMIN' && 
        req.user.role !== 'ADMIN' &&
        existingProperty.ownerId !== req.user.id && 
        existingProperty.agentId !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }

    // Check if property has active bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        propertyId: Number(id),
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (activeBookings) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        errorResponse('Cannot delete property with active bookings', HTTP_STATUS.CONFLICT)
      );
    }

    // Delete property
    await prisma.property.delete({
      where: { id: Number(id) }
    });

    res.json(successResponse(null, 'Property deleted successfully'));
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to delete property', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// ADMIN: Approve property
export const adminApprove = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    if (!['LIVE', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Invalid status. Must be LIVE, REJECTED, or SUSPENDED', HTTP_STATUS.BAD_REQUEST)
      );
    }

    const updated = await prisma.property.update({
      where: { id: Number(id) },
      data: { 
        status,
        adminId: req.user.id,
        adminNotes,
        updatedAt: new Date()
      }
    });

    res.json(successResponse(updated, `Property ${status.toLowerCase()} successfully`));
  } catch (error) {
    console.error('Admin approve property error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to update property status', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get properties for admin review
export const getAdminReviewQueue = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'PENDING' } = req.query;
    
    const where = { status };
    
    const total = await prisma.property.count({ where });
    
    const properties = await prisma.property.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const paginatedResults = paginateResults(
      properties, 
      Number(page), 
      Number(limit), 
      total
    );

    res.json(successResponse(paginatedResults, 'Admin review queue retrieved successfully'));
  } catch (error) {
    console.error('Get admin review queue error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve admin review queue', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get user's properties
export const getUserProperties = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const userId = req.user.id;
    
    const where = {
      OR: [
        { ownerId: userId },
        { agentId: userId }
      ]
    };
    
    if (status) where.status = status;
    
    const total = await prisma.property.count({ where });
    
    const properties = await prisma.property.findMany({
      where,
      include: {
        cityRef: true,
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const paginatedResults = paginateResults(
      properties, 
      Number(page), 
      Number(limit), 
      total
    );

    res.json(successResponse(paginatedResults, 'User properties retrieved successfully'));
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve user properties', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};
