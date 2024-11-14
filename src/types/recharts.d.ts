import { AreaProps, BarProps, LineProps, PieProps, RadarProps, ScatterProps } from 'recharts';

// Dashboard Chart Types
export interface DashboardChartData {
  name: string;
  value: number;
  target?: number;
  percentage?: number;
}

// Performance Chart Types
export interface DriverPerformanceChartData {
  date: string;
  completedOrders: number;
  targetOrders: number;
  achievementRate: number;
}

// Financial Chart Types
export interface ProfitLossChartData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// Order Metrics Chart Types
export interface OrderMetricsChartData {
  period: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  achievementRate: number;
}

// Attendance Chart Types
export interface AttendanceChartData {
  date: string;
  present: number;
  absent: number;
  leave: number;
  total: number;
}

// Growth Chart Types
export interface GrowthChartData {
  period: string;
  growth: number;
  target: number;
  percentage: number;
}

// Custom Chart Props
export interface CustomBarChartProps extends BarProps {
  data: DashboardChartData[];
  dataKey: string;
  fill?: string;
}

export interface CustomLineChartProps extends LineProps {
  data: DashboardChartData[];
  dataKey: string;
  stroke?: string;
}

export interface CustomAreaChartProps extends AreaProps {
  data: DashboardChartData[];
  dataKey: string;
  fill?: string;
  stroke?: string;
}

export interface CustomPieChartProps extends PieProps {
  data: DashboardChartData[];
  dataKey: string;
  nameKey: string;
}

export interface CustomRadarChartProps extends RadarProps {
  data: DashboardChartData[];
  dataKey: string;
}

export interface CustomScatterChartProps extends ScatterProps {
  data: DashboardChartData[];
  dataKey: string;
}

// Chart Configuration Types
export interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'pie' | 'radar' | 'scatter';
  dataKey: string;
  name: string;
  color?: string;
  strokeWidth?: number;
  fillOpacity?: number;
}

// Dashboard Chart Layout Types
export interface DashboardChartLayout {
  id: string;
  title: string;
  type: ChartConfig['type'];
  config: ChartConfig;
  data: DashboardChartData[];
  width: number;
  height: number;
  gridArea?: string;
}

// Real-time Chart Update Types
export interface ChartUpdatePayload {
  chartId: string;
  newData: DashboardChartData[];
}

// Chart Theme Types
export interface ChartTheme {
  colors: string[];
  fontFamily: string;
  fontSize: number;
  backgroundColor: string;
  gridColor: string;
  tooltipBackground: string;
  tooltipColor: string;
}

// Chart Animation Types
export interface ChartAnimation {
  duration: number;
  easing: string;
  delay: number;
}

// Chart Legend Types
export interface ChartLegend {
  position: 'top' | 'right' | 'bottom' | 'left';
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
}

// Chart Tooltip Types
export interface ChartTooltip {
  formatter?: (value: any, name: string) => [string, string];
  labelFormatter?: (label: string) => string;
  cursor?: boolean | object;
}

// Chart Axis Types
export interface ChartAxis {
  dataKey: string;
  type?: 'number' | 'category';
  domain?: [number | string, number | string];
  tickFormatter?: (value: any) => string;
  label?: string | object;
}
// Metrics Types for Supabase
export interface DailyOrderMetrics {
  date: string;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  average_delivery_time: number;
  satisfaction_rate: number;
}

export interface OrderMetricsMonthly {
  month: string;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  revenue: number;
  growth_rate: number;
  average_order_value: number;
  average_delivery_time: number;
  satisfaction_rate: number;
}
