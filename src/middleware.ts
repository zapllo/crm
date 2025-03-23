// app/middleware.ts (or in the root folder if using the app router)

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

/**
 * If you have public routes (e.g. '/', '/login', '/signup', '/api/auth/...')
 * that shouldn't require authentication, you can handle them in logic below 
 * OR exclude them via `matcher`.
 */

// Our example: we protect all routes under `/CRM/...`, 
// redirecting to `/login` if no valid token is present.
export function middleware(request: NextRequest) {
  // The protected paths will match the config below. If the requested path
  // matches, we check for the `token` cookie.

  // 1. Grab the 'token' cookie
  const token = request.cookies.get('token')?.value

  // 2. If no token, redirect to /login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Verify token
  try {
    // If your secret is in .env, ensure it's available here
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error('JWT secret is missing')
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY)
  } catch (err) {
    // If token verification fails, redirect to /login
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If everything is good, continue to the requested route
  return NextResponse.next()
}

/**
 * We tell Next.js which routes should run this middleware.
 * In this example, any route under '/CRM' is protected.
 */
export const config = {
  matcher: ['/CRM/:path*'],
}
