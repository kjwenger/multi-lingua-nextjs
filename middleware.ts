import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token');
  const pathname = request.nextUrl.pathname;

  // Public paths that don't need authentication
  const publicPaths = ['/landing', '/login', '/register'];
  
  // If user is on root path, let the HomePage component handle routing
  // It will check auth and redirect appropriately
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  // If user has token but is on landing, redirect to translations
  if (pathname === '/landing' && authToken) {
    return NextResponse.redirect(new URL('/translations', request.url));
  }
  
  // If user is trying to access translations without token, redirect to landing
  if (pathname === '/translations' && !authToken) {
    return NextResponse.redirect(new URL('/landing', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
