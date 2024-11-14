'use client';

import dynamic from 'next/dynamic';
import { ChartSkeleton } from '../shared/LoadingSkeleton';

// Dynamically import the dashboard component to reduce initial bundle size
const MainDashboard = dynamic(
  () => import('./MainDashboard'),
  {
    loading: () => (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <ChartSkeleton />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <ChartSkeleton />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false // Disable SSR for dashboard components that use browser APIs
  }
);

export default function DashboardWrapper() {
  return <MainDashboard />;
}
