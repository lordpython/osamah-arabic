'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { hrOperations, realtime, supabase } from '@/lib/supabase/config';
import type { AttendanceInput as AttendanceInputType, AttendanceStatus, EmployeeRecord } from '@/types/database';

const MotionDiv = motion.div;

export default function AttendanceInput() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<AttendanceInputType>({
    employee_id: 0,
    date: new Date(),
    status: 'present',
    check_in_time: new Date(),
    check_out_time: undefined,
  });

  useEffect(() => {
    fetchEmployees();

    // Set up real-time subscription for attendance updates
    const subscription = realtime.subscribeToAttendance((payload) => {
      if (payload.eventType === 'INSERT') {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchEmployees() {
    try {
      const { data, error } = await supabase
        .from('employee_records')
        .select('*')
        .eq('status', 'active')
        .order('employee_name');

      if (error) throw new Error(error.message);

      setEmployees(data || []);
      if (data && data.length > 0) {
        setFormData((prev) => ({ ...prev, employee_id: data[0].id as number }));
      }
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError(null);

    try {
      // Check if attendance record already exists
      const { data: existingRecord } = await hrOperations.getEmployeeAttendance(
        String(formData.employee_id),
        formData.date.toISOString().split('T')[0],
        formData.date.toISOString().split('T')[0]
      );

      if (existingRecord && existingRecord.length > 0) {
        throw new Error('Attendance record already exists for this employee on this date');
      }

      const { error: insertError } = await hrOperations.recordAttendance(formData);

      if (insertError) throw new Error(insertError.message);

      setSuccess(true);
      // Reset form except for date
      setFormData((prev) => ({
        ...prev,
        check_in_time: new Date(),
        check_out_time: undefined,
        status: 'present',
      }));
    } catch (err) {
      setError(err as Error);
      console.error('Error submitting attendance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'employee_id') {
        return { ...prev, [name]: parseInt(value, 10) };
      }
      if (name === 'date') {
        return { ...prev, [name]: new Date(value) };
      }
      if (name === 'check_in_time' || name === 'check_out_time') {
        const [hours, minutes] = value.split(':');
        const date = new Date(prev.date);
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        return { ...prev, [name]: date };
      }
      if (name === 'status') {
        return { ...prev, [name]: value as AttendanceStatus };
      }
      return { ...prev, [name]: value };
    });
    setSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold mb-4">Attendance Input</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg">
          <p className="text-red-700">{error.message}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <p className="text-green-700">Attendance recorded successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employee">
            Employee
          </label>
          <select
            id="employee_id"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.employee_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date.toISOString().split('T')[0]}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="check_in_time">
              Check-in Time
            </label>
            <input
              type="time"
              id="check_in_time"
              name="check_in_time"
              value={formData.check_in_time?.toTimeString().slice(0, 5)}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="check_out_time">
              Check-out Time
            </label>
            <input
              type="time"
              id="check_out_time"
              name="check_out_time"
              value={formData.check_out_time?.toTimeString().slice(0, 5) || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="on leave">On Leave</option>
          </select>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className={`
              bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline
              transition-colors duration-200
              ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </div>
      </form>
    </MotionDiv>
  );
}
