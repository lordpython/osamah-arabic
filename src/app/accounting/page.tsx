'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

import AccountingEntries from '@/components/accounting/AccountingEntries';
import CSVImport from '@/components/accounting/CSVImport';
import PaymentForm from '@/components/accounting/PaymentForm';
import { accountingOperations } from '@/lib/supabase/config';

const MotionDiv = motion.div;

export default function AccountingPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Last 30 days

      const { data, error } = await accountingOperations.getEntriesByDateRange(
        startDate.toISOString(),
        new Date().toISOString()
      );

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      // Convert data to CSV format
      const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Payment Method', 'Status'];
      const csvContent = [
        headers.join(','),
        ...data.map((entry) =>
          [
            entry.date,
            entry.type,
            entry.category,
            entry.amount,
            `"${entry.description.replace(/"/g, '""')}"`,
            entry.payment_method,
            entry.status,
          ].join(',')
        ),
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `accounting_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert(err instanceof Error ? err.message : 'Error exporting data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 mb-8 shadow-lg"
      >
        <h1 className="text-3xl font-bold text-white mb-6">Financial Management</h1>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              setShowCSVImport(!showCSVImport);
              setShowPaymentForm(false);
            }}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              showCSVImport ? 'bg-white text-indigo-700' : 'bg-indigo-500 text-white hover:bg-indigo-400'
            }`}
          >
            {showCSVImport ? 'Hide Import' : 'Import CSV'}
          </button>
          <button
            onClick={() => {
              setShowPaymentForm(!showPaymentForm);
              setShowCSVImport(false);
            }}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              showPaymentForm ? 'bg-white text-indigo-700' : 'bg-indigo-500 text-white hover:bg-indigo-400'
            }`}
          >
            {showPaymentForm ? 'Hide Form' : 'Add Entry'}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 
              bg-transparent text-white border border-white hover:bg-white/10
              ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {exporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </MotionDiv>

      {showCSVImport && (
        <MotionDiv
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <CSVImport />
        </MotionDiv>
      )}

      {showPaymentForm && (
        <MotionDiv
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <PaymentForm />
        </MotionDiv>
      )}

      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <AccountingEntries />
      </MotionDiv>
    </div>
  );
}
