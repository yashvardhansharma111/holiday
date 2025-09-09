import { z } from 'zod';
import prisma from '../db.js';
import { successResponse, errorResponse, ERROR_MESSAGES, HTTP_STATUS } from '../utils/responses.js';
import { 
  updateUserSchema, 
  userFilterSchema, 
  analyticsFilterSchema,
  deleteUserSchema,
  propertyApprovalSchema,
  subscriptionPlanSchema,
  updateSubscriptionPlanSchema 
} from '../schemas/index.js';
import { paginateResults, buildSearchQuery, buildFilterQuery } from '../utils/responses.js';
import bcrypt from 'bcryptjs';
import { createAdminUserSchema } from '../schemas/admin.schemas.js';
import SubscriptionService from '../services/subscription.service.js';

// Get all users with pagination and filtering
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    
    // Build where clause
    const where = {};


    if (role) {
      where.role = role;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get total count for pagination
    const total = await prisma.user.count({ where });
    
    // Get users with pagination
    const usersRaw = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        ownerPaid: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            properties: true,
            bookings: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });
    // Remove ownerPaid field for non-OWNER roles
    const users = usersRaw.map(u => {
      if (u.role !== 'OWNER') {
        const { ownerPaid, ...rest } = u
        return rest
      }
      return u
    })
    
    const paginatedResults = paginateResults(
      users, 
      Number(page), 
      Number(limit), 
      total
    );
    
    res.json(successResponse(paginatedResults, 'Users retrieved successfully'));
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve users', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// SUPER_ADMIN: Create an Agent user
export const createAgentUser = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }

    const data = createAdminUserSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        errorResponse(ERROR_MESSAGES.EMAIL_EXISTS || 'Email already exists', HTTP_STATUS.CONFLICT)
      );
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const agent = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: 'AGENT',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    return res.status(HTTP_STATUS.CREATED).json(
      successResponse(agent, 'Agent user created successfully', HTTP_STATUS.CREATED)
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    console.error('Create agent user error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to create agent user', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// SUPER_ADMIN: Create an Admin user
export const createAdminUser = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }

    const data = createAdminUserSchema.parse(req.body);

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        errorResponse(ERROR_MESSAGES.EMAIL_EXISTS || 'Email already exists', HTTP_STATUS.CONFLICT)
      );
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const admin = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: 'ADMIN',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(HTTP_STATUS.CREATED).json(
      successResponse(admin, 'Admin user created successfully', HTTP_STATUS.CREATED)
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    console.error('Create admin user error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to create admin user', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get user by ID with detailed information
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userRaw = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        ownerPaid: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        properties: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          }
        },
        subscriptions: {
          where: { isActive: true },
          select: {
            id: true,
            type: true,
            price: true,
            expiresAt: true,
            status: true
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            createdAt: true
          }
        }
      }
    });
    const user = userRaw?.role !== 'OWNER' && userRaw ? (() => { const { ownerPaid, ...rest } = userRaw; return rest })() : userRaw;
    
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('User not found', HTTP_STATUS.NOT_FOUND)
      );
    }
    
    res.json(successResponse(user, 'User details retrieved successfully'));
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve user details', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('User not found', HTTP_STATUS.NOT_FOUND)
      );
    }
    
    // Prevent role escalation (non-super admins can't create super admins)
    if (req.user.role !== 'SUPER_ADMIN' && data.role === 'SUPER_ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('Only super admins can assign super admin role', HTTP_STATUS.FORBIDDEN)
      );
    }
    
    // Prevent self-deactivation
    if (Number(id) === req.user.id && data.isActive === false) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Cannot deactivate your own account', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Enforce that only OWNER users can have ownerPaid updated
    if (Object.prototype.hasOwnProperty.call(data, 'ownerPaid') && existingUser.role !== 'OWNER') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('ownerPaid can only be set for OWNER users', HTTP_STATUS.BAD_REQUEST)
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...data,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        ownerPaid: true,
        updatedAt: true
      }
    });
    // Hide ownerPaid if not OWNER
    const sanitized = updatedUser.role !== 'OWNER' ? (() => { const { ownerPaid, ...rest } = updatedUser; return rest })() : updatedUser;
    
    res.json(successResponse(sanitized, 'User updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Update user error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to update user', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('User not found', HTTP_STATUS.NOT_FOUND)
      );
    }
    
    // Prevent self-deletion
    if (Number(id) === req.user.id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Cannot delete your own account', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Check if user has active properties or bookings
    const activeProperties = await prisma.property.count({
      where: {
        OR: [
          { ownerId: Number(id) },
          { agentId: Number(id) }
        ],
        status: { in: ['PENDING', 'LIVE'] }
      }
    });
    
    const activeBookings = await prisma.booking.count({
      where: {
        userId: Number(id),
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });
    
    if (activeProperties > 0 || activeBookings > 0) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        errorResponse('Cannot delete user with active properties or bookings', HTTP_STATUS.CONFLICT)
      );
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id: Number(id) }
    });
    
    res.json(successResponse(null, 'User deleted successfully'));
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to delete user', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};


