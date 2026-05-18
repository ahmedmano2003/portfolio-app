import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Middleware يحمي routes معينة:
 * - /admin/*    → ADMIN only
 * - /dashboard/* → مستخدم مسجل
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // routes تحت /admin - لازم ADMIN
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // /dashboard - أي user مسجل
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
