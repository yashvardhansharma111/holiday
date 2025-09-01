import { z } from 'zod';
import prisma from '../db.js';
import { successResponse, errorResponse, ERROR_MESSAGES, HTTP_STATUS } from '../utils/responses.js';
import { calculateNights, generateBookingCode, isDateRangeAvailable } from '../utils/responses.js';
import { 
  createBookingSchema, 
  updateBookingSchema, 
  bookingFilterSchema,
  cancelBookingSchema,
  confirmBookingSchema 
} from '../schemas/index.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const data = createBookingSchema.parse(req.body);
    const userId = req.user.id;
    
    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const now = new Date();
    
    if (startDate <= now) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Start date must be in the future', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    if (endDate <= startDate) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('End date must be after start date', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Check if property exists and is live
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
      select: {
        id: true,
        status: true,
        price: true,
        maxGuests: true,
        instantBooking: true,
        ownerId: true,
        agentId: true
      }
    });
    
    if (!property) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Property not found', HTTP_STATUS.NOT_FOUND)
      );
    }
    
    if (property.status !== 'LIVE') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Cannot book non-live properties', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    if (data.guests > property.maxGuests) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(`Maximum ${property.maxGuests} guests allowed for this property`, HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Check date availability
    const existingBookings = await prisma.booking.findMany({
      where: {
        propertyId: data.propertyId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            startDate: { lt: endDate },
            endDate: { gt: startDate }
          }
        ]
      }
    });
    
    if (existingBookings.length > 0) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        errorResponse('Selected dates are not available', HTTP_STATUS.CONFLICT)
      );
    }
    
    // Calculate booking details
    const nights = calculateNights(startDate, endDate);
    const amount = property.price * nights;
    const totalAmount = amount; // Add fees if needed
    
    // Generate unique booking code
    const bookingCode = generateBookingCode();
    
    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        userId,
        propertyId: data.propertyId,
        startDate,
        endDate,
        nights,
        guests: data.guests,
        amount,
        totalAmount,
        status: property.instantBooking ? 'CONFIRMED' : 'PENDING',
        paymentStatus: 'PENDING',
        specialRequests: data.specialRequests
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.status(HTTP_STATUS.CREATED).json(
      successResponse(booking, 'Booking created successfully', HTTP_STATUS.CREATED)
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Create booking error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to create booking', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get aggregated bookings across all properties owned/managed by the user (OWNER/AGENT)
export const getOwnerAggregatedBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const userId = req.user.id;

    // Build where clause: bookings for properties where current user is owner or agent
    const where = {
      OR: [
        { property: { ownerId: userId } },
        { property: { agentId: userId } }
      ]
    };

    if (status) {
      where.status = status;
    }

    const total = await prisma.booking.count({ where });

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        property: {
          select: { id: true, title: true, location: true, ownerId: true, agentId: true }
        },
        payments: {
          select: { id: true, amount: true, status: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const paginatedResults = {
      bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    };

    res.json(successResponse(paginatedResults, 'Owner aggregated bookings retrieved successfully'));
  } catch (error) {
    console.error('Get owner aggregated bookings error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve owner aggregated bookings', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const userId = req.user.id;
    
    const where = { userId };
    
    if (status) {
      where.status = status;
    }
    
    // Get total count for pagination
    const total = await prisma.booking.count({ where });
    
    // Get bookings with pagination
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            media: true,
            owner: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });
    
    const paginatedResults = {
      bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    };
    
    res.json(successResponse(paginatedResults, 'User bookings retrieved successfully'));
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve user bookings', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            city: true,
            country: true,
            media: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            stripePaymentIntentId: true,
            createdAt: true
          }
        }
      }
    });
    
    if (!booking) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Booking not found', HTTP_STATUS.NOT_FOUND)
      );
    }
    
    // Check access permissions
    if (req.user.role !== 'SUPER_ADMIN' && 
        req.user.role !== 'ADMIN' &&
        booking.userId !== req.user.id &&
        booking.property.owner.id !== req.user.id &&
        booking.property.agentId !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }
    
    res.json(successResponse(booking, 'Booking retrieved successfully'));
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve booking', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Update booking
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateBookingSchema.parse(req.body);
    
    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        userId: true,
        propertyId: true,
        status: true,
        startDate: true,
        endDate: true,
        property: {
          select: {
            ownerId: true,
            agentId: true
          }
        }
      }
    });
    
    if (!existingBooking) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Booking not found', HTTP_STATUS.NOT_FOUND)
      );
    }
    
    // Check access permissions
    if (req.user.role !== 'SUPER_ADMIN' && 
        req.user.role !== 'ADMIN' &&
        existingBooking.userId !== req.user.id &&
        existingBooking.property.ownerId !== req.user.id &&
        existingBooking.property.agentId !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }
    
    // Only allow updates for pending bookings
    if (existingBooking.status !== 'PENDING') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Cannot update confirmed or completed bookings', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Validate new dates if provided
    if (data.startDate || data.endDate) {
      const newStartDate = data.startDate ? new Date(data.startDate) : existingBooking.startDate;
      const newEndDate = data.endDate ? new Date(data.endDate) : existingBooking.endDate;
      
      if (newEndDate <= newStartDate) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse('End date must be after start date', HTTP_STATUS.BAD_REQUEST)
        );
      }
      
      // Check availability for new dates
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          propertyId: existingBooking.propertyId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          id: { not: Number(id) },
          OR: [
            {
              startDate: { lt: newEndDate },
              endDate: { gt: newStartDate }
            }
          ]
        }
      });
      
      if (conflictingBookings.length > 0) {
        return res.status(HTTP_STATUS.CONFLICT).json(
          errorResponse('Selected dates are not available', HTTP_STATUS.CONFLICT)
        );
      }
      
      // Update calculated fields
      data.nights = calculateNights(newStartDate, newEndDate);
      // Recalculate amount if dates changed
      if (data.startDate || data.endDate) {
        const property = await prisma.property.findUnique({
          where: { id: existingBooking.propertyId },
          select: { price: true }
        });
        data.amount = property.price * data.nights;
        data.totalAmount = data.amount;
      }
    }
    
    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true
          }
        }
      }
    });
    
    res.json(successResponse(updatedBooking, 'Booking updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Update booking error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to update booking', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        userId: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        property: {
          select: {
            ownerId: true,
            agentId: true
          }
        }
      }
    });
    
    if (!existingBooking) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Booking not found', HTTP_STATUS.NOT_FOUND)
      );
    }
    
    // Check access permissions
    if (req.user.role !== 'SUPER_ADMIN' && 
        req.user.role !== 'ADMIN' &&
        existingBooking.userId !== req.user.id &&
        existingBooking.property.ownerId !== req.user.id &&
        existingBooking.property.agentId !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }
    
    // Only allow cancellation for pending or confirmed bookings
    if (!['PENDING', 'CONFIRMED'].includes(existingBooking.status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Cannot cancel completed or already cancelled bookings', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        cancelledAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    // Update payment status if payment was made
    if (existingBooking.paymentStatus === 'PAID') {
      try {
        // Get payment record
        const payment = await prisma.payment.findFirst({
          where: {
            bookingId: Number(id),
            status: 'PAID'
          }
        });
        
        if (payment) {
          // Update payment record to refunded
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'REFUNDED',
              refundedAt: new Date()
            }
          });
          
          // Update booking payment status
          await prisma.booking.update({
            where: { id: Number(id) },
            data: { paymentStatus: 'REFUNDED' }
          });
        }
      } catch (error) {
        console.error('Payment status update failed:', error);
        // Continue with cancellation even if payment update fails
      }
    }
    
    res.json(successResponse(updatedBooking, 'Booking cancelled successfully'));
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to cancel booking', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get property bookings (for owners/agents)
export const getPropertyBookings = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const userId = req.user.id;
    
    // Check if user has access to this property
    const property = await prisma.property.findUnique({
      where: { id: Number(propertyId) },
      select: {
        id: true,
        ownerId: true,
        agentId: true
      }
    });
    
    if (!property) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Property not found', HTTP_STATUS.NOT_FOUND)
      );
    }
    
    if (req.user.role !== 'SUPER_ADMIN' && 
        req.user.role !== 'ADMIN' &&
        property.ownerId !== userId && 
        property.agentId !== userId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }
    
    // Build where clause
    const where = { propertyId: Number(propertyId) };
    
    if (status) {
      where.status = status;
    }
    
    // Get total count for pagination
    const total = await prisma.booking.count({ where });
    
    // Get bookings with pagination
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });
    
    const paginatedResults = {
      bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    };
    
    res.json(successResponse(paginatedResults, 'Property bookings retrieved successfully'));
  } catch (error) {
    console.error('Get property bookings error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve property bookings', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Confirm booking (for property owners/agents)
export const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        status: true,
        property: {
          select: {
            ownerId: true,
            agentId: true
          }
        }
      }
    });
    
    if (!existingBooking) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Booking not found', HTTP_STATUS.NOT_FOUND)
      );
    }
    
    // Check access permissions
    if (req.user.role !== 'SUPER_ADMIN' && 
        req.user.role !== 'ADMIN' &&
        existingBooking.property.ownerId !== req.user.id &&
        existingBooking.property.agentId !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }
    
    // Only allow confirmation of pending bookings
    if (existingBooking.status !== 'PENDING') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Can only confirm pending bookings', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Confirm booking
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: {
        status: 'CONFIRMED',
        updatedAt: new Date()
      }
    });
    
    res.json(successResponse(updatedBooking, 'Booking confirmed successfully'));
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to confirm booking', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};
