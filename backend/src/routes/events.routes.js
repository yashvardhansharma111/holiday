import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as eventsController from '../controllers/events.controller.js';

const router = express.Router();

// Public listing and details
router.get('/', eventsController.listEvents);
router.get('/:id', eventsController.getEventById);

// SUPER_ADMIN only CRUD
router.use(requireAuth);
router.use(requireRole('SUPER_ADMIN'));
router.post('/', eventsController.createEvent);
router.put('/:id', eventsController.updateEvent);
router.delete('/:id', eventsController.deleteEvent);

export default router;
