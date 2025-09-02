import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// BUG: This file should not be used, but the config part seems to be required by nextjs.
// The real middleware implementation resides in project root, /middleware.ts.
//export default async function middleware(req: NextRequest) {
//}

export const config = {
  matcher: ['/:path*'],
}


