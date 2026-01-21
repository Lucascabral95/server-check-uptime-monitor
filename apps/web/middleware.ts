import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { protectedRoutes, publicRoutes } from './infraestructure/constants';

const publicRoutesFinally = publicRoutes;
const ROUTE_DEFAULT_IS_AUTHENTICATED = '/dashboard/home';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get('accessToken')?.value;

  const isProtectedRoute = protectedRoutes.some(route => {
    if (pathname === route) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });

  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (publicRoutesFinally.includes(pathname) && authToken && pathname !== '/') {
    return NextResponse.redirect(new URL(ROUTE_DEFAULT_IS_AUTHENTICATED, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
