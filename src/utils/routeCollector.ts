import fs from 'fs';
import path from 'path';

interface RouteInfo {
  path: string;
  component: string;
  layout?: string;
  children?: RouteInfo[];
}

export function collectRoutes(dir: string = 'src/app'): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const fullPath = path.join(process.cwd(), dir);

  if (!fs.existsSync(fullPath)) {
    return routes;
  }

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.')) {
      const routePath = entry.name === '(.)' ? '/' : `/${entry.name}`;
      const childRoutes = collectRoutes(path.join(dir, entry.name));

      const routeInfo: RouteInfo = {
        path: routePath,
        component: path.join(dir, entry.name, 'page.tsx'),
        layout: fs.existsSync(path.join(fullPath, entry.name, 'layout.tsx'))
          ? path.join(dir, entry.name, 'layout.tsx')
          : undefined,
        children: childRoutes.length > 0 ? childRoutes : undefined,
      };

      routes.push(routeInfo);
    }
  }

  return routes;
}
