import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export default async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/';
  const isProtectedRoute = pathname.startsWith('/teacher') || pathname.startsWith('/student');

  // Not authenticated & trying to access protected route -> redirect to login
  if (!session?.user && isProtectedRoute) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated
  if (session?.user) {
    const role = (session.user as Record<string, unknown>).role as string;
    const isApproved = (session.user as Record<string, unknown>).isApproved as boolean;

    // Admin routes
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Pending approval
    if (role === 'TEACHER' && !isApproved && !pathname.startsWith('/pending-approval') && !isAuthRoute) {
      return NextResponse.redirect(new URL('/pending-approval', req.url));
    }

    // If on an auth route or root, redirect to their dashboard
    if (isAuthRoute) {
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', req.url));
      if (role === 'TEACHER' && !isApproved) return NextResponse.redirect(new URL('/pending-approval', req.url));
      if (role === 'TEACHER') return NextResponse.redirect(new URL('/teacher', req.url));
      if (role === 'STUDENT') return NextResponse.redirect(new URL('/student', req.url));
    }

    // Teacher routes — only for TEACHER role
    if (pathname.startsWith('/teacher') && role !== 'TEACHER') {
      return NextResponse.redirect(new URL('/student', req.url));
    }

    // Student routes — only for STUDENT role
    if (pathname.startsWith('/student') && role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/teacher', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/teacher/:path*', '/student/:path*', '/admin/:path*', '/pending-approval', '/login', '/register', '/'],
};
