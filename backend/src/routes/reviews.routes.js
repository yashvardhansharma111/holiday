import express from 'express';
import { requireAuth, requireRole, validateResourceOwnership } from '../middleware/auth.js';
import * as reviewController from '../controllers/reviews.controller.js';

const router = express.Router();

// Public routes
router.get('/property/:propertyId', reviewController.listForProperty);

// Protected routes
router.post('/property/:propertyId', requireAuth, reviewController.addReview);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', requireAuth, validateResourceOwnership('review'), reviewController.updateReview);
router.delete('/:id', requireAuth, validateResourceOwnership('review'), reviewController.deleteReview);

// User's reviews
router.get('/user/list', requireAuth, reviewController.getUserReviews);

// Property owner's reviews
router.get('/owner/list', requireAuth, requireRole('OWNER', 'AGENT'), reviewController.getPropertyOwnerReviews);

// Admin routes
router.put('/:id/admin-response', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), reviewController.adminRespondToReview);

export default router;
