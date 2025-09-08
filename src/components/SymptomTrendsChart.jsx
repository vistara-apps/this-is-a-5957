import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const SymptomTrendsChart = ({ symptomEntries, className = '' }) => {
  // Prepare data for the chart
  const prepareChartData = () => {
    if (!symptomEntries || symptomEntries.length === 0) return [];

    // Group entries by date
    const entriesByDate = {};
    symptomEntries.forEach(entry => {
      const date = format(parseISO(entry.timestamp), 'yyyy-MM-dd');
      if (!entriesByDate[date]) {
        entriesByDate[date] = [];
      }
      entriesByDate[date].push(entry);
    });

    // Convert to chart data
    const chartData = Object.entries(entriesByDate)
      .map(([date, entries]) => ({
        date,
        count: entries.length,
        avgConfidence: entries.reduce((sum, entry) => sum + (entry.confidenceScore || 0.5), 0) / entries.length,
        displayDate: format(parseISO(date), 'MMM dd')
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14); // Last 14 days

    return chartData;
  };

  const chartData = prepareChartData();

  // Calculate trend
  const calculateTrend = () => {
    if (chartData.length < 2) return { direction: 'stable', change: 0 };

    const recent = chartData.slice(-3);
    const older = chartData.slice(0, -3);

    if (older.length === 0) return { direction: 'stable', change: 0 };

    const recentAvg = recent.reduce((sum, item) => sum + item.count, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item.count, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    return {
      direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      change: Math.abs(change)
    };
  };

  const trend = calculateTrend();

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-accent" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getTrendColor = () => {
    switch (trend.direction) {
      case 'increasing':
        return 'text-accent';
      case 'decreasing':
        return 'text-green-500';
      default:
        return 'text-text-secondary';
    }
  };

  if (chartData.length === 0) {
    return (
      <div className={`bg-surface rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Symptom Trends</h3>
        <div className="text-center py-8 text-text-secondary">
          <p>No symptom data available yet.</p>
          <p className="text-sm mt-2">Start tracking your symptoms to see trends over time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Symptom Trends</h3>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {trend.direction === 'stable' ? 'Stable' : `${trend.change.toFixed(1)}% ${trend.direction}`}
          </span>
        </div>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 22% 30%)" />
            <XAxis 
              dataKey="displayDate" 
              stroke="hsl(0 0% 75%)"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(0 0% 75%)"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220 22% 20%)',
                border: '1px solid hsl(220 22% 30%)',
                borderRadius: '8px',
                color: 'hsl(0 0% 95%)'
              }}
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value, name) => [
                name === 'count' ? `${value} entries` : `${(value * 100).toFixed(1)}%`,
                name === 'count' ? 'Symptom Entries' : 'Avg Confidence'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="hsl(220 89% 50%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(220 89% 50%)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(220 89% 50%)', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="avgConfidence" 
              stroke="hsl(10 90% 55%)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'hsl(10 90% 55%)', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-sm text-text-secondary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span>Symptom Count</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full opacity-60"></div>
            <span>Confidence Level</span>
          </div>
        </div>
        <span>Last 14 days</span>
      </div>
    </div>
  );
};

export const SymptomFrequencyChart = ({ symptomEntries, className = '' }) => {
  const prepareFrequencyData = () => {
    if (!symptomEntries || symptomEntries.length === 0) return [];

    const symptomCounts = {};
    const commonSymptoms = [
      'headache', 'fever', 'cough', 'fatigue', 'nausea', 'dizziness', 'pain',
      'sore throat', 'runny nose', 'congestion', 'muscle ache', 'joint pain'
    ];

    symptomEntries.forEach(entry => {
      const text = entry.symptoms.toLowerCase();
      commonSymptoms.forEach(symptom => {
        if (text.includes(symptom)) {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        }
      });
    });

    return Object.entries(symptomCounts)
      .map(([symptom, count]) => ({
        symptom: symptom.charAt(0).toUpperCase() + symptom.slice(1),
        count,
        percentage: (count / symptomEntries.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  const frequencyData = prepareFrequencyData();

  if (frequencyData.length === 0) {
    return (
      <div className={`bg-surface rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Most Common Symptoms</h3>
        <div className="text-center py-8 text-text-secondary">
          <p>No symptom patterns identified yet.</p>
          <p className="text-sm mt-2">Continue tracking to see your most common symptoms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-text-primary mb-6">Most Common Symptoms</h3>
      
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={frequencyData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 22% 30%)" />
            <XAxis 
              type="number"
              stroke="hsl(0 0% 75%)"
              fontSize={12}
            />
            <YAxis 
              type="category"
              dataKey="symptom"
              stroke="hsl(0 0% 75%)"
              fontSize={12}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220 22% 20%)',
                border: '1px solid hsl(220 22% 30%)',
                borderRadius: '8px',
                color: 'hsl(0 0% 95%)'
              }}
              formatter={(value, name) => [
                `${value} times (${((value / symptomEntries.length) * 100).toFixed(1)}%)`,
                'Frequency'
              ]}
            />
            <Bar 
              dataKey="count" 
              fill="hsl(220 89% 50%)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-sm text-text-secondary">
        Based on {symptomEntries.length} symptom entries
      </div>
    </div>
  );
};
