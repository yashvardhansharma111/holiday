import express from 'express';
import { requireAuth, requireRole, validateResourceOwnership } from '../middleware/auth.js';
import * as propertyController from '../controllers/properties.controller.js';
import { exportPropertyAvailabilityICS, syncPropertyIcal, getPropertyIcalBlocks, getPropertyIcalMeta } from '../controllers/ical.controller.js';

const router = express.Router();

// Public routes
router.get('/', propertyController.listPublic);
router.get('/cities/popular-rentals', propertyController.getPopularRentalsByCity);
router.get('/cities', propertyController.getPopularCities);
router.get('/featured', propertyController.getFeaturedProperties);
router.get('/popular', propertyController.getPopularProperties);
// Runtime iCal (no DB changes)
router.post('/:id/ical/sync', syncPropertyIcal);
router.get('/:id/ical/blocks', getPropertyIcalBlocks);
router.get('/:id/ical/meta', getPropertyIcalMeta);
router.get('/:id/availability.ics', exportPropertyAvailabilityICS);
router.get('/:id/availability-check', propertyController.checkAvailability);
router.get('/:id', propertyController.getPropertyById);

// Protected routes - Agent/Owner
router.post('/', requireAuth, requireRole('AGENT', 'OWNER'), propertyController.createByAgentOrOwner);
router.put('/:id', requireAuth, validateResourceOwnership('property'), propertyController.updateProperty);
router.delete('/:id', requireAuth, validateResourceOwnership('property'), propertyController.deleteProperty);

// Media management for a property
router.post('/:id/media', requireAuth, propertyController.addPropertyMedia);
router.delete('/:id/media', requireAuth, propertyController.removePropertyMedia);

// Presigned URL for direct uploads
router.post('/media/presign', requireAuth, propertyController.getPresignedUploadUrl);

// User's properties
router.get('/user/list', requireAuth, propertyController.getUserProperties);

// Agent routes - Feature flags
router.put('/:id/feature-flags', requireAuth, requireRole('AGENT'), propertyController.updateFeatureFlags);

// Admin routes
router.get('/admin/queue', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), propertyController.getAdminReviewQueue);
router.put('/admin/:id/approve', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), propertyController.adminApprove);

export default router;
