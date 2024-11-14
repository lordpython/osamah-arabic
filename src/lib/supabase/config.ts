import { createClient } from '@supabase/supabase-js';

import type { AccountingEntry, Attendance, EmployeeRecord } from '@/types/database';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        Role: 'authenticated',
      },
    },
  }
);

// HR Operations
export const hrOperations = {
  // Employee Management
  async addEmployee(employee: Omit<EmployeeRecord, 'id' | 'created_at' | 'updated_at'>) {
    return await supabase.from('employee_records').insert([employee]).select();
  },

  async updateEmployee(id: string, updates: Partial<EmployeeRecord>) {
    return await supabase.from('employee_records').update(updates).eq('id', id).select();
  },

  // Attendance Management
  async recordAttendance(attendance: Omit<Attendance, 'attendance_id'>) {
    return await supabase.from('attendance').insert([attendance]).select();
  },

  async getEmployeeAttendance(employeeId: string, startDate: string, endDate: string) {
    return await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
  },
};

// Accounting Operations
export const accountingOperations = {
  // Financial Entries
  async addEntry(entry: Omit<AccountingEntry, 'entry_id' | 'created_at' | 'updated_at'>) {
    return await supabase.from('accounting_entries').insert([entry]).select();
  },

  async updateEntry(entryId: number, updates: Partial<AccountingEntry>) {
    return await supabase.from('accounting_entries').update(updates).eq('entry_id', entryId).select();
  },

  async getEntriesByDateRange(startDate: string, endDate: string) {
    return await supabase
      .from('accounting_entries')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
  },

  async getDailyProfitLoss(date: string) {
    return await supabase.from('accounting_entries').select('type, amount').eq('date', date);
  },
};

// Dashboard Charts Data
export const dashboardCharts = {
  // Driver Performance Chart
  async getDriverPerformanceData(startDate: string, endDate: string) {
    return await supabase
      .from('driver_daily_performance')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
  },

  // Daily Order Metrics
  async getDailyOrderMetrics(days: number) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return await supabase
      .from('daily_order_metrics')
      .select('*')
      .gte('date', date.toISOString())
      .order('date', { ascending: true });
  },

  // Monthly Order Metrics
  async getMonthlyOrderMetrics(year: number) {
    return await supabase
      .from('monthly_order_metrics')
      .select('*')
      .eq('year', year)
      .order('month', { ascending: true });
  },

  // Profit and Loss Chart
  async getProfitLossData(months: number) {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return await supabase
      .from('profit_and_loss')
      .select('*')
      .gte('period', date.toISOString())
      .order('period', { ascending: true });
  },

  // Attendance Overview Chart
  async getAttendanceOverview(startDate: string, endDate: string) {
    return await supabase
      .from('attendance')
      .select('date, status, count')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
  },
};

// Real-time Subscriptions
export const realtime = {
  // Subscribe to new accounting entries
  subscribeToAccountingEntries(callback: (payload: any) => void) {
    return supabase
      .channel('accounting_entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounting_entries' }, callback)
      .subscribe();
  },

  // Subscribe to attendance changes
  subscribeToAttendance(callback: (payload: any) => void) {
    return supabase
      .channel('attendance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, callback)
      .subscribe();
  },
};
