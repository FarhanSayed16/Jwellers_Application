import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * GET — return refreshToken from httpOnly cookie for client tryRefresh only.
 * Same-origin; not for third-party use.
 */
export async function GET() {
  const jar = await cookies();
  const refreshToken = jar.get('jwellers_admin_refresh')?.value ?? null;
  if (!refreshToken) {
    return NextResponse.json({ refreshToken: null }, { status: 401 });
  }
  return NextResponse.json({ refreshToken });
}
