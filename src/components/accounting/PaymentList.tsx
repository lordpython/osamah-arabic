'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { accountingOperations, realtime } from '../../lib/supabase/config'; // Removed unused supabase import

import type { AccountingEntry } from '../../types/database';

const ITEMS_PER_PAGE = 10;

type SortableFields = 'date' | 'category' | 'amount' | 'status';

export default function PaymentList() {
  const [payments, setPayments] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortableFields>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchPayments();

    // Set up real-time subscription
    const subscription = realtime.subscribeToAccountingEntries((payload) => {
      if (payload.eventType === 'INSERT') {
        setPayments((current) => [payload.new as AccountingEntry, ...current]);
      } else if (payload.eventType === 'DELETE') {
        setPayments((current) => current.filter((p) => p.entry_id !== payload.old.entry_id));
      } else if (payload.eventType === 'UPDATE') {
        setPayments((current) =>
          current.map((p) => (p.entry_id === payload.new.entry_id ? (payload.new as AccountingEntry) : p))
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchPayments() {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Last 30 days

      const { data, error: fetchError } = await accountingOperations.getEntriesByDateRange(
        startDate.toISOString(),
        new Date().toISOString()
      );

      if (fetchError) throw new Error(fetchError.message);

      setPayments(data?.filter((entry) => entry.type === 'payment') || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSort = (field: SortableFields) => {
    if (field === sortField) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const compareValues = (a: AccountingEntry, b: AccountingEntry, field: SortableFields) => {
    if (field === 'amount') {
      return a.amount - b.amount;
    }
    if (field === 'date') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return String(a[field]).localeCompare(String(b[field]));
  };

  const filteredPayments = payments
    .filter((payment) => {
      const matchesSearch =
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const comparison = compareValues(a, b, sortField);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <input
            type="search"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => handleSort('date')}
              >
                Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => handleSort('category')}
              >
                Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Method</th>
              <th
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedPayments.map((payment) => (
              <tr key={payment.entry_id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                  {new Date(payment.date).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{payment.category}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                  <span className={payment.type === 'receipt' ? 'text-green-600' : 'text-red-600'}>
                    ${payment.amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">{payment.description}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{payment.payment_method}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(payment.status)}`}
                  >
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPayments.length)}</span>{' '}
                of <span className="font-medium">{filteredPayments.length}</span> payments
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
