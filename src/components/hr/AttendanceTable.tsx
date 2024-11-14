'use client';

import { useState } from 'react';

import AttendanceInput from './AttendanceInput';
import ExistingAttendanceTable from './ExistingAttendanceTable';

export default function AttendanceTable() {
  const [view, setView] = useState<'view' | 'input'>('view');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Attendance Management</h2>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            onClick={() => setView(view === 'view' ? 'input' : 'view')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {view === 'view' ? 'Enter Attendance' : 'View Attendance'}
          </button>
        </div>
      </div>

      {view === 'view' ? (
        <ExistingAttendanceTable date={selectedDate} attendanceRecords={[]} />
      ) : (
        <AttendanceInput />
      )}
    </div>
  );
}
