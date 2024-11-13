'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import DriverStatusChart from './DriverStatusChart';
import FinancialSummary from './FinancialSummary';
import MetricCard from './MetricCard';

type MotionDivProps = HTMLMotionProps<"div"> & {
  className?: string;
  children: React.ReactNode;
};

const MotionDiv = motion.div as React.FC<MotionDivProps>;

export default function ModernDashboard() {
  const { data: metrics } = useSupabaseQuery('dashboard_metrics', async (supabase) => {
    // Fetch your metrics here
    return { data: null, error: null };
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Real-time metrics and performance analysis</p>
        </MotionDiv>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Active Drivers"
            value={62}
            icon="🚗"
            trend={5}
            theme="dark"
          />
          <MetricCard
            title="Monthly Revenue"
            value={84500}
            icon="💰"
            trend={12}
            format="currency"
            theme="dark"
          />
          <MetricCard
            title="Performance"
            value={72}
            icon="📈"
            trend={-3}
            format="percentage"
            theme="dark"
          />
          <MetricCard
            title="Fleet Utilization"
            value={89}
            icon="🚚"
            trend={7}
            format="percentage"
            theme="dark"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Driver Distribution</h3>
            <DriverStatusChart darkMode />
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Financial Performance</h3>
            <FinancialSummary darkMode />
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Performance Metrics</h3>
          {/* Add your performance metrics visualization here */}
        </div>
      </div>
    </div>
  );
} 