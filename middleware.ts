import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Allow public assets
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next()
  }

  // Allow auth endpoints and email webhook without authentication
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/emails')) {
    return NextResponse.next()
  }

  // Require authentication for all API routes
  if (pathname.startsWith('/api/')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const hasSessionCookie =
      req.cookies.has('next-auth.session-token') ||
      req.cookies.has('__Secure-next-auth.session-token')
    if (!token && !hasSessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Require authentication for all other routes
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const hasSessionCookie =
    req.cookies.has('next-auth.session-token') ||
    req.cookies.has('__Secure-next-auth.session-token')
  if (!token && !hasSessionCookie) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/:path*'],
}
