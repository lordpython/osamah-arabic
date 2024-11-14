type AttendanceStatus = 'present' | 'absent' | 'leave';

// ... in the component ...

<select
  className="rounded-md border-gray-300"
  onChange={(e) => handleStatusUpdate(e.target.id, e.target.value as AttendanceStatus)}
>
  <option value="present">Present</option>
  <option value="absent">Absent</option>
  <option value="leave">Leave</option>
  <option value="holiday">Holiday</option>
</select>;

function handleStatusUpdate(id: any, arg1: string): void {
  throw new Error('Function not implemented.');
}
