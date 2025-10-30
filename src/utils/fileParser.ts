// File parser utilities for CSV, Excel, JSON, and SQL INSERT files
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface Column {
  key: string;
  label: string;
  type: 'numeric' | 'date' | 'boolean' | 'string';
}

export interface Dataset {
  id: string;
  name: string;
  columns: Column[];
  rows: Record<string, any>[];
  createdAt: string;
  rowCount: number;
}

/**
 * Detect column type by sampling values
 */
function detectColumnType(values: any[]): 'numeric' | 'date' | 'boolean' | 'string' {
  const samples = values.filter(v => v != null && v !== '').slice(0, 20);
  
  if (samples.length === 0) return 'string';
  
  // Check if numeric
  const numericCount = samples.filter(v => !isNaN(Number(v)) && v !== '').length;
  if (numericCount / samples.length > 0.8) return 'numeric';
  
  // Check if boolean
  const booleanValues = ['true', 'false', '1', '0', 'yes', 'no'];
  const booleanCount = samples.filter(v => 
    booleanValues.includes(String(v).toLowerCase())
  ).length;
  if (booleanCount / samples.length > 0.8) return 'boolean';
  
  // Check if date
  const dateCount = samples.filter(v => {
    const date = new Date(v);
    return date instanceof Date && !isNaN(date.getTime());
  }).length;
  if (dateCount / samples.length > 0.8) return 'date';
  
  return 'string';
}

/**
 * Normalize column name (lowercase, underscores)
 */
function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Generate columns metadata from rows
 */
function generateColumns(rows: Record<string, any>[]): Column[] {
  if (rows.length === 0) return [];
  
  const firstRow = rows[0];
  const columns: Column[] = [];
  
  for (const key of Object.keys(firstRow)) {
    const values = rows.map(row => row[key]);
    const type = detectColumnType(values);
    
    columns.push({
      key: normalizeColumnName(key),
      label: key,
      type
    });
  }
  
  return columns;
}

/**
 * Normalize row data based on column types
 */
function normalizeRows(rows: any[], columns: Column[]): Record<string, any>[] {
  return rows.map(row => {
    const normalized: Record<string, any> = {};
    
    for (const col of columns) {
      const value = row[col.label] || row[col.key];
      
      if (value == null || value === '') {
        normalized[col.key] = null;
        continue;
      }
      
      switch (col.type) {
        case 'numeric':
          normalized[col.key] = Number(value);
          break;
        case 'boolean':
          const boolStr = String(value).toLowerCase();
          normalized[col.key] = ['true', '1', 'yes'].includes(boolStr);
          break;
        case 'date':
          normalized[col.key] = new Date(value).toISOString();
          break;
        default:
          normalized[col.key] = String(value);
      }
    }
    
    return normalized;
  });
}

/**
 * Parse CSV file
 */
export function parseCSV(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as Record<string, any>[];
          const columns = generateColumns(rows);
          const normalizedRows = normalizeRows(rows, columns);
          
          resolve({
            id: `csv_${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            columns,
            rows: normalizedRows,
            createdAt: new Date().toISOString(),
            rowCount: normalizedRows.length
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
}

/**
 * Parse Excel file
 */
export async function parseExcel(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Read first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
        
        const columns = generateColumns(rows);
        const normalizedRows = normalizeRows(rows, columns);
        
        resolve({
          id: `xlsx_${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          columns,
          rows: normalizedRows,
          createdAt: new Date().toISOString(),
          rowCount: normalizedRows.length
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse JSON file
 */
export async function parseJSON(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        
        // Handle array of objects
        let rows: Record<string, any>[] = [];
        if (Array.isArray(json)) {
          rows = json;
        } else if (typeof json === 'object') {
          // Handle object with array values
          const firstKey = Object.keys(json)[0];
          if (Array.isArray(json[firstKey])) {
            rows = json[firstKey];
          } else {
            rows = [json];
          }
        }
        
        const columns = generateColumns(rows);
        const normalizedRows = normalizeRows(rows, columns);
        
        resolve({
          id: `json_${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          columns,
          rows: normalizedRows,
          createdAt: new Date().toISOString(),
          rowCount: normalizedRows.length
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Parse SQL INSERT statements
 * Simple regex-based parser for INSERT INTO table (...) VALUES (...)
 */
export async function parseSQL(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        
        // Extract INSERT statements
        const insertRegex = /INSERT\s+INTO\s+\w+\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/gi;
        const matches = [...text.matchAll(insertRegex)];
        
        if (matches.length === 0) {
          reject(new Error('No INSERT statements found in SQL file'));
          return;
        }
        
        // Parse columns from first INSERT
        const columnsPart = matches[0][1];
        const columnNames = columnsPart.split(',').map(c => c.trim().replace(/[`'"]/g, ''));
        
        // Parse rows from all INSERTs
        const rows: Record<string, any>[] = [];
        for (const match of matches) {
          const valuesPart = match[2];
          // Simple value parsing (handles strings in quotes and numbers)
          const values = valuesPart.match(/('(?:[^']|'')*'|"(?:[^"]|"")*"|[^,]+)/g) || [];
          const cleanValues = values.map(v => {
            v = v.trim();
            // Remove quotes from strings
            if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
              return v.slice(1, -1).replace(/''/g, "'").replace(/""/g, '"');
            }
            // Handle NULL
            if (v.toUpperCase() === 'NULL') return null;
            // Keep numbers as is
            return v;
          });
          
          const row: Record<string, any> = {};
          columnNames.forEach((col, idx) => {
            row[col] = cleanValues[idx];
          });
          rows.push(row);
        }
        
        const columns = generateColumns(rows);
        const normalizedRows = normalizeRows(rows, columns);
        
        resolve({
          id: `sql_${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          columns,
          rows: normalizedRows,
          createdAt: new Date().toISOString(),
          rowCount: normalizedRows.length
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Main file parser dispatcher
 */
export async function parseFile(file: File): Promise<Dataset> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'csv':
      return parseCSV(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    case 'json':
      return parseJSON(file);
    case 'sql':
      return parseSQL(file);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}
