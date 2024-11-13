'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/config';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

interface UseSupabaseQueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useSupabaseQuery<T>(
  tableName: string,
  query: (client: SupabaseClient) => Promise<{ data: T | null; error: PostgrestError | null }>,
  deps: any[] = []
): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      setLoading(true);
      const { data, error } = await query(supabase);
      if (error) {
        setError(error);
        console.error(`Error fetching data from ${tableName}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return;
      }
      setData(data);
    } catch (error: any) {
      const pgError = error as PostgrestError;
      setError(pgError);
      console.error(`Error fetching data from ${tableName}:`, {
        message: pgError?.message || 'Unknown error',
        details: pgError?.details,
        hint: pgError?.hint,
        code: pgError?.code,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // It's a good practice to include fetchData in the dependency array
    // if it's defined inside the component
  }, deps);

  return { data, error, loading, refetch: fetchData };
} 