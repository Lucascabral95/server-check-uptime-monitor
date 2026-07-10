import { NextRequest, NextResponse } from "next/server";

// BACKEND_API_URL es server-only (sin NEXT_PUBLIC_) porque este handler corre
// en el servidor de Next, nunca en el browser. Cae a la var pública histórica
// si todavía no se configuró la nueva, para no romper despliegues existentes.
const BACKEND_URL =
  process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL_BACKEND;

const BODYLESS_METHODS = new Set(["GET", "HEAD"]);
const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const FRONTEND_ORIGIN = process.env.NEXT_PUBLIC_URL_FRONTEND;

async function proxy(
  request: NextRequest,
  path: string[],
): Promise<NextResponse> {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { message: "Backend URL no configurada" },
      { status: 500 },
    );
  }

  const origin = request.headers.get("origin");
  if (
    STATE_CHANGING_METHODS.has(request.method) &&
    origin &&
    origin !== request.nextUrl.origin &&
    origin !== FRONTEND_ORIGIN
  ) {
    return NextResponse.json(
      { message: "Origen no permitido" },
      { status: 403 },
    );
  }

  // El idToken vive en una cookie httpOnly (seteada por /api/auth/session):
  // el browser nunca puede leerlo, pero este proxy same-origin sí, y lo
  // reenvía como el Authorization: Bearer que el backend NestJS ya esperaba
  // — el backend no necesita ningún cambio.
  const accessToken = request.cookies.get("accessToken")?.value;
  const targetUrl = `${BACKEND_URL}/${path.join("/")}${request.nextUrl.search}`;

  const headers: Record<string, string> = {
    "Content-Type": request.headers.get("content-type") ?? "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const body = BODYLESS_METHODS.has(request.method)
    ? undefined
    : await request.text();

  let backendResponse: Response;
  try {
    backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });
  } catch {
    return NextResponse.json(
      { message: "No se pudo contactar al backend" },
      { status: 502 },
    );
  }

  if (
    backendResponse.headers.get("content-type")?.includes("text/event-stream")
  ) {
    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }
  const responseBody = await backendResponse.text();
  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: {
      "Content-Type":
        backendResponse.headers.get("content-type") ?? "application/json",
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
