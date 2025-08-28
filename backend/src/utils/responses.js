// Standard API response utilities
export const successResponse = (data, message = 'Success', statusCode = 200) => ({
  success: true,
  message,
  data,
  statusCode
});

export const errorResponse = (message, statusCode = 400, errors = null) => ({
  success: false,
  message,
  errors,
  statusCode
});

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Common error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid credentials',
  EMAIL_EXISTS: 'Email already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  SUBSCRIPTION_REQUIRED: 'Active subscription required',
  PROPERTY_LIMIT_REACHED: 'Property limit reached',
  BOOKING_CONFLICT: 'Booking conflict with existing dates',
  PAYMENT_FAILED: 'Payment processing failed'
};

// Validation error formatter
export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(error => ({
      field: error.path?.join('.') || 'unknown',
      message: error.message,
      value: error.value
    }));
  }
  
  if (typeof errors === 'object' && errors !== null) {
    return Object.keys(errors).map(key => ({
      field: key,
      message: errors[key],
      value: null
    }));
  }
  
  return [{ field: 'general', message: 'Validation failed', value: null }];
};

// Pagination helper
export const paginateResults = (data, page = 1, limit = 10, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  };
};

// Search and filter helpers
export const buildSearchQuery = (searchTerm, searchFields) => {
  if (!searchTerm || !searchFields.length) return {};
  
  const searchConditions = searchFields.map(field => ({
    [field]: {
      contains: searchTerm,
      mode: 'insensitive'
    }
  }));
  
  return {
    OR: searchConditions
  };
};

export const buildFilterQuery = (filters) => {
  const where = {};
  
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== '') {
      if (key.includes('.')) {
        // Handle nested filters like 'user.name'
        const [parent, child] = key.split('.');
        if (!where[parent]) where[parent] = {};
        where[parent][child] = value;
      } else if (key === 'price') {
        // Handle price range
        if (value.min !== undefined) where.price = { ...where.price, gte: Number(value.min) };
        if (value.max !== undefined) where.price = { ...where.price, lte: Number(value.max) };
      } else if (key === 'dates') {
        // Handle date range
        if (value.start) where.startDate = { ...where.startDate, gte: new Date(value.start) };
        if (value.end) where.endDate = { ...where.endDate, lte: new Date(value.end) };
      } else if (Array.isArray(value)) {
        where[key] = { in: value };
      } else if (typeof value === 'boolean') {
        where[key] = value;
      } else if (typeof value === 'number') {
        where[key] = Number(value);
      } else {
        where[key] = value;
      }
    }
  });
  
  return where;
};

// Date utilities
export const calculateNights = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isDateRangeAvailable = (startDate, endDate, existingBookings) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return !existingBookings.some(booking => {
    const bookingStart = new Date(booking.startDate);
    const bookingEnd = new Date(booking.endDate);
    
    return (start < bookingEnd && end > bookingStart);
  });
};

// Property ID generator
export const generatePropertyId = (baseId) => {
  return 1000 + baseId;
};

// Booking code generator
export const generateBookingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// File validation
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.mimetype);
};

export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

// Role-based access control helpers
export const canAccessResource = (userRole, resourceOwnerId, userId, allowedRoles = []) => {
  // Super admin can access everything
  if (userRole === 'SUPER_ADMIN') return true;
  
  // Admin can access resources under their jurisdiction
  if (userRole === 'ADMIN' && allowedRoles.includes('ADMIN')) return true;
  
  // Users can access their own resources
  if (resourceOwnerId === userId) return true;
  
  return false;
};

// Rate limiting helpers
export const createRateLimitConfig = (windowMs = 15 * 60 * 1000, max = 100) => ({
  windowMs,
  max,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});
