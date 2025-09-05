import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as destinationsController from '../controllers/destinations.controller.js';

const router = express.Router();

// Public routes
router.get('/regions', destinationsController.getRegionsWithDestinations);
router.get('/regions/:regionSlug/destinations', destinationsController.getDestinationsByRegion);

// Admin routes - Region management
router.get('/admin/regions', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), destinationsController.getAllRegions);
router.post('/admin/regions', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), destinationsController.createRegion);
router.put('/admin/regions/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), destinationsController.updateRegion);
router.delete('/admin/regions/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), destinationsController.deleteRegion);

// Admin routes - Destination management
router.get('/admin/destinations', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), destinationsController.getAllDestinations);
router.post('/admin/destinations', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), destinationsController.createDestination);
router.put('/admin/destinations/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), destinationsController.updateDestination);
router.delete('/admin/destinations/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), destinationsController.deleteDestination);

export default router;
