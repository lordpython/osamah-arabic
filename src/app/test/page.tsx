'use client';

import { useCallback, useEffect, useState } from 'react';
import { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/config';

export default function TestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const testConnection = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('test')
        .select('*')
        .limit(1)
        .throwOnError();

      if (error) throw error;
      
      setStatus('success');
      setError(null);
    } catch (err) {
      setStatus('error');
      if (err instanceof Error) {
        setError(err.message);
      } else if ((err as PostgrestError).message) {
        setError((err as PostgrestError).message);
      } else {
        setError('Failed to connect to database');
      }
    }
  }, []);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      {status === 'loading' && <p>Testing connection...</p>}
      {status === 'success' && (
        <p className="text-green-600">Connection successful!</p>
      )}
      {status === 'error' && (
        <div className="text-red-600">
          <p>Connection failed:</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
