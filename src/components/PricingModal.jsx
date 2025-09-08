import React, { useState } from 'react';
import { X, Check, Zap, Shield, TrendingUp, Brain, Loader2, CreditCard } from 'lucide-react';
import { Button } from './Button';
import { stripeService, pricingConfig } from '../services/stripeService';

export const PricingModal = ({ onClose, onUpgrade, currentPlan, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async (planName) => {
    if (planName === 'Free' || currentPlan === 'premium') return;

    setIsLoading(true);
    setError('');

    try {
      // For demo purposes, use mock subscription
      if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY === 'your-stripe-publishable-key') {
        const result = await stripeService.mockSubscription(user?.userId, 'premium');
        if (result.success) {
          onUpgrade();
          onClose();
        }
      } else {
        // Real Stripe integration
        await stripeService.createCheckoutSession(
          pricingConfig.plans.premium.priceId,
          user?.userId,
          user?.email
        );
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      setError('Failed to process upgrade. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out SymptomSense AI',
      features: pricingConfig.plans.free.features,
      limitations: pricingConfig.plans.free.limitations,
      current: currentPlan === 'free',
      popular: false
    },
    {
      name: 'Premium',
      price: `$${pricingConfig.plans.premium.price}`,
      period: 'per month',
      description: 'Unlock the full power of AI-driven health insights',
      features: pricingConfig.plans.premium.features,
      limitations: pricingConfig.plans.premium.limitations,
      current: currentPlan === 'premium',
      popular: true
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-card w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Choose Your Plan</h2>
            <p className="text-text-secondary mt-1">Upgrade to unlock advanced AI health insights</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-md p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Plans */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-lg border-2 p-6 ${
                  plan.popular
                    ? 'border-primary bg-primary bg-opacity-5'
                    : 'border-gray-600 bg-surface'
                } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {plan.current && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-text-primary mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                    <span className="text-text-secondary ml-1">/{plan.period}</span>
                  </div>
                  <p className="text-text-secondary text-sm">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      What's included:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-text-secondary">
                          <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-text-primary mb-3 flex items-center">
                        <X className="w-4 h-4 text-red-500 mr-2" />
                        Limitations:
                      </h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start text-sm text-text-secondary">
                            <X className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className="w-full"
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={plan.current || isLoading}
                >
                  {isLoading && plan.name === 'Premium' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {plan.current ? (
                        'Current Plan'
                      ) : plan.name === 'Free' ? (
                        'Current Plan'
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Upgrade Now
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Feature comparison */}
          <div className="mt-8 pt-8 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-text-primary mb-6 text-center">
              Why upgrade to Premium?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-text-primary mb-2">Advanced AI Analysis</h4>
                <p className="text-sm text-text-secondary">
                  Get deeper insights with our most sophisticated AI models for more accurate symptom analysis.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-text-primary mb-2">Pattern Recognition</h4>
                <p className="text-sm text-text-secondary">
                  Identify chronic conditions and health trends by analyzing your symptom patterns over time.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-text-primary mb-2">Personalized Recommendations</h4>
                <p className="text-sm text-text-secondary">
                  Receive tailored health advice based on your unique symptom history and lifestyle factors.
                </p>
              </div>
            </div>
          </div>

          {/* Usage limits comparison */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                <h4 className="font-semibold text-text-primary mb-3">Free Plan Limits</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• 5 symptom checks per month</li>
                  <li>• 7 days of symptom history</li>
                  <li>• 3 basic recommendations</li>
                  <li>• No pattern analysis</li>
                </ul>
              </div>
              
              <div className="bg-primary bg-opacity-10 border border-primary rounded-lg p-4">
                <h4 className="font-semibold text-text-primary mb-3">Premium Benefits</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• Unlimited symptom checks</li>
                  <li>• Complete symptom history</li>
                  <li>• Unlimited personalized recommendations</li>
                  <li>• Advanced pattern analysis</li>
                  <li>• Health data export</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Money back guarantee */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-center text-sm text-text-secondary">
              <Shield className="w-4 h-4 mr-2" />
              30-day money-back guarantee • Cancel anytime • Secure payment with Stripe
            </div>
          </div>

          {/* Demo notice */}
          {(!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY === 'your-stripe-publishable-key') && (
            <div className="mt-4 bg-primary bg-opacity-10 border border-primary rounded-md p-3">
              <p className="text-primary text-sm text-center">
                <strong>Demo Mode:</strong> Stripe is not configured. Upgrade will simulate a successful payment for demonstration purposes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
