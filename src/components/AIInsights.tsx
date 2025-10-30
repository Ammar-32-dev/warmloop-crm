import React, { useEffect, useState } from 'react';
import { leadsService } from '../services/leadsService';
import { Lead } from '../lib/supabase';
import { TrendingUp, AlertTriangle, Clock } from 'lucide-react';

interface Insight {
  type: 'high-value' | 'at-risk' | 'stale';
  title: string;
  message: string;
  lead?: Lead;
  severity: 'high' | 'medium' | 'low';
}

export const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
    // Subscribe to real-time updates
    const subscription = leadsService.subscribeToChanges(() => {
      generateInsights();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const generateInsights = async () => {
    try {
      const leads = await leadsService.getLeads();
      const newInsights: Insight[] = [];

      // High-Value Lead Detection (score >= 85)
      leads.forEach(lead => {
        if (lead.score >= 85) {
          newInsights.push({
            type: 'high-value',
            title: 'High-Value Lead',
            message: `${lead.name} (score: ${lead.score})`,
            lead,
            severity: 'high'
          });
        }
      });

      // At-Risk Pipeline Detection (>5 leads in same stage with avg score < 40)
      const stageGroups = leads.reduce((acc, lead) => {
        if (!acc[lead.status]) acc[lead.status] = [];
        acc[lead.status].push(lead);
        return acc;
      }, {} as Record<string, Lead[]>);

      Object.entries(stageGroups).forEach(([status, stageLeads]) => {
        if (stageLeads.length > 5) {
          const avgScore = stageLeads.reduce((sum, lead) => sum + lead.score, 0) / stageLeads.length;
          if (avgScore < 40) {
            newInsights.push({
              type: 'at-risk',
              title: 'At-Risk Pipeline',
              message: `${stageLeads.length} leads in "${status}" stage with avg score ${Math.round(avgScore)}`,
              severity: 'medium'
            });
          }
        }
      });

      // Stale Lead Detection (lead.stage != 'won' and last_activity > 14 days)
      const now = new Date();
      leads.forEach(lead => {
        if (lead.status !== 'won') {
          const lastActivity = lead.last_activity 
            ? new Date(lead.last_activity)
            : new Date(lead.updated_at);
          const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceActivity > 14) {
            newInsights.push({
              type: 'stale',
              title: 'Stale Lead',
              message: `${lead.name} - no activity for ${daysSinceActivity} days`,
              lead,
              severity: 'low'
            });
          }
        }
      });

      setInsights(newInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'high-value':
        return <TrendingUp className="w-5 h-5" />;
      case 'at-risk':
        return <AlertTriangle className="w-5 h-5" />;
      case 'stale':
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getInsightColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-l-rose-500 bg-rose-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleReviewLead = (lead: Lead) => {
    // Navigate to leads page with the specific lead
    window.location.href = `/leads?highlight=${lead.id}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          AI Insights
        </h2>
        <div className="text-sm text-gray-500">Rule-based alerts</div>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">🤖</div>
          <p className="text-gray-600">No insights yet. Add more leads to see AI-powered recommendations.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-l-4 ${getInsightColor(insight.severity)} transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded-lg ${
                    insight.severity === 'high' ? 'text-rose-600' :
                    insight.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                  </div>
                </div>
                {insight.lead && (
                  <button
                    onClick={() => handleReviewLead(insight.lead!)}
                    className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-150"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {insights.some(i => i.type === 'high-value') && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={() => window.location.href = '/leads'}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-400 text-white rounded-lg hover:from-indigo-700 hover:to-sky-500 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Review high-value leads</span>
          </button>
        </div>
      )}
    </div>
  );
};