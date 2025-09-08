import React, { useState } from 'react';
import { TrendingUp, Calendar, Heart, Brain, Utensils, Activity, AlertCircle, Trash2 } from 'lucide-react';
import { useSymptomData } from '../context/SymptomDataContext';
import { generateHealthRecommendations } from '../services/aiService';

export const Dashboard = ({ user, onShowPricing }) => {
  const { symptomEntries, recommendations, addRecommendation, deleteSymptomEntry } = useSymptomData();
  const [activeTab, setActiveTab] = useState('overview');
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSymptomTrends = () => {
    const trends = {};
    symptomEntries.forEach(entry => {
      const keywords = entry.symptoms.toLowerCase().split(/\s+/);
      keywords.forEach(keyword => {
        if (keyword.length > 3) { // Filter out small words
          trends[keyword] = (trends[keyword] || 0) + 1;
        }
      });
    });
    
    return Object.entries(trends)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));
  };

  const generatePersonalizedRecommendations = async () => {
    if (user.subscriptionStatus === 'free') {
      onShowPricing();
      return;
    }

    setIsGeneratingRecommendations(true);
    try {
      const recentSymptoms = symptomEntries.slice(0, 10);
      const newRecommendations = await generateHealthRecommendations(recentSymptoms);
      
      newRecommendations.forEach(rec => {
        addRecommendation({
          userId: user.userId,
          recommendationText: rec.text,
          type: rec.type
        });
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'Diet': return <Utensils className="h-5 w-5" />;
      case 'Exercise': return <Activity className="h-5 w-5" />;
      case 'Lifestyle': return <Heart className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'history', label: 'History', icon: Calendar },
    { id: 'recommendations', label: 'Recommendations', icon: Heart }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">Health Dashboard</h1>
          <p className="text-text-secondary mt-2">Track your symptoms and health patterns</p>
        </div>
        
        {user.subscriptionStatus === 'premium' && (
          <button
            onClick={generatePersonalizedRecommendations}
            disabled={isGeneratingRecommendations}
            className="btn-primary flex items-center space-x-2"
          >
            <Brain className="h-4 w-4" />
            <span>{isGeneratingRecommendations ? 'Generating...' : 'Generate Recommendations'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-text-secondary/10">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stats Cards */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="card text-center">
                <div className="text-2xl font-bold text-primary">{symptomEntries.length}</div>
                <div className="text-text-secondary text-sm">Total Entries</div>
              </div>
              
              <div className="card text-center">
                <div className="text-2xl font-bold text-accent">{recommendations.length}</div>
                <div className="text-text-secondary text-sm">Recommendations</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {symptomEntries.slice(0, 3).map(entry => (
                  <div key={entry.entryId} className="flex items-start space-x-3 p-3 bg-bg rounded-md">
                    <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm truncate">{entry.symptoms}</p>
                      <p className="text-text-secondary text-xs">{formatDate(entry.timestamp)}</p>
                    </div>
                  </div>
                ))}
                
                {symptomEntries.length === 0 && (
                  <div className="text-center py-8 text-text-secondary">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No symptom entries yet</p>
                    <p className="text-sm">Start a chat to log your first symptoms</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Symptom Trends */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Common Symptoms</h3>
            <div className="space-y-3">
              {getSymptomTrends().map((trend, index) => (
                <div key={trend.symptom} className="flex items-center justify-between">
                  <span className="text-text-primary capitalize">{trend.symptom}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-surface rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(trend.count / Math.max(...getSymptomTrends().map(t => t.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-text-secondary text-sm w-6">{trend.count}</span>
                  </div>
                </div>
              ))}
              
              {getSymptomTrends().length === 0 && (
                <div className="text-center py-8 text-text-secondary">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No trends available yet</p>
                  <p className="text-sm">Log more symptoms to see patterns</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Symptom History</h3>
          <div className="space-y-4">
            {symptomEntries.map(entry => (
              <div key={entry.entryId} className="border border-text-secondary/10 rounded-lg p-4 hover:bg-surface/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-text-primary font-medium">{entry.symptoms}</p>
                    <p className="text-text-secondary text-sm mt-1">{entry.potentialDiagnosis}</p>
                    <div className="flex items-center space-x-4 mt-3 text-xs text-text-secondary">
                      <span>{formatDate(entry.timestamp)}</span>
                      {entry.confidenceScore && (
                        <span>Confidence: {Math.round(entry.confidenceScore * 100)}%</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSymptomEntry(entry.entryId)}
                    className="text-text-secondary hover:text-accent transition-colors p-1"
                    title="Delete entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {symptomEntries.length === 0 && (
              <div className="text-center py-12 text-text-secondary">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No symptom history</p>
                <p className="text-sm">Your symptom entries will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {user.subscriptionStatus === 'free' && (
            <div className="card border border-accent/20 bg-accent/5">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="h-6 w-6 text-accent" />
                <h3 className="text-lg font-semibold text-text-primary">Premium Feature</h3>
              </div>
              <p className="text-text-secondary mb-4">
                Get personalized health recommendations based on your symptom patterns. 
                Upgrade to Premium to unlock AI-powered insights.
              </p>
              <button onClick={onShowPricing} className="btn-primary">
                Upgrade to Premium
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map(rec => (
              <div key={rec.recommendationId} className="card">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg text-primary">
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-primary">{rec.type}</span>
                      <span className="text-xs text-text-secondary">{formatDate(rec.timestamp)}</span>
                    </div>
                    <p className="text-text-primary leading-relaxed">{rec.recommendationText}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {recommendations.length === 0 && user.subscriptionStatus === 'premium' && (
            <div className="card text-center py-12">
              <Heart className="h-12 w-12 mx-auto mb-4 text-text-secondary opacity-50" />
              <p className="text-lg text-text-primary">No recommendations yet</p>
              <p className="text-text-secondary mb-4">Generate personalized recommendations based on your symptom history</p>
              <button
                onClick={generatePersonalizedRecommendations}
                disabled={isGeneratingRecommendations}
                className="btn-primary"
              >
                Generate Recommendations
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};