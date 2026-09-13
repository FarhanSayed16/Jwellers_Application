import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/** GET — return accessToken from httpOnly cookie (same-origin only). */
export async function GET() {
  const jar = await cookies();
  const accessToken = jar.get('jwellers_admin_access')?.value ?? null;
  if (!accessToken) {
    return NextResponse.json({ accessToken: null }, { status: 401 });
  }
  return NextResponse.json({ accessToken });
}
