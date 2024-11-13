import { useEffect, useState } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import MetricCard from './MetricCard';
import DriverStatusChart from './DriverStatusChart';
import FinancialSummary from './FinancialSummary';
import OrderMetrics from './OrderMetrics';

export default function CEODashboard() {
  // Fetch company-wide metrics
  const { data: totalRevenue } = useSupabaseQuery<number>(
    'accounting_entries',
    async (supabase) => {
      const { data, error } = await supabase
        .from('accounting_entries')
        .select('amount')
        .eq('type', 'income');

      const total = (data || []).reduce((sum, entry) => sum + Number(entry.amount), 0);
      return { data: total, error };
    }
  );

  // Fetch total active drivers
  const { data: totalDrivers } = useSupabaseQuery<number>(
    'drivers',
    async (supabase) => {
      const { count, error } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      return { data: count, error };
    }
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">CEO Dashboard</h1>
      
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Revenue"
          value={totalRevenue || 0}
          icon="💰"
          trend={0}
          format="currency"
        />
        <MetricCard
          title="Active Drivers"
          value={totalDrivers || 0}
          icon="🚗"
          trend={0}
        />
        <MetricCard
          title="Fleet Utilization"
          value={85}
          icon="📈"
          trend={5}
          format="number"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Driver Distribution</h3>
          <DriverStatusChart />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Overview</h3>
          <FinancialSummary />
        </div>
      </div>

      {/* Operations Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Operations Overview</h3>
        <OrderMetrics />
      </div>
    </div>
  );
} 