/**
 * KAIROS — Supabase Auth Helpers
 * Client-side auth functions used by login, register, and forgot-password pages.
 */

import { supabase } from "@/lib/supabase/client"

/**
 * Sign up with email and password.
 */
export async function signUp({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })
  return { data, error }
}

/**
 * Sign in with email and password.
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/api/auth/callback?next=/account/reset-password`,
  })
  return { data, error }
}

/**
 * Get the current session user (client-side).
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}