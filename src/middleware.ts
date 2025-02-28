import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/verify',
  '/auth/reset-password',
  '/auth/update-password',
  '/auth/callback',
];

// List of routes that are part of the auth flow
const authRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password',
];

export async function middleware(request: NextRequest) {
  // API routes should bypass middleware completely
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
  if (isApiRoute) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    }
  )

  // Check if the user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  // If the route is public, allow access
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return response
  }

  // If the user is not authenticated and the route is not public, redirect to login
  if (userError || !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 