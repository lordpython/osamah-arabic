'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase, hrOperations, realtime } from '@/lib/supabase/config';
import type { Attendance, EmployeeRecord } from '@/types/database';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'holiday';

type AttendanceInput = Omit<Attendance, 'attendance_id'>;

const MotionDiv = motion.div;

export default function AttendanceInput() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<AttendanceInput>({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in: new Date().toLocaleTimeString(),
    check_out: '',
    status: 'present'
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
        .order('full_name');

      if (error) throw new Error(error.message);

      setEmployees(data || []);
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, employee_id: data[0].employee_id }));
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
        formData.employee_id,
        formData.date,
        formData.date
      );

      if (existingRecord && existingRecord.length > 0) {
        throw new Error('Attendance record already exists for this employee on this date');
      }

      const { error: insertError } = await hrOperations.recordAttendance(formData);

      if (insertError) throw new Error(insertError.message);

      setSuccess(true);
      // Reset form except for date
      setFormData(prev => ({
        ...prev,
        check_in: new Date().toLocaleTimeString(),
        check_out: '',
        status: 'present'
      }));
    } catch (err) {
      setError(err as Error);
      console.error('Error submitting attendance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
              <option key={employee.employee_id} value={employee.employee_id}>
                {employee.full_name} - {employee.department}
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
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="check_in">
              Check-in Time
            </label>
            <input
              type="time"
              id="check_in"
              name="check_in"
              value={formData.check_in}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="check_out">
              Check-out Time
            </label>
            <input
              type="time"
              id="check_out"
              name="check_out"
              value={formData.check_out}
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
            <option value="late">Late</option>
            <option value="leave">Leave</option>
            <option value="holiday">Holiday</option>
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
