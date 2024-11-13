'use client';

import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import MetricCard from './MetricCard';
import DriverStatusChart from './DriverStatusChart';
import GrowthChart from './GrowthChart';

export default function MainDashboard() {
  // Fetch active drivers count
  const { data: activeDrivers } = useSupabaseQuery<number>(
    'drivers',
    async (supabase) => {
      const { count, error } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      return { data: count, error };
    }
  );

  // Fetch monthly revenue
  const { data: monthlyRevenue } = useSupabaseQuery<number>(
    'accounting_entries',
    async (supabase) => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { data, error } = await supabase
        .from('accounting_entries')
        .select('amount')
        .eq('type', 'income')
        .gte('date', startOfMonth.toISOString());
      const total = (data || []).reduce((sum, entry) => sum + Number(entry.amount), 0);
      return { data: total, error };
    }
  );

  return (
    <div className="space-y-6 p-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Active Drivers"
          value={activeDrivers || 0}
          icon="🚗"
          trend={0}
        />
        <MetricCard
          title="Monthly Revenue"
          value={monthlyRevenue || 0}
          icon="💰"
          trend={0}
          format="currency"
        />
        {/* ... */}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Driver Status Distribution</h3>
          <DriverStatusChart />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Growth Trend</h3>
          <GrowthChart />
        </div>
      </div>

      {/* Financial Performance */}
      {/* ... */}
    </div>
  );
}