/**
 * KAIROS — Next.js Middleware
 * Refreshes Supabase auth session on every request.
 * Protects routes that require authentication.
 * Passes returnTo so login lands the user back where they came from.
 */

import { NextResponse }       from "next/server"
import { createServerClient } from "@supabase/ssr"

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
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must be called before any route protection
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ── Protected routes — require a real (non-anonymous) account ──
  const protectedRoutes = [
    "/account",
    "/settings",
    "/journey/saved",
  ]

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r))
  const isAnonymous = !user || user.is_anonymous

  if (isProtected && isAnonymous) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("returnTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Redirect already-logged-in users away from auth pages ──
  const authRoutes = ["/login", "/register"]
  if (user && !user.is_anonymous && authRoutes.some(r => pathname.startsWith(r))) {
    // Honour returnTo if present, otherwise go to /journey
    const returnTo = request.nextUrl.searchParams.get("returnTo") || "/journey"
    return NextResponse.redirect(new URL(returnTo, request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}