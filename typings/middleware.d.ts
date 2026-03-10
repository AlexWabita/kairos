
/**
 * KAIROS — Next.js Middleware
 * Refreshes Supabase auth session on every request.
 * Protects routes that require authentication.
 */

import { NextResponse }          from "next/server"
import { createServerClient }    from "@supabase/ssr"

export async function middleware(request) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must be called before any route protection
  const { data: { user } } = await supabase.auth.getUser()

  // Protect /journey — redirect to login if not authenticated
  // Temporarily open for anonymous access — will tighten in Phase 7
  // when organisation portals require accounts
  // const protectedRoutes = ["/account", "/settings"]
  // if (!user && protectedRoutes.some(r => request.nextUrl.pathname.startsWith(r))) {
  //   return NextResponse.redirect(new URL("/login", request.url))
  // }

  // Redirect logged-in users away from auth pages
  const authRoutes = ["/login", "/register"]
  const pathname = request.nextUrl.pathname
  if (user && authRoutes.some(r => pathname.startsWith     (r))) {
    return NextResponse.redirect(new URL("/journey",   request.url))
  }

  return response
}

declare interface configType {
	static matcher: (string | any)[];
}
