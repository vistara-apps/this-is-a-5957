import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const stripeService = {
  // Create checkout session for subscription
  async createCheckoutSession(priceId, userId, userEmail) {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          userEmail,
          successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Create customer portal session
  async createPortalSession(customerId) {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: `${window.location.origin}/dashboard`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  },

  // Verify checkout session
  async verifyCheckoutSession(sessionId) {
    try {
      const response = await fetch(`/api/verify-checkout-session?session_id=${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to verify checkout session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying checkout session:', error);
      throw error;
    }
  },

  // Mock implementation for demo purposes
  async mockSubscription(userId, plan = 'premium') {
    // Simulate successful subscription for demo
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          subscription: {
            id: `sub_mock_${Date.now()}`,
            status: 'active',
            plan: plan,
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          }
        });
      }, 1500); // Simulate API delay
    });
  },

  // Get subscription status
  async getSubscriptionStatus(userId) {
    try {
      const response = await fetch(`/api/subscription-status?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get subscription status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting subscription status:', error);
      // Return mock data for demo
      return {
        status: 'free',
        plan: 'free',
        current_period_end: null
      };
    }
  }
};

// Pricing configuration
export const pricingConfig = {
  plans: {
    free: {
      name: 'Free',
      price: 0,
      priceId: null,
      features: [
        'Basic symptom triage',
        'Up to 5 symptom checks per month',
        'General health recommendations',
        'Basic symptom history'
      ],
      limitations: [
        'Limited AI analysis',
        'No pattern recognition',
        'No personalized recommendations'
      ]
    },
    premium: {
      name: 'Premium',
      price: 5,
      priceId: 'price_premium_monthly', // Replace with actual Stripe price ID
      features: [
        'Unlimited symptom analysis',
        'Advanced pattern identification',
        'Personalized health recommendations',
        'Detailed symptom tracking',
        'Health trend analysis',
        'Export health reports',
        'Priority AI processing'
      ],
      limitations: []
    }
  },

  // Feature access control
  hasAccess: (userPlan, feature) => {
    const planFeatures = {
      free: ['basic_triage', 'limited_history'],
      premium: ['basic_triage', 'limited_history', 'pattern_analysis', 'personalized_recommendations', 'unlimited_checks', 'export_data']
    };

    return planFeatures[userPlan]?.includes(feature) || false;
  },

  // Usage limits
  getLimits: (userPlan) => {
    const limits = {
      free: {
        monthlyChecks: 5,
        historyDays: 7,
        recommendations: 3
      },
      premium: {
        monthlyChecks: -1, // unlimited
        historyDays: -1, // unlimited
        recommendations: -1 // unlimited
      }
    };

    return limits[userPlan] || limits.free;
  }
};
