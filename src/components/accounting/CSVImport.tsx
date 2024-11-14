'use client';

import { motion } from 'framer-motion';
import Papa, { ParseError, ParseResult } from 'papaparse';
import { useState } from 'react';

import { supabase } from '@/lib/supabase/config';

interface CSVRow {
  transaction_date: string;
  description: string;
  amount: string;
  type: 'income' | 'expense';
  category: string;
}

const validateCSVData = (data: CSVRow[]): CSVRow[] => {
  return data.filter((row) => {
    const date = new Date(row.transaction_date);
    const amount = parseFloat(row.amount);
    return (
      !isNaN(date.getTime()) &&
      !isNaN(amount) &&
      ['income', 'expense'].includes(row.type) &&
      row.description?.length > 0 &&
      row.category?.length > 0
    );
  });
};

export default function CSVImport() {
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      error: (error: Error, file: File) => {
        setError(`Error parsing CSV file: ${error.message}`);
      },
      encoding: 'UTF-8'
    });
  };

  const handleImport = async () => {
    try {
      const { data, error } = await supabase.from('accounting_entries').insert(preview);

      if (error) throw error;

      // Reset after successful import
      setPreview([]);
      setError(null);
    } catch (err) {
      setError(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Date</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Type</th>
                <th className="border p-2">Category</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border p-2">{row.transaction_date}</td>
                  <td className="border p-2">{row.description}</td>
                  <td className="border p-2">{row.amount}</td>
                  <td className="border p-2">{row.type}</td>
                  <td className="border p-2">{row.category}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button 
            onClick={handleImport}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Import Data
          </button>
        </div>
      )}
    </div>
  );
}