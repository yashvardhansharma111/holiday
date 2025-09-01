import express from 'express';
import { requireAuth, requireRole, validateResourceOwnership } from '../middleware/auth.js';
import * as bookingController from '../controllers/bookings.controller.js';

const router = express.Router();

// Protected routes - Users
router.post('/', requireAuth, bookingController.createBooking);
router.get('/user/list', requireAuth, bookingController.getUserBookings);
router.get('/:id', requireAuth, validateResourceOwnership('booking'), bookingController.getBookingById);
router.put('/:id', requireAuth, validateResourceOwnership('booking'), bookingController.updateBooking);
router.delete('/:id', requireAuth, validateResourceOwnership('booking'), bookingController.cancelBooking);

// Property owner/agent routes
router.get('/owner/aggregated', requireAuth, requireRole('OWNER', 'AGENT'), bookingController.getOwnerAggregatedBookings);
router.get('/property/:propertyId', requireAuth, requireRole('OWNER', 'AGENT'), bookingController.getPropertyBookings);
router.put('/:id/confirm', requireAuth, requireRole('OWNER', 'AGENT'), bookingController.confirmBooking);

export default router;
