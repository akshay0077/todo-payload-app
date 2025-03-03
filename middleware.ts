import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Authentication paths
 */
const PUBLIC_PATHS = ['/login']
const PROTECTED_PATHS = ['/todos']
const HOME_PATH = '/'
const ADMIN_PATH = '/admin'

/**
 * Middleware function to handle authentication redirects
 * @param request The incoming request
 * @returns NextResponse with appropriate redirect or the original request
 */
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Skip middleware completely for admin paths
  // This is important for PayloadCMS admin to work properly
  if (path === ADMIN_PATH || path.startsWith(`${ADMIN_PATH}/`)) {
    return NextResponse.next()
  }

  // Check if the path is public (login page)
  const isPublicPath = PUBLIC_PATHS.includes(path)

  // Get the token from cookies
  const token = request.cookies.get('payload-token')?.value || ''
  const isAuthenticated = !!token

  // Redirect logic based on authentication status and requested path

  // Case 1: Authenticated user trying to access public pages (like login)
  // Redirect to todos page
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/todos', request.url))
  }

  // Case 2: Unauthenticated user trying to access protected pages
  // Redirect to login page
  if (!isPublicPath && !isAuthenticated && path !== HOME_PATH) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Case 3: Authenticated user accessing home page
  // Redirect to todos page
  if (path === HOME_PATH && isAuthenticated) {
    return NextResponse.redirect(new URL('/todos', request.url))
  }

  // Case 4: Unauthenticated user accessing home page
  // Redirect to login page
  if (path === HOME_PATH && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Allow the request to proceed
  return NextResponse.next()
}

/**
 * Configure which paths the middleware should run on
 * Explicitly exclude admin paths to ensure PayloadCMS works properly
 */
export const config = {
  matcher: [
    '/',
    '/login',
    '/todos/:path*',
    // Explicitly exclude admin paths
    '/((?!admin|api|_next|static|favicon.ico|robots.txt).*)',
  ],
}
