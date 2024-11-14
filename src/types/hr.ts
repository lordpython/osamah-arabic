export interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  join_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: 'annual' | 'sick' | 'unpaid' | 'other';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Payroll {
  id: string;
  employee_id: string;
  pay_period: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  payment_date: string;
  status: 'pending' | 'paid';
  created_at: string;
  updated_at: string;
}

export type NewEmployee = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
export type NewLeaveRequest = Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>;
export type NewPayroll = Omit<Payroll, 'id' | 'created_at' | 'updated_at'>;
