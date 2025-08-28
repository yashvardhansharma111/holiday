import { z } from 'zod';
import prisma from '../db.js';
import { successResponse, errorResponse, ERROR_MESSAGES, HTTP_STATUS } from '../utils/responses.js';
import { 
  createReviewSchema, 
  updateReviewSchema, 
  reviewFilterSchema,
  adminResponseSchema 
} from '../schemas/index.js';

// Add a new review
export const addReview = async (req, res) => {
  try {
    const propertyId = Number(req.params.propertyId);
    const data = createReviewSchema.parse(req.body);
    
    // Check if property exists and is live
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, status: true, ownerId: true, agentId: true }
    });

    if (!property) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Property not found', HTTP_STATUS.NOT_FOUND)
      );
    }

    if (property.status !== 'LIVE') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Cannot review non-live properties', HTTP_STATUS.BAD_REQUEST)
      );
    }

    // Check if user has already reviewed this property
    const existingReview = await prisma.review.findFirst({
      where: {
        propertyId,
        userId: req.user.id
      }
    });

    if (existingReview) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        errorResponse('You have already reviewed this property', HTTP_STATUS.CONFLICT)
      );
    }

    // Check if user has a verified booking (optional but recommended)
    let isVerified = false;
    if (data.bookingId) {
      const booking = await prisma.booking.findFirst({
        where: {
          id: data.bookingId,
          userId: req.user.id,
          propertyId,
          status: 'COMPLETED'
        }
      });
      isVerified = !!booking;
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        propertyId,
        userId: req.user.id,
        bookingId: data.bookingId,
        rating: data.rating,
        comment: data.comment,
        isVerified
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        property: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.status(HTTP_STATUS.CREATED).json(
      successResponse(review, 'Review added successfully', HTTP_STATUS.CREATED)
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Add review error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to add review', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// List reviews for a property
export const listForProperty = async (req, res) => {
  try {
    const propertyId = Number(req.params.propertyId);
    const { page = 1, limit = 10, rating, verified } = req.query;
    
    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, status: true }
    });

    if (!property) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Property not found', HTTP_STATUS.NOT_FOUND)
      );
    }

    // Build where clause
    const where = { propertyId };
    
    if (rating) {
      where.rating = Number(rating);
    }
    
    if (verified === 'true') {
      where.isVerified = true;
    } else if (verified === 'false') {
      where.isVerified = false;
    }

    // Get total count for pagination
    const total = await prisma.review.count({ where });
    
    // Get reviews with pagination
    const reviews = await prisma.review.findMany({
      where,
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
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    // Calculate average rating
    const allReviews = await prisma.review.findMany({
      where: { propertyId },
      select: { rating: true }
    });

    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
      : 0;

    const ratingDistribution = {
      1: allReviews.filter(r => r.rating === 1).length,
      2: allReviews.filter(r => r.rating === 2).length,
      3: allReviews.filter(r => r.rating === 3).length,
      4: allReviews.filter(r => r.rating === 4).length,
      5: allReviews.filter(r => r.rating === 5).length
    };

    const paginatedResults = {
      reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      },
      summary: {
        totalReviews: allReviews.length,
        averageRating: Math.round(avgRating * 10) / 10,
        ratingDistribution
      }
    };

    res.json(successResponse(paginatedResults, 'Reviews retrieved successfully'));
  } catch (error) {
    console.error('List reviews error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve reviews', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get review by ID
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await prisma.review.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        property: {
          select: {
            id: true,
            title: true,
            location: true
          }
        },
        booking: {
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Review not found', HTTP_STATUS.NOT_FOUND)
      );
    }

    res.json(successResponse(review, 'Review retrieved successfully'));
  } catch (error) {
    console.error('Get review error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve review', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateReviewSchema.parse(req.body);
    
    // Check if review exists and user owns it
    const existingReview = await prisma.review.findUnique({
      where: { id: Number(id) },
      select: { id: true, userId: true, propertyId: true }
    });

    if (!existingReview) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Review not found', HTTP_STATUS.NOT_FOUND)
      );
    }

    // Check ownership (user can only edit their own review, admin can edit any)
    if (req.user.role !== 'SUPER_ADMIN' && 
        req.user.role !== 'ADMIN' && 
        existingReview.userId !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: Number(id) },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.json(successResponse(updatedReview, 'Review updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Update review error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to update review', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: Number(id) },
      select: { id: true, userId: true, propertyId: true }
    });

    if (!existingReview) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Review not found', HTTP_STATUS.NOT_FOUND)
      );
    }

    // Check ownership (user can only delete their own review, admin can delete any)
    if (req.user.role !== 'SUPER_ADMIN' && 
        req.user.role !== 'ADMIN' && 
        existingReview.userId !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }

    // Delete review
    await prisma.review.delete({
      where: { id: Number(id) }
    });

    res.json(successResponse(null, 'Review deleted successfully'));
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to delete review', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Admin: Respond to review
export const adminRespondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body;
    
    if (!adminResponse || adminResponse.trim().length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Admin response is required', HTTP_STATUS.BAD_REQUEST)
      );
    }

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: Number(id) }
    });

    if (!existingReview) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Review not found', HTTP_STATUS.NOT_FOUND)
      );
    }

    // Update review with admin response
    const updatedReview = await prisma.review.update({
      where: { id: Number(id) },
      data: {
        adminResponse: adminResponse.trim(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        property: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.json(successResponse(updatedReview, 'Admin response added successfully'));
  } catch (error) {
    console.error('Admin respond to review error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to add admin response', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    
    const where = { userId };
    
    // Get total count for pagination
    const total = await prisma.review.count({ where });
    
    // Get reviews with pagination
    const reviews = await prisma.review.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            media: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const paginatedResults = {
      reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    };

    res.json(successResponse(paginatedResults, 'User reviews retrieved successfully'));
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve user reviews', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get property owner's reviews
export const getPropertyOwnerReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, propertyId } = req.query;
    const userId = req.user.id;
    
    // Build where clause
    const where = {};
    
    if (propertyId) {
      where.propertyId = Number(propertyId);
    }
    
    // Get properties owned by user
    const userProperties = await prisma.property.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { agentId: userId }
        ]
      },
      select: { id: true }
    });
    
    const propertyIds = userProperties.map(p => p.id);
    where.propertyId = { in: propertyIds };
    
    // Get total count for pagination
    const total = await prisma.review.count({ where });
    
    // Get reviews with pagination
    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        property: {
          select: {
            id: true,
            title: true,
            location: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const paginatedResults = {
      reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    };

    res.json(successResponse(paginatedResults, 'Property owner reviews retrieved successfully'));
  } catch (error) {
    console.error('Get property owner reviews error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve property owner reviews', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};
