import { analyzeSymptoms, generateHealthRecommendations } from './aiService';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';

export const patternAnalysisService = {
  // Analyze symptom patterns over time
  analyzeSymptomPatterns: (symptomEntries) => {
    if (!symptomEntries || symptomEntries.length === 0) {
      return {
        patterns: [],
        trends: {},
        insights: [],
        riskFactors: []
      };
    }

    const patterns = [];
    const trends = {};
    const insights = [];
    const riskFactors = [];

    // Group symptoms by type
    const symptomGroups = groupSymptomsByType(symptomEntries);
    
    // Analyze frequency patterns
    const frequencyPatterns = analyzeFrequencyPatterns(symptomEntries);
    patterns.push(...frequencyPatterns);

    // Analyze temporal patterns
    const temporalPatterns = analyzeTemporalPatterns(symptomEntries);
    patterns.push(...temporalPatterns);

    // Analyze severity trends
    const severityTrends = analyzeSeverityTrends(symptomEntries);
    Object.assign(trends, severityTrends);

    // Generate insights
    insights.push(...generateInsights(symptomGroups, patterns, trends));

    // Identify risk factors
    riskFactors.push(...identifyRiskFactors(symptomEntries, patterns));

    return {
      patterns,
      trends,
      insights,
      riskFactors,
      summary: generatePatternSummary(patterns, trends, insights)
    };
  },

  // Identify chronic condition indicators
  identifyChronicIndicators: (symptomEntries) => {
    const indicators = [];
    const symptomFrequency = {};
    const timeSpan = getTimeSpan(symptomEntries);

    // Count symptom occurrences
    symptomEntries.forEach(entry => {
      const symptoms = extractSymptomKeywords(entry.symptoms);
      symptoms.forEach(symptom => {
        symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
      });
    });

    // Identify recurring symptoms
    Object.entries(symptomFrequency).forEach(([symptom, count]) => {
      const frequency = count / Math.max(timeSpan.weeks, 1);
      
      if (frequency >= 0.5 && count >= 3) { // At least twice per week for 3+ occurrences
        indicators.push({
          type: 'recurring_symptom',
          symptom,
          frequency,
          occurrences: count,
          severity: 'moderate',
          recommendation: `Consider discussing recurring ${symptom} with a healthcare provider`
        });
      }
    });

    // Identify symptom clusters
    const clusters = identifySymptomClusters(symptomEntries);
    indicators.push(...clusters);

    return indicators;
  },

  // Generate personalized health insights
  generateHealthInsights: async (symptomEntries, userProfile = {}) => {
    const patterns = patternAnalysisService.analyzeSymptomPatterns(symptomEntries);
    const chronicIndicators = patternAnalysisService.identifyChronicIndicators(symptomEntries);
    
    const insights = {
      overview: generateOverviewInsight(symptomEntries, patterns),
      trends: generateTrendInsights(patterns.trends),
      recommendations: await generatePersonalizedRecommendations(symptomEntries, patterns, userProfile),
      alerts: generateHealthAlerts(chronicIndicators, patterns),
      nextSteps: generateNextSteps(patterns, chronicIndicators)
    };

    return insights;
  },

  // Export health data
  exportHealthData: (symptomEntries, recommendations, format = 'json') => {
    const exportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalEntries: symptomEntries.length,
        dateRange: getDateRange(symptomEntries),
        mostCommonSymptoms: getMostCommonSymptoms(symptomEntries, 5)
      },
      symptomEntries: symptomEntries.map(entry => ({
        date: entry.timestamp,
        symptoms: entry.symptoms,
        confidence: entry.confidenceScore,
        diagnosis: entry.potentialDiagnosis
      })),
      recommendations: recommendations.map(rec => ({
        date: rec.timestamp,
        type: rec.type,
        recommendation: rec.recommendationText
      })),
      patterns: patternAnalysisService.analyzeSymptomPatterns(symptomEntries)
    };

    if (format === 'csv') {
      return convertToCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }
};

// Helper functions
function groupSymptomsByType(symptomEntries) {
  const groups = {};
  
  symptomEntries.forEach(entry => {
    const symptoms = extractSymptomKeywords(entry.symptoms);
    symptoms.forEach(symptom => {
      if (!groups[symptom]) {
        groups[symptom] = [];
      }
      groups[symptom].push({
        ...entry,
        extractedSymptom: symptom
      });
    });
  });

  return groups;
}

