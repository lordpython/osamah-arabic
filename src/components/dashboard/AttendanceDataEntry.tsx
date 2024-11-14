'use client';

import { useState } from 'react';

import { supabase } from '@/lib/supabase/config';
import type { AttendanceStatus } from '@/types/database';

export default function AttendanceDataEntry() {
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (employeeId: string, status: AttendanceStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          employee_id: employeeId,
          date: new Date().toISOString().split('T')[0],
          status,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating attendance status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Attendance Entry</h2>
      <div className="space-y-4">
        <select
          className="rounded-md border-gray-300 w-full"
          onChange={(e) => handleStatusUpdate(e.target.id, e.target.value as AttendanceStatus)}
          disabled={loading}
        >
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="on leave">On Leave</option>
        </select>
      </div>
    </div>
  );
}
