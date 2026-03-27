import { createClient } from '@supabase/supabase-js'

import { getRequestUser } from '@/lib/server/auth/getRequestUser'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function findAppUser(authUserId) {
  if (!authUserId) return null

  const { data: byAuthId, error: byAuthIdError } = await adminClient
    .from('users')
    .select('*')
    .eq('auth_id', authUserId)
    .maybeSingle()

  if (!byAuthIdError && byAuthId) {
    return byAuthId
  }

  const { data: byId, error: byIdError } = await adminClient
    .from('users')
    .select('*')
    .eq('id', authUserId)
    .maybeSingle()

  if (!byIdError && byId) {
    return byId
  }

  return null
}

export async function getRequestAppUser() {
  const authResult = await getRequestUser()

  if (!authResult.user) {
    return {
      authUser: null,
      appUser: null,
      error: authResult.error || 'Authentication required',
      status: authResult.status || 401,
    }
  }

  const appUser = await findAppUser(authResult.user.id)

  if (!appUser) {
    return {
      authUser: authResult.user,
      appUser: null,
      error: 'User not found',
      status: 404,
    }
  }

  return {
    authUser: authResult.user,
    appUser,
    error: null,
    status: 200,
  }
}