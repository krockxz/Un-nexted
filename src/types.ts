/**
 * Type definitions for Un-nexted framework
 */

import type { ComponentType } from 'react';

/**
 * Represents a route in the application
 */
export interface Route {
  /** URL pattern (e.g., "/", "/about", "/blog/[slug]") */
  pattern: string;
  /** File path to the page component */
  filePath: string;
  /** Regular expression for matching URLs */
  regex: RegExp;
  /** Parameter names for dynamic routes */
  paramNames: string[];
}

/**
 * Server-side props context passed to getServerSideProps
 */
export interface ServerPropsContext {
  /** URL parameters extracted from dynamic routes */
  params: Record<string, string>;
  /** The original URL path */
  pathname: string;
}

/**
 * Result returned by getServerSideProps
 */
export interface ServerPropsResult<T = any> {
  /** Props to pass to the page component */
  props: T;
}

/**
 * Page component with optional getServerSideProps
 */
export type PageComponent<P = any> = ComponentType<P> & {
  /** Optional server-side data fetching function */
  getServerSideProps?: (context: ServerPropsContext) => ServerPropsResult<P> | Promise<ServerPropsResult<P>>;
};

/**
 * Route match result
 */
export interface RouteMatch {
  /** Matched route */
  route: Route;
  /** Extracted parameters */
  params: Record<string, string>;
}

/**
 * Server-rendered page data
 */
export interface PageData {
  /** URL path */
  pathname: string;
  /** Props to pass to component */
  props: Record<string, any>;
}
