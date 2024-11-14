export function calculateGrowth(data: any[]): number {
  if (!data || data.length < 2) return 0;
  const current = data[0].amount || 0;
  const previous = data[1].amount || 0;
  return previous === 0 ? 0 : ((current - previous) / previous) * 100;
}

export function calculateCompletedOrders(data: any[]): number {
  return data?.reduce((sum, d) => sum + (d.total_orders || 0), 0) || 0;
}

export function calculateAverageRating(data: any[]): number {
  const ratings = data?.filter((d) => d.performance?.rating_average);
  return ratings?.length ? ratings.reduce((sum, d) => sum + d.performance.rating_average, 0) / ratings.length : 0;
}