// Get platform analytics
export const getPlatformAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get user statistics
    const totalUsers = await prisma.user.count();
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: startDate } }
    });
    
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });
    
    // Get property statistics
    const totalProperties = await prisma.property.count();
    const liveProperties = await prisma.property.count({ where: { status: 'LIVE' } });
    const pendingProperties = await prisma.property.count({ where: { status: 'PENDING' } });
    const newProperties = await prisma.property.count({
      where: { createdAt: { gte: startDate } }
    });
    
    // Get booking statistics
    const totalBookings = await prisma.booking.count();
    const confirmedBookings = await prisma.booking.count({ where: { status: 'CONFIRMED' } });
    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });
    const newBookings = await prisma.booking.count({
      where: { createdAt: { gte: startDate } }
    });
    
    // Get revenue statistics
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    });
    
    const periodRevenue = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
        createdAt: { gte: startDate }
      },
      _sum: { amount: true }
    });
    
    // Get review statistics
    const totalReviews = await prisma.review.count();
    const avgRating = await prisma.review.aggregate({
      _avg: { rating: true }
    });
    
    // Get subscription statistics
    const activeSubscriptions = await prisma.subscription.count({
      where: { isActive: true }
    });
    
    const subscriptionRevenue = await prisma.subscription.aggregate({
      where: { isActive: true },
      _sum: { price: true }
    });
    
    const analytics = {
      period,
      dateRange: {
        start: startDate,
        end: now
      },
      users: {
        total: totalUsers,
        new: newUsers,
        byRole: usersByRole
      },
      properties: {
        total: totalProperties,
        live: liveProperties,
        pending: pendingProperties,
        new: newProperties
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        pending: pendingBookings,
        new: newBookings
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
        period: periodRevenue._sum.amount || 0
      },
      reviews: {
        total: totalReviews,
        averageRating: avgRating._avg.rating || 0
      },
      subscriptions: {
        active: activeSubscriptions,
        revenue: subscriptionRevenue._sum.price || 0
      }
    };
    
    res.json(successResponse(analytics, 'Platform analytics retrieved successfully'));
  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve platform analytics', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get property approval queue
export const getPropertyApprovalQueue = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'PENDING' } = req.query;
    
    const where = { status };
    
    // Get total count for pagination
    const total = await prisma.property.count({ where });
    
    // Get properties with pagination
    const properties = await prisma.property.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        agent: { select: { id: true, name: true, email: true } }
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
    
    res.json(successResponse(paginatedResults, 'Property approval queue retrieved successfully'));
  } catch (error) {
    console.error('Get property approval queue error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve property approval queue', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Approve/reject property
export const approveProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    if (!['LIVE', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Invalid status. Must be LIVE, REJECTED, or SUSPENDED', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingProperty) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Property not found', HTTP_STATUS.NOT_FOUND)
      );
    }
    
    // Update property status
    const updatedProperty = await prisma.property.update({
      where: { id: Number(id) },
      data: {
        status,
        adminId: req.user.id,
        adminNotes,
        updatedAt: new Date()
      },
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
      }
    });
    
    res.json(successResponse(updatedProperty, `Property ${status.toLowerCase()} successfully`));
  } catch (error) {
    console.error('Approve property error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to update property status', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get subscription plans
export const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    });
    
    res.json(successResponse(plans, 'Subscription plans retrieved successfully'));
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve subscription plans', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Create subscription plan
export const createSubscriptionPlan = async (req, res) => {
  try {
    const data = subscriptionPlanSchema.parse(req.body);
    
    // Check if plan type already exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { type: data.type }
    });
    
    if (existingPlan) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        errorResponse('Subscription plan type already exists', HTTP_STATUS.CONFLICT)
      );
    }
    
    // Create plan
    const plan = await prisma.subscriptionPlan.create({
      data
    });
    
    res.status(HTTP_STATUS.CREATED).json(
      successResponse(plan, 'Subscription plan created successfully', HTTP_STATUS.CREATED)
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Create subscription plan error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to create subscription plan', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Update subscription plan
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateSubscriptionPlanSchema.parse(req.body);
    
    // Check if plan exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingPlan) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Subscription plan not found', HTTP_STATUS.NOT_FOUND)
      );
    }
    
    // Update plan
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: Number(id) },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
    
    res.json(successResponse(updatedPlan, 'Subscription plan updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Update subscription plan error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to update subscription plan', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Delete subscription plan
export const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if plan exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingPlan) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Subscription plan not found', HTTP_STATUS.NOT_FOUND)
      );
    }
    
    // Check if plan has active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        planId: Number(id),
        isActive: true
      }
    });
    
    if (activeSubscriptions > 0) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        errorResponse('Cannot delete plan with active subscriptions', HTTP_STATUS.CONFLICT)
      );
    }
    
    // Delete plan
    await prisma.subscriptionPlan.delete({
      where: { id: Number(id) }
    });
    
    res.json(successResponse(null, 'Subscription plan deleted successfully'));
  } catch (error) {
    console.error('Delete subscription plan error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to delete subscription plan', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Admin: Grant a subscription to a user (manual, no gateway)
export const grantUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { planId, paid = false } = req.body;

    if (!planId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('planId is required', HTTP_STATUS.BAD_REQUEST)
      );
    }

    const subscription = await SubscriptionService.createSubscription(Number(userId), Number(planId), Boolean(paid));
    res.status(HTTP_STATUS.CREATED).json(
      successResponse(subscription, 'Subscription granted', HTTP_STATUS.CREATED)
    );
  } catch (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse(error.message || 'Failed to grant subscription', HTTP_STATUS.BAD_REQUEST)
    );
  }
};

