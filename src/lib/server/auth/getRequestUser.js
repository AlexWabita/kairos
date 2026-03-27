import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getRequestUser() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      error: 'Authentication required',
      status: 401,
    }
  }

  return {
    user,
    error: null,
    status: 200,
  }
}