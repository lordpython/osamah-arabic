'use client';

import { useState } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import type { Database } from '@/types/supabase';
import { motion, HTMLMotionProps } from 'framer-motion';
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/config';

type Driver = Database['public']['Tables']['drivers']['Row'];
type DriverStatus = 'active' | 'inactive' | 'suspended';

type MotionDivProps = HTMLMotionProps<"div"> & {
  className?: string;
  children: React.ReactNode;
};

const MotionDiv = motion.div as React.FC<MotionDivProps>;

export default function DriverManagement() {
  const [editingDriver, setEditingDriver] = useState<string | null>(null);
  
  const { data: drivers, loading, error, refetch } = useSupabaseQuery<Driver[]>(
    'drivers',
    async (supabase) => {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .order('full_name');
          
        if (error) throw error;
        return { data: data || [], error: null };
      } catch (err) {
        return { data: null, error: err as PostgrestError };
      }
    }
  );

  const handleStatusChange = async (driverId: string, newStatus: DriverStatus) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ status: newStatus })
        .eq('id', driverId);

      if (error) throw error;
      refetch();
    } catch (err) {
      console.error('Error updating driver status:', err);
    }
  };

  if (loading) {
    return (
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-8"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </MotionDiv>
    );
  }

  if (error) {
    return (
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-50 p-4 rounded-lg"
      >
        <p className="text-red-700">Error loading drivers: {error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-2 text-sm text-red-600 hover:text-red-500"
        >
          Try again
        </button>
      </MotionDiv>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
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

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Driver Management</h3>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Add Driver
            </button>
          </div>
        </div>
        <div className="mt-4">
          {drivers && drivers.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadgeClass(driver.status)}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(driver.id, driver.status === 'active' ? 'inactive' : 'active')}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {driver.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setEditingDriver(driver.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center py-4">No drivers found</p>
          )}
        </div>
      </div>
    </div>
  );
} 