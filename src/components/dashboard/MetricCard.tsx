interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
  trend: number;
  format?: 'number' | 'currency' | 'percentage';
  theme?: 'light' | 'dark';
}

export default function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  format = 'number',
  theme = 'light' 
}: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return val.toString();
    }
  };

  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`${bgColor} rounded-xl shadow-lg p-6`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {trend !== 0 && (
          <span className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className={`${subTextColor} text-sm font-medium mt-4`}>{title}</h3>
      <p className={`text-2xl font-semibold ${textColor} mt-2`}>{formatValue(value)}</p>
    </div>
  );
} 