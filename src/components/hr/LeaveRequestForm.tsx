'use client';

import { useState } from 'react';

import { supabase } from '@/lib/supabase/config';
import { Employee, NewLeaveRequest } from '@/types/hr';

const leaveTypes = ['annual', 'sick', 'unpaid', 'other'] as const;

interface LeaveRequestFormProps {
  employees: Employee[];
}

export default function LeaveRequestForm({ employees }: LeaveRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<NewLeaveRequest>({
    employee_id: employees[0]?.id || '',
    leave_type: 'annual',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'pending',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.from('leave_requests').insert([request]).select();

      if (error) throw error;

      alert('Leave request submitted successfully!');
      // Reset form
      setRequest({
        employee_id: employees[0]?.id || '',
        leave_type: 'annual',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: '',
        status: 'pending',
      });
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Error submitting leave request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="employee" className="block text-sm font-medium leading-6 text-gray-900">
                Employee
              </label>
              <div className="mt-2">
                <select
                  id="employee"
                  value={request.employee_id}
                  onChange={(e) => setRequest({ ...request, employee_id: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                >
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} ({employee.employee_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="leave_type" className="block text-sm font-medium leading-6 text-gray-900">
                Leave Type
              </label>
              <div className="mt-2">
                <select
                  id="leave_type"
                  value={request.leave_type}
                  onChange={(e) =>
                    setRequest({ ...request, leave_type: e.target.value as (typeof leaveTypes)[number] })
                  }
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  {leaveTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)} Leave
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="start_date" className="block text-sm font-medium leading-6 text-gray-900">
                Start Date
              </label>
              <div className="mt-2">
                <input
                  type="date"
                  id="start_date"
                  value={request.start_date}
                  onChange={(e) => setRequest({ ...request, start_date: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="end_date" className="block text-sm font-medium leading-6 text-gray-900">
                End Date
              </label>
              <div className="mt-2">
                <input
                  type="date"
                  id="end_date"
                  value={request.end_date}
                  onChange={(e) => setRequest({ ...request, end_date: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="reason" className="block text-sm font-medium leading-6 text-gray-900">
                Reason
              </label>
              <div className="mt-2">
                <textarea
                  id="reason"
                  rows={4}
                  value={request.reason}
                  onChange={(e) => setRequest({ ...request, reason: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {loading ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </div>
      </div>
    </form>
  );
}
