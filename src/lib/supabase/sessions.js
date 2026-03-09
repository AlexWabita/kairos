import { supabase } from './client'

const SESSION_TOKEN_KEY = 'kairos_session_token'

// Generate a random session token
function generateSessionToken() {
  return 'ks_' + crypto.randomUUID().replace(/-/g, '')
}

// Get existing token from cookie or create a new one
function getOrCreateSessionToken() {
  if (typeof document === 'undefined') return null

  const existing = getCookie(SESSION_TOKEN_KEY)
  if (existing) return existing

  const token = generateSessionToken()
  setCookie(SESSION_TOKEN_KEY, token, 30)
  return token
}

// Cookie helpers
function setCookie(name, value, days) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// Core function — call this when Kairos loads
// Returns the user object (anonymous or authenticated)
export async function initKairosSession() {
  try {
    // Check if user is already authenticated
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (authUser) {
      // Authenticated user — fetch their profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .maybeSingle()

      return { type: 'authenticated', user: profile, authUser }
    }

    // Anonymous flow — get or create session token
    const sessionToken = getOrCreateSessionToken()
    if (!sessionToken) return null

    // Check if session already exists in DB
    const { data: existingSession, error: sessionError } = await supabase
      .from('sessions')
      .select('*, users(*)')
      .eq('session_token', sessionToken)
      .maybeSingle()

    if (sessionError) {
      console.error('[Kairos] Session lookup error:', sessionError.message)
    }

    if (existingSession?.users) {
      // Returning anonymous user — update last seen
      await supabase
        .from('users')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', existingSession.user_id)

      return {
        type: 'anonymous',
        user: existingSession.users,
        sessionToken
      }
    }

    // Brand new visitor — create anonymous user + session
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({ is_anonymous: true })
      .select()
      .single()

    if (userError) {
      console.error('[Kairos] User creation error:', userError.message)
      throw userError
    }

    const { error: sessionInsertError } = await supabase
      .from('sessions')
      .insert({
        user_id: newUser.id,
        session_token: sessionToken,
        device_hint: getDeviceHint()
      })

    if (sessionInsertError) {
      console.error('[Kairos] Session creation error:', sessionInsertError.message)
    }

    return { type: 'anonymous', user: newUser, sessionToken }

  } catch (error) {
    console.error('[Kairos] Session init failed:', error.message || error)
    return null
  }
}

// Detect mobile vs desktop
function getDeviceHint() {
  if (typeof navigator === 'undefined') return 'unknown'
  return /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
}

// Call this after a user signs up to migrate their anonymous data
export async function migrateAnonymousSession(authUserId) {
  const sessionToken = getCookie(SESSION_TOKEN_KEY)
  if (!sessionToken) return

  try {
    const { data: session } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .maybeSingle()

    if (!session) return

    // Link the anonymous user record to the new auth account
    await supabase
      .from('users')
      .update({
        auth_id: authUserId,
        is_anonymous: false
      })
      .eq('id', session.user_id)

  } catch (error) {
    console.error('[Kairos] Session migration failed:', error.message || error)
  }
}