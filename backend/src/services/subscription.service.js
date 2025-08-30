import prisma from '../db.js';

export class SubscriptionService {
  // Get all available subscription plans
  static async getSubscriptionPlans() {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
      });
      return plans;
    } catch (error) {
      throw new Error(`Failed to get subscription plans: ${error.message}`);
    }
  }

  // Create a new subscription for a user
  static async createSubscription(userId, planId, paid = false) {
    try {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId }
      });

      if (!plan || !plan.isActive) {
        throw new Error('Invalid or inactive subscription plan');
      }

      // Check if user already has an active subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: { 
          ownerId: userId, 
          isActive: true 
        }
      });

      if (existingSubscription) {
        throw new Error('User already has an active subscription');
      }

      // Create subscription record
      const subscription = await prisma.subscription.create({
        data: {
          type: plan.type,
          price: plan.price,
          features: plan.features,
          isActive: true,
          paid,
          ownerId: userId,
          planId: plan.id,
          maxProperties: plan.maxProperties,
          expiresAt: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000)
        }
      });

      return subscription;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  // Validate if user can list more properties
  static async canListProperty(userId) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { 
          ownerId: userId,
          isActive: true,
          paid: true,
          expiresAt: { gt: new Date() }
        }
      });

      if (!subscription) {
        return { canList: false, reason: 'No active subscription' };
      }

      // Count current properties
      const propertyCount = await prisma.property.count({
        where: { 
          ownerId: userId,
          status: { in: ['PENDING', 'LIVE'] }
        }
      });

      if (propertyCount >= subscription.maxProperties) {
        return { 
          canList: false, 
          reason: `Maximum properties (${subscription.maxProperties}) reached` 
        };
      }

      return { 
        canList: true, 
        remaining: subscription.maxProperties - propertyCount,
        subscription 
      };
    } catch (error) {
      throw new Error(`Failed to validate property listing: ${error.message}`);
    }
  }

  // Update subscription status
  static async updateSubscriptionStatus(subscriptionId, isActive) {
    try {
      const subscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { 
          isActive,
          updatedAt: new Date()
        }
      });
      return subscription;
    } catch (error) {
      throw new Error(`Failed to update subscription status: ${error.message}`);
    }
  }

  // Update subscription paid flag
  static async updateSubscriptionPaidStatus(subscriptionId, paid) {
    try {
      const subscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          paid,
          updatedAt: new Date()
        }
      });
      return subscription;
    } catch (error) {
      throw new Error(`Failed to update subscription payment status: ${error.message}`);
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId }
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Update local record
      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { 
          isActive: false,
          cancelledAt: new Date(),
          updatedAt: new Date()
        }
      });

      return updatedSubscription;
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  // Get user's subscription details
  static async getUserSubscription(userId) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { 
          ownerId: userId, 
          isActive: true 
        },
        include: {
          plan: true
        }
      });

      if (!subscription) {
        return null;
      }

      // Get property count
      const propertyCount = await prisma.property.count({
        where: { 
          ownerId: userId,
          status: { in: ['PENDING', 'LIVE'] }
        }
      });

      return {
        ...subscription,
        propertyCount,
        remainingProperties: subscription.maxProperties - propertyCount
      };
    } catch (error) {
      throw new Error(`Failed to get user subscription: ${error.message}`);
    }
  }

  // Check subscription expiration and deactivate expired ones
  static async checkExpiredSubscriptions() {
    try {
      const expiredSubscriptions = await prisma.subscription.findMany({
        where: {
          isActive: true,
          expiresAt: { lt: new Date() }
        }
      });

      for (const subscription of expiredSubscriptions) {
        await this.updateSubscriptionStatus(subscription.id, false);
      }

      return expiredSubscriptions.length;
    } catch (error) {
      throw new Error(`Failed to check expired subscriptions: ${error.message}`);
    }
  }

  // Upgrade/downgrade subscription
  static async changeSubscriptionPlan(userId, newPlanId, paid = false) {
    try {
      const newPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: newPlanId }
      });

      if (!newPlan || !newPlan.isActive) {
        throw new Error('Invalid or inactive subscription plan');
      }

      // Cancel current subscription
      const currentSubscription = await prisma.subscription.findFirst({
        where: { 
          ownerId: userId, 
          isActive: true 
        }
      });

      if (currentSubscription) {
        await this.cancelSubscription(currentSubscription.id);
      }

      // Create new subscription
      const newSubscription = await this.createSubscription(userId, newPlanId, paid);

      return newSubscription;
    } catch (error) {
      throw new Error(`Failed to change subscription plan: ${error.message}`);
    }
  }
}

export default SubscriptionService;