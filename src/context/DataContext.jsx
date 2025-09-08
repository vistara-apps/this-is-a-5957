import React, { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [symptomEntries, setSymptomEntries] = useState([])
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    // Load data from localStorage
    const storedEntries = localStorage.getItem('symptomsense_entries')
    const storedRecommendations = localStorage.getItem('symptomsense_recommendations')
    
    if (storedEntries) {
      setSymptomEntries(JSON.parse(storedEntries))
    }
    
    if (storedRecommendations) {
      setRecommendations(JSON.parse(storedRecommendations))
    }
  }, [])

  const addSymptomEntry = (entry) => {
    const newEntry = {
      entryId: Date.now().toString(),
      userId: 'demo-user-1',
      timestamp: new Date().toISOString(),
      ...entry
    }
    
    const updatedEntries = [newEntry, ...symptomEntries]
    setSymptomEntries(updatedEntries)
    localStorage.setItem('symptomsense_entries', JSON.stringify(updatedEntries))
    
    return newEntry
  }

  const addRecommendation = (recommendation) => {
    const newRecommendation = {
      recommendationId: Date.now().toString(),
      userId: 'demo-user-1',
      timestamp: new Date().toISOString(),
      ...recommendation
    }
    
    const updatedRecommendations = [newRecommendation, ...recommendations]
    setRecommendations(updatedRecommendations)
    localStorage.setItem('symptomsense_recommendations', JSON.stringify(updatedRecommendations))
    
    return newRecommendation
  }

  const analyzeSymptomPatterns = () => {
    if (symptomEntries.length < 2) return null

    // Simple pattern analysis
    const symptomCounts = {}
    const recentEntries = symptomEntries.slice(0, 10)
    
    recentEntries.forEach(entry => {
      entry.symptoms.forEach(symptom => {
        symptomCounts[symptom.toLowerCase()] = (symptomCounts[symptom.toLowerCase()] || 0) + 1
      })
    })

    const patterns = Object.entries(symptomCounts)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)

    return patterns.map(([symptom, count]) => ({
      symptom,
      frequency: count,
      trend: 'recurring'
    }))
  }

  return (
    <DataContext.Provider value={{
      symptomEntries,
      recommendations,
      addSymptomEntry,
      addRecommendation,
      analyzeSymptomPatterns
    }}>
      {children}
    </DataContext.Provider>
  )
}