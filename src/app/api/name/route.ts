import { NextRequest, NextResponse } from 'next/server';

const expectedAction = 'addname';

export async function POST(req: NextRequest) {
  const expectedHostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? '')
      .split(',')
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  );

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const token = typeof body['cf-turnstile-response'] === 'string' ? body['cf-turnstile-response'] : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (
    token.length === 0 ||
    token.length > 2048 ||
    expectedHostnames.size === 0
  ) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const forwarded = req.headers.get('x-forwarded-for');
  const clientIp = forwarded ? forwarded.split(',')[0].trim() : '';

  let result: { success?: boolean; action?: string; hostname?: string };
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET ?? '',
        response: token,
        remoteip: clientIp,
      }),
    });
    if (!r.ok) throw new Error(`siteverify ${r.status}`);
    result = await r.json();
  } catch {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  if (
    !result.success ||
    result.action !== expectedAction ||
    !expectedHostnames.has(result.hostname ?? '')
  ) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  return NextResponse.json({ ok: true, name });
}
