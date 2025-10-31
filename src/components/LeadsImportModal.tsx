import React, { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle2, MapPin, AlertTriangle } from 'lucide-react';
import { parseFile, Dataset } from '../utils/fileParser';
import { supabase, Lead } from '../lib/supabase';
import { computeScore } from '../services/score';

interface LeadsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ColumnMapping {
  datasetColumn: string;
  leadsField: string | '';
}

interface ValidationResult {
  valid: boolean;
  row: any;
  errors: string[];
}

interface ImportResult {
  insertedIds: string[];
  insertedCount: number;
  failedCount: number;
  errors: string[];
}

const LEADS_FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', required: false },
  { key: 'company', label: 'Company', required: false },
  { key: 'status', label: 'Status', required: false },
  { key: 'source', label: 'Source', required: false },
  { key: 'estimated_value', label: 'Estimated Value', required: false },
  { key: 'activities_last_30d', label: 'Activities (Last 30 Days)', required: false },
];

const COLUMN_MAPPING_HEURISTICS: Record<string, string[]> = {
  name: ['name', 'full_name', 'fullname', 'first_name', 'last_name', 'contact_name', 'lead_name'],
  email: ['email', 'e-mail', 'email_address', 'contact_email', 'mail'],
  company: ['company', 'org', 'organization', 'company_name', 'business'],
  status: ['status', 'stage', 'lead_status', 'state'],
  source: ['source', 'lead_source', 'origin'],
  estimated_value: ['value', 'estimated_value', 'amount', 'deal_value', 'revenue'],
  activities_last_30d: ['activities', 'activities_last_30d', 'activity_count', 'touchpoints'],
};

