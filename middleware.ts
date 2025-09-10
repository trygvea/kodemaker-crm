import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Allow public assets and auth endpoints
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next()
  }

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


