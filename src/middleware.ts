import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const { pathname, search } = request.nextUrl

    // Skip middleware for API routes, static files, and admin routes
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/admin/') ||
      pathname.includes('.') ||
      pathname === '/favicon.ico'
    ) {
      return NextResponse.next()
    }

    // Handle Spaces routes (always protected)
    if (pathname.startsWith('/spaces/')) {
      const token = request.cookies.get('payload-token')?.value

      if (!token) {
        const redirectUrl = new URL('/admin/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname + search)
        return NextResponse.redirect(redirectUrl)
      }

      // For spaces, we trust that the token exists and let the page handle validation
      // Complex auth validation is moved to the spaces page components
      return NextResponse.next()
    }

    // For other protected content, add a flag for server components to check
    const response = NextResponse.next()

    // Pass the path to server components for auth checking
    response.headers.set('x-pathname', pathname)

    const token = request.cookies.get('payload-token')?.value
    if (token) {
      response.headers.set('x-has-token', 'true')
    }

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
