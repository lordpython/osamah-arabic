'use client';

import { PostgrestError } from '@supabase/supabase-js';
import { HTMLMotionProps, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/config';

import type { Driver } from '@/types/database';

type DriverStatus = 'active' | 'inactive' | 'suspended';

type MotionDivProps = HTMLMotionProps<'div'> & {
  className?: string;
  children: React.ReactNode;
};

type DriverFormData = Omit<Driver, 'id' | 'created_at' | 'updated_at'>;

const MotionDiv = motion.div as React.FC<MotionDivProps>;

const ITEMS_PER_PAGE = 10;
const vehicleTypes = ['Truck', 'Van', 'Car', 'Motorcycle'];

const initialFormData: DriverFormData = {
  full_name: '',
  phone: '',
  email: '',
  status: 'active',
  vehicle_type: vehicleTypes[0],
  joining_date: new Date().toISOString().split('T')[0],
};

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<DriverFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof DriverFormData, string>>>({});

  useEffect(() => {
    fetchDrivers();

    // Set up real-time subscription for driver updates
    const subscription = supabase
      .channel('driver_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDrivers((current) => [payload.new as Driver, ...current]);
        } else if (payload.eventType === 'DELETE') {
          setDrivers((current) => current.filter((driver) => driver.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setDrivers((current) =>
            current.map((driver) => (driver.id === payload.new.id ? (payload.new as Driver) : driver))
          );
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchDrivers() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('drivers').select('*').order('full_name');

      if (error) throw error;
      setDrivers(data || []);
      setError(null);
    } catch (err) {
      setError(err as PostgrestError);
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  }

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof DriverFormData, string>> = {};

    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('drivers').insert([
        {
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      setShowForm(false);
      setFormData(initialFormData);
      setFormErrors({});
    } catch (err) {
      console.error('Error adding driver:', err);
      setError(err as PostgrestError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (driverId: string, newStatus: DriverStatus) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating driver status:', err);
      setError(err as PostgrestError);
    }
  };

  const handleBulkStatusChange = async (newStatus: DriverStatus) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .in('id', selectedDrivers);

      if (error) throw error;
      setSelectedDrivers([]);
    } catch (err) {
      console.error('Error updating driver statuses:', err);
      setError(err as PostgrestError);
    }
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDrivers.length / ITEMS_PER_PAGE);
  const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getStatusBadgeClass = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'suspended':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </MotionDiv>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Driver Management</h3>
            <p className="mt-1 text-sm text-gray-500">Manage your drivers, their status, and information.</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:flex-none">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showForm ? 'Cancel' : 'Add Driver'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-red-700">{error.message}</p>
          </div>
        )}

        {showForm && (
          <MotionDiv
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gray-50 p-6 rounded-lg"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      formErrors.full_name ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.full_name && <p className="mt-1 text-sm text-red-600">{formErrors.full_name}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone*
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      formErrors.phone ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      formErrors.email ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                </div>

                <div>
                  <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700">
                    Vehicle Type*
                  </label>
                  <select
                    id="vehicle_type"
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    {vehicleTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="joining_date" className="block text-sm font-medium text-gray-700">
                    Join Date*
                  </label>
                  <input
                    type="date"
                    name="joining_date"
                    id="joining_date"
                    value={formData.joining_date}
                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(initialFormData);
                    setFormErrors({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {submitting ? 'Adding...' : 'Add Driver'}
                </button>
              </div>
            </form>
          </MotionDiv>
        )}

        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="max-w-xs">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <input
                  type="search"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Search drivers..."
                />
              </div>
            </div>
            {selectedDrivers.length > 0 && (
              <div className="mt-3 sm:mt-0 sm:ml-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">{selectedDrivers.length} selected</span>
                  <button
                    onClick={() => handleBulkStatusChange('active')}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('inactive')}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('suspended')}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    Suspend
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                          <input
                            type="checkbox"
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
                            checked={selectedDrivers.length === paginatedDrivers.length}
                            onChange={(e) => {
                              setSelectedDrivers(e.target.checked ? paginatedDrivers.map((d) => d.id) : []);
                            }}
                          />
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Vehicle</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {paginatedDrivers.map((driver) => (
                        <tr key={driver.id}>
                          <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                            <input
                              type="checkbox"
                              className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
                              checked={selectedDrivers.includes(driver.id)}
                              onChange={(e) => {
                                setSelectedDrivers(
                                  e.target.checked
                                    ? [...selectedDrivers, driver.id]
                                    : selectedDrivers.filter((id) => id !== driver.id)
                                );
                              }}
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{driver.full_name}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{driver.email}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{driver.vehicle_type}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={getStatusBadgeClass(driver.status)}>{driver.status}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <button
                              onClick={() =>
                                handleStatusChange(driver.id, driver.status === 'active' ? 'inactive' : 'active')
                              }
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              {driver.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(driver.id, driver.status === 'suspended' ? 'active' : 'suspended')
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              {driver.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredDrivers.length)}</span>{' '}
                  of <span className="font-medium">{filteredDrivers.length}</span> drivers
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
