import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { leadsService } from '../services/leadsService';
import { Lead } from '../lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const AnalyticsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
    // Subscribe to real-time updates
    const subscription = leadsService.subscribeToChanges(() => {
      loadLeads();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadLeads = async () => {
    try {
      const data = await leadsService.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for status distribution chart
  const getStatusDistribution = () => {
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      datasets: [
        {
          label: 'Leads by Status',
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)', // blue for new
            'rgba(251, 191, 36, 0.8)', // yellow for contacted
            'rgba(34, 197, 94, 0.8)', // green for qualified
            'rgba(239, 68, 68, 0.8)', // red for lost
            'rgba(16, 185, 129, 0.8)', // emerald for won
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  // Prepare data for top scored leads
  const getTopScoredLeads = () => {
    const topLeads = [...leads]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return {
      labels: topLeads.map(lead => lead.name),
      datasets: [
        {
          label: 'Lead Score',
          data: topLeads.map(lead => lead.score),
          backgroundColor: 'rgba(79, 70, 229, 0.8)', // indigo
          borderRadius: 8,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif',
          },
          padding: 15,
        },
      },
    },
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

  if (leads.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Analytics
            </h1>
            <p className="text-gray-600 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Visualize your lead pipeline
            </p>
          </div>

          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No data to visualize
            </h3>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Add some leads to see analytics and insights
            </p>
            <a
              href="/leads"
              className="inline-flex items-center px-6 py-3 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              Go to Leads
            </a>
          </div>
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
            Analytics
          </h1>
          <p className="text-gray-600 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Insights into your lead pipeline
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Lead Pipeline
              </h2>
              <p className="text-sm text-gray-600 mt-1">Distribution by status</p>
            </div>
            <div className="h-80">
              <Doughnut data={getStatusDistribution()} options={doughnutOptions} />
            </div>
          </div>

          {/* Top Scored Leads */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Top Scored Leads
              </h2>
              <p className="text-sm text-gray-600 mt-1">Highest quality prospects</p>
            </div>
            <div className="h-80">
              <Bar data={getTopScoredLeads()} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-br from-indigo-500 to-sky-400 rounded-2xl p-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Quick Insights
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold mb-1">{leads.length}</div>
              <div className="text-white/80">Total Leads</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">
                {leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0}
              </div>
              <div className="text-white/80">Average Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">
                {leads.filter(l => l.status === 'won').length}
              </div>
              <div className="text-white/80">Converted Leads</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
