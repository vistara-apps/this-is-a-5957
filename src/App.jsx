import React, { useState, useEffect } from 'react'
import AppShell from './components/AppShell'
import Dashboard from './components/Dashboard'
import SymptomChecker from './components/SymptomChecker'
import { DataProvider } from './context/DataContext'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Simulate user authentication
    const userData = localStorage.getItem('symptomsense_user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      // Create demo user
      const demoUser = {
        userId: 'demo-user-1',
        email: 'demo@symptomsense.ai',
        createdAt: new Date().toISOString(),
        subscriptionStatus: 'free'
      }
      localStorage.setItem('symptomsense_user', JSON.stringify(demoUser))
      setUser(demoUser)
    }
  }, [])

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen bg-bg text-text-primary">Loading...</div>
  }

  return (
    <DataProvider>
      <AppShell 
        currentView={currentView} 
        onViewChange={setCurrentView}
        user={user}
        onUserUpdate={setUser}
      >
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'symptom-checker' && <SymptomChecker />}
      </AppShell>
    </DataProvider>
  )
}

export default App