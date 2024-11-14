'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, hrOperations } from '@/lib/supabase/config';
import type { DriverMonthlyStatement, DailyAttendanceRecord } from '@/types/database';

interface MonthlyStats {
  daysWorked: number;
  totalHours: number;
  attendanceRate: number;
  averageHours: number;
  onTimeRate: number;
  lateCount: number;
}

interface Props {
  driverId: string;
  month: number;
  year: number;
}

export default function MonthlyStatementSummary({ driverId, month, year }: Props) {
  const [stats, setStats] = useState<MonthlyStats>({
    daysWorked: 0,
    totalHours: 0,
    attendanceRate: 0,
    averageHours: 0,
    onTimeRate: 0,
    lateCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonthlyStats();
  }, [driverId, month, year]);

  const fetchMonthlyStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range for the month
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0).toISOString();
      const totalDaysInMonth = new Date(year, month, 0).getDate();

      // Fetch attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', driverId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (attendanceError) throw new Error(attendanceError.message);

      if (!attendanceData) {
        throw new Error('No attendance data found');
      }

      // Calculate statistics
      const daysWorked = attendanceData.filter(record => record.status === 'present').length;
      const totalHours = attendanceData.reduce((sum, record) => {
        if (record.check_in && record.check_out) {
          const checkIn = new Date(`${record.date}T${record.check_in}`);
          const checkOut = new Date(`${record.date}T${record.check_out}`);
          return sum + (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        }
        return sum;
      }, 0);

      const lateCount = attendanceData.filter(record => record.status === 'late').length;
      const presentAndLateCount = daysWorked + lateCount;

      setStats({
        daysWorked: presentAndLateCount,
        totalHours: Math.round(totalHours * 10) / 10,
        attendanceRate: Math.round((presentAndLateCount / totalDaysInMonth) * 100),
        averageHours: presentAndLateCount ? Math.round((totalHours / presentAndLateCount) * 10) / 10 : 0,
        onTimeRate: presentAndLateCount ? Math.round((daysWorked / presentAndLateCount) * 100) : 0,
        lateCount
      });

    } catch (err) {
      console.error('Error fetching monthly stats:', err);
      setError(err instanceof Error ? err.message : 'Error fetching monthly statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Days Worked</h3>
          <p className="mt-2 text-xl font-semibold text-gray-900">{stats.daysWorked}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Hours</h3>
          <p className="mt-2 text-xl font-semibold text-gray-900">{stats.totalHours}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
          <p className={`mt-2 text-xl font-semibold ${
            stats.attendanceRate >= 90 ? 'text-green-600' : 
            stats.attendanceRate >= 80 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {stats.attendanceRate}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Average Hours/Day</h3>
          <p className="mt-2 text-xl font-semibold text-gray-900">{stats.averageHours}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">On-Time Rate</h3>
          <p className={`mt-2 text-xl font-semibold ${
            stats.onTimeRate >= 90 ? 'text-green-600' : 
            stats.onTimeRate >= 80 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {stats.onTimeRate}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Late Count</h3>
          <p className={`mt-2 text-xl font-semibold ${
            stats.lateCount <= 2 ? 'text-green-600' : 
            stats.lateCount <= 4 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {stats.lateCount}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Monthly Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Attendance Target:</span>
              <span className="font-medium">95%</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div 
                className={`h-2 rounded-full ${
                  stats.attendanceRate >= 95 ? 'bg-green-500' :
                  stats.attendanceRate >= 85 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(stats.attendanceRate, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">On-Time Target:</span>
              <span className="font-medium">90%</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div 
                className={`h-2 rounded-full ${
                  stats.onTimeRate >= 90 ? 'bg-green-500' :
                  stats.onTimeRate >= 80 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(stats.onTimeRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
