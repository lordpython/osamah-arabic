declare module 'recharts' {
  import { ComponentType, ReactNode } from 'react';

  export interface LineChartProps {
    data?: any[];
    width?: number;
    height?: number;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    children?: ReactNode;
  }

  export interface BarChartProps extends LineChartProps {
    barGap?: number;
    barCategoryGap?: number;
    maxBarSize?: number;
  }

  export interface BarProps {
    dataKey: string;
    fill?: string;
    name?: string;
    radius?: number | [number, number, number, number];
    minPointSize?: number;
    background?: boolean;
    stackId?: string;
  }

  export interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    children?: ReactNode;
  }

  export interface CartesianGridProps {
    strokeDasharray?: string;
  }

  export interface XAxisProps {
    dataKey?: string;
    tickFormatter?: (value: any) => string;
  }

  export interface YAxisProps {
    dataKey?: string;
  }

  export interface TooltipProps {
    labelFormatter?: (label: any) => string;
  }

  export interface LineProps {
    type?: 'monotone' | 'linear';
    dataKey: string;
    stroke?: string;
    name?: string;
    strokeDasharray?: string;
  }

  export interface LegendProps {
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
  }

  export const LineChart: ComponentType<LineChartProps>;
  export const BarChart: ComponentType<BarChartProps>;
  export const ResponsiveContainer: ComponentType<ResponsiveContainerProps>;
  export const CartesianGrid: ComponentType<CartesianGridProps>;
  export const XAxis: ComponentType<XAxisProps>;
  export const YAxis: ComponentType<YAxisProps>;
  export const Tooltip: ComponentType<TooltipProps>;
  export const Line: ComponentType<LineProps>;
  export const Bar: ComponentType<BarProps>;
  export const Legend: ComponentType<LegendProps>;
} 