import { NextResponse } from 'next/server';
import { collectRoutes } from '@/utils/routeCollector';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development mode' }, { status: 403 });
  }

  const routes = collectRoutes();
  return NextResponse.json(routes);
} 