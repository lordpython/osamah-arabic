'use client';

import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { AccountingEntry } from '@/types/database';

const MotionDiv = motion.div;

interface MonthlyFinancialData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export default function ReportsPage() {
  const {
    data: financialData,
    loading,
    error,
  } = useSupabaseQuery<MonthlyFinancialData[]>('accounting_entries', async (supabase) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const { data, error } = await supabase
      .from('accounting_entries')
      .select('*')
      .gte('date', startDate.toISOString())
      .order('date');

    if (error) throw error;

    const monthlyData = processMonthlyData(data as AccountingEntry[]);
    return { data: monthlyData, error: null };
  });

  function processMonthlyData(data: AccountingEntry[]): MonthlyFinancialData[] {
    const monthlyAggregates = data.reduce<Record<string, MonthlyFinancialData>>((acc, entry) => {
      const monthYear = new Date(entry.date).toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });

      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          income: 0,
          expenses: 0,
          profit: 0,
        };
      }

      if (entry.type === 'receipt') {
        acc[monthYear].income += Number(entry.amount);
      } else {
        acc[monthYear].expenses += Number(entry.amount);
      }

      acc[monthYear].profit = acc[monthYear].income - acc[monthYear].expenses;
      return acc;
    }, {});

    return Object.values(monthlyAggregates);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <p className="text-red-700">Error loading financial data: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-8">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-indigo-600 rounded-xl p-8 mb-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-4">Financial Reports</h1>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
            Generate Report
          </button>
          <button className="px-4 py-2 border border-white text-white rounded-lg hover:bg-white/10 transition-colors">
            Export Data
          </button>
        </div>
      </MotionDiv>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="h-96 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#4F46E5" name="Income" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              <Bar dataKey="profit" fill="#10B981" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Income
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(financialData || []).map((data) => (
                <tr key={data.month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${data.income.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${data.expenses.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${data.profit.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
