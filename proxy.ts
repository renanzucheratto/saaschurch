import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicPaths = ['/login', '/signup', '/externo'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  if (!token && !isPublicPath && !pathname.startsWith('/api/auth')) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
