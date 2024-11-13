'use client';

export default function MonthlyStatementSummary({ 
  driverId, 
  month, 
  year 
}: { 
  driverId: string; 
  month: number; 
  year: number; 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Total Days Worked</h3>
        <p className="mt-2 text-xl font-semibold text-gray-900">22</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Total Hours</h3>
        <p className="mt-2 text-xl font-semibold text-gray-900">176</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
        <p className="mt-2 text-xl font-semibold text-green-600">95%</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Average Hours/Day</h3>
        <p className="mt-2 text-xl font-semibold text-gray-900">8</p>
      </div>
    </div>
  );
} 