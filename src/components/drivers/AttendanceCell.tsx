'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/config';

interface AttendanceCellProps {
  driverId: string;
  date: string;
  initialValue?: number;
  onUpdate: (hours: number) => void;
}

export default function AttendanceCell({ 
  driverId, 
  date, 
  initialValue = 0,
  onUpdate 
}: AttendanceCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [hours, setHours] = useState(initialValue);

  async function handleUpdate(newValue: number) {
    try {
      const { error } = await supabase
        .from('driver_attendance')
        .upsert({
          driver_id: driverId,
          date: date,
          hours_worked: newValue,
          status: newValue > 0 ? 'present' : 'absent',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      onUpdate(newValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  }

  if (isEditing) {
    return (
      <input
        type="number"
        min="0"
        max="24"
        value={hours}
        onChange={(e) => setHours(Number(e.target.value))}
        onBlur={() => handleUpdate(hours)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleUpdate(hours);
          if (e.key === 'Escape') setIsEditing(false);
        }}
        className="w-12 text-center border rounded-md"
        autoFocus
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer ${getStatusColor(hours)}`}
    >
      {hours || '-'}
    </div>
  );
}

function getStatusColor(hours: number): string {
  if (hours === 0) return 'text-red-600';
  if (hours < 8) return 'text-yellow-600';
  return 'text-green-600';
} 