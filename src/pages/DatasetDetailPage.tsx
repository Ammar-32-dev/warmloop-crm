import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { getDataset, downloadDatasetAsCSV } from '../utils/datasetStorage';
import { Dataset, Column } from '../utils/fileParser';
import {  ArrowLeft, Download, AlertTriangle, TrendingUp, Database } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ColumnStats {
  column: Column;
  nonNullCount: number;
  uniqueCount: number;
  min?: number;
  max?: number;
  mean?: number;
  sampleValues: any[];
}

export const DatasetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [stats, setStats] = useState<ColumnStats[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  useEffect(() => {
    if (id) {
      const loaded = getDataset(id);
      if (loaded) {
        setDataset(loaded);
        calculateStats(loaded);
      }
    }
  }, [id]);

  const calculateStats = (ds: Dataset) => {
    const columnStats: ColumnStats[] = ds.columns.map(col => {
      const values = ds.rows.map(row => row[col.key]);
      const nonNullValues = values.filter(v => v != null && v !== '');
      const uniqueValues = new Set(nonNullValues);

      const stat: ColumnStats = {
        column: col,
        nonNullCount: nonNullValues.length,
        uniqueCount: uniqueValues.size,
        sampleValues: Array.from(uniqueValues).slice(0, 3)
      };

      if (col.type === 'numeric') {
        const numericValues = nonNullValues.map(Number).filter(n => !isNaN(n));
        if (numericValues.length > 0) {
          stat.min = Math.min(...numericValues);
          stat.max = Math.max(...numericValues);
          stat.mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        }
      }

      return stat;
    });

    setStats(columnStats);
  };

  const generateCharts = () => {
    if (!dataset) return null;

    const numericCols = dataset.columns.filter(c => c.type === 'numeric');
    const categoricalCols = dataset.columns.filter(c => c.type === 'string');
    const charts: JSX.Element[] = [];

    // Numeric histogram/bar chart
    if (numericCols.length > 0) {
      const col = numericCols[0];
      const values = dataset.rows.map(row => row[col.key]).filter(v => v != null);
      
      charts.push(
        <div key="numeric-chart" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{col.label} Distribution</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: values.slice(0, 20).map((_, i) => `Row ${i + 1}`),
                datasets: [{
                  label: col.label,
                  data: values.slice(0, 20),
                  backgroundColor: 'rgba(79, 70, 229, 0.8)',
                  borderRadius: 8,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          </div>
        </div>
      );
    }

    // Categorical doughnut chart
    if (categoricalCols.length > 0) {
      const col = categoricalCols[0];
      const valueCounts: Record<string, number> = {};
      
      dataset.rows.forEach(row => {
        const value = row[col.key];
        if (value != null) {
          valueCounts[value] = (valueCounts[value] || 0) + 1;
        }
      });

      const sorted = Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

      charts.push(
        <div key="categorical-chart" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{col.label} Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={{
                labels: sorted.map(([k]) => k),
                datasets: [{
                  data: sorted.map(([, v]) => v),
                  backgroundColor: [
                    'rgba(79, 70, 229, 0.8)',
                    'rgba(56, 189, 248, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                  ],
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right' }
                }
              }}
            />
          </div>
        </div>
      );
    }

    return charts;
  };

  const generateInsights = () => {
    if (!dataset) return [];

    const insights: { type: string; message: string }[] = [];

    // Flag columns with >50% nulls
    stats.forEach(stat => {
      const nullPercentage = ((dataset.rowCount - stat.nonNullCount) / dataset.rowCount) * 100;
      if (nullPercentage > 50) {
        insights.push({
          type: 'warning',
          message: `Column "${stat.column.label}" has ${nullPercentage.toFixed(1)}% null values`
        });
      }
    });

    // Flag numeric outliers
    stats.forEach(stat => {
      if (stat.column.type === 'numeric' && stat.mean != null) {
        const values = dataset.rows.map(row => Number(row[stat.column.key])).filter(v => !isNaN(v));
        const std = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - stat.mean!, 2), 0) / values.length);
        const outliers = values.filter(v => Math.abs(v - stat.mean!) > 3 * std);
        
        if (outliers.length > 0) {
          insights.push({
            type: 'info',
            message: `Column "${stat.column.label}" has ${outliers.length} outliers (>3σ from mean)`
          });
        }
      }
    });

    // Top 5 rows by "score" column if exists
    const scoreCol = dataset.columns.find(c => c.key.includes('score'));
    if (scoreCol) {
      const topRows = [...dataset.rows]
        .sort((a, b) => Number(b[scoreCol.key]) - Number(a[scoreCol.key]))
        .slice(0, 5);
      
      insights.push({
        type: 'success',
        message: `Top score: ${topRows[0][scoreCol.key]} (${topRows.length} high-value rows identified)`
      });
    }

    return insights;
  };

  if (!dataset) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Dataset not found</p>
          <Link to="/datasets" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
            Back to Datasets
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const paginatedRows = dataset.rows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(dataset.rows.length / rowsPerPage);
  const insights = generateInsights();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/datasets"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {dataset.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {dataset.rowCount.toLocaleString()} rows • {dataset.columns.length} columns
              </p>
            </div>
          </div>
          <button
            onClick={() => downloadDatasetAsCSV(dataset)}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-colors duration-150"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Insights</span>
            </h2>
            <div className="space-y-2">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 p-3 rounded-lg ${
                    insight.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    insight.type === 'info' ? 'bg-blue-50 border border-blue-200' :
                    'bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    insight.type === 'warning' ? 'text-yellow-600' :
                    insight.type === 'info' ? 'text-blue-600' :
                    'text-emerald-600'
                  }`} />
                  <span className="text-sm text-gray-700">{insight.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {generateCharts()}
        </div>

        {/* Column Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Column Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Non-Null</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unique</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Range</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sample</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.map(stat => (
                  <tr key={stat.column.key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{stat.column.label}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        stat.column.type === 'numeric' ? 'bg-blue-100 text-blue-700' :
                        stat.column.type === 'date' ? 'bg-purple-100 text-purple-700' :
                        stat.column.type === 'boolean' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {stat.column.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{stat.nonNullCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{stat.uniqueCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {stat.min != null && stat.max != null
                        ? `${stat.min.toFixed(1)} - ${stat.max.toFixed(1)}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {stat.sampleValues.slice(0, 2).map(v => String(v)).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Data Table</span>
            </h2>
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, dataset.rowCount)} of {dataset.rowCount}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {dataset.columns.map(col => (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {dataset.columns.map(col => (
                      <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                        {row[col.key] != null ? String(row[col.key]) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
