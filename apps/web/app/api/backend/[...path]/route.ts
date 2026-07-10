import { NextRequest, NextResponse } from 'next/server';

// BACKEND_API_URL es server-only (sin NEXT_PUBLIC_) porque este handler corre
// en el servidor de Next, nunca en el browser. Cae a la var pública histórica
// si todavía no se configuró la nueva, para no romper despliegues existentes.
const BACKEND_URL = process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL_BACKEND;

const BODYLESS_METHODS = new Set(['GET', 'HEAD']);

async function proxy(request: NextRequest, path: string[]): Promise<NextResponse> {
  if (!BACKEND_URL) {
    return NextResponse.json({ message: 'Backend URL no configurada' }, { status: 500 });
  }

  // El idToken vive en una cookie httpOnly (seteada por /api/auth/session):
  // el browser nunca puede leerlo, pero este proxy same-origin sí, y lo
  // reenvía como el Authorization: Bearer que el backend NestJS ya esperaba
  // — el backend no necesita ningún cambio.
  const idToken = request.cookies.get('idToken')?.value;
  const targetUrl = `${BACKEND_URL}/${path.join('/')}${request.nextUrl.search}`;

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') ?? 'application/json',
  };
  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  const body = BODYLESS_METHODS.has(request.method) ? undefined : await request.text();

  let backendResponse: Response;
  try {
    backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });
  } catch {
    return NextResponse.json({ message: 'No se pudo contactar al backend' }, { status: 502 });
  }

  const responseBody = await backendResponse.text();
  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: {
      'Content-Type': backendResponse.headers.get('content-type') ?? 'application/json',
    },
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  return proxy(request, (await params).path);
}
export async function POST(request: NextRequest, { params }: RouteContext) {
  return proxy(request, (await params).path);
}
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return proxy(request, (await params).path);
}
export async function PUT(request: NextRequest, { params }: RouteContext) {
  return proxy(request, (await params).path);
}
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return proxy(request, (await params).path);
}
