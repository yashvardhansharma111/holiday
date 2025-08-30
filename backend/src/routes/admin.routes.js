import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole('ADMIN', 'SUPER_ADMIN'));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
// SUPER_ADMIN: create admin user
router.post('/users/admin', requireRole('SUPER_ADMIN'), adminController.createAdminUser);

// Property management
router.get('/properties/queue', adminController.getPropertyApprovalQueue);
router.put('/properties/:id/approve', adminController.approveProperty);

// Subscription plan management
router.get('/subscription-plans', adminController.getSubscriptionPlans);
router.post('/subscription-plans', requireRole('SUPER_ADMIN'), adminController.createSubscriptionPlan);
router.put('/subscription-plans/:id', requireRole('SUPER_ADMIN'), adminController.updateSubscriptionPlan);
router.delete('/subscription-plans/:id', requireRole('SUPER_ADMIN'), adminController.deleteSubscriptionPlan);

// Subscription management (manual)
router.post('/subscriptions/users/:userId/grant', adminController.grantUserSubscription);
router.post('/subscriptions/:subscriptionId/cancel', adminController.cancelUserSubscription);
router.put('/subscriptions/:subscriptionId/paid', adminController.setSubscriptionPaidStatus);
router.get('/subscriptions/users/:userId', adminController.getUserSubscription);

// Analytics and system health
router.get('/analytics', adminController.getPlatformAnalytics);
router.get('/health', adminController.getSystemHealth);

export default router;
