export interface Driver {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  joining_date: string;
  vehicle_type: string;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  driver_id: string;
  order_id: string;
  restaurant_name: string;
  pickup_location: string;
  delivery_location: string;
  status: 'assigned' | 'picked' | 'delivered' | 'cancelled';
  assigned_at: string;
  picked_at?: string;
  delivered_at?: string;
  created_at: string;
}

export interface FinancialTransaction {
  id: string;
  transaction_type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeRecord {
  id: string;
  employee_id: string;
  full_name: string;
  department: string;
  position: string;
  salary: number;
  joining_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetric {
  id: string;
  driver_id: string;
  date: string;
  deliveries_completed: number;
  on_time_delivery_rate: number;
  customer_rating: number;
  created_at: string;
}

export interface Attendance {
  attendance_id: number;
  employee_id: string;
  date: string;
  check_in: string;
  check_out: string;
  status: string;
}

export interface Debt {
  debt_id: number;
  amount: number;
  description: string;
  date: string;
  status: string;
}

export interface DriverDailyPerformance {
  daily_performance_id: number;
  driver_id: string;
  date: string;
  total_orders: number;
  orders_target: number;
  target_achievement_rate: number;
  completed_orders: number;
  cancelled_orders: number;
  total_distance: number;
  total_earnings: number;
  rating_average: number;
  created_at: string;
  updated_at: string;
}

export interface DriverPerformance {
  performance_id: number;
  driver_id: string;
  rating: number;
  comments: string;
  date: string;
}

export interface Expense {
  expense_id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface FuelConsumption {
  fuel_id: number;
  driver_id: string;
  amount: number;
  date: string;
  vehicle_id: string;
}

export interface MonthlyStatement {
  statement_id: number;
  month: string;
  year: number;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
}

export interface Order {
  order_id: number;
  driver_id: string;
  status: string;
  pickup_location: string;
  delivery_location: string;
  created_at: string;
  completed_at: string;
}

export interface ProfitAndLoss {
  pl_id: number;
  period: string;
  revenue: number;
  expenses: number;
  net_profit: number;
}

export interface DailyOrderMetrics {
  id: number;
  date: string;
  total_orders: number;
  orders_target: number;
  achieved_percentage: number;
}

export interface MonthlyOrderMetrics {
  id: number;
  month: number;
  year: number;
  total_orders: number;
  orders_target: number;
  achieved_percentage: number;
}

export interface DriverMonthlyStatement {
  id: number;
  driver_id: string;
  driver_name: string;
  month: number;
  year: number;
  total_days: number;
  total_hours: number;
  daily_records: {
    day: number;
    hours_worked: number;
    status: string;
  }[];
}

export interface MetricCalculations {
  calculateGrowth: (data: any[]) => number;
  calculateCompletedOrders: (data: any[]) => number;
  calculateAverageRating: (data: any[]) => number;
}

export interface DriverAttendanceStatement {
  id: number;
  driver_id: string;
  driver_name: string;
  month: number;
  year: number;
  daily_records: DailyAttendanceRecord[];
  total_days_present: number;
  total_hours: number;
  created_at: string;
  updated_at: string;
}

export interface DailyAttendanceRecord {
  day: number;
  hours: number;
  status: 'present' | 'absent' | 'leave' | 'holiday';
  notes?: string;
}

export interface AccountingEntry {
  entry_id: number;
  date: string;
  type: 'income' | 'expense' | 'debt' | 'payment';
  amount: number;
  category: string;
  description: string;
  driver_id?: string;
  payment_method: 'cash' | 'bank' | 'other';
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface AccountingCategory {
  category_id: number;
  name: string;
  type: 'income' | 'expense';
  description?: string;
}

export interface DailyEntry {
  entry_id: number;
  statement_id: number;
  day: number;
  hours_worked: number;
  status: 'present' | 'absent' | 'leave' | 'holiday';
  notes: string;
} 