function extractSymptomKeywords(symptomText) {
  const commonSymptoms = [
    'headache', 'fever', 'cough', 'fatigue', 'nausea', 'dizziness', 'pain',
    'sore throat', 'runny nose', 'congestion', 'muscle ache', 'joint pain',
    'stomach ache', 'diarrhea', 'constipation', 'insomnia', 'anxiety',
    'depression', 'shortness of breath', 'chest pain', 'back pain'
  ];

  const text = symptomText.toLowerCase();
  return commonSymptoms.filter(symptom => text.includes(symptom));
}

function analyzeFrequencyPatterns(symptomEntries) {
  const patterns = [];
  const symptomCounts = {};
  
  symptomEntries.forEach(entry => {
    const symptoms = extractSymptomKeywords(entry.symptoms);
    symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  Object.entries(symptomCounts).forEach(([symptom, count]) => {
    if (count >= 3) {
      patterns.push({
        type: 'frequency',
        symptom,
        count,
        pattern: count >= 5 ? 'high_frequency' : 'moderate_frequency',
        description: `${symptom} reported ${count} times`
      });
    }
  });

  return patterns;
}

function analyzeTemporalPatterns(symptomEntries) {
  const patterns = [];
  const sortedEntries = symptomEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // Look for weekly patterns
  const weeklyPatterns = analyzeWeeklyPatterns(sortedEntries);
  patterns.push(...weeklyPatterns);

  // Look for monthly patterns
  const monthlyPatterns = analyzeMonthlyPatterns(sortedEntries);
  patterns.push(...monthlyPatterns);

  return patterns;
}

function analyzeWeeklyPatterns(sortedEntries) {
  const patterns = [];
  const dayOfWeekCounts = {};

  sortedEntries.forEach(entry => {
    const dayOfWeek = new Date(entry.timestamp).getDay();
    dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(dayOfWeekCounts));
  const totalEntries = sortedEntries.length;

  Object.entries(dayOfWeekCounts).forEach(([day, count]) => {
    if (count / totalEntries > 0.3) { // More than 30% of entries on this day
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      patterns.push({
        type: 'temporal',
        pattern: 'weekly',
        day: dayNames[parseInt(day)],
        frequency: count / totalEntries,
        description: `Symptoms more common on ${dayNames[parseInt(day)]}`
      });
    }
  });

  return patterns;
}

function analyzeMonthlyPatterns(sortedEntries) {
  // Implementation for monthly pattern analysis
  return [];
}

function analyzeSeverityTrends(symptomEntries) {
  const trends = {};
  const sortedEntries = symptomEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  if (sortedEntries.length < 3) return trends;

  const recentEntries = sortedEntries.slice(-5);
  const olderEntries = sortedEntries.slice(0, -5);

  if (olderEntries.length > 0) {
    const recentAvgConfidence = recentEntries.reduce((sum, entry) => sum + (entry.confidenceScore || 0.5), 0) / recentEntries.length;
    const olderAvgConfidence = olderEntries.reduce((sum, entry) => sum + (entry.confidenceScore || 0.5), 0) / olderEntries.length;

    trends.severity = {
      recent: recentAvgConfidence,
      historical: olderAvgConfidence,
      trend: recentAvgConfidence > olderAvgConfidence ? 'increasing' : 'decreasing',
      change: Math.abs(recentAvgConfidence - olderAvgConfidence)
    };
  }

  return trends;
}

function generateInsights(symptomGroups, patterns, trends) {
  const insights = [];

  // Most frequent symptoms
  const sortedSymptoms = Object.entries(symptomGroups)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 3);

  if (sortedSymptoms.length > 0) {
    insights.push({
      type: 'frequency',
      title: 'Most Common Symptoms',
      description: `Your most reported symptoms are: ${sortedSymptoms.map(([symptom]) => symptom).join(', ')}`,
      severity: 'info'
    });
  }

  // Trend insights
  if (trends.severity) {
    const trendDirection = trends.severity.trend === 'increasing' ? 'worsening' : 'improving';
    insights.push({
      type: 'trend',
      title: 'Symptom Severity Trend',
      description: `Your symptoms appear to be ${trendDirection} over time`,
      severity: trends.severity.trend === 'increasing' ? 'warning' : 'positive'
    });
  }

  return insights;
}

function identifyRiskFactors(symptomEntries, patterns) {
  const riskFactors = [];

  // High frequency symptoms
  const highFrequencyPatterns = patterns.filter(p => p.pattern === 'high_frequency');
  if (highFrequencyPatterns.length > 0) {
    riskFactors.push({
      type: 'frequency',
      factor: 'High symptom frequency',
      description: 'Multiple symptoms reported frequently may indicate an underlying condition',
      severity: 'moderate'
    });
  }

  return riskFactors;
}

function generatePatternSummary(patterns, trends, insights) {
  return {
    totalPatterns: patterns.length,
    significantTrends: Object.keys(trends).length,
    keyInsights: insights.length,
    overallRisk: calculateOverallRisk(patterns, trends, insights)
  };
}

function calculateOverallRisk(patterns, trends, insights) {
  let riskScore = 0;
  
  // High frequency patterns increase risk
  riskScore += patterns.filter(p => p.pattern === 'high_frequency').length * 2;
  
  // Worsening trends increase risk
  if (trends.severity?.trend === 'increasing') {
    riskScore += 3;
  }
  
  // Warning insights increase risk
  riskScore += insights.filter(i => i.severity === 'warning').length * 2;

  if (riskScore >= 6) return 'high';
  if (riskScore >= 3) return 'moderate';
  return 'low';
}

function identifySymptomClusters(symptomEntries) {
  // Implementation for identifying symptom clusters
  return [];
}

function generateOverviewInsight(symptomEntries, patterns) {
  const timeSpan = getTimeSpan(symptomEntries);
  const uniqueSymptoms = new Set();
  
  symptomEntries.forEach(entry => {
    extractSymptomKeywords(entry.symptoms).forEach(symptom => {
      uniqueSymptoms.add(symptom);
    });
  });

  return {
    totalEntries: symptomEntries.length,
    uniqueSymptoms: uniqueSymptoms.size,
    timeSpan: timeSpan,
    averageEntriesPerWeek: symptomEntries.length / Math.max(timeSpan.weeks, 1)
  };
}

function generateTrendInsights(trends) {
  const insights = [];
  
  if (trends.severity) {
    insights.push({
      type: 'severity_trend',
      trend: trends.severity.trend,
      description: `Symptom severity is ${trends.severity.trend}`,
      confidence: trends.severity.change > 0.1 ? 'high' : 'moderate'
    });
  }

  return insights;
}

async function generatePersonalizedRecommendations(symptomEntries, patterns, userProfile) {
  // Use existing AI service to generate recommendations
  return await generateHealthRecommendations(symptomEntries.slice(0, 10));
}

function generateHealthAlerts(chronicIndicators, patterns) {
  const alerts = [];

  chronicIndicators.forEach(indicator => {
    if (indicator.severity === 'high' || indicator.occurrences >= 5) {
      alerts.push({
        type: 'chronic_pattern',
        severity: 'warning',
        message: `Recurring ${indicator.symptom} detected - consider medical consultation`,
        recommendation: indicator.recommendation
      });
    }
  });

  return alerts;
}

function generateNextSteps(patterns, chronicIndicators) {
  const steps = [];

  if (chronicIndicators.length > 0) {
    steps.push({
      priority: 'high',
      action: 'Schedule medical consultation',
      reason: 'Recurring symptoms detected that may require professional evaluation'
    });
  }

  if (patterns.length > 3) {
    steps.push({
      priority: 'medium',
      action: 'Keep detailed symptom diary',
      reason: 'Multiple patterns detected - detailed tracking will help identify triggers'
    });
  }

  steps.push({
    priority: 'low',
    action: 'Continue monitoring symptoms',
    reason: 'Regular tracking helps identify patterns and improvements'
  });

  return steps;
}

function getTimeSpan(symptomEntries) {
  if (symptomEntries.length === 0) return { days: 0, weeks: 0, months: 0 };

  const dates = symptomEntries.map(entry => new Date(entry.timestamp));
  const earliest = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));
  
  const days = differenceInDays(latest, earliest);
  
  return {
    days,
    weeks: Math.ceil(days / 7),
    months: Math.ceil(days / 30)
  };
}

function getDateRange(symptomEntries) {
  if (symptomEntries.length === 0) return null;

  const dates = symptomEntries.map(entry => new Date(entry.timestamp));
  const earliest = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));

  return {
    start: format(earliest, 'yyyy-MM-dd'),
    end: format(latest, 'yyyy-MM-dd')
  };
}

function getMostCommonSymptoms(symptomEntries, limit = 5) {
  const symptomCounts = {};
  
  symptomEntries.forEach(entry => {
    const symptoms = extractSymptomKeywords(entry.symptoms);
    symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  return Object.entries(symptomCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([symptom, count]) => ({ symptom, count }));
}

function convertToCSV(data) {
  // Simple CSV conversion for symptom entries
  const headers = ['Date', 'Symptoms', 'Confidence', 'Diagnosis'];
  const rows = data.symptomEntries.map(entry => [
    entry.date,
    `"${entry.symptoms}"`,
    entry.confidence,
    `"${entry.diagnosis || ''}"`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
