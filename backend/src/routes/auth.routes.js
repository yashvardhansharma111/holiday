import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
// OTP-based routes
router.post('/otp/send', authController.sendOtp); // body: { email, purpose: 'SIGNUP'|'LOGIN'|'FORGOT' }
router.post('/otp/signup/verify', authController.verifySignupOtp);
router.post('/otp/login/verify', authController.verifyLoginOtp);
// Forgot password
router.post('/forgot/send', authController.forgotSendOtp);
router.post('/forgot/verify', authController.forgotVerifyOtp);

// Protected routes
router.get('/me', requireAuth, authController.me);
router.put('/profile', requireAuth, authController.updateProfile);
router.put('/password', requireAuth, authController.changePassword);
router.post('/refresh', requireAuth, authController.refreshToken);
router.post('/logout', requireAuth, authController.logout);

export default router;
