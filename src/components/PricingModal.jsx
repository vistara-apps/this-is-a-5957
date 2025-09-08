import React from 'react';
import { X, Check, Crown, Zap } from 'lucide-react';

export const PricingModal = ({ onClose, onUpgrade, currentPlan }) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Basic symptom analysis',
      features: [
        'Basic symptom triage',
        'Simple AI diagnosis',
        'Limited chat history',
        'Community support'
      ],
      buttonText: 'Current Plan',
      disabled: true,
      icon: <Zap className="h-5 w-5" />
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$5',
      period: '/month',
      description: 'Advanced health insights',
      features: [
        'Advanced symptom analysis',
        'Pattern identification',
        'Personalized recommendations',
        'Unlimited chat history',
        'Health trend analysis',
        'Priority support'
      ],
      buttonText: currentPlan === 'premium' ? 'Current Plan' : 'Upgrade Now',
      disabled: currentPlan === 'premium',
      highlighted: true,
      icon: <Crown className="h-5 w-5" />
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg shadow-card max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-text-secondary/10">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Choose Your Plan</h2>
            <p className="text-text-secondary mt-1">Unlock advanced health insights with Premium</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`card relative ${
                  plan.highlighted 
                    ? 'border-2 border-primary shadow-lg' 
                    : 'border border-text-secondary/10'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                    plan.highlighted ? 'bg-primary text-white' : 'bg-surface border border-text-secondary/20 text-text-secondary'
                  }`}>
                    {plan.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
                  <p className="text-text-secondary text-sm mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                    <span className="text-text-secondary">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-text-primary text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => plan.id === 'premium' && !plan.disabled ? onUpgrade() : null}
                  disabled={plan.disabled}
                  className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    plan.disabled
                      ? 'bg-surface border border-text-secondary/20 text-text-secondary cursor-not-allowed'
                      : plan.highlighted
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-surface border border-text-secondary/20 text-text-primary hover:bg-bg'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary text-sm">
              All plans include secure data handling and privacy protection.
            </p>
            <p className="text-text-secondary text-xs mt-2">
              Cancel anytime. No long-term commitments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};