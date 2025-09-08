import React from 'react'
import { Calendar, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatDistance } from 'date-fns'

const SymptomCard = ({ entry, variant = 'default' }) => {
  const isHighlighted = variant === 'highlighted'
  
  const getUrgencyColor = (score) => {
    if (score >= 0.8) return 'text-accent'
    if (score >= 0.5) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getUrgencyLevel = (score) => {
    if (score >= 0.8) return 'High'
    if (score >= 0.5) return 'Medium'
    return 'Low'
  }

  return (
    <div className={`bg-surface rounded-lg p-4 sm:p-6 shadow-card transition-all duration-200 hover:shadow-lg ${
      isHighlighted ? 'ring-2 ring-primary ring-opacity-50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-text-secondary" />
          <span className="text-sm text-text-secondary">
            {formatDistance(new Date(entry.timestamp), new Date(), { addSuffix: true })}
          </span>
        </div>
        
        {entry.confidenceScore && (
          <div className="flex items-center space-x-2">
            <TrendingUp className={`h-4 w-4 ${getUrgencyColor(entry.confidenceScore)}`} />
            <span className={`text-xs font-medium ${getUrgencyColor(entry.confidenceScore)}`}>
              {getUrgencyLevel(entry.confidenceScore)}
            </span>
          </div>
        )}
      </div>

      {/* Symptoms */}
      <div className="mb-4">
        <h3 className="font-medium text-text-primary mb-2">Symptoms</h3>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(entry.symptoms) ? entry.symptoms.map((symptom, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-bg text-text-primary text-xs rounded-full border border-text-secondary border-opacity-30"
            >
              {symptom}
            </span>
          )) : (
            <span className="px-2 py-1 bg-bg text-text-primary text-xs rounded-full border border-text-secondary border-opacity-30">
              {entry.symptoms}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      {entry.details && (
        <div className="mb-4">
          <h4 className="font-medium text-text-primary text-sm mb-2">Details</h4>
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
            {entry.details}
          </p>
        </div>
      )}

      {/* Potential Diagnoses */}
      {entry.potentialDiagnosis && entry.potentialDiagnosis.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-text-primary text-sm mb-2">Potential Conditions</h4>
          <ul className="space-y-1">
            {entry.potentialDiagnosis.slice(0, 3).map((diagnosis, index) => (
              <li key={index} className="text-text-secondary text-sm flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                <span>{diagnosis}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confidence Score */}
      {entry.confidenceScore && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Confidence Score</span>
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-bg rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${entry.confidenceScore * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-text-secondary">
              {Math.round(entry.confidenceScore * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SymptomCard