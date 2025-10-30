// Dataset storage and persistence layer
import { Dataset, Column } from './fileParser';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'warmloop:datasets';

/**
 * Get all datasets from localStorage
 */
export function getAllDatasets(): Dataset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading datasets from localStorage:', error);
    return [];
  }
}

/**
 * Get dataset by ID
 */
export function getDataset(id: string): Dataset | null {
  const datasets = getAllDatasets();
  return datasets.find(d => d.id === id) || null;
}

/**
 * Save dataset to localStorage
 */
export function saveDataset(dataset: Dataset): void {
  const datasets = getAllDatasets();
  const existingIndex = datasets.findIndex(d => d.id === dataset.id);
  
  if (existingIndex >= 0) {
    datasets[existingIndex] = dataset;
  } else {
    datasets.push(dataset);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets));
}

/**
 * Delete dataset from localStorage
 */
export function deleteDataset(id: string): void {
  const datasets = getAllDatasets();
  const filtered = datasets.filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Convert column type to Postgres type
 */
function columnTypeToPostgres(type: string): string {
  switch (type) {
    case 'numeric':
      return 'NUMERIC';
    case 'date':
      return 'TIMESTAMPTZ';
    case 'boolean':
      return 'BOOLEAN';
    default:
      return 'TEXT';
  }
}

/**
 * Generate safe table name
 */
function generateTableName(datasetName: string): string {
  return 'imported_' + datasetName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50);
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!(url && key);
  } catch {
    return false;
  }
}

/**
 * Check if table exists in Supabase
 */
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    return error === null || !error.message.includes('does not exist');
  } catch {
    return false;
  }
}

/**
 * Create table in Supabase
 */
export async function createSupabaseTable(dataset: Dataset): Promise<{ tableName: string; log: string[] }> {
  const log: string[] = [];
  const tableName = generateTableName(dataset.name);
  
  log.push(`Creating table: ${tableName}`);
  
  // Build CREATE TABLE statement
  const columnDefs = dataset.columns.map(col => {
    const pgType = columnTypeToPostgres(col.type);
    return `${col.key} ${pgType}`;
  }).join(', ');
  
  const createSQL = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      ${columnDefs},
      imported_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  
  log.push(`SQL: ${createSQL}`);
  
  try {
    // Execute via RPC or direct SQL
    const { error } = await supabase.rpc('exec_sql', { query: createSQL });
    
    if (error) {
      log.push(`Error creating table: ${error.message}`);
      throw error;
    }
    
    log.push(`Table created successfully`);
    return { tableName, log };
  } catch (error: any) {
    log.push(`Failed to create table: ${error.message}`);
    throw error;
  }
}

/**
 * Insert rows into Supabase table (batched)
 */
export async function insertDataToSupabase(
  dataset: Dataset,
  tableName?: string
): Promise<{ tableName: string; insertedCount: number; log: string[] }> {
  const log: string[] = [];
  const finalTableName = tableName || generateTableName(dataset.name);
  
  log.push(`Starting data insertion into ${finalTableName}`);
  log.push(`Total rows to insert: ${dataset.rows.length}`);
  
  const batchSize = 500;
  let insertedCount = 0;
  
  try {
    // Check if table exists
    const exists = await tableExists(finalTableName);
    
    if (!exists) {
      log.push(`Table does not exist, creating...`);
      const createResult = await createSupabaseTable(dataset);
      log.push(...createResult.log);
    }
    
    // Insert in batches
    for (let i = 0; i < dataset.rows.length; i += batchSize) {
      const batch = dataset.rows.slice(i, i + batchSize);
      log.push(`Inserting batch ${Math.floor(i / batchSize) + 1}: rows ${i + 1}-${Math.min(i + batchSize, dataset.rows.length)}`);
      
      const { error } = await supabase
        .from(finalTableName)
        .insert(batch);
      
      if (error) {
        log.push(`Error in batch: ${error.message}`);
        throw error;
      }
      
      insertedCount += batch.length;
      log.push(`Batch inserted successfully (${insertedCount}/${dataset.rows.length})`);
    }
    
    log.push(`All data inserted successfully: ${insertedCount} rows`);
    
    return { tableName: finalTableName, insertedCount, log };
  } catch (error: any) {
    log.push(`Failed to insert data: ${error.message}`);
    throw error;
  }
}

/**
 * Delete Supabase table
 */
export async function deleteSupabaseTable(tableName: string): Promise<{ log: string[] }> {
  const log: string[] = [];
  
  log.push(`Deleting table: ${tableName}`);
  
  try {
    const dropSQL = `DROP TABLE IF EXISTS ${tableName}`;
    const { error } = await supabase.rpc('exec_sql', { query: dropSQL });
    
    if (error) {
      log.push(`Error deleting table: ${error.message}`);
      throw error;
    }
    
    log.push(`Table deleted successfully`);
    return { log };
  } catch (error: any) {
    log.push(`Failed to delete table: ${error.message}`);
    throw error;
  }
}

/**
 * Export dataset as CSV
 */
export function exportAsCSV(dataset: Dataset): string {
  const headers = dataset.columns.map(c => c.label).join(',');
  const rows = dataset.rows.map(row => {
    return dataset.columns.map(col => {
      const value = row[col.key];
      if (value == null) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  }).join('\n');
  
  return `${headers}\n${rows}`;
}

/**
 * Download dataset as CSV file
 */
export function downloadDatasetAsCSV(dataset: Dataset): void {
  const csv = exportAsCSV(dataset);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${dataset.name}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
