'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { accountingOperations } from '@/lib/supabase/config';
import type { AccountingEntryForm, PaymentMethod, PaymentCategory } from '@/types/database';

const paymentMethods: PaymentMethod[] = ['cash', 'bank', 'other'];
const categories: PaymentCategory[] = [
  'Salary',
  'Fuel',
  'Maintenance',
  'Insurance',
  'Office Supplies',
  'Utilities',
  'Rent',
  'Other'
];

const initialFormData: AccountingEntryForm = {
  date: new Date().toISOString().split('T')[0],
  type: 'payment',
  amount: 0,
  category: categories[0],
  description: '',
  payment_method: 'bank',
  status: 'pending'
};

export default function PaymentForm() {
  const [formData, setFormData] = useState<AccountingEntryForm>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AccountingEntryForm, string>>>({});

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AccountingEntryForm, string>> = {};

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: insertError } = await accountingOperations.addEntry(formData);

      if (insertError) throw new Error(insertError.message);

      setSuccess(true);
      setFormData(initialFormData);
      setFormErrors({});

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the payment');
      console.error('Error submitting payment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: AccountingEntryForm) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
    
    // Clear validation error for the field being changed
    if (formErrors[name as keyof AccountingEntryForm]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">New Payment</h2>
        {loading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
          <p className="text-green-700">Payment submitted successfully!</p>
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount*
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="amount"
                id="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`block w-full rounded-md border ${
                  formErrors.amount ? 'border-red-300' : 'border-gray-300'
                } pl-7 pr-12 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                placeholder="0.00"
                required
                min="0"
                step="0.01"
              />
            </div>
            {formErrors.amount && (
              <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date*
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={formData.date}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                formErrors.date ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
              required
            />
            {formErrors.date && (
              <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category*
            </label>
            <select
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
              Payment Method*
            </label>
            <select
              name="payment_method"
              id="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              required
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description*
          </label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`mt-1 block w-full rounded-md border ${
              formErrors.description ? 'border-red-300' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
            required
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setFormData(initialFormData);
              setFormErrors({});
              setError(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Payment'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
