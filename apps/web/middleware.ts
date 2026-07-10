import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { protectedRoutes, publicRoutes } from './infraestructure/constants';

const publicRoutesFinally = publicRoutes;
const ROUTE_DEFAULT_IS_AUTHENTICATED = '/dashboard/home';

// El backend es el único validador real de firma/claims (ver
// apps/backend-uptime JwtAuthGuard); acá solo se decodifica el payload para
// chequear `exp` y evitar el caso obvio de "cookie presente pero vencida"
// colando a una ruta protegida hasta el próximo request al backend. atob()
// es global tanto en el Edge runtime (donde corre este middleware) como en
// browsers — a propósito no se usa Buffer, que no existe ahí.
function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;

    const decoded = JSON.parse(atob(payload)) as { exp?: number };
    if (typeof decoded.exp !== 'number') return true;

    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rawToken = request.cookies.get('accessToken')?.value;
  const authToken = rawToken && !isTokenExpired(rawToken) ? rawToken : undefined;

  const isProtectedRoute = protectedRoutes.some(route => {
    if (pathname === route) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });

  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (publicRoutesFinally.includes(pathname) && authToken) {
    return NextResponse.redirect(new URL(ROUTE_DEFAULT_IS_AUTHENTICATED, request.url));
  }

  if (pathname === '/' && authToken) {
    return NextResponse.redirect(new URL(ROUTE_DEFAULT_IS_AUTHENTICATED, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
