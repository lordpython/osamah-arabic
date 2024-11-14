'use client';

import { format } from 'date-fns';

import type { Attendance } from '@/types/database';

interface ExistingAttendanceTableProps {
  date: string;
  attendanceRecords: Attendance[];
}

export default function ExistingAttendanceTable({ date, attendanceRecords }: ExistingAttendanceTableProps) {
  const formattedDate = format(new Date(date), 'MMMM d, yyyy');

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Attendance Records</h3>
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>
      
      {attendanceRecords.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No attendance records for this date</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Employee ID</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Check In</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Check Out</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {attendanceRecords.map((record) => (
              <tr key={record.attendance_id}>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{record.employee_id}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {record.check_in_time ? format(new Date(record.check_in_time), 'HH:mm') : '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {record.check_out_time ? format(new Date(record.check_out_time), 'HH:mm') : '-'}
                </td>
                <td className={`whitespace-nowrap px-3 py-4 text-sm ${
                  record.status === 'present' ? 'text-green-600' :
                  record.status === 'absent' ? 'text-red-600' :
                  record.status === 'on leave' ? 'text-yellow-600' :
                  'text-gray-500'
                }`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
