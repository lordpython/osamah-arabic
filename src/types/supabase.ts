export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      drivers: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          email: string;
          status: 'active' | 'inactive' | 'suspended';
          joining_date: string;
          vehicle_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone: string;
          email: string;
          status?: 'active' | 'inactive' | 'suspended';
          joining_date: string;
          vehicle_type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string;
          email?: string;
          status?: 'active' | 'inactive' | 'suspended';
          joining_date?: string;
          vehicle_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      driver_attendance: {
        Row: {
          id: string;
          driver_id: string;
          date: string;
          hours_worked: number;
          status: 'present' | 'absent' | 'leave';
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          date: string;
          hours_worked: number;
          status: 'present' | 'absent' | 'leave';
          updated_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string;
          date?: string;
          hours_worked?: number;
          status?: 'present' | 'absent' | 'leave';
          updated_at?: string;
        };
      };
      accounting_entries: {
        Row: {
          id: string;
          type: 'income' | 'expense';
          amount: number;
          date: string;
          description: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: 'income' | 'expense';
          amount: number;
          date: string;
          description: string;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: 'income' | 'expense';
          amount?: number;
          date?: string;
          description?: string;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      driver_daily_performance: {
        Row: {
          id: string;
          driver_id: string;
          date: string;
          total_orders: number;
          completed_orders: number;
          cancelled_orders: number;
          total_distance: number;
          total_earnings: number;
          rating_average: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          date: string;
          total_orders: number;
          completed_orders: number;
          cancelled_orders: number;
          total_distance: number;
          total_earnings: number;
          rating_average: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string;
          date?: string;
          total_orders?: number;
          completed_orders?: number;
          cancelled_orders?: number;
          total_distance?: number;
          total_earnings?: number;
          rating_average?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
