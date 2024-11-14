import { useCallback, useEffect, useState } from 'react';
import { supabase, dashboardCharts, realtime } from '../lib/supabase/config';
import type { DashboardChartData } from '../types/recharts';
import type { DailyOrderMetrics, MonthlyOrderMetrics } from '../types/database';

interface DashboardData {
  driverStats: DashboardChartData[];
  dailyMetrics: DailyOrderMetrics[];
  monthlyMetrics: MonthlyOrderMetrics[];
  activeDrivers: number;
  monthlyRevenue: number;
  loading: boolean;
  error: Error | null;
}

export function useDashboardData(): DashboardData & {
  refreshData: () => Promise<void>;
} {
  const [data, setData] = useState<DashboardData>({
    driverStats: [],
    dailyMetrics: [],
    monthlyMetrics: [],
    activeDrivers: 0,
    monthlyRevenue: 0,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      // Fetch active drivers count
      const { count: activeDrivers } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch monthly revenue
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { data: revenueData } = await supabase
        .from('accounting_entries')
        .select('amount')
        .eq('type', 'income')
        .gte('date', startOfMonth.toISOString());
      
      const monthlyRevenue = (revenueData || []).reduce(
        (sum: number, entry: { amount: any }) => sum + Number(entry.amount),
        0
      );

      // Fetch driver statistics
      const { data: driversData } = await supabase
        .from('drivers')
        .select('status');

      const driverStats = [
        'active',
        'on_leave',
        'suspended',
        'inactive'
      ].map(status => {
        const count = driversData?.filter(d => d.status === status).length || 0;
        const total = driversData?.length || 1;
        return {
          name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
          value: count,
          percentage: (count / total) * 100
        };
      });

      // Fetch daily metrics for the last 30 days
      const { data: dailyMetrics } = await dashboardCharts.getDailyOrderMetrics(30);

      // Fetch monthly metrics for current year
      const currentYear = new Date().getFullYear();
      const { data: monthlyMetrics } = await dashboardCharts.getMonthlyOrderMetrics(currentYear);

      setData({
        driverStats,
        dailyMetrics: dailyMetrics || [],
        monthlyMetrics: monthlyMetrics || [],
        activeDrivers: activeDrivers || 0,
        monthlyRevenue,
        loading: false,
        error: null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Set up real-time subscriptions for all relevant tables
    const subscriptions = [
      // Driver status changes
      supabase
        .channel('driver_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'drivers' },
          fetchData
        )
        .subscribe(),

      // Accounting entries for revenue
      supabase
        .channel('accounting_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'accounting_entries' },
          fetchData
        )
        .subscribe(),

      // Daily order metrics
      supabase
        .channel('daily_metrics')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'daily_order_metrics' },
          fetchData
        )
        .subscribe(),

      // Monthly order metrics
      supabase
        .channel('monthly_metrics')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'monthly_order_metrics' },
          fetchData
        )
        .subscribe(),

      // Driver performance
      supabase
        .channel('driver_performance')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'driver_daily_performance' },
          fetchData
        )
        .subscribe(),
    ];

    // Cleanup subscriptions
    return () => {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, [fetchData]);

  return {
    ...data,
    refreshData: fetchData,
  };
}
