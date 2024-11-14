'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, hrOperations } from '@/lib/supabase/config';
import type { EmployeeRecord } from '@/types/database';

const MotionDiv = motion.div;

type EmployeeFormData = Omit<EmployeeRecord, 'id' | 'created_at' | 'updated_at'>;

const departments = [
  'HR Operations',
  'Accounting',
  'IT',
  'Finance',
  'Operations',
  'Sales',
  'Marketing',
  'Logistics'
];

const positions = [
  'Manager',
  'Team Lead',
  'Senior',
  'Junior',
  'Intern',
  'Driver',
  'Coordinator',
  'Accountant',
  'HR Specialist'
];

const initialFormData: EmployeeFormData = {
  employee_id: '',
  full_name: '',
  department: departments[0],
  position: positions[0],
  salary: 0,
  joining_date: new Date().toISOString().split('T')[0],
  status: 'active'
};

export default function EmployeeForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!formData.employee_id.trim()) {
      errors.employee_id = 'Employee ID is required';
    } else if (!/^[A-Z0-9]{4,}$/i.test(formData.employee_id)) {
      errors.employee_id = 'Employee ID must be at least 4 alphanumeric characters';
    }

    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }

    if (formData.salary < 0) {
      errors.salary = 'Salary cannot be negative';
    }

    if (!formData.joining_date) {
      errors.joining_date = 'Joining date is required';
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
        .select('employee_id')
        .eq('employee_id', formData.employee_id)
        .single();

      if (existingEmployee) {
        throw new Error('Employee ID already exists');
      }

      const { error: insertError } = await hrOperations.addEmployee(formData);

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
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
    setSuccess(false);
    
    // Clear validation error for the field being changed
    if (validationErrors[name as keyof EmployeeFormData]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
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
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            )}
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
                <label htmlFor="employee_id" className="block text-sm font-medium text-gray-900">
                  Employee ID*
                </label>
                <input
                  type="text"
                  id="employee_id"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  className={`mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ${
                    validationErrors.employee_id ? 'ring-red-300' : 'ring-gray-300'
                  } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm`}
                  required
                />
                {validationErrors.employee_id && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.employee_id}</p>
                )}
              </div>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-900">
                  Full Name*
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ${
                    validationErrors.full_name ? 'ring-red-300' : 'ring-gray-300'
                  } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm`}
                  required
                />
                {validationErrors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.full_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-900">
                  Department*
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  required
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-900">
                  Position*
                </label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  required
                >
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-900">
                  Salary*
                </label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className={`mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ${
                    validationErrors.salary ? 'ring-red-300' : 'ring-gray-300'
                  } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm`}
                  min="0"
                  step="0.01"
                  required
                />
                {validationErrors.salary && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.salary}</p>
                )}
              </div>

              <div>
                <label htmlFor="joining_date" className="block text-sm font-medium text-gray-900">
                  Joining Date*
                </label>
                <input
                  type="date"
                  id="joining_date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  className={`mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ${
                    validationErrors.joining_date ? 'ring-red-300' : 'ring-gray-300'
                  } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm`}
                  required
                />
                {validationErrors.joining_date && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.joining_date}</p>
                )}
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