export const LeadsImportModal: React.FC<LeadsImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [lastImportIds, setLastImportIds] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setLoading(true);
    setProgress('Parsing file...');

    try {
      const parsedDataset = await parseFile(selectedFile);
      setDataset(parsedDataset);
      
      // Auto-suggest mappings
      const suggestedMappings = autoMapColumns(parsedDataset);
      setMappings(suggestedMappings);
      
      setProgress(`Parsed ${parsedDataset.rowCount} rows successfully`);
    } catch (err: any) {
      setError(err.message || 'Failed to parse file');
      setDataset(null);
    } finally {
      setLoading(false);
    }
  };

  const autoMapColumns = (ds: Dataset): ColumnMapping[] => {
    return ds.columns.map(col => {
      const normalizedKey = col.key.toLowerCase();
      
      // Find matching field using heuristics
      for (const [fieldKey, patterns] of Object.entries(COLUMN_MAPPING_HEURISTICS)) {
        if (patterns.some(pattern => normalizedKey.includes(pattern))) {
          return { datasetColumn: col.key, leadsField: fieldKey };
        }
      }
      
      return { datasetColumn: col.key, leadsField: '' };
    });
  };

  const handleMappingChange = (datasetColumn: string, leadsField: string) => {
    setMappings(prev =>
      prev.map(m =>
        m.datasetColumn === datasetColumn ? { ...m, leadsField } : m
      )
    );
  };

  const validateData = (): ValidationResult[] => {
    if (!dataset) return [];

    const results: ValidationResult[] = dataset.rows.map(row => {
      const errors: string[] = [];
      const mappedRow: any = {};

      // Map columns
      mappings.forEach(mapping => {
        if (mapping.leadsField) {
          mappedRow[mapping.leadsField] = row[mapping.datasetColumn];
        }
      });

      // Validate required: name + (email OR company)
      if (!mappedRow.name || mappedRow.name.trim() === '') {
        errors.push('Name is required');
      }

      if (!mappedRow.email && !mappedRow.company) {
        errors.push('Either email or company is required');
      }

      // Validate email format if provided
      if (mappedRow.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(mappedRow.email)) {
          errors.push('Invalid email format');
        }
      }

      // Validate numeric fields
      if (mappedRow.estimated_value && isNaN(Number(mappedRow.estimated_value))) {
        errors.push('Estimated value must be numeric');
      }

      if (mappedRow.activities_last_30d && isNaN(Number(mappedRow.activities_last_30d))) {
        errors.push('Activities count must be numeric');
      }

      return {
        valid: errors.length === 0,
        row: mappedRow,
        errors,
      };
    });

    setValidationResults(results);
    return results;
  };

  const handleValidate = () => {
    setError(null);
    const results = validateData();
    const validCount = results.filter(r => r.valid).length;
    const invalidCount = results.length - validCount;
    
    if (invalidCount > 0) {
      setProgress(`Validation: ${validCount} valid, ${invalidCount} invalid rows`);
    } else {
      setProgress(`All ${validCount} rows are valid and ready to import`);
    }
  };

  const handleImport = async () => {
    if (!dataset || validationResults.length === 0) {
      handleValidate();
      return;
    }

    setImporting(true);
    setError(null);
    setProgress('Importing leads...');

    const insertedIds: string[] = [];
    const errors: string[] = [];
    let insertedCount = 0;
    let failedCount = 0;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const validRows = validationResults.filter(r => r.valid);
      const batchSize = 500;

      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize);
        setProgress(`Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validRows.length / batchSize)}...`);

        // Prepare leads with scores
        const leadsToInsert = batch.map(result => {
          const leadData = {
            name: result.row.name,
            email: result.row.email || '',
            company: result.row.company || null,
            status: result.row.status || 'new',
            source: result.row.source || null,
            estimated_value: result.row.estimated_value ? Number(result.row.estimated_value) : null,
            activities_last_30d: result.row.activities_last_30d ? Number(result.row.activities_last_30d) : null,
            user_id: user.id,
          };

          // Compute score
          const score = computeScore(leadData);

          return { ...leadData, score };
        });

        const { data, error: insertError } = await supabase
          .from('leads')
          .insert(leadsToInsert)
          .select('id');

        if (insertError) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`);
          failedCount += batch.length;
        } else if (data) {
          insertedIds.push(...data.map(d => d.id));
          insertedCount += data.length;
        }
      }

      const result: ImportResult = {
        insertedIds,
        insertedCount,
        failedCount,
        errors,
      };

      setImportResult(result);
      setLastImportIds(insertedIds);
      
      if (failedCount === 0) {
        setProgress(`Successfully imported ${insertedCount} leads`);
        setTimeout(() => {
          onImportComplete();
          handleClose();
        }, 2000);
      } else {
        setProgress(`Imported ${insertedCount} leads, ${failedCount} failed`);
        setError(`Some imports failed: ${errors.join(', ')}`);
      }
    } catch (err: any) {
      setError(err.message || 'Import failed');
      setProgress('');
    } finally {
      setImporting(false);
    }
  };

  const handleUndo = async () => {
    if (lastImportIds.length === 0) return;

    setLoading(true);
    setProgress('Undoing last import...');

    try {
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .in('id', lastImportIds);

      if (deleteError) throw deleteError;

      setProgress(`Deleted ${lastImportIds.length} leads`);
      setLastImportIds([]);
      setTimeout(() => {
        onImportComplete();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Undo failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDataset(null);
    setMappings([]);
    setValidationResults([]);
    setError(null);
    setProgress('');
    setImportResult(null);
    onClose();
  };

  if (!isOpen) return null;

  const validCount = validationResults.filter(r => r.valid).length;
  const invalidCount = validationResults.length - validCount;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Import Leads
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Import and map columns to leads table
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select File
            </label>
            <input
              type="file"
              accept=".csv,.xls,.xlsx,.json"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 file:cursor-pointer cursor-pointer"
            />
          </div>

          {/* Progress */}
          {(loading || importing || progress) && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              {(loading || importing) && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
              {!loading && !importing && progress && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              <span className="text-sm text-gray-700">{progress}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start space-x-3 p-3 bg-rose-50 rounded-lg border border-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-rose-900">Error</p>
                <p className="text-sm text-rose-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Column Mapping */}
          {dataset && mappings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Column Mapping</h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                {mappings.map((mapping, idx) => (
                  <div key={idx} className="flex items-center space-x-3 bg-white p-2 rounded border border-gray-200">
                    <span className="text-sm font-medium text-gray-700 w-1/3 truncate">
                      {mapping.datasetColumn}
                    </span>
                    <span className="text-gray-400">→</span>
                    <select
                      value={mapping.leadsField}
                      onChange={(e) => handleMappingChange(mapping.datasetColumn, e.target.value)}
                      className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Skip</option>
                      {LEADS_FIELDS.map(field => (
                        <option key={field.key} value={field.key}>
                          {field.label} {field.required && '(required)'}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Results */}
          {validationResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900">Validation Report</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-900">Valid Rows</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{validCount}</p>
                </div>

                <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span className="text-sm font-medium text-rose-900">Invalid Rows</span>
                  </div>
                  <p className="text-2xl font-bold text-rose-700 mt-1">{invalidCount}</p>
                </div>
              </div>

              {invalidCount > 0 && (
                <div className="max-h-32 overflow-y-auto bg-rose-50 rounded-lg p-3 border border-rose-200">
                  <p className="text-xs font-medium text-rose-900 mb-2">First 5 errors:</p>
                  {validationResults
                    .filter(r => !r.valid)
                    .slice(0, 5)
                    .map((result, idx) => (
                      <div key={idx} className="text-xs text-rose-700 mb-1">
                        Row {idx + 1}: {result.errors.join(', ')}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Undo Section */}
          {lastImportIds.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <p className="text-sm text-amber-900 mb-2">
                Last import: {lastImportIds.length} leads inserted
              </p>
              <button
                onClick={handleUndo}
                disabled={loading}
                className="text-sm px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Undo Last Import
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          >
            Cancel
          </button>
          <div className="flex space-x-2">
            {dataset && validationResults.length === 0 && (
              <button
                onClick={handleValidate}
                disabled={mappings.length === 0 || loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Validate Data
              </button>
            )}
            {validationResults.length > 0 && validCount > 0 && (
              <button
                onClick={handleImport}
                disabled={importing || loading}
                className="flex items-center space-x-2 px-4 py-2 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                <span>Import {validCount} Leads</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
