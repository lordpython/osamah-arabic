'use client';

import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/config';
import type { AttendanceStatus, Driver } from '@/types/database';

interface AttendanceStatement {
  id: string;
  driver_id: string;
  date: string;
  status: AttendanceStatus;
  hours_worked: number;
}

export default function AttendanceTracking() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [statements, setStatements] = useState<AttendanceStatement[]>([]);

  const daysInMonth = Array.from({ length: new Date(selectedYear, selectedMonth, 0).getDate() }, (_, i) => i + 1);

  const fetchDrivers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('drivers').select('*').eq('status', 'active');

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  }, []);

  const fetchAttendanceStatements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('driver_attendance_statements')
        .select('*')
        .eq('month', selectedMonth)
        .eq('year', selectedYear);

      if (error) throw error;
      setStatements(data || []);
    } catch (error) {
      console.error('Error fetching statements:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDrivers();
    fetchAttendanceStatements();
  }, [fetchDrivers, fetchAttendanceStatements]);

  const getAttendanceStatus = (driverId: string, day: number) => {
    const date = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return statements.find((s) => s.driver_id === driverId && s.date === date);
  };

  const getStatusColor = (status?: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'on leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Driver Attendance</h2>
        <div className="flex space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-md border-gray-300"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border-gray-300"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                Driver Name
              </th>
              {daysInMonth.map((day) => (
                <th
                  key={day}
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                  {driver.full_name}
                </td>
                {daysInMonth.map((day) => {
                  const attendance = getAttendanceStatus(driver.id, day);
                  return (
                    <td
                      key={day}
                      className={`px-3 py-4 text-center text-sm ${getStatusColor(attendance?.status)}`}
                    >
                      {attendance?.hours_worked || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
