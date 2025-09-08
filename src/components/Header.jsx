import React from 'react';
import { Activity, BarChart3, MessageSquare, Crown } from 'lucide-react';

export const Header = ({ currentView, setCurrentView, user, onShowPricing }) => {
  return (
    <header className="border-b border-text-secondary/10 bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-primary rounded-lg p-2">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">SymptomSense AI</h1>
              <p className="text-xs sm:text-sm text-text-secondary hidden sm:block">
                Understand your symptoms, predict your health
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <nav className="flex space-x-1 sm:space-x-2">
              <button
                onClick={() => setCurrentView('chat')}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md transition-colors ${
                  currentView === 'chat'
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </button>
              
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </nav>

            {/* Subscription Status */}
            <div className="flex items-center space-x-2">
              {user.subscriptionStatus === 'premium' ? (
                <div className="flex items-center space-x-1 text-accent text-sm">
                  <Crown className="h-4 w-4" />
                  <span className="hidden sm:inline">Premium</span>
                </div>
              ) : (
                <button
                  onClick={onShowPricing}
                  className="bg-accent text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  <span className="hidden sm:inline">Upgrade</span>
                  <span className="sm:hidden">Pro</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};