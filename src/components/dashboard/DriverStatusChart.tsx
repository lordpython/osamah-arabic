'use client';

import { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase, dashboardCharts } from '@/lib/supabase/config';
import type { DashboardChartData } from '@/types/recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

interface DriverStatusChartProps {
  darkMode?: boolean;
}

export default function DriverStatusChart({ darkMode = false }: DriverStatusChartProps) {
  const [driverStats, setDriverStats] = useState<DashboardChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverStats();
    // Set up real-time subscription
    const subscription = supabase
      .channel('driver_status_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'drivers' }, 
        () => {
          fetchDriverStats(); // Refresh data on any changes
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchDriverStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: performanceData, error: performanceError } = await dashboardCharts.getDriverPerformanceData(today, today);

      if (performanceError) {
        console.error('Error fetching performance data:', performanceError);
        return;
      }

      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('status');

      if (driversError) {
        console.error('Error fetching drivers:', driversError);
        return;
      }

      const stats: DashboardChartData[] = [
        { 
          name: 'Active', 
          value: driversData.filter((d) => d.status === 'active').length,
          percentage: (driversData.filter((d) => d.status === 'active').length / driversData.length) * 100
        },
        { 
          name: 'On Leave', 
          value: driversData.filter((d) => d.status === 'on_leave').length,
          percentage: (driversData.filter((d) => d.status === 'on_leave').length / driversData.length) * 100
        },
        { 
          name: 'Suspended', 
          value: driversData.filter((d) => d.status === 'suspended').length,
          percentage: (driversData.filter((d) => d.status === 'suspended').length / driversData.length) * 100
        },
        { 
          name: 'Inactive', 
          value: driversData.filter((d) => d.status === 'inactive').length,
          percentage: (driversData.filter((d) => d.status === 'inactive').length / driversData.length) * 100
        },
      ];

      setDriverStats(stats);
    } catch (error) {
      console.error('Error in fetchDriverStats:', error);
      setDriverStats([]);
    } finally {
      setLoading(false);
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow-lg rounded-lg border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Count: {data.value}</p>
          <p className="text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${darkMode ? 'text-white' : 'text-gray-900'} w-full`}>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Driver Status Distribution
        </h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={driverStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {driverStats.map((entry, index) => (
                    <Cell 
                      key={entry.name} 
                      fill={COLORS[index % COLORS.length]}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
