/**
 * useAuthState — reactive Supabase session hook
 *
 * Uses onAuthStateChange instead of a one-shot getUser() call.
 * This means it correctly reflects the session even when the
 * cookie hasn't hydrated yet on the first render.
 *
 * Returns:
 *   user        — the Supabase auth user (null if signed out)
 *   profileId   — the row ID from the public.users table
 *   isAuth      — true when user is real (non-anonymous)
 *   loading     — true until the first auth event fires
 */

"use client"

import { useState, useEffect } from "react"
import { supabase }            from "@/lib/supabase/client"

export function useAuthState() {
  const [user,      setUser]      = useState(null)
  const [profileId, setProfileId] = useState(null)
  const [isAuth,    setIsAuth]    = useState(false)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    // Resolve the profile row for a confirmed user
    const resolveProfile = async (authUser) => {
      if (!authUser || authUser.is_anonymous) {
        setUser(authUser)
        setProfileId(null)
        setIsAuth(false)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", authUser.id)
        .maybeSingle()

      setUser(authUser)
      setProfileId(profile?.id ?? null)
      setIsAuth(!!profile)
      setLoading(false)
    }

    // Fire once immediately for the current session
    supabase.auth.getUser().then(({ data: { user } }) => resolveProfile(user))

    // Then stay reactive — this fires on sign-in, sign-out, token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        resolveProfile(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, profileId, isAuth, loading }
}