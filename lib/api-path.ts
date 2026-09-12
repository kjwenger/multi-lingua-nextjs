/**
 * Next.js's `basePath` config (next.config.js) automatically rewrites
 * next/link, next/router, and next/image — but NOT raw fetch() calls.
 * Any client-side fetch('/api/...') is broken when this build is
 * deployed under a reverse-proxy prefix (e.g. /multi-lingua/...):
 * the browser resolves that absolute path against the domain root,
 * not the app's actual mount point.
 *
 * Use apiPath('/api/...') instead of a hardcoded string wherever
 * client-side code calls fetch() against this app's own API routes.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function apiPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
