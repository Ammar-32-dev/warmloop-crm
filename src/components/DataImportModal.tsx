import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseFile, Dataset } from '../utils/fileParser';
import { saveDataset, isSupabaseConfigured, insertDataToSupabase } from '../utils/datasetStorage';
import { useNavigate } from 'react-router-dom';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [saveToSupabase, setSaveToSupabase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const navigate = useNavigate();

  const supabaseAvailable = isSupabaseConfigured();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setLoading(true);
    setProgress('Parsing file...');

    try {
      const parsedDataset = await parseFile(selectedFile);
      setDataset(parsedDataset);
      setProgress(`Parsed ${parsedDataset.rowCount} rows, ${parsedDataset.columns.length} columns`);
    } catch (err: any) {
      setError(err.message || 'Failed to parse file');
      setDataset(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!dataset) return;

    setLoading(true);
    setError(null);
    setProgress('Saving to localStorage...');

    try {
      // Save to localStorage
      saveDataset(dataset);
      setProgress('Saved to browser storage');

      // Optionally save to Supabase
      if (saveToSupabase && supabaseAvailable) {
        setProgress('Saving to Supabase...');
        try {
          const result = await insertDataToSupabase(dataset);
          setProgress(`Saved to Supabase: ${result.insertedCount} rows inserted`);
          
          // Log to artifacts
          console.log('Supabase insertion log:', result.log);
        } catch (supaError: any) {
          console.warn('Supabase save failed, data still in localStorage:', supaError);
          setProgress('Saved to localStorage (Supabase save failed)');
        }
      }

      // Navigate to dataset page
      setTimeout(() => {
        navigate(`/datasets/${dataset.id}`);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to import data');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setDataset(null);
    setError(null);
    setProgress('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Import Data
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload CSV, Excel, JSON, or SQL files
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".csv,.xls,.xlsx,.json,.sql"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 file:cursor-pointer cursor-pointer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: CSV, XLS/XLSX, JSON, SQL INSERT
            </p>
          </div>

          {/* Supabase Toggle */}
          {supabaseAvailable && (
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="saveToSupabase"
                  checked={saveToSupabase}
                  onChange={(e) => setSaveToSupabase(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="saveToSupabase" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Save to Supabase
                </label>
              </div>
              <span className="text-xs text-indigo-600">Database available</span>
            </div>
          )}

          {/* Progress */}
          {(loading || progress) && (
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
              {!loading && progress && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              <span className="text-sm text-gray-700">{progress}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start space-x-3 p-4 bg-rose-50 rounded-lg border border-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-rose-900">Import Error</p>
                <p className="text-sm text-rose-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {dataset && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Preview
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{dataset.rowCount} rows</span>
                  <span>{dataset.columns.length} columns</span>
                </div>
              </div>

              {/* Column Types */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Detected Types</p>
                <div className="flex flex-wrap gap-2">
                  {dataset.columns.map((col) => (
                    <div key={col.key} className="inline-flex items-center space-x-2 px-3 py-1 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-900">{col.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        col.type === 'numeric' ? 'bg-blue-100 text-blue-700' :
                        col.type === 'date' ? 'bg-purple-100 text-purple-700' :
                        col.type === 'boolean' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {col.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {dataset.columns.map((col) => (
                          <th
                            key={col.key}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dataset.rows.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          {dataset.columns.map((col) => (
                            <td key={col.key} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                              {row[col.key] != null ? String(row[col.key]) : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {dataset.rows.length > 10 && (
                  <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center border-t border-gray-200">
                    Showing first 10 of {dataset.rows.length} rows
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            disabled={!file}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!dataset || loading}
              className="flex items-center space-x-2 px-6 py-2 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span>Import & Generate Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
