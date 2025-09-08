import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import ChatInput from './ChatInput'
import { getSymptomAnalysis } from '../services/aiService'
import { Brain, AlertCircle, CheckCircle } from 'lucide-react'
import Button from './Button'

const SymptomChecker = () => {
  const { addSymptomEntry, addRecommendation } = useData()
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI health assistant. Please describe your symptoms in detail, and I'll help you understand what they might mean. Remember, this is for informational purposes only and not a substitute for professional medical advice.",
      timestamp: new Date().toISOString()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState(null)

  const handleSubmitSymptoms = async (symptoms) => {
    if (!symptoms.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: symptoms,
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Get AI analysis
      const analysis = await getSymptomAnalysis(symptoms)
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: analysis.explanation,
        timestamp: new Date().toISOString(),
        analysis: analysis
      }
      
      setMessages(prev => [...prev, aiMessage])
      setCurrentAnalysis(analysis)

      // Save symptom entry
      addSymptomEntry({
        symptoms: analysis.symptoms || [symptoms],
        details: symptoms,
        potentialDiagnosis: analysis.possibleConditions || [],
        confidenceScore: analysis.confidenceScore || 0.7
      })

      // Generate and save recommendations if available
      if (analysis.recommendations && analysis.recommendations.length > 0) {
        analysis.recommendations.forEach(rec => {
          addRecommendation({
            recommendationText: rec.text,
            type: rec.type || 'General'
          })
        })
      }

    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble analyzing your symptoms right now. Please try again or consult with a healthcare professional if your symptoms are concerning.",
        timestamp: new Date().toISOString(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startNewSession = () => {
    setMessages([{
      id: Date.now(),
      type: 'ai',
      content: "Let's start fresh! Please describe your current symptoms and I'll help you understand what they might mean.",
      timestamp: new Date().toISOString()
    }])
    setCurrentAnalysis(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-text-primary">Symptom Checker</h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Describe your symptoms and get instant AI-powered insights. Our advanced AI will help you understand 
          potential causes and provide guidance on next steps.
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-text-secondary">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-accent" />
            <span>Not a medical diagnosis</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>AI-powered analysis</span>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-surface rounded-lg shadow-card">
        {/* Messages */}
        <div className="p-4 sm:p-6 space-y-4 max-h-96 md:max-h-[500px] overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`chat-message flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-primary text-white' 
                  : message.isError 
                    ? 'bg-accent bg-opacity-20 text-accent border border-accent border-opacity-30'
                    : 'bg-bg text-text-primary border border-text-secondary border-opacity-20'
              }`}>
                {message.type === 'ai' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-4 w-4" />
                    <span className="text-xs font-medium opacity-75">AI Assistant</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                
                {/* Analysis Results */}
                {message.analysis && (
                  <div className="mt-4 space-y-3 border-t border-text-secondary border-opacity-20 pt-3">
                    {message.analysis.possibleConditions && message.analysis.possibleConditions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold mb-2 text-text-secondary">Possible Conditions:</h4>
                        <ul className="space-y-1">
                          {message.analysis.possibleConditions.slice(0, 3).map((condition, index) => (
                            <li key={index} className="text-xs flex items-center space-x-2">
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                              <span>{condition}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {message.analysis.urgencyLevel && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-text-secondary">Urgency:</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          message.analysis.urgencyLevel === 'high' ? 'bg-accent text-white' :
                          message.analysis.urgencyLevel === 'medium' ? 'bg-yellow-500 text-white' :
                          'bg-green-500 text-white'
                        }`}>
                          {message.analysis.urgencyLevel}
                        </span>
                      </div>
                    )}
                    
                    {message.analysis.confidenceScore && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-text-secondary">Confidence:</span>
                        <div className="flex-1 bg-bg rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${message.analysis.confidenceScore * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-text-secondary">
                          {Math.round(message.analysis.confidenceScore * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-xs opacity-50 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-bg text-text-primary border border-text-secondary border-opacity-20 px-4 py-3 rounded-lg max-w-xs">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span className="text-xs font-medium opacity-75">AI Assistant</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-xs text-text-secondary">Analyzing symptoms...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-text-secondary border-opacity-20 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <ChatInput 
                onSubmit={handleSubmitSymptoms}
                disabled={isLoading}
                placeholder="Describe your symptoms in detail..."
              />
            </div>
            <Button 
              variant="ghost" 
              onClick={startNewSession}
              className="text-sm whitespace-nowrap"
            >
              New Session
            </Button>
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Be as specific as possible. Include duration, severity, and any triggering factors.
          </p>
        </div>
      </div>

      {/* Current Analysis Summary */}
      {currentAnalysis && (
        <div className="bg-surface rounded-lg p-4 sm:p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Analysis Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="font-medium text-text-primary mb-2">Key Insights</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                {currentAnalysis.keyInsights?.slice(0, 3).map((insight, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                )) || [
                  <li key="default" className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Symptom analysis completed successfully</span>
                  </li>
                ]}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-text-primary mb-2">Recommended Actions</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                {currentAnalysis.recommendedActions?.slice(0, 3).map((action, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                )) || [
                  <li key="default" className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Monitor symptoms and consult healthcare provider if concerned</span>
                  </li>
                ]}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SymptomChecker