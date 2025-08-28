import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import SubscriptionService from '../services/subscription.service.js';
import { successResponse, errorResponse, ERROR_MESSAGES, HTTP_STATUS } from '../utils/responses.js';
import { createSubscriptionSchema, updateSubscriptionSchema } from '../schemas/index.js';
import { z } from 'zod';
import prisma from '../db.js';

const router = express.Router();

// Get all available subscription plans (public)
router.get('/plans', async (req, res) => {
  try {
    const plans = await SubscriptionService.getSubscriptionPlans();
    res.json(successResponse(plans, 'Subscription plans retrieved successfully'));
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve subscription plans', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
});

// Get user's current subscription
router.get('/user', requireAuth, async (req, res) => {
  try {
    const subscription = await SubscriptionService.getUserSubscription(req.user.id);
    res.json(successResponse(subscription, 'User subscription retrieved successfully'));
  } catch (error) {
    console.error('Get user subscription error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve user subscription', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
});

// Create new subscription
router.post('/', requireAuth, requireRole('OWNER'), async (req, res) => {
  try {
    const data = createSubscriptionSchema.parse(req.body);
    
    // Create subscription
    const subscription = await SubscriptionService.createSubscription(
      req.user.id,
      data.planId
    );
    
    res.status(HTTP_STATUS.CREATED).json(
      successResponse(subscription, 'Subscription created successfully', HTTP_STATUS.CREATED)
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Create subscription error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse(error.message || 'Failed to create subscription', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
});

// Update subscription plan
router.put('/:id', requireAuth, requireRole('OWNER'), async (req, res) => {
  try {
    const data = updateSubscriptionSchema.parse(req.body);
    
    // Change subscription plan
    const updatedSubscription = await SubscriptionService.changeSubscriptionPlan(
      req.user.id,
      data.planId
    );
    
    res.json(successResponse(updatedSubscription, 'Subscription plan updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.errors)
      );
    }
    
    console.error('Update subscription error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse(error.message || 'Failed to update subscription', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
});

// Cancel subscription
router.delete('/:id', requireAuth, requireRole('OWNER'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cancel subscription
    const cancelledSubscription = await SubscriptionService.cancelSubscription(Number(id));
    
    res.json(successResponse(cancelledSubscription, 'Subscription cancelled successfully'));
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse(error.message || 'Failed to cancel subscription', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
});

// Get subscription usage (for owners)
router.get('/usage', requireAuth, requireRole('OWNER'), async (req, res) => {
  try {
    const subscription = await SubscriptionService.getUserSubscription(req.user.id);
    
    if (!subscription) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('No active subscription found', HTTP_STATUS.NOT_FOUND)
      );
    }
    
    // Get property count
    const propertyCount = await prisma.property.count({
      where: {
        ownerId: req.user.id,
        status: { in: ['PENDING', 'LIVE'] }
      }
    });
    
    const usage = {
      subscription,
      propertyCount,
      remainingProperties: subscription.maxProperties - propertyCount,
      usagePercentage: Math.round((propertyCount / subscription.maxProperties) * 100)
    };
    
    res.json(successResponse(usage, 'Subscription usage retrieved successfully'));
  } catch (error) {
    console.error('Get subscription usage error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Failed to retrieve subscription usage', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
});

export default router; 