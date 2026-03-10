/**
 * KAIROS — Auth Callback Route
 * GET /api/auth/callback
 *
 * Handles two Supabase email flows:
 * 1. PKCE code exchange (OAuth / magic link with code param)
 * 2. Email OTP token_hash (default email confirmation flow)
 */

import { NextResponse }       from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies }            from "next/headers"

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)

  const code       = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type       = searchParams.get("type")
  const next       = searchParams.get("next") ?? "/journey"

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Flow 1: PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error("[Kairos Auth] Code exchange failed:", error.message)
  }

  // Flow 2: Email OTP token_hash (standard email confirmation)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error("[Kairos Auth] OTP verification failed:", error.message)
  }

  // Both flows failed
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}