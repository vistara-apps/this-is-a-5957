import React from 'react'
import { Activity, Brain, User, Settings, Plus } from 'lucide-react'
import Button from './Button'

const AppShell = ({ children, currentView, onViewChange, user, onUserUpdate }) => {
  const upgradeTopremium = () => {
    const updatedUser = { ...user, subscriptionStatus: 'premium' }
    localStorage.setItem('symptomsense_user', JSON.stringify(updatedUser))
    onUserUpdate(updatedUser)
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-text-secondary border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-text-primary">SymptomSense AI</h1>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => onViewChange('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard' 
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onViewChange('symptom-checker')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'symptom-checker' 
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Check Symptoms
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              {user?.subscriptionStatus === 'free' && (
                <Button variant="primary" onClick={upgradeTopremium} className="text-sm">
                  Upgrade to Premium
                </Button>
              )}
              {user?.subscriptionStatus === 'premium' && (
                <span className="text-sm text-accent font-medium">Premium User</span>
              )}
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-text-secondary" />
                <span className="text-sm text-text-secondary">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-surface border-b border-text-secondary border-opacity-20">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`flex flex-col items-center py-2 px-4 text-xs ${
              currentView === 'dashboard' ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            <Brain className="h-5 w-5 mb-1" />
            Dashboard
          </button>
          <button
            onClick={() => onViewChange('symptom-checker')}
            className={`flex flex-col items-center py-2 px-4 text-xs ${
              currentView === 'symptom-checker' ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            <Plus className="h-5 w-5 mb-1" />
            Check Symptoms
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}

export default AppShell