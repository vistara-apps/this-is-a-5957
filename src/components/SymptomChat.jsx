import React, { useState } from 'react';
import { Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react';
import { useSymptomData } from '../context/SymptomDataContext';
import { analyzeSymptoms } from '../services/aiService';

export const SymptomChat = ({ user, onShowPricing }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI health assistant. Please describe your symptoms, and I'll help you understand what they might indicate. Remember, this is for informational purposes only and not a substitute for professional medical advice."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addSymptomEntry, addRecommendation } = useSymptomData();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Analyze symptoms with AI
      const analysis = await analyzeSymptoms(input.trim());
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: analysis.diagnosis,
        confidence: analysis.confidence,
        recommendations: analysis.recommendations
      };

      setMessages(prev => [...prev, botMessage]);

      // Save symptom entry
      addSymptomEntry({
        userId: user.userId,
        symptoms: input.trim(),
        details: '',
        potentialDiagnosis: analysis.diagnosis,
        confidenceScore: analysis.confidence
      });

      // Add recommendations for premium users
      if (user.subscriptionStatus === 'premium' && analysis.recommendations?.length > 0) {
        analysis.recommendations.forEach(rec => {
          addRecommendation({
            userId: user.userId,
            recommendationText: rec.text,
            type: rec.type
          });
        });
      }

    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I'm having trouble analyzing your symptoms right now. Please try again in a moment.",
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card min-h-[70vh] flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-text-secondary/10 pb-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Symptom Triage Bot</h2>
          <p className="text-text-secondary mt-2">
            Describe your symptoms for AI-powered health insights
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-6 overflow-y-auto max-h-96 mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-primary text-white' 
                  : message.isError 
                    ? 'bg-accent text-white'
                    : 'bg-surface border border-text-secondary/20 text-text-secondary'
              }`}>
                {message.type === 'user' ? (
                  <User className="h-4 w-4" />
                ) : message.isError ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              
              <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-4 rounded-lg max-w-md sm:max-w-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-white'
                    : message.isError
                      ? 'bg-accent/10 border border-accent/20 text-text-primary'
                      : 'bg-surface border border-text-secondary/10 text-text-primary'
                }`}>
                  <p className="leading-relaxed">{message.content}</p>
                  
                  {message.confidence && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between text-sm">
                        <span>Confidence Level:</span>
                        <span className="font-medium">{Math.round(message.confidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-500"
                          style={{ width: `${message.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {message.recommendations && user.subscriptionStatus === 'free' && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center space-x-2 text-sm text-white/80">
                        <AlertCircle className="h-4 w-4" />
                        <span>Upgrade to Premium for personalized recommendations</span>
                      </div>
                      <button
                        onClick={onShowPricing}
                        className="mt-2 text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
                      >
                        View Plans
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface border border-text-secondary/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-text-secondary" />
              </div>
              <div className="bg-surface border border-text-secondary/10 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-text-secondary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing your symptoms...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms..."
            className="input flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-primary flex-shrink-0 flex items-center justify-center w-12 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};