/**
 * File-System Router
 * Scans pages directory and maps files to URL routes
 */

import type { Route, RouteMatch } from './types.js';

const PAGES_DIR = './src/pages';

/**
 * Route storage
 */
class Router {
  private routes: Route[] = [];
  private initialized = false;

  /**
   * Initialize router by scanning pages directory
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    const files = this.scanPages();
    this.routes = this.buildRoutes(files);
    this.initialized = true;

    console.log(`[Router] Registered ${this.routes.length} routes:`);
    for (const route of this.routes) {
      console.log(`  ${route.pattern.padEnd(30)} -> ${route.filePath}`);
    }
  }

  /**
   * Scan pages directory for .tsx files
   */
  private scanPages(): string[] {
    const files: string[] = [];

    try {
      const glob = new Bun.Glob('**/*.tsx');
      for (const file of glob.scanSync({ cwd: PAGES_DIR })) {
        // Skip _app.tsx and _document.tsx
        if (file !== '_app.tsx' && file !== '_document.tsx' && !file.includes('/_')) {
          files.push(file);
        }
      }
    } catch (e) {
      console.warn(`[Router] No pages directory found at ${PAGES_DIR}`);
    }

    return files;
  }

  /**
   * Convert file paths to route definitions
   */
  private buildRoutes(files: string[]): Route[] {
    return files.map((file) => {
      // Remove .tsx extension
      const withoutExt = file.replace(/\.tsx$/, '');

      // Convert to URL pattern
      let pattern = withoutExt;

      // index.tsx -> /
      if (pattern === 'index') {
        pattern = '/';
      } else if (pattern.endsWith('/index')) {
        // foo/index.tsx -> /foo
        pattern = pattern.replace(/\/index$/, '/');
      } else {
        // Add leading slash
        pattern = `/${pattern}`;
      }

      // Build regex for matching
      const { regex, paramNames } = this.buildRouteRegex(pattern);

      return {
        pattern,
        filePath: `${PAGES_DIR}/${file}`,
        regex,
        paramNames,
      };
    });
  }

  /**
   * Build regex pattern for route matching
   * Handles dynamic segments like [slug], [id], etc.
   */
  private buildRouteRegex(pattern: string): { regex: RegExp; paramNames: string[] } {
    const paramNames: string[] = [];

    // Escape special regex characters except for our dynamic segments
    let regexStr = pattern
      // Replace dynamic segments [param] with named capture groups
      .replace(/\[([a-zA-Z_][a-zA-Z0-9_]*)\]/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      })
      // Escape special regex characters
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      // Fix the capture groups we just added (we escaped them)
      .replace(/\\\([^/]+\\\)/g, '([^/]+)')
      // Allow trailing slash
      .replace(/\/$/, '/?');

    return {
      regex: new RegExp(`^${regexStr}$`),
      paramNames,
    };
  }

  /**
   * Match a URL path to a route
   */
  match(pathname: string): RouteMatch | null {
    for (const route of this.routes) {
      const match = route.regex.exec(pathname);
      if (match) {
        const params: Record<string, string> = {};

        // Extract parameter values
        for (let i = 0; i < route.paramNames.length; i++) {
          const paramName = route.paramNames[i];
          const paramValue = match[i + 1];
          if (paramName !== undefined && paramValue !== undefined) {
            params[paramName] = paramValue;
          }
        }

        return { route, params };
      }
    }

    return null;
  }

  /**
   * Get all registered routes
   */
  getRoutes(): Route[] {
    return this.routes;
  }
}

/**
 * Singleton router instance
 */
export const router = new Router();

/**
 * Initialize router (call on server startup)
 */
export async function initRouter(): Promise<void> {
  await router.init();
}

/**
 * Match a URL to a route
 */
export function matchRoute(pathname: string): RouteMatch | null {
  return router.match(pathname);
}

/**
 * Get all routes
 */
export function getRoutes(): Route[] {
  return router.getRoutes();
}
