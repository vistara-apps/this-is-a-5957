import React from 'react'
import { Heart, Utensils, Activity, Brain, Calendar } from 'lucide-react'
import { formatDistance } from 'date-fns'

const RecommendationCard = ({ recommendation }) => {
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'diet':
      case 'nutrition':
        return <Utensils className="h-5 w-5 text-primary" />
      case 'exercise':
      case 'activity':
        return <Activity className="h-5 w-5 text-primary" />
      case 'lifestyle':
        return <Heart className="h-5 w-5 text-primary" />
      case 'mental health':
      case 'stress':
        return <Brain className="h-5 w-5 text-primary" />
      default:
        return <Heart className="h-5 w-5 text-primary" />
    }
  }

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'diet':
      case 'nutrition':
        return 'bg-green-500 bg-opacity-20 text-green-400'
      case 'exercise':
      case 'activity':
        return 'bg-blue-500 bg-opacity-20 text-blue-400'
      case 'lifestyle':
        return 'bg-purple-500 bg-opacity-20 text-purple-400'
      case 'mental health':
      case 'stress':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-400'
      default:
        return 'bg-primary bg-opacity-20 text-primary'
    }
  }

  return (
    <div className="bg-surface rounded-lg p-4 sm:p-6 shadow-card transition-all duration-200 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getTypeIcon(recommendation.type)}
          <div>
            <h3 className="font-medium text-text-primary capitalize">
              {recommendation.type || 'General'}
            </h3>
            <span className="text-xs text-text-secondary">
              {formatDistance(new Date(recommendation.timestamp), new Date(), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(recommendation.type)}`}>
          {recommendation.type || 'General'}
        </span>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-text-secondary leading-relaxed text-sm">
          {recommendation.recommendationText}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-text-secondary border-opacity-20">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-text-secondary" />
          <span className="text-xs text-text-secondary">
            {new Date(recommendation.timestamp).toLocaleDateString()}
          </span>
        </div>
        
        <button className="text-xs text-primary hover:text-blue-600 transition-colors">
          Mark as Applied
        </button>
      </div>
    </div>
  )
}

export default RecommendationCard