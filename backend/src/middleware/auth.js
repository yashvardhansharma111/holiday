import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import { errorResponse, ERROR_MESSAGES, HTTP_STATUS } from '../utils/responses.js';

export const requireAuth = (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
      );
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, email }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Token expired', HTTP_STATUS.UNAUTHORIZED)
      );
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED)
      );
    }
    
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
    );
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
    );
  }
  
  if (!roles.includes(req.user.role)) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
    );
  }
  
  next();
};

export const requireActiveUser = (req, res, next) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
    );
  }
  
  // Check if user account is active
  if (req.user.isActive === false) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      errorResponse('Account is deactivated', HTTP_STATUS.FORBIDDEN)
    );
  }
  
  next();
};

export const requireSubscription = async (req, res, next) => {
  try {
    if (req.user.role !== 'OWNER') {
      return next(); // Only owners need subscription check
    }
    
    // Check if user has active subscription
    const { SubscriptionService } = await import('../services/subscription.service.js');
    const subscription = await SubscriptionService.getUserSubscription(req.user.id);
    
    if (!subscription || !subscription.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.SUBSCRIPTION_REQUIRED, HTTP_STATUS.FORBIDDEN)
      );
    }
    
    req.user.subscription = subscription;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to verify subscription', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

export const validateResourceOwnership = (resourceType) => async (req, res, next) => {
  try {
    if (req.user.role === 'SUPER_ADMIN') {
      return next(); // Super admin can access everything
    }
    
    const resourceId = req.params.id || req.params.propertyId || req.params.bookingId;
    if (!resourceId) {
      return next();
    }
    
    let resource;
    switch (resourceType) {
      case 'property':
        resource = await prisma.property.findUnique({
          where: { id: Number(resourceId) },
          select: { ownerId: true, agentId: true, adminId: true }
        });
        break;
      case 'booking':
        resource = await prisma.booking.findUnique({
          where: { id: Number(resourceId) },
          select: { userId: true, property: { select: { ownerId: true, agentId: true } } }
        });
        break;
      case 'review':
        resource = await prisma.review.findUnique({
          where: { id: Number(resourceId) },
          select: { userId: true, property: { select: { ownerId: true } } }
        });
        break;
      default:
        return next();
    }
    
    if (!resource) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND)
      );
    }
    
    // Check ownership based on resource type
    let canAccess = false;
    switch (resourceType) {
      case 'property':
        canAccess = resource.ownerId === req.user.id || 
                   resource.agentId === req.user.id || 
                   resource.adminId === req.user.id ||
                   req.user.role === 'ADMIN';
        break;
      case 'booking':
        canAccess = resource.userId === req.user.id || 
                   resource.property.ownerId === req.user.id ||
                   resource.property.agentId === req.user.id ||
                   req.user.role === 'ADMIN';
        break;
      case 'review':
        canAccess = resource.userId === req.user.id || 
                   resource.property.ownerId === req.user.id ||
                   req.user.role === 'ADMIN';
        break;
    }
    
    if (!canAccess) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }
    
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to validate resource ownership', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

// Rate limiting middleware
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      const userRequests = requests.get(ip);
      
      if (now > userRequests.resetTime) {
        userRequests.count = 1;
        userRequests.resetTime = now + windowMs;
      } else {
        userRequests.count++;
      }
      
      if (userRequests.count > max) {
        return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
          errorResponse('Too many requests, please try again later', HTTP_STATUS.TOO_MANY_REQUESTS)
        );
      }
    }
    
    next();
  };
};