// Admin: Cancel (deactivate) a subscription
export const cancelUserSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const updated = await SubscriptionService.cancelSubscription(Number(subscriptionId));
    res.json(successResponse(updated, 'Subscription cancelled'));
  } catch (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse(error.message || 'Failed to cancel subscription', HTTP_STATUS.BAD_REQUEST)
    );
  }
};

// Admin: Set subscription paid flag
export const setSubscriptionPaidStatus = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { paid } = req.body;
    if (typeof paid !== 'boolean') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('paid must be a boolean', HTTP_STATUS.BAD_REQUEST)
      );
    }
    const updated = await SubscriptionService.updateSubscriptionPaidStatus(Number(subscriptionId), paid);
    res.json(successResponse(updated, 'Subscription payment status updated'));
  } catch (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse(error.message || 'Failed to update subscription payment status', HTTP_STATUS.BAD_REQUEST)
    );
  }
};

// Admin: Get a user's active subscription details
export const getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const subscription = await SubscriptionService.getUserSubscription(Number(userId));
    if (!subscription) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('No active subscription found', HTTP_STATUS.NOT_FOUND)
      );
    }
    res.json(successResponse(subscription, 'User subscription retrieved'));
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to get user subscription', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Get all properties for admin management
export const getAllProperties = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    
    // Build where clause
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get total count for pagination
    const total = await prisma.property.count({ where });
    
    // Get properties with pagination
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
    
    res.json(successResponse(paginatedResults, 'Properties retrieved successfully'));
  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve properties', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Create property (admin)
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      city,
      country,
      address,
      price,
      pricePerNight,
      amenities,
      media,
      maxGuests,
      bedrooms,
      bathrooms,
      propertyType,
      instantBooking
    } = req.body;

    // Basic validation
    if (!title || title.trim().length < 5) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Title must be at least 5 characters', HTTP_STATUS.BAD_REQUEST)
      );
    }

    if (!description || description.trim().length < 20) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Description must be at least 20 characters', HTTP_STATUS.BAD_REQUEST)
      );
    }

    if (!location || location.trim().length < 5) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Location must be at least 5 characters', HTTP_STATUS.BAD_REQUEST)
      );
    }

    if (!media || media.length < 1) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('At least one image is required', HTTP_STATUS.BAD_REQUEST)
      );
    }

    // Ensure City exists and provide required cityId relation
    const cityName = city?.trim() || ''
    const countryName = country?.trim() || ''
    let cityRecord = await prisma.city.findUnique({ where: { name: cityName } })
    if (!cityRecord) {
      cityRecord = await prisma.city.create({ data: { name: cityName, country: countryName } })
    }

    // Create property with admin as owner
    const property = await prisma.property.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        city: cityName,
        country: countryName,
        address: address?.trim() || '',
        latitude: req.body.latitude != null ? Number(req.body.latitude) : undefined,
        longitude: req.body.longitude != null ? Number(req.body.longitude) : undefined,
        price: Number(price),
        pricePerNight: Boolean(pricePerNight),
        amenities: amenities || [],
        maxGuests: Number(maxGuests) || 1,
        bedrooms: Number(bedrooms) || 1,
        bathrooms: Number(bathrooms) || 1,
        propertyType: propertyType || 'apartment',
        instantBooking: Boolean(instantBooking),
        status: 'LIVE', // Admin properties go live immediately
        ownerId: req.user.id, // Admin becomes the owner
        adminId: req.user.id,
        cityId: cityRecord.id,
        // media stored as JSON array per schema
        media: Array.isArray(media) ? media : [],
        // Feature flags: only SUPER_ADMIN may set; otherwise false
        isFeatured: req.user.role === 'SUPER_ADMIN' ? Boolean(req.body.isFeatured) : false,
        isPopular: req.user.role === 'SUPER_ADMIN' ? Boolean(req.body.isPopular) : false,
        // optional region/destination mapping
        ...(req.body.regionId ? { regionId: Number(req.body.regionId) } : {}),
        ...(req.body.destinationId ? { destinationId: Number(req.body.destinationId) } : {})
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(HTTP_STATUS.CREATED).json(
      successResponse(property, 'Property created successfully', HTTP_STATUS.CREATED)
    );
  } catch (error) {
    console.error('Create property error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to create property', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Update property (admin)
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      city,
      country,
      address,
      price,
      pricePerNight,
      amenities,
      media,
      maxGuests,
      bedrooms,
      bathrooms,
      propertyType,
      instantBooking
    } = req.body;

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id: Number(id) }
    });

    if (!existingProperty) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Property not found', HTTP_STATUS.NOT_FOUND)
      );
    }

    // Update property
    // Build update data with enforcement for flags and optional coords
    const updateData = {
      title: title?.trim(),
      description: description?.trim(),
      location: location?.trim(),
      city: city?.trim(),
      country: country?.trim(),
      address: address?.trim(),
      price: price ? Number(price) : undefined,
      pricePerNight: pricePerNight !== undefined ? Boolean(pricePerNight) : undefined,
      amenities: amenities,
      maxGuests: maxGuests ? Number(maxGuests) : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      propertyType: propertyType,
      instantBooking: instantBooking !== undefined ? Boolean(instantBooking) : undefined,
      updatedAt: new Date(),
      // Replace media JSON if provided
      ...(Array.isArray(media) ? { media } : {}),
      // optional region/destination mapping updates
      ...(req.body.regionId !== undefined ? { regionId: req.body.regionId == null ? null : Number(req.body.regionId) } : {}),
      ...(req.body.destinationId !== undefined ? { destinationId: req.body.destinationId == null ? null : Number(req.body.destinationId) } : {}),
      // optional latitude/longitude
      ...(Object.prototype.hasOwnProperty.call(req.body, 'latitude') ? { latitude: req.body.latitude == null || req.body.latitude === '' ? null : Number(req.body.latitude) } : {}),
      ...(Object.prototype.hasOwnProperty.call(req.body, 'longitude') ? { longitude: req.body.longitude == null || req.body.longitude === '' ? null : Number(req.body.longitude) } : {}),
    };

    // Only SUPER_ADMIN can set feature flags
    if (req.user.role === 'SUPER_ADMIN') {
      if (Object.prototype.hasOwnProperty.call(req.body, 'isFeatured')) updateData.isFeatured = Boolean(req.body.isFeatured);
      if (Object.prototype.hasOwnProperty.call(req.body, 'isPopular')) updateData.isPopular = Boolean(req.body.isPopular);
    }

    const updatedProperty = await prisma.property.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(successResponse(updatedProperty, 'Property updated successfully'));
  } catch (error) {
    console.error('Update property error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to update property', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Delete property (admin)
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id: Number(id) }
    });

    if (!existingProperty) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Property not found', HTTP_STATUS.NOT_FOUND)
      );
    }

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        propertyId: Number(id),
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (activeBookings > 0) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        errorResponse('Cannot delete property with active bookings', HTTP_STATUS.CONFLICT)
      );
    }

    // Delete property (cascade will handle media and other relations)
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

// Get system health status
export const getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        s3: 'configured'
      },
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };
    
    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.services.database = 'connected';
    } catch (error) {
      health.services.database = 'disconnected';
      health.status = 'degraded';
    }
    
    // Check AWS S3 configuration
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
      health.services.s3 = 'not_configured';
      health.status = 'degraded';
    }
    
    const statusCode = health.status === 'healthy' ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;
    
    res.status(statusCode).json(successResponse(health, 'System health check completed'));
  } catch (error) {
    console.error('System health check error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('System health check failed', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};
