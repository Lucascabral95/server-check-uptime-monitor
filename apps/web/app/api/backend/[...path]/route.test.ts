import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('backend proxy route', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('BACKEND_API_URL', 'http://backend:4000/api/v1');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: [] }), {
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
  });

  it('forwards the ID token, which contains the email needed for first login', async () => {
    const { GET } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/backend/uptime?limit=100');
    request.cookies.set('accessToken', 'access-token');
    request.cookies.set('idToken', 'id-token');

    await GET(request, { params: Promise.resolve({ path: ['uptime'] }) });

    expect(fetch).toHaveBeenCalledWith(
      'http://backend:4000/api/v1/uptime?limit=100',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer id-token' }),
      }),
    );
  });
});
