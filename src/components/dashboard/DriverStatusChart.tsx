'use client';

import { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { supabase } from '@/lib/supabase/config';

interface DriverStat {
  name: string;
  value: number;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

interface DriverStatusChartProps {
  darkMode?: boolean;
}

export default function DriverStatusChart({ darkMode = false }: DriverStatusChartProps) {
  const [driverStats, setDriverStats] = useState<DriverStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverStats();
  }, []);

  async function fetchDriverStats() {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('status, performance:driver_daily_performance(rating_average)');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        console.error('No data returned from Supabase');
        return;
      }

      const stats: DriverStat[] = [
        { name: 'Active', value: data.filter((d) => d.status === 'active').length },
        { name: 'On Leave', value: data.filter((d) => d.status === 'on_leave').length },
        { name: 'Suspended', value: data.filter((d) => d.status === 'suspended').length },
        { name: 'Inactive', value: data.filter((d) => d.status === 'inactive').length },
      ];

      setDriverStats(stats);
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      // Set empty stats instead of leaving stale data
      setDriverStats([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={darkMode ? 'text-white' : 'text-gray-900'}>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900">Driver Status Distribution</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={driverStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {driverStats.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
