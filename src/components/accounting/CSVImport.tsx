'use client';

import { useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase/config';

interface CSVRow {
  transaction_date: string;
  description: string;
  amount: string;
  type: 'income' | 'expense';
  category: string;
}

interface ParseResult {
  data: CSVRow[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export default function CSVImport() {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [error, setError] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<CSVRow>(file, {
      header: true,
      complete: (results: ParseResult) => {
        const validData = validateCSVData(results.data);
        setPreview(validData);
      },
      error: (error: Error, file: LocalFile) => {
        setError('Error parsing CSV file: ' + error.message);
      }
    });
  };

  const validateCSVData = (data: CSVRow[]): CSVRow[] => {
    return data.filter(row => {
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

  const MotionButton = motion.button as any;

  const handleImport = async () => {
    setUploading(true);
    setError('');

    try {
      const formattedData = preview.map(row => ({
        ...row,
        amount: parseFloat(row.amount),
        transaction_date: new Date(row.transaction_date).toISOString()
      }));

      const { error } = await supabase
        .from('accounting_entries')
        .insert(formattedData);

      if (error) throw error;

      setPreview([]);
      alert('Data imported successfully!');
    } catch (err) {
      setError('Error importing data: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-effect p-6 rounded-xl">
      <h2 className="text-2xl font-bold gradient-text mb-6">Import Accounting Data</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 text-neutral-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm text-neutral-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-neutral-500">CSV file only</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".csv" 
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {preview.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview ({preview.length} entries)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {preview.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm">{row.transaction_date}</td>
                      <td className="px-4 py-3 text-sm">{row.description}</td>
                      <td className="px-4 py-3 text-sm">{row.type}</td>
                      <td className="px-4 py-3 text-sm">{row.category}</td>
                      <td className="px-4 py-3 text-sm text-right">${parseFloat(row.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <MotionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleImport}
              disabled={uploading}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg neo-brutalism disabled:opacity-50"
            >
              {uploading ? 'Importing...' : `Import ${preview.length} Entries`}
            </MotionButton>
          </div>
        )}
      </div>
    </div>
  );
} 