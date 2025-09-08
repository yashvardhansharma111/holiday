import { z } from 'zod';
import prisma from '../db.js';
import { successResponse, errorResponse, ERROR_MESSAGES, HTTP_STATUS } from '../utils/responses.js';
import { IcalCache } from '../services/icalCache.service.js';
import { S3Service } from '../services/s3.service.js';
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
      sortOrder = 'desc',
      regionId,
      destinationId,
      regionSlug,
      destinationSlug
    } = req.query;

    // Opportunistically refresh stale iCal caches in the background (non-blocking)
    try { IcalCache.refreshStaleFeedsAsync(process.env.ICAL_CACHE_TTL_MS); } catch (_) {}

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
    
    // Region/Destination filters
    if (regionId) where.regionId = parseInt(regionId);
    if (destinationId) where.destinationId = parseInt(destinationId);
    if (regionSlug) {
      where.region = { is: { slug: String(regionSlug) } };
    }
    if (destinationSlug) {
      where.destination = { is: { slug: String(destinationSlug) } };
    }
    
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
      
      const conflictingPropertyIds = new Set(conflictingBookings.map(b => b.propertyId));
      // Include iCal cached blocks (runtime, no DB)
      try {
        const blockedByIcal = IcalCache.getBlockedPropertyIdsInRange(startDate, endDate);
        for (const pid of blockedByIcal) conflictingPropertyIds.add(pid);
      } catch (_) { /* ignore cache errors */ }

      if (conflictingPropertyIds.size > 0) {
        const ids = Array.from(conflictingPropertyIds.values());
        if (where.id && where.id.notIn) {
          // merge with existing notIn
          where.id.notIn = Array.from(new Set([...(where.id.notIn || []), ...ids]));
        } else {
          where.id = { notIn: ids };
        }
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
        media: true,
        status: true,
        maxGuests: true,
        bedrooms: true,
        bathrooms: true,
        propertyType: true,
        instantBooking: true,
        headerRibbonPrice: true,
        headerRibbonText: true,
        initialRating: true,
        isFeatured: true,
        isPopular: true,
        createdAt: true,
        updatedAt: true,
        cityRef: {
          select: {
            id: true,
            name: true,
            country: true,
            isPopular: true
          }
        },
        region: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        destination: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        rates: {
          select: {
            id: true,
            rate: true,
            startDate: true,
            endDate: true,
            minStay: true
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
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

// NEW: Popular Rentals grouped by City (Public)
// Route: GET /api/properties/cities/popular-rentals?citiesLimit=6&propsPerCity=6
export const getPopularRentalsByCity = async (req, res) => {
  try {
    const citiesLimit = Number(req.query.citiesLimit ?? 6);
    const propsPerCity = Number(req.query.propsPerCity ?? 6);

    // 1) Find top cities by count of LIVE properties
    const grouped = await prisma.property.groupBy({
      by: ['cityId'],
      where: { status: 'LIVE' },
      _count: { cityId: true },
      orderBy: { _count: { cityId: 'desc' } },
      take: Math.max(1, Math.min(24, citiesLimit)),
    });

    if (grouped.length === 0) {
      return res.json(successResponse([], 'No popular city rentals found'));
    }

    const cityIds = grouped.map(g => g.cityId);
    const countMap = new Map(grouped.map(g => [g.cityId, g._count.cityId]));

    // 2) Fetch city metadata
    const cities = await prisma.city.findMany({
      where: { id: { in: cityIds } },
      select: { id: true, name: true, country: true, image: true, description: true }
    });

    // 3) For each city, fetch sample LIVE properties
    const results = [];
    for (const cityId of cityIds) {
      const city = cities.find(c => c.id === cityId);
      if (!city) continue;
      const props = await prisma.property.findMany({
        where: { status: 'LIVE', cityId },
        select: {
          id: true,
          propertyId: true,
          title: true,
          price: true,
          media: true,
          isFeatured: true,
          isPopular: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: Math.max(1, Math.min(24, propsPerCity)),
      });
      results.push({
        city: { id: city.id, name: city.name, country: city.country, image: city.image, description: city.description },
        propertyCount: countMap.get(cityId) || 0,
        properties: props,
      });
    }

    return res.json(successResponse(results, 'Popular rentals by city retrieved successfully'));
  } catch (error) {
    console.error('getPopularRentalsByCity error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve popular rentals by city', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// AGENT/OWNER: Create property
export const createByAgentOrOwner = async (req, res) => {
  try {
    const data = createPropertySchema.parse(req.body);
    const role = req.user.role;

    // Gate owners by ownerPaid flag instead of subscription
    if (role === 'OWNER') {
      const owner = await prisma.user.findUnique({ where: { id: req.user.id }, select: { ownerPaid: true } });
      if (!owner || owner.ownerPaid !== true) {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          errorResponse('Owner access requires payment', HTTP_STATUS.FORBIDDEN)
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

    // Normalize amenities: allow array of strings or record<bool>
    const normalizedAmenities = Array.isArray(data.amenities)
      ? data.amenities
      : (data.amenities || {});

    // Create property
    const propertyData = {
      ...data,
      cityId: cityRecord.id,
      status: 'PENDING',
      ownerId: role === 'OWNER' ? req.user.id : null,
      agentId: role === 'AGENT' ? req.user.id : null,
      amenities: normalizedAmenities,
      media: data.media || [],
      initialRating: data.initialRating ?? null,
      headerRibbonText: data.headerRibbonText ?? null,
      headerRibbonPrice: data.headerRibbonPrice ?? null,
      nearbyAttractions: data.nearbyAttractions ?? null,
      videos: data.videos ?? [],
      // optional mapping
      ...(data.regionId ? { regionId: Number(data.regionId) } : {}),
      ...(data.destinationId ? { destinationId: Number(data.destinationId) } : {}),
    };

    const created = await prisma.property.create({ data: propertyData });
    // Generate property ID (1000 + id)
    const propertyId = generatePropertyId(created.id);
    const updated = await prisma.property.update({
      where: { id: created.id },
      data: { propertyId }
    });

    // Persist seasonal pricing ranges if provided
    if (Array.isArray(data.pricingRanges) && data.pricingRanges.length > 0) {
      const rows = data.pricingRanges.map((r) => ({
        propertyId: updated.id,
        category: r.category || null,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        rate: Number(r.rate),
        minStay: r.minStay != null ? Number(r.minStay) : 1,
      }));
      await prisma.propertyRate.createMany({ data: rows });
    }

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
    const numeric = Number(id)

    // Try by primary id; if not found, try by display propertyId
    let property = await prisma.property.findUnique({
      where: { id: Number(numeric) },
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
        },
        rates: {
          orderBy: { startDate: 'asc' }
        }
      }
    });

    if (!property && Number.isFinite(numeric)) {
      property = await prisma.property.findFirst({
        where: { propertyId: numeric },
        include: {
          owner: { select: { id: true, name: true, avatar: true } },
          agent: { select: { id: true, name: true, avatar: true } },
          cityRef: true,
          reviews: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: { select: { reviews: true, bookings: true } },
          rates: { orderBy: { startDate: 'asc' } },
        }
      })
    }

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

    // Normalize amenities if provided
    const updateData = { ...data };
    if (data.amenities !== undefined) {
      updateData.amenities = Array.isArray(data.amenities) ? data.amenities : data.amenities || {};
    }
    // Optional mapping updates
    if (data.regionId !== undefined) {
      updateData.regionId = data.regionId == null ? null : Number(data.regionId);
    }
    if (data.destinationId !== undefined) {
      updateData.destinationId = data.destinationId == null ? null : Number(data.destinationId);
    }

    // If pricingRanges provided, replace existing ones atomically
    let updated;
    if (Array.isArray(data.pricingRanges)) {
      const rows = data.pricingRanges.map((r) => ({
        propertyId: Number(id),
        category: r.category || null,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        rate: Number(r.rate),
        minStay: r.minStay != null ? Number(r.minStay) : 1,
      }));

      const [prop] = await prisma.$transaction([
        prisma.property.update({
          where: { id: Number(id) },
          data: { ...updateData, updatedAt: new Date() }
        }),
        prisma.propertyRate.deleteMany({ where: { propertyId: Number(id) } }),
        ...(rows.length ? [prisma.propertyRate.createMany({ data: rows })] : [])
      ]);
      updated = prop;
    } else {
      updated = await prisma.property.update({
        where: { id: Number(id) },
        data: { ...updateData, updatedAt: new Date() }
      });
    }

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

// PUBLIC: Quick availability check for one property (bookings + runtime iCal cache)
export const checkAvailability = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { start, end } = req.query
    if (!Number.isFinite(id) || !start || !end) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('Invalid request', HTTP_STATUS.BAD_REQUEST))
    }
    const startDate = new Date(String(start))
    const endDate = new Date(String(end))
    if (!(startDate < endDate)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('Invalid date range', HTTP_STATUS.BAD_REQUEST))
    }
    // Booking conflicts
    const bookingConflict = await prisma.booking.findFirst({
      where: { propertyId: id, status: { in: ['CONFIRMED','PENDING'] }, startDate: { lt: endDate }, endDate: { gt: startDate } },
      select: { id: true }
    })
    let icalConflict = false
    try {
      const cached = IcalCache.get(id)
      if (cached?.events?.length) {
        icalConflict = cached.events.some(ev => new Date(ev.start) < endDate && new Date(ev.end) > startDate)
      }
    } catch(_) { /* ignore */ }
    const available = !bookingConflict && !icalConflict
    return res.json(successResponse({ available, bookingConflict: !!bookingConflict, icalConflict }, 'Availability checked'))
  } catch (error) {
    console.error('checkAvailability error:', error)
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to check availability', HTTP_STATUS.INTERNAL_SERVER_ERROR))
  }
}

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
        },
        rates: {
          orderBy: { startDate: 'asc' }
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

// Add media URLs to a property (OWNER/AGENT/Admins)
export const addPropertyMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { media } = req.body; // expect array of URLs

    if (!Array.isArray(media) || media.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('media must be a non-empty array of URLs', HTTP_STATUS.BAD_REQUEST)
      );
    }

    const property = await prisma.property.findUnique({ where: { id: Number(id) } });
    if (!property) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND)
      );
    }

    // Ownership/access check
    const isPrivileged = req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN';
    const isOwnerOrAgent = property.ownerId === req.user.id || property.agentId === req.user.id;
    if (!isPrivileged && !isOwnerOrAgent) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }

    // Basic URL validation and dedupe
    const urlRegex = /^(https?:\/\/).+/i;
    const newUrls = media
      .filter((u) => typeof u === 'string' && urlRegex.test(u))
      .map((u) => u.trim());

    if (newUrls.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('No valid media URLs provided', HTTP_STATUS.BAD_REQUEST)
      );
    }

    const updated = await prisma.property.update({
      where: { id: Number(id) },
      data: {
        media: Array.from(new Set([...(property.media || []), ...newUrls])),
        updatedAt: new Date()
      }
    });

    res.json(successResponse(updated, 'Media added to property successfully'));
  } catch (error) {
    console.error('Add property media error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to add media to property', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Remove media URLs from a property
export const removePropertyMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { media } = req.body; // expect array of URLs to remove

    if (!Array.isArray(media) || media.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('media must be a non-empty array of URLs', HTTP_STATUS.BAD_REQUEST)
      );
    }

    const property = await prisma.property.findUnique({ where: { id: Number(id) } });
    if (!property) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND)
      );
    }

    // Ownership/access check
    const isPrivileged = req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN';
    const isOwnerOrAgent = property.ownerId === req.user.id || property.agentId === req.user.id;
    if (!isPrivileged && !isOwnerOrAgent) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }

    const toRemove = new Set(media.map((u) => String(u).trim()));
    const remaining = (property.media || []).filter((u) => !toRemove.has(String(u).trim()));

    // Best-effort: delete from S3 if the URL points to our bucket
    try {
      const bucket = process.env.AWS_S3_BUCKET_NAME;
      if (bucket) {
        for (const url of toRemove) {
          try {
            const parsed = new URL(url);
            // Accept both virtual-hosted-style and path-style just by taking pathname as key
            const key = parsed.pathname.replace(/^\//, '');
            // Only attempt if hostname includes our bucket (extra safety)
            if (parsed.hostname.includes(`${bucket}.s3.`) || parsed.hostname.startsWith('s3.')) {
              await S3Service.deleteFile(key);
            }
          } catch (err) {
            // ignore malformed URL or deletion failure for individual items
            // console.warn('S3 delete skip:', err?.message || err);
          }
        }
      }
    } catch (_) {
      // ignore batch delete errors; DB update will still proceed
    }

    const updated = await prisma.property.update({
      where: { id: Number(id) },
      data: { media: remaining, updatedAt: new Date() }
    });

    res.json(successResponse(updated, 'Media removed from property successfully'));
  } catch (error) {
    console.error('Remove property media error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to remove media from property', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Generate S3 presigned URL for direct client upload
export const getPresignedUploadUrl = async (req, res) => {
  try {
    const { fileType, fileName, folder = 'properties' } = req.body;

    if (!fileType || !fileName) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('fileType and fileName are required', HTTP_STATUS.BAD_REQUEST)
      );
    }

    // Simple type allowlist (image/video)
    const allowed = ['image/', 'video/'];
    if (!allowed.some(prefix => String(fileType).startsWith(prefix))) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Only image/* or video/* uploads are allowed', HTTP_STATUS.BAD_REQUEST)
      );
    }

    const { presignedUrl, key, url } = await S3Service.generatePresignedUrl(fileType, fileName, folder);
    return res.json(successResponse({ presignedUrl, key, url }, 'Presigned URL generated'));
  } catch (error) {
    console.error('Generate presigned URL error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to generate presigned URL', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Update feature flags (Agent only)
const updateFeatureFlags = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured, isPopular } = req.body;
    const user = req.user;

    // Check if user is an agent
    if (user.role !== 'AGENT') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('Only agents can update featured/popular flags', HTTP_STATUS.FORBIDDEN)
      );
    }

    // Validate property exists and belongs to agent
    const existingProperty = await prisma.property.findUnique({
      where: { id: parseInt(id) },
      include: { agent: true }
    });

    if (!existingProperty) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Property not found', HTTP_STATUS.NOT_FOUND)
      );
    }

    // Check if agent owns this property or is authorized to modify it
    if (existingProperty.agentId !== user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('You can only update feature flags for your own properties', HTTP_STATUS.FORBIDDEN)
      );
    }

    // Update feature flags
    const updatedProperty = await prisma.property.update({
      where: { id: parseInt(id) },
      data: {
        ...(typeof isFeatured === 'boolean' && { isFeatured }),
        ...(typeof isPopular === 'boolean' && { isPopular })
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        agent: { select: { id: true, name: true, email: true } },
        cityRef: true,
        reviews: {
          include: { user: { select: { name: true } } }
        }
      }
    });

    return res.status(HTTP_STATUS.OK).json(
      successResponse(updatedProperty, 'Feature flags updated successfully')
    );

  } catch (error) {
    console.error('Update feature flags error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to update feature flags', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get featured properties (Public)
const getFeaturedProperties = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const properties = await prisma.property.findMany({
      where: {
        isFeatured: true,
        status: 'LIVE'
      },
      take: parseInt(limit),
      include: {
        owner: { select: { id: true, name: true } },
        agent: { select: { id: true, name: true } },
        cityRef: true,
        reviews: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(HTTP_STATUS.OK).json(
      successResponse(properties, 'Featured properties retrieved successfully')
    );

  } catch (error) {
    console.error('Get featured properties error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve featured properties', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get popular properties (Public)
const getPopularProperties = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const properties = await prisma.property.findMany({
      where: {
        isPopular: true,
        status: 'LIVE'
      },
      take: parseInt(limit),
      include: {
        owner: { select: { id: true, name: true } },
        agent: { select: { id: true, name: true } },
        cityRef: true,
        reviews: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(HTTP_STATUS.OK).json(
      successResponse(properties, 'Popular properties retrieved successfully')
    );

  } catch (error) {
    console.error('Get popular properties error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve popular properties', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

export { updateFeatureFlags, getFeaturedProperties, getPopularProperties };
