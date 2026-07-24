import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isAdmin = req.nextUrl.pathname.startsWith('/admin');
  const isLogin = req.nextUrl.pathname === '/admin/login';
  const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth');

  if (isAdmin && !isLogin && !isApiAuth && !req.auth) {
    const loginUrl = new URL('/admin/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ['/admin/:path*'],
};
