'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';
import AttendanceCell from './AttendanceCell';
import { Driver } from '@/types/database';

export default function AttendanceDataEntry() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDrivers();
    fetchAttendance();
  }, [selectedDate]);

  async function fetchDrivers() {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendance() {
    // Implementation similar to fetchDrivers
  }

  async function handleBulkUpdate(status: 'present' | 'absent' | 'leave') {
    setSaving(true);
    try {
      const updates = drivers.map(driver => ({
        driver_id: driver.id,
        date: selectedDate.toISOString().split('T')[0],
        hours_worked: status === 'present' ? 8 : 0,
        status: status,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('driver_attendance')
        .upsert(updates);

      if (error) throw error;
    } catch (error) {
      console.error('Error bulk updating attendance:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusUpdate(driverId: string, status: 'present' | 'absent' | 'leave') {
    try {
      const { error } = await supabase
        .from('driver_attendance')
        .upsert({
          driver_id: driverId,
          date: selectedDate.toISOString().split('T')[0],
          status: status,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  async function handleNotesUpdate(driverId: string, notes: string) {
    try {
      const { error } = await supabase
        .from('driver_attendance')
        .upsert({
          driver_id: driverId,
          date: selectedDate.toISOString().split('T')[0],
          notes: notes,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Attendance Data Entry</h2>
        
        <div className="flex space-x-4 items-center">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="rounded-md border-gray-300"
          />
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkUpdate('present')}
              disabled={saving}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleBulkUpdate('absent')}
              disabled={saving}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours Worked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {driver.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <AttendanceCell
                      driverId={driver.id}
                      date={selectedDate.toISOString().split('T')[0]}
                      onUpdate={() => fetchAttendance()}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      className="rounded-md border-gray-300"
                      onChange={(e) => handleStatusUpdate(driver.id, e.target.value as "present" | "absent" | "leave")}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="leave">Leave</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="text"
                      className="rounded-md border-gray-300 w-full"
                      placeholder="Add notes..."
                      onChange={(e) => handleNotesUpdate(driver.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 