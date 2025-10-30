import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Link } from 'react-router-dom';
import { Database, FileText, Calendar, Download, Trash2, Plus } from 'lucide-react';
import { getAllDatasets, deleteDataset, downloadDatasetAsCSV } from '../utils/datasetStorage';
import { Dataset } from '../utils/fileParser';

export const DatasetsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = () => {
    const loaded = getAllDatasets();
    setDatasets(loaded);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this dataset? This cannot be undone.')) {
      deleteDataset(id);
      loadDatasets();
    }
  };

  const handleDownload = (dataset: Dataset) => {
    downloadDatasetAsCSV(dataset);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Imported Datasets
            </h1>
            <p className="text-gray-600 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              View and manage your imported data
            </p>
          </div>
        </div>

        {/* Datasets Grid */}
        {datasets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                {/* Icon & Name */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Database className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{dataset.name}</h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <FileText className="w-3 h-3" />
                        <span>{dataset.id.split('_')[0].toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Rows</p>
                    <p className="text-lg font-bold text-gray-900">{dataset.rowCount.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Columns</p>
                    <p className="text-lg font-bold text-gray-900">{dataset.columns.length}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>Imported {new Date(dataset.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/datasets/${dataset.id}`}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-colors duration-150 text-sm font-medium"
                  >
                    <span>View Dashboard</span>
                  </Link>
                  <button
                    onClick={() => handleDownload(dataset)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                    title="Download CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dataset.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-150"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No datasets yet
            </h3>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Import your first dataset to get started with data analysis
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Import Data</span>
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
