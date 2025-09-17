import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['AGENT', 'OWNER', 'USER']).default('USER'),
  phone: z.string().optional(),
  avatar: z.string().url().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
}); 

// OTP-based auth schemas
export const sendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  purpose: z.enum(['SIGNUP', 'LOGIN', 'FORGOT'])
});

export const verifySignupOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().min(4, 'Code is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  role: z.enum(['OWNER', 'USER']).default('USER'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional()
});

export const verifyLoginOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().min(4, 'Code is required')
});

export const verifyForgotOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().min(4, 'Code is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});