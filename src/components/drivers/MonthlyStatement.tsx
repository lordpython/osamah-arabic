'use client';

import { useState } from 'react';

import { DriverMonthlyStatement } from '@/types/database';

export default function MonthlyStatement() {
  const [statements, setStatements] = useState<DriverMonthlyStatement[]>([]);

  // Generate array of days in a month (1-31)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  function getStatusColor(status?: string) {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-50';
      case 'absent':
        return 'text-red-600 bg-red-50';
      case 'leave':
        return 'text-yellow-600 bg-yellow-50';
      case 'holiday':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-500';
    }
  }

  return (
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
          {statements.map((statement) => (
            <tr key={statement.id}>
              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                {statement.driver_name}
              </td>
              {daysInMonth.map((day) => {
                const dailyRecord = statement.daily_records.find(
                  (record: { day: number; hours_worked: number; status: string }) => record.day === day
                );

                return (
                  <td key={day} className={`px-3 py-4 text-center text-sm ${getStatusColor(dailyRecord?.status)}`}>
                    {dailyRecord?.hours_worked || '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
