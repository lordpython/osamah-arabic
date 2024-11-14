'use client';

import { PostgrestError, RealtimeChannel } from '@supabase/supabase-js';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase/config';
import type { Driver, DriverDailyPerformance } from '@/types/database';

// Cache interfaces
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
}

interface DriverPerformanceCacheData {
  [key: string]: {
    value: DriverDailyPerformance[];
    timestamp: number;
    expiresAt: number;
  };
}

interface Cache {
  [key: string]: CacheEntry<any> | undefined;
  drivers?: CacheEntry<Driver[]>;
  driverPerformance?: CacheEntry<DriverPerformanceCacheData>;
}

interface BatchOperation {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  condition?: Record<string, any>;
}

interface CacheInvalidationRules {
  [key: string]: {
    dependencies: string[];
    invalidateOn: ('INSERT' | 'UPDATE' | 'DELETE')[];
  };
}

const CACHE_INVALIDATION_RULES: CacheInvalidationRules = {
  drivers: {
    dependencies: ['driver_attendance', 'driver_daily_performance'],
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
  },
  driver_daily_performance: {
    dependencies: [],
    invalidateOn: ['INSERT', 'UPDATE'],
  },
};

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  error: PostgrestError | null;
  setError: (error: PostgrestError | null) => void;
  clearError: () => void;
  drivers: Driver[];
  fetchDrivers: (forceFetch?: boolean) => Promise<void>;
  updateDriverStatus: (driverId: string, status: 'active' | 'inactive' | 'suspended') => Promise<void>;
  driverPerformance: DriverDailyPerformance[];
  fetchDriverPerformance: (driverId: string, startDate: string, endDate: string, forceFetch?: boolean) => Promise<void>;
  refreshData: () => Promise<void>;
  subscribeToDriverUpdates: () => void;
  unsubscribeFromDriverUpdates: () => void;
  clearCache: () => void;
  setCacheConfig: (config: Partial<CacheConfig>) => void;
  executeBatch: (operations: BatchOperation[]) => Promise<void>;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverPerformance, setDriverPerformance] = useState<DriverDailyPerformance[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [cacheConfig, setCacheConfig] = useState<CacheConfig>(DEFAULT_CACHE_CONFIG);
  const cache = useRef<Cache>({});

  const clearError = useCallback(() => setError(null), []);

  const clearCache = useCallback(() => {
    cache.current = {};
  }, []);

  const invalidateCache = useCallback((table: string, event: 'INSERT' | 'UPDATE' | 'DELETE') => {
    // Invalidate the main table cache
    if (cache.current[table]) {
      cache.current[table].expiresAt = 0;
    }

    // Check dependencies and invalidate them
    const rules = CACHE_INVALIDATION_RULES[table];
    if (rules && rules.invalidateOn.includes(event)) {
      rules.dependencies.forEach((depTable) => {
        if (cache.current[depTable]) {
          cache.current[depTable].expiresAt = 0;
        }
      });
    }
  }, []);

  const isCacheValid = useCallback(<T,>(entry?: CacheEntry<T>): entry is CacheEntry<T> => {
    if (!entry) return false;
    return Date.now() < entry.expiresAt;
  }, []);

  const fetchDrivers = useCallback(
    async (forceFetch = false) => {
      try {
        if (!forceFetch && isCacheValid(cache.current.drivers)) {
          setDrivers(cache.current.drivers.data);
          return;
        }

        setLoading(true);
        const { data, error } = await supabase.from('drivers').select('*').order('full_name');

        if (error) throw error;

        const newData = data || [];
        cache.current.drivers = {
          data: newData,
          timestamp: Date.now(),
          expiresAt: Date.now() + cacheConfig.ttl,
        };
        setDrivers(newData);
      } catch (err) {
        setError(err as PostgrestError);
        console.error('Error fetching drivers:', err);
      } finally {
        setLoading(false);
      }
    },
    [cacheConfig.ttl, isCacheValid]
  );

  const updateDriverStatus = useCallback(
    async (driverId: string, status: 'active' | 'inactive' | 'suspended') => {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('drivers')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', driverId);

        if (error) throw error;
        await fetchDrivers();
      } catch (err) {
        setError(err as PostgrestError);
        console.error('Error updating driver status:', err);
      } finally {
        setLoading(false);
      }
    },
    [fetchDrivers]
  );

  const fetchDriverPerformance = useCallback(
    async (driverId: string, startDate: string, endDate: string, forceFetch = false) => {
      try {
        const cacheKey = `${driverId}-${startDate}-${endDate}`;

        if (!cache.current.driverPerformance) {
          cache.current.driverPerformance = {
            data: {},
            timestamp: Date.now(),
            expiresAt: Date.now() + cacheConfig.ttl,
          };
        }

        const performanceData = cache.current.driverPerformance.data[cacheKey];

        if (!forceFetch && performanceData && Date.now() < performanceData.expiresAt) {
          setDriverPerformance(performanceData.value);
          return;
        }

        setLoading(true);
        const { data, error } = await supabase
          .from('driver_daily_performance')
          .select('*')
          .eq('driver_id', driverId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date');

        if (error) throw error;

        const newData = data || [];
        cache.current.driverPerformance.data[cacheKey] = {
          value: newData,
          timestamp: Date.now(),
          expiresAt: Date.now() + cacheConfig.ttl,
        };
        setDriverPerformance(newData);
      } catch (err) {
        setError(err as PostgrestError);
        console.error('Error fetching driver performance:', err);
      } finally {
        setLoading(false);
      }
    },
    [cacheConfig.ttl]
  );

  const refreshData = useCallback(async () => {
    await fetchDrivers();
  }, [fetchDrivers]);

  const subscribeToDriverUpdates = useCallback(() => {
    const newChannel = supabase
      .channel('driver_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, (payload) => {
        invalidateCache('drivers', payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE');

        if (payload.eventType === 'INSERT') {
          setDrivers((current) => [...current, payload.new as Driver]);
        } else if (payload.eventType === 'DELETE') {
          setDrivers((current) => current.filter((driver) => driver.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setDrivers((current) =>
            current.map((driver) => (driver.id === payload.new.id ? (payload.new as Driver) : driver))
          );
        }
      })
      .subscribe();
    setChannel(newChannel);
  }, [invalidateCache]);

  const unsubscribeFromDriverUpdates = useCallback(() => {
    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
    }
  }, [channel]);

  useEffect(() => {
    return () => {
      unsubscribeFromDriverUpdates();
    };
  }, [unsubscribeFromDriverUpdates]);

  const executeBatch = useCallback(
    async (operations: BatchOperation[]) => {
      try {
        setLoading(true);

        for (const operation of operations) {
          const { type, table, data, condition } = operation;

          let error;

          switch (type) {
            case 'INSERT':
              ({ error } = await supabase.from(table).upsert(data));
              break;

            case 'UPDATE':
              if (!condition) throw new Error('Condition required for UPDATE operation');
              ({ error } = await supabase.from(table).update(data).match(condition));
              break;

            case 'DELETE':
              if (!condition) throw new Error('Condition required for DELETE operation');
              ({ error } = await supabase.from(table).delete().match(condition));
              break;
          }

          if (error) throw error;
          invalidateCache(table, type);
        }

        await refreshData();
      } catch (err) {
        setError(err as PostgrestError);
        console.error('Error executing batch operations:', err);
      } finally {
        setLoading(false);
      }
    },
    [invalidateCache, refreshData]
  );

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    error,
    setError,
    clearError,
    drivers,
    fetchDrivers,
    updateDriverStatus,
    driverPerformance,
    fetchDriverPerformance,
    refreshData,
    subscribeToDriverUpdates,
    unsubscribeFromDriverUpdates,
    clearCache,
    setCacheConfig,
    executeBatch,
  } as AppContextType;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
