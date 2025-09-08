import React from 'react'
import { useData } from '../context/DataContext'
import { TrendingUp, AlertCircle, Brain, Clock } from 'lucide-react'

const PatternAnalysis = () => {
  const { analyzeSymptomPatterns, symptomEntries } = useData()
  
  const patterns = analyzeSymptomPatterns()

  if (!patterns || patterns.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-4 sm:p-6 shadow-card">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-text-primary">Pattern Analysis</h2>
        </div>
        
        <div className="text-center py-6 sm:py-8">
          <TrendingUp className="h-12 w-12 text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No patterns detected yet</h3>
          <p className="text-text-secondary">
            Log at least 2 symptom entries to start identifying patterns in your health data
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-lg p-4 sm:p-6 shadow-card">
      <div className="flex items-center space-x-3 mb-4">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold text-text-primary">Pattern Analysis</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-text-secondary mb-4">
          <Clock className="h-4 w-4" />
          <span>Analyzing patterns from your last {symptomEntries.length} entries</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patterns.map((pattern, index) => (
            <div key={index} className="bg-bg rounded-lg p-4 border border-text-secondary border-opacity-20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-text-primary capitalize mb-1">
                    {pattern.symptom}
                  </h3>
                  <span className="text-xs text-text-secondary">
                    Recurring symptom
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-accent">
                    {pattern.frequency}x
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Pattern Strength</span>
                <div className="flex items-center space-x-2">
                  <div className="w-12 bg-surface rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((pattern.frequency / symptomEntries.length) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {Math.round((pattern.frequency / symptomEntries.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-accent bg-opacity-10 border border-accent border-opacity-30 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-text-primary mb-1">Pattern Insights</h4>
              <p className="text-sm text-text-secondary">
                We've identified recurring symptoms in your health data. Consider discussing these patterns 
                with your healthcare provider, especially if symptoms are persistent or worsening.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatternAnalysis