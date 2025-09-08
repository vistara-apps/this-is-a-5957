import React from 'react'
import { useData } from '../context/DataContext'
import SymptomCard from './SymptomCard'
import RecommendationCard from './RecommendationCard'
import PatternAnalysis from './PatternAnalysis'
import { Calendar, TrendingUp, Brain, Plus } from 'lucide-react'
import Button from './Button'

const Dashboard = () => {
  const { symptomEntries, recommendations } = useData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text-primary">Health Dashboard</h1>
          <p className="text-text-secondary mt-2">Track your symptoms and get personalized insights</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="primary" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Symptoms</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-surface rounded-lg p-4 sm:p-6 shadow-card">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Total Entries</p>
              <p className="text-2xl font-bold text-text-primary">{symptomEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-4 sm:p-6 shadow-card">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-accent" />
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">This Week</p>
              <p className="text-2xl font-bold text-text-primary">
                {symptomEntries.filter(entry => {
                  const entryDate = new Date(entry.timestamp)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return entryDate > weekAgo
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-4 sm:p-6 shadow-card">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Recommendations</p>
              <p className="text-2xl font-bold text-text-primary">{recommendations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Analysis */}
      <PatternAnalysis />

      {/* Recent Symptom Entries */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-text-primary">Recent Symptom Entries</h2>
        {symptomEntries.length === 0 ? (
          <div className="bg-surface rounded-lg p-6 sm:p-8 text-center">
            <Brain className="h-12 w-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No symptoms logged yet</h3>
            <p className="text-text-secondary mb-4">Start by checking your symptoms to get personalized health insights</p>
            <Button variant="primary">Check Symptoms Now</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {symptomEntries.slice(0, 6).map((entry) => (
              <SymptomCard key={entry.entryId} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Health Recommendations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-text-primary">Health Recommendations</h2>
        {recommendations.length === 0 ? (
          <div className="bg-surface rounded-lg p-6 sm:p-8 text-center">
            <TrendingUp className="h-12 w-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No recommendations yet</h3>
            <p className="text-text-secondary">Log some symptoms to receive personalized health recommendations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {recommendations.slice(0, 6).map((recommendation) => (
              <RecommendationCard key={recommendation.recommendationId} recommendation={recommendation} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard