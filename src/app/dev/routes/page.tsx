import { headers } from 'next/headers';
import RouteViewer from '@/components/dev/RouteViewer';

export default async function DevRoutesPage() {
  const headersList = headers();
  const host = (await headersList).get('host') || '';
  
  if (!host.includes('localhost') && process.env.NODE_ENV !== 'development') {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold text-red-600">
          This page is only available in development mode
        </h1>
      </div>
    );
  }

  return <RouteViewer />;
} 