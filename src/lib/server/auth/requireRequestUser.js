import { NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/server/auth/getRequestUser'

export async function requireRequestUser() {
  const result = await getRequestUser()

  if (!result.user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: result.error || 'Authentication required' },
        { status: result.status || 401 }
      ),
    }
  }

  return {
    user: result.user,
    response: null,
  }
}