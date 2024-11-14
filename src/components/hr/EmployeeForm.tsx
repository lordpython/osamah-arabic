'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

import { hrOperations, supabase } from '@/lib/supabase/config';
import type { AttendanceStatus, EmployeeRecord } from '@/types/database';

const MotionDiv = motion.div;

type FormData = {
  employee_name: string;
  date: string;
  status: AttendanceStatus;
  check_in?: string;
  check_out?: string;
};

const attendanceStatuses: AttendanceStatus[] = ['present', 'absent', 'on leave'];

const initialFormData: FormData = {
  employee_name: '',
  date: new Date().toISOString().split('T')[0],
  status: 'present',
  check_in: undefined,
  check_out: undefined,
};

export default function EmployeeForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.employee_name.trim()) {
      errors.employee_name = 'Employee name is required';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data: existingEmployee } = await supabase
        .from('employee_records')
        .select('employee_name')
        .eq('employee_name', formData.employee_name)
        .eq('date', formData.date)
        .single();

      if (existingEmployee) {
        throw new Error('Employee record already exists for this date');
      }

      // Convert form data to EmployeeRecord format
      const employeeRecord: Omit<EmployeeRecord, 'id' | 'created_at' | 'updated_at'> = {
        employee_name: formData.employee_name,
        date: formData.date,
        status: formData.status,
        check_in: formData.check_in || undefined,
        check_out: formData.check_out || undefined,
      };

      const { error: insertError } = await hrOperations.addEmployee(employeeRecord);

      if (insertError) throw new Error(insertError.message);

      setSuccess(true);
      setFormData(initialFormData);
      setValidationErrors({});

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the employee');
      console.error('Error adding employee:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
    setSuccess(false);

    // Clear validation error for the field being changed
    if (validationErrors[name as keyof FormData]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New Employee</h2>
            {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>}
          </div>

          {error && (
            <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-400 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 mb-6 bg-green-50 border-l-4 border-green-400 rounded">
              <p className="text-green-700">Employee added successfully!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div>
                <label htmlFor="employee_name" className="block text-sm font-medium text-gray-900">
                  Employee Name*
                </label>
                <input
                  type="text"
                  id="employee_name"
                  name="employee_name"
                  value={formData.employee_name}
                  onChange={handleChange}
                  className={`mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ${
                    validationErrors.employee_name ? 'ring-red-300' : 'ring-gray-300'
                  } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm`}
                  required
                />
                {validationErrors.employee_name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.employee_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-900">
                  Date*
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ${
                    validationErrors.date ? 'ring-red-300' : 'ring-gray-300'
                  } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm`}
                  required
                />
                {validationErrors.date && <p className="mt-1 text-sm text-red-600">{validationErrors.date}</p>}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-900">
                  Status*
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  required
                >
                  {attendanceStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="check_in" className="block text-sm font-medium text-gray-900">
                  Check In Time
                </label>
                <input
                  type="time"
                  id="check_in"
                  name="check_in"
                  value={formData.check_in || ''}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="check_out" className="block text-sm font-medium text-gray-900">
                  Check Out Time
                </label>
                <input
                  type="time"
                  id="check_out"
                  name="check_out"
                  value={formData.check_out || ''}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-x-6 pt-6 border-t border-gray-900/10">
              <button
                type="button"
                onClick={() => {
                  setFormData(initialFormData);
                  setValidationErrors({});
                  setError(null);
                  setSuccess(false);
                }}
                className="text-sm font-semibold text-gray-900 hover:text-gray-700"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Adding...' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MotionDiv>
  );
}
