'use client';

import { memo, useEffect, useRef } from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
  trend?: number;
  format?: 'number' | 'currency';
  previousValue?: number | null;
}

const MetricCard = memo(
  ({ title, value, icon, trend = 0, format = 'number', previousValue = null }: MetricCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const hasChanged = previousValue !== null && previousValue !== value;

    useEffect(() => {
      if (hasChanged && cardRef.current) {
        cardRef.current.classList.add('scale-105', 'bg-blue-50');
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.classList.remove('scale-105', 'bg-blue-50');
          }
        }, 1000);
      }
    }, [value, hasChanged]);

    const formattedValue =
      format === 'currency'
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
        : new Intl.NumberFormat('en-US').format(value);

    return (
      <div ref={cardRef} className="bg-white rounded-lg shadow p-6 transition-all duration-300 ease-in-out transform">
        <div className="flex items-center justify-between">
          <span className="text-2xl">{icon}</span>
          {trend !== 0 && (
            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mt-4">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900 mt-2">{formattedValue}</p>
      </div>
    );
  }
);

MetricCard.displayName = 'MetricCard';

export default MetricCard;
