'use client';

import { useEffect, useState } from 'react';

export default function MonthlyStatementSummary({
  driverId,
  month,
  year,
}: {
  driverId: string;
  month: number;
  year: number;
}) {
  const [stats, setStats] = useState({
    daysWorked: 0,
    totalHours: 0,
    attendanceRate: 0,
    averageHours: 0,
  });

  useEffect(() => {
    // This would typically fetch data based on driverId, month, and year
    // For now using placeholder data
    const fetchStats = async () => {
      // Simulated API call using the props
      console.log(`Fetching stats for driver ${driverId} for ${month}/${year}`);

      // Placeholder data - in real app, this would come from an API
      setStats({
        daysWorked: 22,
        totalHours: 176,
        attendanceRate: 95,
        averageHours: 8,
      });
    };

    fetchStats();
  }, [driverId, month, year]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Total Days Worked</h3>
        <p className="mt-2 text-xl font-semibold text-gray-900">{stats.daysWorked}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Total Hours</h3>
        <p className="mt-2 text-xl font-semibold text-gray-900">{stats.totalHours}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
        <p className="mt-2 text-xl font-semibold text-green-600">{stats.attendanceRate}%</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Average Hours/Day</h3>
        <p className="mt-2 text-xl font-semibold text-gray-900">{stats.averageHours}</p>
      </div>
    </div>
  );
}
