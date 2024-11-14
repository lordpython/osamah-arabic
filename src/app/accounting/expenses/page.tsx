'use client';

import { motion } from 'framer-motion';

const MotionDiv = motion.div;

export default function ExpensesPage() {
  return (
    <div className="p-6">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm rounded-lg p-6 mb-6"
      >
        <h1 className="text-2xl font-bold mb-6">Expenses</h1>
        <div className="flex space-x-4">
          <button
            className="px-4 py-2 rounded-lg transition-colors duration-200 bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Add Expense
          </button>
          <button
            className="px-4 py-2 rounded-lg transition-colors duration-200 bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
          >
            Import Expenses
          </button>
        </div>
      </MotionDiv>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Expense rows will be added here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 