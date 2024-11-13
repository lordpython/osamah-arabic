import { useState } from 'react';
import { Attendance } from '@/types/database';

interface ExistingAttendanceTableProps {
  date: string;
  attendanceRecords: Attendance[];
}

export default function ExistingAttendanceTable({ date, attendanceRecords }: ExistingAttendanceTableProps) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Attendance Records</h3>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Driver Name</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Check In</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Check Out</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {attendanceRecords.map((record) => (
            <tr key={record.attendance_id}>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                {record.employee_id}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {record.check_in}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {record.check_out}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {record.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 