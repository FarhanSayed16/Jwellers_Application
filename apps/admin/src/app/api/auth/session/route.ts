import { NextResponse } from 'next/server';

const ACCESS = 'jwellers_admin_access';
const REFRESH = 'jwellers_admin_refresh';
const SESSION = 'jwellers_admin_session';

const cookieBase = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

/** POST { accessToken, refreshToken } — store httpOnly tokens + session marker. */
export async function POST(req: Request) {
  let body: { accessToken?: string; refreshToken?: string };
  try {
    body = (await req.json()) as { accessToken?: string; refreshToken?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const accessToken = body.accessToken?.trim();
  const refreshToken = body.refreshToken?.trim();
  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: 'accessToken and refreshToken required' }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS, accessToken, {
    ...cookieBase,
    httpOnly: true,
    maxAge: 60 * 60 * 12, // 12h
  });
  res.cookies.set(REFRESH, refreshToken, {
    ...cookieBase,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30d
  });
  // Readable by middleware / client to know a session exists (not the JWT itself).
  res.cookies.set(SESSION, '1', {
    ...cookieBase,
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

/** DELETE — clear all admin session cookies. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  for (const name of [ACCESS, REFRESH, SESSION]) {
    res.cookies.set(name, '', { ...cookieBase, httpOnly: name !== SESSION, maxAge: 0 });
  }
  return res;
}
