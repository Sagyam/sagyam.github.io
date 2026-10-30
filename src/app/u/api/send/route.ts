// Umami's collection endpoint, proxied. A plain rewrite reaches Umami from Vercel's address, so
// every visitor would be placed at, and share sessions with, the Vercel edge they came through.
// Umami takes the visitor's address from `payload.ip` when it's there, so it's set from the
// address Vercel saw.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const ip =
    request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0];

  if (ip && body?.payload && typeof body.payload === 'object') {
    body.payload.ip = ip.trim();
  }

  const headers = new Headers({ 'Content-Type': 'application/json' });
  for (const [key, value] of request.headers) {
    if (key === 'user-agent' || key.startsWith('x-umami-')) headers.set(key, value);
  }

  const response = await fetch('https://gateway.umami.is/api/send', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return new Response(response.body, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' },
  });
}
