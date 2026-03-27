import { NextResponse } from 'next/server'

import { getRequestAppUser } from '@/lib/server/auth/getRequestAppUser'

export async function requireRequestAppUser() {
  const result = await getRequestAppUser()

  if (!result.appUser) {
    return {
      authUser: result.authUser || null,
      appUser: null,
      response: NextResponse.json(
        { error: result.error || 'Authentication required' },
        { status: result.status || 401 }
      ),
    }
  }

  return {
    authUser: result.authUser,
    appUser: result.appUser,
    response: null,
  }
}