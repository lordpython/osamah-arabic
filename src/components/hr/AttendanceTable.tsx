'use client';

import { useState } from 'react';
import AttendanceInput from './AttendanceInput';
import ExistingAttendanceTable from './ExistingAttendanceTable';

export default function AttendanceTable() {
  const [view, setView] = useState<'view' | 'input'>('view');
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Attendance Management</h2>
        <button
          onClick={() => setView(view === 'view' ? 'input' : 'view')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {view === 'view' ? 'Enter Attendance' : 'View Attendance'}
        </button>
      </div>

      {view === 'view' ? (
        <ExistingAttendanceTable date="" attendanceRecords={[]} />
      ) : (
        <AttendanceInput />
      )}
    </div>
  );
} 