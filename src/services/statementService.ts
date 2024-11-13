import { supabase } from '@/lib/supabase/config';
import { DriverMonthlyStatement, DailyEntry, DriverDailyPerformance } from '@/types/database';

export async function generateMonthlyStatement(
  driverId: string,
  month: number,
  year: number
): Promise<DriverMonthlyStatement | null> {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const { data: performances, error: perfError } = await supabase
      .from('driver_daily_performance')
      .select('*')
      .eq('driver_id', driverId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

    if (perfError) throw perfError;

    const dailyEntries: DailyEntry[] = performances?.map((perf: DriverDailyPerformance) => ({
      entry_id: 0,
      statement_id: 0,
      day: new Date(perf.date).getDate(),
      hours_worked: calculateHoursWorked(perf),
      status: determineStatus(perf),
      notes: generateNotes(perf)
    })) || [];

    const statement: Partial<DriverMonthlyStatement> = {
      driver_id: driverId,
      month,
      year,
      total_days: dailyEntries.length,
      total_hours: dailyEntries.reduce((sum, entry) => sum + entry.hours_worked, 0),
      daily_entries: dailyEntries
    };

    const { data: savedStatement, error: saveError } = await supabase
      .from('driver_monthly_statements')
      .insert([statement])
      .select()
      .single();

    if (saveError) throw saveError;

    return savedStatement;
  } catch (error) {
    console.error('Error generating monthly statement:', error);
    return null;
  }
}

function calculateHoursWorked(performance: DriverDailyPerformance): number {
  return performance.total_orders > 0 ? 8 : 0;
}

function determineStatus(performance: DriverDailyPerformance): 'present' | 'absent' | 'leave' | 'holiday' {
  if (performance.total_orders > 0) return 'present';
  return 'absent';
}

function generateNotes(performance: DriverDailyPerformance): string {
  const notes = [];
  if (performance.total_orders > 0) {
    notes.push(`Orders: ${performance.total_orders}`);
  }
  if (performance.rating_average) {
    notes.push(`Rating: ${performance.rating_average}`);
  }
  return notes.join(' | ');
} 