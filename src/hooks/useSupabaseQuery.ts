'use client';

import { useState, useEffect } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/config';

export function useSupabaseQuery<T>(
  tableName: string,
  queryFn: (supabaseClient: typeof supabase) => Promise<{ data: T | null; error: PostgrestError | null }>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      const { data, error } = await queryFn(supabase);
      
      if (error) {
        setError(error);
        console.error(`Error fetching data from ${tableName}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return;
      }

      setData(data);
      setError(null);
    } catch (err) {
      const pgError = err as PostgrestError;
      setError(pgError);
      console.error(`Error fetching data from ${tableName}:`, {
        message: pgError.message,
        details: pgError.details,
        hint: pgError.hint,
        code: pgError.code
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
