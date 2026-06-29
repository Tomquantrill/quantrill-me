import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const isToolsRoute = req.nextUrl.pathname.startsWith('/tools');
  const isLoginRoute = req.nextUrl.pathname === '/tools/login';
  const auth = req.cookies.get('tools-auth');

  if (isToolsRoute && !isLoginRoute && !auth) {
    return NextResponse.redirect(new URL('/tools/login', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/tools/:path*'] };
