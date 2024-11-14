// PostgreSQL ENUM Types
export type EmploymentStatus = 'active' | 'terminated' | 'on leave';
export type ShiftType = 'day' | 'night' | 'other';
export type ReimbursementStatus = 'reimbursed' | 'pending'; 
export type DeductionFrequency = 'weekly' | 'monthly' | 'other';
export type AttendanceStatus = 'present' | 'absent' | 'on leave';
export type DeductionType = 'loan' | 'fine' | 'advance' | 'other';
export type BonusType = 'performance' | 'holiday' | 'other';
export type CompletionStatus = 'completed' | 'in progress' | 'not started';
export type PaymentMethod = 'cash' | 'bank' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'cancelled';
export type PaymentCategory =
  | 'Salary'
  | 'Fuel'
  | 'Maintenance'
  | 'Insurance'
  | 'Office Supplies'
  | 'Utilities'
  | 'Rent'
  | 'Other';

// Form-specific types
export interface AccountingEntryForm {
  date: string;
  type: 'payment' | 'receipt';
  amount: number;
  category: PaymentCategory;
  description: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
}

// Database types
export interface AccountingEntry extends Omit<AccountingEntryForm, 'date'> {
  entry_id: number;
  date: Date;
  created_at: Date;
  updated_at: Date;
}

// Legacy types for backward compatibility
export interface Driver {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended' | 'on_leave';
  vehicle_type: string;
  joining_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface DriverDailyPerformance extends DailyRecord {
  rating_average?: number;
  total_orders: number;
}

export interface DailyEntry {
  entry_id: number;
  statement_id: number;
  day: number;
  hours_worked: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface DriverMonthlyStatement {
  id: number;
  driver_id: string;
  month: number;
  year: number;
  total_days: number;
  total_hours: number;
  daily_entries: DailyEntry[];
  created_at: Date;
  updated_at: Date;
}

export interface EmployeeRecord {
  id: string | number;
  employee_name: string;
  date: string | Date;
  check_in?: string | Date;
  check_out?: string | Date;
  status?: AttendanceStatus;
}

// Database Tables
export interface Employee {
  id: number;
  employee_name: string;
  work_type?: string;
  payment_method?: string;
  bank_account_number: string;
  phone_number?: string;
  email?: string;
  address?: string;
  fuel_card_number?: string;
  zone_location?: string;
  car_plate_number?: string;
  employment_start_date?: Date;
  employment_status: EmploymentStatus;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  position?: string;
  supervisor_id?: number;
  termination_date?: Date;
  notes?: string;
}

export interface DailyRecord {
  orders_id: number;
  employee_id: number;
  date: Date;
  task_description?: string;
  shift: ShiftType;
  location?: string;
  order_count: number;
}

export interface TotalOrder {
  order_id: number;
  employee_id: number;
  date_range_start: Date;
  date_range_end: Date;
  total_orders: number;
  entered_orders: number;
  target_difference: number;
  bonus_deduction: number;
  total_revenue: number;
  overtime_orders: number;
  average_order_time?: number;
  comments?: string;
}

export interface Expense {
  expense_id: number;
  employee_id: number;
  salary: number;
  additional_expenses: number;
  fines: number;
  outstanding_balance: number;
  comments?: string;
  expense_date: Date;
  expense_type?: string;
  reimbursement_status: ReimbursementStatus;
  approved_by?: number;
}

export interface Fuel {
  fuel_id: number;
  employee_id: number;
  fuel_card_balance: number;
  cash_paid: number;
  consumption?: number;
  total_fuel_cost: number;
  fuel_type?: string;
  fuel_station_location?: string;
  mileage?: number;
  date: Date;
}

export interface ProfitLossStatement {
  statement_id: number;
  statement_period?: string;
  date_range_start: Date;
  date_range_end: Date;
  revenue: number;
  expenses: number;
  taxes: number;
  operating_expenses: number;
  gross_profit: number; // Generated column
  net_profit: number; // Generated column
}

export interface NetEarning {
  earning_id: number;
  employee_id: number;
  total_earnings: number;
  bonus: number;
  deductions: number;
  net_income: number; // Generated column
  earning_period?: string;
}

export interface Liability {
  liability_id: number;
  employee_id: number;
  liability_type?: string;
  maintenance_cost: number;
  total_liability: number;
  deduction_frequency: DeductionFrequency;
  last_deduction_date?: Date;
  next_deduction_date?: Date;
  remaining_liability: number;
  comments?: string;
  liability_start_date: Date;
}

export interface MonthlyStatement {
  statement_id: number;
  employee_id: number;
  salary: number;
  additional_expenses: number;
  violations: number;
  net_income_with_bonus: number;
  total_working_days: number;
  absences: number;
  overtime_hours: number;
  holiday_pay: number;
  statement_date: Date;
}

export interface OrderDetail {
  order_detail_id: number;
  orders_id: number;
  order_time?: Date;
  order_description?: string;
  order_location?: string;
}

export interface Deduction {
  deduction_id: number;
  employee_id: number;
  deduction_type: DeductionType;
  amount: number;
  deduction_date: Date;
}

export interface Attendance {
  attendance_id: number;
  employee_id: number;
  date: Date;
  status: AttendanceStatus;
  check_in_time?: Date;
  check_out_time?: Date;
}

export interface AttendanceInput extends Omit<Attendance, 'attendance_id'> {
  check_in?: string | Date;
  check_out?: string | Date;
}

export interface Bonus {
  bonus_id: number;
  employee_id: number;
  bonus_amount: number;
  bonus_type: BonusType;
  bonus_date: Date;
  comments?: string;
}

export interface PerformanceEvaluation {
  evaluation_id: number;
  employee_id: number;
  evaluation_date: Date;
  rating?: number;
  comments?: string;
  next_evaluation_date?: Date;
}

export interface Project {
  project_id: number;
  project_name: string;
  project_description?: string;
  start_date?: Date;
  end_date?: Date;
}

export interface EmployeeProject {
  employee_id: number;
  project_id: number;
  role?: string;
}

export interface TrainingSession {
  training_id: number;
  training_name: string;
  training_description?: string;
  training_date?: Date;
  duration_hours?: number;
}

export interface EmployeeTraining {
  employee_id: number;
  training_id: number;
  completion_status: CompletionStatus;
  score?: number;
}

// Utility types for relationships
export interface EmployeeWithRelations extends Employee {
  supervisor?: Employee;
  subordinates?: Employee[];
  daily_records?: DailyRecord[];
  expenses?: Expense[];
  fuel_records?: Fuel[];
  net_earnings?: NetEarning[];
  liabilities?: Liability[];
  monthly_statements?: MonthlyStatement[];
  deductions?: Deduction[];
  attendance_records?: Attendance[];
  bonuses?: Bonus[];
  performance_evaluations?: PerformanceEvaluation[];
  projects?: (EmployeeProject & { project: Project })[];
  training_sessions?: (EmployeeTraining & { session: TrainingSession })[];
}

export interface ProjectWithEmployees extends Project {
  employees?: (EmployeeProject & { employee: Employee })[];
}

export interface TrainingSessionWithEmployees extends TrainingSession {
  employees?: (EmployeeTraining & { employee: Employee })[];
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
  year: number;
  month: string;
  total_orders: number;
  orders_target: number;
  achieved_percentage: number;
}

export interface DriverAttendanceStatement {
  id: number;
  driver_id: string;
  date: Date;
  check_in?: Date;
  check_out?: Date;
  status: AttendanceStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}
