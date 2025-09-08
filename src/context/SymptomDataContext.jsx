import React, { createContext, useContext, useState, useEffect } from 'react';

const SymptomDataContext = createContext();

export const useSymptomData = () => {
  const context = useContext(SymptomDataContext);
  if (!context) {
    throw new Error('useSymptomData must be used within a SymptomDataProvider');
  }
  return context;
};

export const SymptomDataProvider = ({ children }) => {
  const [symptomEntries, setSymptomEntries] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedEntries = localStorage.getItem('symptomsense_entries');
    const storedRecommendations = localStorage.getItem('symptomsense_recommendations');
    
    if (storedEntries) {
      setSymptomEntries(JSON.parse(storedEntries));
    }
    
    if (storedRecommendations) {
      setRecommendations(JSON.parse(storedRecommendations));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('symptomsense_entries', JSON.stringify(symptomEntries));
  }, [symptomEntries]);

  useEffect(() => {
    localStorage.setItem('symptomsense_recommendations', JSON.stringify(recommendations));
  }, [recommendations]);

  const addSymptomEntry = (entry) => {
    const newEntry = {
      entryId: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...entry
    };
    setSymptomEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const addRecommendation = (recommendation) => {
    const newRecommendation = {
      recommendationId: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...recommendation
    };
    setRecommendations(prev => [newRecommendation, ...prev]);
    return newRecommendation;
  };

  const deleteSymptomEntry = (entryId) => {
    setSymptomEntries(prev => prev.filter(entry => entry.entryId !== entryId));
  };

  const value = {
    symptomEntries,
    recommendations,
    addSymptomEntry,
    addRecommendation,
    deleteSymptomEntry
  };

  return (
    <SymptomDataContext.Provider value={value}>
      {children}
    </SymptomDataContext.Provider>
  );
};