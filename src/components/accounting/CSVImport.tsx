'use client';

import Papa, { ParseResult } from 'papaparse';
import { useState } from 'react';
import { supabase, accountingOperations } from '@/lib/supabase/config';
import type { AccountingEntry } from '@/types/database';

interface CSVImportProps {
  onImportComplete?: () => void;
}

interface CSVRow {
  date: string;
  description: string;
  amount: string;
  type: 'income' | 'expense' | 'debt' | 'payment';
  category: string;
  payment_method: 'cash' | 'bank' | 'other';
}

const validateCSVData = (data: CSVRow[]): Omit<AccountingEntry, 'entry_id' | 'created_at' | 'updated_at'>[] => {
  return data
    .filter((row) => {
      const date = new Date(row.date);
      const amount = parseFloat(row.amount);
      return (
        !isNaN(date.getTime()) &&
        !isNaN(amount) &&
        ['income', 'expense', 'debt', 'payment'].includes(row.type) &&
        row.description?.length > 0 &&
        row.category?.length > 0 &&
        ['cash', 'bank', 'other'].includes(row.payment_method)
      );
    })
    .map(row => ({
      date: row.date,
      description: row.description,
      amount: parseFloat(row.amount),
      type: row.type,
      category: row.category,
      payment_method: row.payment_method,
      status: 'pending'
    }));
};

export default function CSVImport({ onImportComplete }: CSVImportProps) {
  const [preview, setPreview] = useState<Omit<AccountingEntry, 'entry_id' | 'created_at' | 'updated_at'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<CSVRow>(file, {
      header: true,
      complete: (results: ParseResult<CSVRow>) => {
        const validData = validateCSVData(results.data);
        if (validData.length === 0) {
          setError('No valid data found in the CSV file');
          return;
        }

        setPreview(validData);
        setError(null);
      },
      error: (error: Error) => {
        setError(`Error parsing CSV file: ${error.message}`);
      },
      encoding: 'UTF-8'
    });
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      setError(null);

      // Use our accountingOperations to insert entries
      const { error } = await supabase.from('accounting_entries').insert(preview);

      if (error) throw error;

      // Reset after successful import
      setPreview([]);
      setError(null);
      
      // Notify parent component
      onImportComplete?.();
    } catch (err) {
      setError(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">CSV Import</h2>
      
      <input 
        type="file" 
        accept=".csv" 
        onChange={handleFileUpload} 
        className="mb-4 block w-full text-sm text-gray-500 
        file:mr-4 file:py-2 file:px-4 
        file:rounded-full file:border-0 
        file:text-sm file:font-semibold
        file:bg-indigo-50 file:text-indigo-700
        hover:file:bg-indigo-100"
      />

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {preview.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Preview ({preview.length} rows)</h3>
          <div className="max-h-96 overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-white">
                <tr className="bg-gray-100">
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Amount</th>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Category</th>
                  <th className="border p-2">Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2">{row.date}</td>
                    <td className="border p-2">{row.description}</td>
                    <td className="border p-2">${row.amount.toFixed(2)}</td>
                    <td className="border p-2">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                        ${row.type === 'income' ? 'bg-green-100 text-green-800' :
                          row.type === 'expense' ? 'bg-red-100 text-red-800' :
                          row.type === 'debt' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="border p-2">{row.category}</td>
                    <td className="border p-2">{row.payment_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button 
            onClick={handleImport}
            disabled={importing}
            className={`mt-4 px-4 py-2 text-white rounded-md transition-colors
              ${importing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {importing ? 'Importing...' : 'Import Data'}
          </button>
        </div>
      )}
    </div>
  );
}
