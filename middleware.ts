import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const authToken = req.cookies.get('auth-token')?.value

  if (!authToken) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/protected-route/:path*'] // Add protected routes here
}
