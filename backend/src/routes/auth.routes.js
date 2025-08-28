import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.get('/me', requireAuth, authController.me);
router.put('/profile', requireAuth, authController.updateProfile);
router.put('/password', requireAuth, authController.changePassword);
router.post('/refresh', requireAuth, authController.refreshToken);
router.post('/logout', requireAuth, authController.logout);

export default router;
