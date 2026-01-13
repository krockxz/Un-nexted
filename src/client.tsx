/**
 * Client Hydration Entry Point
 * Attaches React event listeners to server-rendered HTML
 */

import { hydrateRoot } from 'react-dom/client';
import { createElement } from 'react';

/**
 * Route component map (populated by build)
 * This will be dynamically imported based on the current route
 */
interface ComponentModule {
  default: React.ComponentType<any>;
}

/**
 * Read server-side data from __UNNEXTED_DATA__ script tag
 */
function getServerData(): { pathname: string; props: Record<string, any> } | null {
  const dataScript = document.getElementById('__UNNEXTED_DATA__');
  if (!dataScript) {
    console.warn('[Client] No server data found');
    return null;
  }

  try {
    return JSON.parse(dataScript.textContent || '{}');
  } catch (e) {
    console.error('[Client] Failed to parse server data:', e);
    return null;
  }
}

/**
 * Dynamic import a page component
 */
async function importPageComponent(filePath: string): Promise<React.ComponentType<any>> {
  // Convert file path to import path
  // ./src/pages/index.tsx -> ../pages/index
  const importPath = filePath
    .replace(/^\.\/src\//, '../')
    .replace(/\.tsx$/, '');

  try {
    const module = await import(importPath);
    return module.default;
  } catch (e) {
    console.error(`[Client] Failed to import component from ${importPath}:`, e);
    return () => createElement('div', null, 'Failed to load page');
  }
}

/**
 * Hydrate the application
 */
async function hydrate(): Promise<void> {
  console.log('[Client] Starting hydration...');

  const serverData = getServerData();
  if (!serverData) {
    console.error('[Client] No server data available, cannot hydrate');
    return;
  }

  const { pathname, props } = serverData;
  console.log('[Client] Hydrating route:', pathname, 'with props:', props);

  // Import the component for the current route
  // We need to match the pathname to the correct file
  // For now, we'll use a simple mapping

  let componentPath = `./src/pages${pathname === '/' ? '/index' : pathname}.tsx`;

  // Handle dynamic routes - we need to check the registered routes
  // The server should have embedded this info
  const routesScript = document.getElementById('__UNNEXTED_ROUTES__');
  if (routesScript) {
    try {
      const routes: Array<{ pattern: string; filePath: string }> = JSON.parse(routesScript.textContent || '[]');

      // Match pathname to a route
      const matchedRoute = routes.find((route) => {
        // Convert pattern to regex
        const regexStr = route.pattern
          .replace(/\[([a-zA-Z_][a-zA-Z0-9_]*)\]/g, '([^/]+)')
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\\\([^/]+\\\)/g, '([^/]+)') + '/?$';
        const regex = new RegExp(`^${regexStr}$`);
        return regex.test(pathname);
      });

      if (matchedRoute) {
        componentPath = matchedRoute.filePath;
      }
    } catch (e) {
      console.warn('[Client] Failed to parse routes:', e);
    }
  }

  const Component = await importPageComponent(componentPath);
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('[Client] Root element not found');
    return;
  }

  // Hydrate with the component and props
  hydrateRoot(rootElement, createElement(Component, props));

  console.log('[Client] Hydration complete!');
}

// Start hydration when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate);
  } else {
    hydrate();
  }
}
