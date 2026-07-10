import { NextRequest, NextResponse } from 'next/server';

// Solo decodifica el payload para leer `exp` — la firma ya fue verificada por
// Cognito al emitir el token vía Amplify; acá solo alineamos el maxAge de la
// cookie con la expiración real, en vez de un valor fijo arbitrario.
function decodeExpClaim(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
}

const DEFAULT_MAX_AGE_SECONDS = 60 * 60;
const isProd = process.env.NODE_ENV === 'production';

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const accessToken = body?.accessToken;
  const idToken = body?.idToken;

  if (typeof accessToken !== 'string' || typeof idToken !== 'string' || !accessToken || !idToken) {
    return NextResponse.json(
      { message: 'accessToken e idToken son requeridos' },
      { status: 400 },
    );
  }

  const exp = decodeExpClaim(idToken);
  const maxAge = exp
    ? Math.max(exp - Math.floor(Date.now() / 1000), 0)
    : DEFAULT_MAX_AGE_SECONDS;

  const response = NextResponse.json({ ok: true });
  response.cookies.set('accessToken', accessToken, cookieOptions(maxAge));
  response.cookies.set('idToken', idToken, cookieOptions(maxAge));

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('accessToken', '', cookieOptions(0));
  response.cookies.set('idToken', '', cookieOptions(0));

  return response;
}
