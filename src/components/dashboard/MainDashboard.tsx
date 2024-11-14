'use client';

import { memo, useEffect, useRef } from 'react';

import { useDashboardData } from '../../hooks/useDashboardData';
import { withErrorBoundary } from '../shared/ErrorBoundary';
import { MetricCardSkeleton } from '../shared/LoadingSkeleton';
import MetricCard from '../shared/MetricCard';
import DriverStatusChart from './DriverStatusChart';
import OrderMetrics from './OrderMetrics';

function MainDashboardBase() {
  const { activeDrivers, monthlyRevenue, loading, error } = useDashboardData();

  const previousValues = useRef({
    activeDrivers,
    monthlyRevenue,
  });

  useEffect(() => {
    previousValues.current = {
      activeDrivers,
      monthlyRevenue,
    };
  }, [activeDrivers, monthlyRevenue]);

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-100">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Active Drivers"
              value={activeDrivers}
              icon="🚗"
              previousValue={previousValues.current.activeDrivers}
            />
            <MetricCard
              title="Monthly Revenue"
              value={monthlyRevenue}
              icon="💰"
              format="currency"
              previousValue={previousValues.current.monthlyRevenue}
            />
            {/* Add more metric cards as needed */}
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DriverStatusChart />
        <OrderMetrics />
      </div>

      {/* Additional dashboard sections can be added here */}
    </div>
  );
}

MainDashboardBase.displayName = 'MainDashboardBase';

export const MainDashboard = memo(withErrorBoundary(MainDashboardBase));
export default MainDashboard;
