'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/config'; // Corrected import path

export default function TestPage() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResults, setTestResults] = useState<
    Array<{ operation: string; status: 'success' | 'error'; message: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  async function testConnection() {
    try {
      setLoading(true);
      setConnectionStatus('testing');
      setTestResults([]); // Clear previous results

      // Test 1: Basic Connection
      const { data, error } = await supabase.from('drivers').select('count').single();

      if (error) {
        setConnectionStatus('error');
        const errorMessage = `Database Connection Error: ${error.message}${error.details ? ` - ${error.details}` : ''}`;
        addTestResult('Database Connection', 'error', errorMessage);
        console.error('Connection test failed:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return;
      }

      addTestResult('Database Connection', 'success', 'Successfully connected to Supabase');

      // Test 2: Insert Operation
      const testDriver = {
        full_name: 'Test Driver',
        phone: '+1234567890',
        email: 'test@example.com',
        status: 'active' as const,
        joining_date: new Date().toISOString(),
        vehicle_type: 'sedan',
      };

      const { error: insertError } = await supabase.from('drivers').insert([testDriver]).select().single();

      if (insertError) {
        const errorMessage = `Insert Operation Error: ${insertError.message}${insertError.details ? ` - ${insertError.details}` : ''}`;
        addTestResult('Insert Operation', 'error', errorMessage);
        console.error('Insert test failed:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        });
        return;
      }

      addTestResult('Insert Operation', 'success', 'Successfully inserted test data');
      setConnectionStatus('success');
    } catch (error: any) {
      setConnectionStatus('error');
      const errorMessage = error?.message || 'An unknown error occurred';
      console.error('Test failed:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
      });
      addTestResult('Database Operation', 'error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function addTestResult(operation: string, status: 'success' | 'error', message: string) {
    setTestResults((prev) => [...prev, { operation, status, message }]);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Testing database connection and operations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>

      <div
        className={`p-4 mb-6 rounded-lg ${
          connectionStatus === 'success'
            ? 'bg-green-50 text-green-700'
            : connectionStatus === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-yellow-50 text-yellow-700'
        }`}
      >
        <p className="font-medium">
          Connection Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
        </p>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div key={index} className={`p-4 rounded-lg ${result.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
            <h3 className={`font-medium ${result.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {result.operation}
            </h3>
            <p className={`mt-1 text-sm ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {result.message}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setTestResults([]);
          setConnectionStatus('testing');
          setLoading(true);
          testConnection();
        }}
        className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        Run Tests Again
      </button>
    </div>
  );
}
