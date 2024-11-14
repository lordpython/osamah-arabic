'use client';

import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/config';
import { AccountingEntry } from '@/types/accounting';
import CSVImport from './CSVImport';

export default function AccountingEntries() {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    // Fetch initial data
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('accounting_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
        return;
      }

      setEntries(data || []);
    };

    fetchEntries();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('accounting_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounting_entries',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEntries((current) => [payload.new as AccountingEntry, ...current]);
          } else if (payload.eventType === 'DELETE') {
            setEntries((current) => current.filter((entry) => entry.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setEntries((current) =>
              current.map((entry) => (entry.id === payload.new.id ? (payload.new as AccountingEntry) : entry))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="mt-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h2 className="text-base font-semibold leading-6 text-gray-900">Accounting Entries</h2>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setShowImport(!showImport)}
            className="px-4 py-2 bg-primary text-white rounded-lg neo-brutalism"
          >
            {showImport ? 'Hide Import' : 'Import CSV'}
          </button>
        </div>
      </div>

      {showImport && <CSVImport />}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                      {new Date(entry.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{entry.description}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          entry.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {entry.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{entry.category}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">
                      ${entry.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
