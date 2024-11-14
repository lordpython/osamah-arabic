export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} style={{ animationDuration: '1.5s' }} />;
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <LoadingSkeleton className="h-8 w-1/4" />
      <div className="h-64 border rounded-lg p-4">
        <div className="h-full flex items-center justify-center">
          <LoadingSkeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <LoadingSkeleton className="h-6 w-1/3" />
      <LoadingSkeleton className="h-10 w-1/2" />
      <LoadingSkeleton className="h-4 w-1/4" />
    </div>
  );
}
