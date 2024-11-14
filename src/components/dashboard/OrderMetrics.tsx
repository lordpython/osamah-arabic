'use client';

import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { supabase } from '@/lib/supabase/config';
import { DailyOrderMetrics, MonthlyOrderMetrics } from '@/types/database';

export default function OrderMetrics() {
  const [dailyMetrics, setDailyMetrics] = useState<DailyOrderMetrics[]>([]);
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyOrderMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      // Fetch daily metrics for the last 30 days
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_order_metrics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (dailyError) throw dailyError;

      // Fetch monthly metrics for the last 12 months
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('monthly_order_metrics')
        .select('*')
        .order('year,month', { ascending: false })
        .limit(12);

      if (monthlyError) throw monthlyError;

      setDailyMetrics(dailyData || []);
      setMonthlyMetrics(monthlyData || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Daily Metrics Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Order Metrics</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date: string) => new Date(date).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(date: string) => new Date(date).toLocaleDateString()} />
                <Legend />
                <Line type="monotone" dataKey="total_orders" stroke="#4F46E5" name="Actual Orders" />
                <Line
                  type="monotone"
                  dataKey="orders_target"
                  stroke="#EF4444"
                  name="Target Orders"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Monthly Metrics Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Order Metrics</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(month: string) => `${month}/${monthlyMetrics[0]?.year}`} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total_orders" stroke="#4F46E5" name="Actual Orders" />
                <Line
                  type="monotone"
                  dataKey="orders_target"
                  stroke="#EF4444"
                  name="Target Orders"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Achievement Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {monthlyMetrics.slice(0, 1).map((metric) => (
            <div key={metric.id} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Current Month Progress</h3>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    {metric.total_orders} / {metric.orders_target}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      metric.achieved_percentage >= 100 ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {metric.achieved_percentage}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.achieved_percentage >= 100 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(metric.achieved_percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
