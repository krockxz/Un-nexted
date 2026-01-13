/**
 * SSR Engine
 * HTTP server that renders React components to HTML strings
 */

import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { initRouter, matchRoute, getRoutes } from './router.js';
import type { PageComponent, ServerPropsContext } from './types.js';

const PORT = Number(process.env.PORT) || 3000;
const IS_DEV = process.env.NODE_ENV !== 'production';

/**
 * Generate HTML template with rendered content
 */
function generateHTML(
  renderedContent: string,
  data: { pathname: string; props: Record<string, any> },
  options: { title?: string } = {}
): string {
  const { title = 'Unnexted App' } = options;

  // Serialize routes for client-side matching
  const routes = getRoutes().map((r) => ({
    pattern: r.pattern,
    filePath: r.filePath,
  }));

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body>
    <div id="root">${renderedContent}</div>
    <script id="__UNNEXTED_DATA__" type="application/json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
    <script id="__UNNEXTED_ROUTES__" type="application/json">${JSON.stringify(routes).replace(/</g, '\\u003c')}</script>
    <script src="/client.js"></script>
  </body>
</html>`;
}

/**
 * Import a page component dynamically
 */
async function getPageComponent(filePath: string): Promise<PageComponent | null> {
  try {
    // Convert file path to import path
    const importPath = filePath.replace(/^\.\/src\//, '../').replace(/\.tsx$/, '');
    const module = await import(importPath);
    return module.default || module;
  } catch (e) {
    console.error(`[Server] Failed to import component from ${filePath}:`, e);
    return null;
  }
}

/**
 * Render a page to HTML
 */
async function renderPage(pathname: string): Promise<{ html: string; status: number }> {
  console.log(`[Server] Rendering: ${pathname}`);

  // Match route
  const match = matchRoute(pathname);

  if (!match) {
    // 404 page
    console.log(`[Server] No route matched: ${pathname}`);

    const NotFoundComponent = await getPageComponent('./src/pages/404.tsx');

    if (NotFoundComponent) {
      const renderedContent = renderToString(createElement(NotFoundComponent as any, { pathname }));
      return {
        html: generateHTML(renderedContent, { pathname, props: {} }, { title: '404 - Not Found' }),
        status: 404,
      };
    }

    return {
      html: generateHTML(
        renderToString(createElement('div', null, createElement('h1', null, '404 - Page Not Found'))),
        { pathname, props: {} },
        { title: '404 - Not Found' }
      ),
      status: 404,
    };
  }

  const { route, params } = match;
  console.log(`[Server] Matched route: ${route.pattern} -> ${route.filePath}`);

  // Import component
  const Component = await getPageComponent(route.filePath);

  if (!Component) {
    return {
      html: generateHTML(
        renderToString(createElement('div', null, createElement('h1', null, 'Failed to load page'))),
        { pathname, props: {} },
        { title: 'Error' }
      ),
      status: 500,
    };
  }

  // Check for getServerSideProps
  let props: Record<string, any> = { params };

  if (typeof Component.getServerSideProps === 'function') {
    console.log('[Server] Calling getServerSideProps...');

    const context: ServerPropsContext = {
      params,
      pathname,
    };

    try {
      const result = await Component.getServerSideProps(context);
      props = { ...props, ...result.props };
    } catch (e) {
      console.error('[Server] getServerSideProps failed:', e);
      return {
        html: generateHTML(
          renderToString(createElement('div', null, createElement('h1', null, 'Error loading data'))),
          { pathname, props: {} },
          { title: 'Error' }
        ),
        status: 500,
      };
    }
  }

  // Render component to string
  const renderedContent = renderToString(createElement(Component as any, props));

  // Extract title from props if available
  const title = (props as any).title || (props as any).metadata?.title || 'Unnexted App';

  return {
    html: generateHTML(renderedContent, { pathname, props }, { title }),
    status: 200,
  };
}

/**
 * Serve static files from dist directory
 */
async function serveStatic(pathname: string): Promise<Response | null> {
  if (pathname === '/client.js') {
    try {
      const file = Bun.file('./dist/client.js');
      return new Response(file, {
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': IS_DEV ? 'no-cache' : 'public, max-age=31536000',
        },
      });
    } catch (e) {
      console.error('[Server] Failed to serve client.js:', e);
      return null;
    }
  }

  return null;
}

/**
 * Start the development server
 */
export async function startServer(): Promise<void> {
  // Initialize router
  console.log('[Server] Initializing router...');
  await initRouter();

  // Build client bundle (in development, build on startup)
  console.log('[Server] Building client bundle...');
  const { buildClient } = await import('./build.js');
  await buildClient({ minify: false, sourcemap: true });

  // Start HTTP server
  const server = Bun.serve({
    port: PORT,
    async fetch(req) {
      const url = new URL(req.url);
      const pathname = url.pathname;

      // Serve static files
      if (pathname.startsWith('/client.js') || pathname.startsWith('/static/')) {
        const staticResponse = await serveStatic(pathname);
        if (staticResponse) {
          return staticResponse;
        }
      }

      // Render page
      const { html, status } = await renderPage(pathname);

      return new Response(html, {
        status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      });
    },
  });

  console.log(`\n[Server] Listening on http://localhost:${server.port}\n`);
}

// Start server if this file is run directly
if (import.meta.path === Bun.resolveSync('./server.ts', import.meta.dir)) {
  startServer().catch((err) => {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  });
}
