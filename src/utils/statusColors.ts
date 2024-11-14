export function getStatusColor(status?: string): string {
  switch (status) {
    case 'present':
      return 'text-green-600';
    case 'absent':
      return 'text-red-600';
    case 'leave':
      return 'text-yellow-600';
    case 'holiday':
      return 'text-blue-600';
    default:
      return 'text-gray-400';
  }
}
