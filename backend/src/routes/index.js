import express from 'express';
import authRoutes from './auth.routes.js';
import propertyRoutes from './properties.routes.js';
import reviewRoutes from './reviews.routes.js';
import bookingRoutes from './bookings.routes.js';
import adminRoutes from './admin.routes.js';
import subscriptionRoutes from './subscriptions.routes.js';
import mediaRoutes from './media.routes.js';
import destinationsRoutes from './destinations.routes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API documentation
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'BookHolidayRental API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      properties: '/properties',
      reviews: '/reviews',
      bookings: '/bookings',
      admin: '/admin',
      subscriptions: '/subscriptions',
      media: '/media',
      destinations: '/destinations'
    },
    documentation: 'https://github.com/your-repo/docs'
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/reviews', reviewRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/media', mediaRoutes);
router.use('/destinations', destinationsRoutes);

export default router;
