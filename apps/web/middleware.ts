import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { protectedRoutes, publicRoutes } from './infraestructure/constants';

// Rutas publicas
const publicRoutesFinally = publicRoutes;
const ROUTE_DEFAULT_IS_AUTHENTICATED = '/dashboard/home';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get('accessToken')?.value;

  // Si está intentando acceder a una ruta protegida sin token → redirigir a login
  if (protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/')) && !authToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Si ya está autenticado y está en una ruta pública → redirigir a /dashboard
  if (publicRoutesFinally.includes(pathname) && authToken) {
    return NextResponse.redirect(new URL(ROUTE_DEFAULT_IS_AUTHENTICATED, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
