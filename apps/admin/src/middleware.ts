import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/legal',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const session = req.cookies.get('jwellers_admin_session')?.value;

  if (!session && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Do not bounce logged-in admins away from public legal pages
  if (session && isPublic && !pathname.startsWith('/legal')) {
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
