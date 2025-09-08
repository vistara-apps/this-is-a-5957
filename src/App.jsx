import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SymptomChat } from './components/SymptomChat';
import { Dashboard } from './components/Dashboard';
import { PricingModal } from './components/PricingModal';
import { SymptomDataProvider } from './context/SymptomDataContext';

function App() {
  const [currentView, setCurrentView] = useState('chat');
  const [showPricing, setShowPricing] = useState(false);
  const [user, setUser] = useState(null);

  // Simulate user authentication for demo
  useEffect(() => {
    const storedUser = localStorage.getItem('symptomsense_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Create demo user
      const demoUser = {
        userId: 'demo-user-1',
        email: 'demo@symptomsense.ai',
        subscriptionStatus: 'free',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('symptomsense_user', JSON.stringify(demoUser));
      setUser(demoUser);
    }
  }, []);

  const upgradeToPremium = () => {
    const updatedUser = { ...user, subscriptionStatus: 'premium' };
    setUser(updatedUser);
    localStorage.setItem('symptomsense_user', JSON.stringify(updatedUser));
    setShowPricing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-pulse-slow text-text-secondary">Loading SymptomSense AI...</div>
      </div>
    );
  }

  return (
    <SymptomDataProvider>
      <div className="min-h-screen bg-bg">
        <Header 
          currentView={currentView}
          setCurrentView={setCurrentView}
          user={user}
          onShowPricing={() => setShowPricing(true)}
        />
        
        <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {currentView === 'chat' && (
            <SymptomChat 
              user={user} 
              onShowPricing={() => setShowPricing(true)}
            />
          )}
          {currentView === 'dashboard' && (
            <Dashboard 
              user={user}
              onShowPricing={() => setShowPricing(true)}
            />
          )}
        </main>

        {showPricing && (
          <PricingModal
            onClose={() => setShowPricing(false)}
            onUpgrade={upgradeToPremium}
            currentPlan={user.subscriptionStatus}
          />
        )}
      </div>
    </SymptomDataProvider>
  );
}

export default App;