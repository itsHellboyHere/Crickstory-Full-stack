// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('my-app-auth')?.value;

  // 1. Protect all routes under /(protected)
  if (pathname.startsWith('/(protected)') && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated users from auth pages
  if (['/login', '/register'].includes(pathname) && token) {
    return NextResponse.redirect(new URL('/posts', request.url));
  }

  return NextResponse.next();
}