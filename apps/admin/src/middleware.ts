import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/legal',
  '/maintenance',
  '/forbidden',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') {
    if (!pathname.startsWith('/maintenance') && !pathname.startsWith('/legal')) {
      const url = req.nextUrl.clone();
      url.pathname = '/maintenance';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  const isPublic =
    PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith('/api/auth');
  const session =
    req.cookies.get('jwellers_admin_session')?.value ||
    req.cookies.get('jwellers_admin_access')?.value ||
    req.cookies.get('jwellers_admin_refresh')?.value;

  if (!session && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Do not bounce logged-in admins away from public legal pages
  if (
    session &&
    isPublic &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/legal') &&
    !pathname.startsWith('/maintenance') &&
    !pathname.startsWith('/forbidden')
  ) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
