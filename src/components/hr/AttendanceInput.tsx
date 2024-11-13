'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/config';
import { Driver } from '@/types/database';

export default function AttendanceInput() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleAttendanceSubmit = async (driverId: string, status: string, checkIn: string, checkOut: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('attendance')
        .upsert({
          employee_id: driverId,
          date: selectedDate,
          check_in: checkIn,
          check_out: checkOut,
          status: status,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Daily Attendance Entry</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Driver Name</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Check In</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Check Out</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {drivers.map((driver) => (
              <AttendanceRow
                key={driver.id}
                driver={driver}
                onSubmit={handleAttendanceSubmit}
                saving={saving}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceRow({ driver, onSubmit, saving }: { 
  driver: Driver; 
  onSubmit: (driverId: string, status: string, checkIn: string, checkOut: string) => Promise<void>;
  saving: boolean;
}) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [status, setStatus] = useState('present');

  return (
    <tr>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{driver.full_name}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <input
          type="time"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <input
          type="time"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="leave">Leave</option>
        </select>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <button
          onClick={() => onSubmit(driver.id, status, checkIn, checkOut)}
          disabled={saving}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </td>
    </tr>
  );
} 