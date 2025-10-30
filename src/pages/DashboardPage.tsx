import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { leadsService } from '../services/leadsService';
import { AIInsights } from '../components/AIInsights';
import { TopLeads } from '../components/TopLeads';
import { Users, TrendingUp, Target } from 'lucide-react';

interface Stats {
  totalLeads: number;
  averageScore: number;
  leadsByStatus: { status: string; count: number }[];
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await leadsService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Overview of your CRM performance
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Total Leads */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Total Leads</span>
            </div>
            <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {stats?.totalLeads || 0}
            </div>
            <p className="text-sm text-gray-600 mt-2">All leads in pipeline</p>
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-sky-500" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Average Score</span>
            </div>
            <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {stats?.averageScore || 0}
            </div>
            <p className="text-sm text-gray-600 mt-2">Lead quality metric</p>
          </div>

          {/* Leads by Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">By Status</span>
            </div>
            <div className="space-y-2">
              {stats?.leadsByStatus.slice(0, 3).map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{item.status}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights and Top Leads */}
        <div className="grid md:grid-cols-2 gap-6">
          <AIInsights />
          <TopLeads />
        </div>

        {/* Quick Stats Table */}
        {stats && stats.leadsByStatus.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Lead Distribution
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.leadsByStatus.map((item) => (
                    <tr key={item.status} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize font-medium text-gray-900">{item.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {((item.count / stats.totalLeads) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats && stats.totalLeads === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No leads yet
            </h3>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Start adding leads to see your dashboard come to life
            </p>
            <a
              href="/leads"
              className="inline-flex items-center px-6 py-3 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              Add Your First Lead
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
