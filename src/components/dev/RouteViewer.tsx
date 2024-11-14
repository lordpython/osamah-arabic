'use client';

import { useEffect, useState } from 'react';

interface RouteInfo {
  path: string;
  component: string;
  layout?: string;
  children?: RouteInfo[];
}

export default function RouteViewer() {
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutes() {
      try {
        const response = await fetch('/api/dev/routes');
        const data = await response.json();
        setRoutes(data);
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutes();
  }, []);

  if (loading) {
    return <div>Loading routes...</div>;
  }

  const renderRoutes = (routes: RouteInfo[], level = 0) => {
    return routes.map((route, index) => (
      <div key={index} style={{ marginLeft: `${level * 20}px` }}>
        <div className="p-2 my-1 bg-gray-100 rounded">
          <div className="font-medium">{route.path}</div>
          <div className="text-sm text-gray-600">Component: {route.component}</div>
          {route.layout && <div className="text-sm text-gray-600">Layout: {route.layout}</div>}
        </div>
        {route.children && renderRoutes(route.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Application Routes</h2>
      {renderRoutes(routes)}
    </div>
  );
}
