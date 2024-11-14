'use client';

import { memo, useEffect, useRef } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import DriverStatusChart from './DriverStatusChart'; // Updated to default import
import OrderMetrics from './OrderMetrics'; // Updated to default import
import { MetricCardSkeleton } from '../shared/LoadingSkeleton';
import { withErrorBoundary } from '../shared/ErrorBoundary';

const MetricCard = memo(({ 
  title, 
  value, 
  icon, 
  trend = 0,
  format = 'number',
  previousValue = null
}: { 
  title: string;
  value: number;
  icon: string;
  trend?: number;
  format?: 'number' | 'currency';
  previousValue?: number | null;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasChanged = previousValue !== null && previousValue !== value;

  useEffect(() => {
    if (hasChanged && cardRef.current) {
      cardRef.current.classList.add('scale-105', 'bg-blue-50');
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.classList.remove('scale-105', 'bg-blue-50');
        }
      }, 1000);
    }
  }, [value, hasChanged]);

  const formattedValue = format === 'currency' 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    : new Intl.NumberFormat('en-US').format(value);

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-lg shadow p-6 transition-all duration-300 ease-in-out transform"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {trend !== 0 && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mt-4">{title}</h3>
      <p className="text-2xl font-semibold text-gray-900 mt-2">{formattedValue}</p>
    </div>
  );
});

function MainDashboardBase() {
  const { 
    activeDrivers, 
    monthlyRevenue, 
    loading, 
    error 
  } = useDashboardData();

  const previousValues = useRef({
    activeDrivers,
    monthlyRevenue
  });

  useEffect(() => {
    previousValues.current = {
      activeDrivers,
      monthlyRevenue
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
