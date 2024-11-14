'use client';

import { motion } from 'framer-motion';

import AccountingEntries from '@/components/accounting/AccountingEntries';

const MotionDiv = motion.div;

export default function TransactionsPage() {
  return (
    <div className="p-6">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm rounded-lg p-6 mb-6"
      >
        <h1 className="text-2xl font-bold mb-6">Transactions</h1>
        <div className="flex space-x-4">
          <button className="px-4 py-2 rounded-lg transition-colors duration-200 bg-indigo-600 text-white hover:bg-indigo-700">
            New Transaction
          </button>
          <button className="px-4 py-2 rounded-lg transition-colors duration-200 bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50">
            Export Transactions
          </button>
        </div>
      </MotionDiv>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <AccountingEntries />
      </div>
    </div>
  );
}
