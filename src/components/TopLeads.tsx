import React, { useEffect, useState } from 'react';
import { leadsService } from '../services/leadsService';
import { Lead } from '../lib/supabase';
import { TrendingUp, Building, Mail } from 'lucide-react';

export const TopLeads: React.FC = () => {
  const [topLeads, setTopLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopLeads();
    // Subscribe to real-time updates
    const subscription = leadsService.subscribeToChanges(() => {
      loadTopLeads();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadTopLeads = async () => {
    try {
      const leads = await leadsService.getTopLeads(5);
      setTopLeads(leads);
    } catch (error) {
      console.error('Error loading top leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Low';
  };

  const handleViewDetails = (lead: Lead) => {
    window.location.href = `/leads?highlight=${lead.id}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Top Leads
        </h2>
        <div className="text-sm text-gray-500">By score</div>
      </div>

      {topLeads.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No leads yet. Add some leads to see top performers.</p>
          <button
            onClick={() => window.location.href = '/leads'}
            className="mt-3 px-4 py-2 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-colors duration-150"
          >
            Add Lead
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {topLeads.map((lead, index) => (
            <div
              key={lead.id}
              className="p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all duration-200 cursor-pointer"
              onClick={() => handleViewDetails(lead)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-sm">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {lead.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Mail className="w-3 h-3" />
                          <span className="text-xs truncate">{lead.email}</span>
                        </div>
                        {lead.company && (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Building className="w-3 h-3" />
                            <span className="text-xs truncate">{lead.company}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Score</div>
                    <div className="text-sm font-semibold text-gray-900">{lead.score}/100</div>
                    <div className="text-xs text-gray-500">{getScoreLabel(lead.score)}</div>
                  </div>
                  
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        lead.score >= 80 ? 'bg-emerald-500' :
                        lead.score >= 60 ? 'bg-blue-500' :
                        lead.score >= 40 ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${Math.min(lead.score, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                    lead.status === 'won' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {lead.status}
                  </span>
                  
                  {lead.source && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {lead.source}
                    </span>
                  )}
                  
                  {lead.estimated_value && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                      ${lead.estimated_value.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {topLeads.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.location.href = '/leads'}
            className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View All Leads →
          </button>
        </div>
      )}
    </div>
  );
};