import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/create',
  '/settings',
  '/my-courses',
  '/dashboard',
  '/become-instructor',
]

const ADMIN_ROUTES = [
  '/admin',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (token) {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      )

      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        const response = NextResponse.next()
        response.headers.set('x-token-expired', 'true')
        return response
      }

      const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))
      if (isAdminRoute && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch {
      if (isProtected) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/create/:path*',
    '/settings/:path*',
    '/my-courses/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/become-instructor/:path*',
  ]
}
