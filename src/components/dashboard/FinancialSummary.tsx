'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { supabase } from '@/lib/supabase/config';
import { AccountingEntry } from '@/types/database';

interface MonthlyFinancialData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

interface FinancialSummaryProps {
  darkMode?: boolean;
}

export default function FinancialSummary({ darkMode = false }: FinancialSummaryProps) {
  const [financialData, setFinancialData] = useState<MonthlyFinancialData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinancialData = useCallback(async () => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const { data, error } = await supabase
        .from('accounting_entries')
        .select('*')
        .gte('date', startDate.toISOString())
        .order('date');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        console.error('No data returned from Supabase');
        return;
      }

      // Process and aggregate data by month
      const monthlyData = processMonthlyData(data);
      setFinancialData(monthlyData);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      // Set empty data instead of leaving stale data
      setFinancialData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  function processMonthlyData(data: AccountingEntry[]): MonthlyFinancialData[] {
    const monthlyAggregates = data.reduce((acc: Record<string, MonthlyFinancialData>, entry) => {
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
        acc[monthYear].income += entry.amount;
      } else if (entry.type === 'payment') {
        acc[monthYear].expenses += entry.amount;
      }

      acc[monthYear].profit = acc[monthYear].income - acc[monthYear].expenses;
      return acc;
    }, {});

    return Object.values(monthlyAggregates);
  }

  return (
    <div className={darkMode ? 'text-white' : 'text-gray-900'}>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900">Financial Performance</h3>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
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
        )}
      </div>
    </div>
  );
}
