'use client';

import { useEffect, useState } from 'react';
import { supabase, accountingOperations, realtime } from '@/lib/supabase/config';
import type { AccountingEntry } from '@/types/database';
import CSVImport from './CSVImport';

export default function AccountingEntries() {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    fetchEntries();
    
    // Set up real-time subscription using our helper
    const subscription = realtime.subscribeToAccountingEntries((payload) => {
      if (payload.eventType === 'INSERT') {
        setEntries((current) => [payload.new as AccountingEntry, ...current]);
      } else if (payload.eventType === 'DELETE') {
        setEntries((current) => current.filter((entry) => entry.entry_id !== payload.old.entry_id));
      } else if (payload.eventType === 'UPDATE') {
        setEntries((current) =>
          current.map((entry) => 
            entry.entry_id === payload.new.entry_id ? (payload.new as AccountingEntry) : entry
          )
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchEntries() {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Last 30 days
      
      const { data, error } = await accountingOperations.getEntriesByDateRange(
        startDate.toISOString(),
        new Date().toISOString()
      );

      if (error) {
        console.error('Error fetching entries:', error);
        return;
      }

      setEntries(data || []);
    } catch (error) {
      console.error('Error in fetchEntries:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-100 text-green-800';
      case 'expense':
        return 'bg-red-100 text-red-800';
      case 'debt':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h2 className="text-base font-semibold leading-6 text-gray-900">Accounting Entries</h2>
          <p className="mt-2 text-sm text-gray-700">
            A list of all accounting entries including date, description, type, category, and amount.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setShowImport(!showImport)}
            className="px-4 py-2 bg-primary text-white rounded-lg neo-brutalism hover:opacity-90 transition-opacity"
          >
            {showImport ? 'Hide Import' : 'Import CSV'}
          </button>
        </div>
      </div>

      {showImport && <CSVImport onImportComplete={fetchEntries} />}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {entries.map((entry) => (
                    <tr key={entry.entry_id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {entry.description}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(entry.type)}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {entry.category}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                        <span className={entry.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          ${entry.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                          ${entry.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
