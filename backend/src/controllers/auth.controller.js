import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../db.js';
import { successResponse, errorResponse, ERROR_MESSAGES, HTTP_STATUS } from '../utils/responses.js';
import { 
  signupSchema, 
  loginSchema, 
  updateProfileSchema, 
  changePasswordSchema,
  refreshTokenSchema 
} from '../schemas/index.js';

export const signup = async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);
    // Disallow admin or super admin signup via public route
    if (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Admin signup is not allowed. Contact super admin.', HTTP_STATUS.BAD_REQUEST)
      );
    }
    const allowedRoles = ['AGENT', 'OWNER', 'USER'];
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: data.email.toLowerCase() }
    });
    
    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        errorResponse(ERROR_MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT)
      );
    }

    // Hash password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: allowedRoles.includes(data.role) ? data.role : 'USER',
        phone: data.phone,
        avatar: data.avatar
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(HTTP_STATUS.CREATED).json(
      successResponse(user, 'User registered successfully', HTTP_STATUS.CREATED)
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Signup error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to create user', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

export const login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    
    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email: data.email.toLowerCase() }
    });
    
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED)
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('Account is deactivated', HTTP_STATUS.FORBIDDEN)
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash || '');
    if (!isValidPassword) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED)
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        email: user.email,
        isActive: user.isActive
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    res.json(successResponse({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    }, 'Login successful'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Login error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Login failed', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND)
      );
    }

    res.json(successResponse(user, 'Profile retrieved successfully'));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to get profile', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

export const updateProfile = async (req, res) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
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
        updatedAt: true
      }
    });

    res.json(successResponse(updatedUser, 'Profile updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Update profile error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to update profile', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

export const changePassword = async (req, res) => {
  try {
    const data = changePasswordSchema.parse(req.body);
    
    // Get current user with password hash
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { passwordHash: true }
    });

    // Verify current password
    const isValidPassword = await bcrypt.compare(data.currentPassword, user.passwordHash || '');
    if (!isValidPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Current password is incorrect', HTTP_STATUS.BAD_REQUEST)
      );
    }

    // Hash new password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(data.newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      }
    });

    res.json(successResponse(null, 'Password changed successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Change password error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to change password', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

export const refreshToken = async (req, res) => {
  try {
    const data = refreshTokenSchema.parse(req.body);

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, role: true, email: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Invalid or inactive user', HTTP_STATUS.UNAUTHORIZED)
      );
    }

    // Generate new token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        email: user.email,
        isActive: user.isActive
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json(successResponse({ token }, 'Token refreshed successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Refresh token error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to refresh token', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

export const logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success response
    res.json(successResponse(null, 'Logged out successfully'));
  } catch (error) {
    console.error('Logout error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Logout failed', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};
