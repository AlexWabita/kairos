import { createClient } from '@supabase/supabase-js'

import { requireRequestAppUser } from '@/lib/server/auth/requireRequestAppUser'
import {
  badRequest,
  ok,
  serverError,
} from '@/lib/server/http/responses'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─────────────────────────────────────────────────────────────
// GET /api/user/journey
// Returns user's journey entries (paginated)
// ─────────────────────────────────────────────────────────────
export async function GET(req) {
  try {
    const { appUser, response } = await requireRequestAppUser()

    if (response) return response

    if (!appUser || appUser.is_anonymous) {
      return badRequest('Authenticated user required')
    }

    const { searchParams } = new URL(req.url)

    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50)
    const offset = parseInt(searchParams.get('offset')) || 0

    const { data, error, count } = await admin
      .from('journey_entries')
      .select(
        `
        id,
        title,
        content,
        entry_type,
        scripture_ref,
        created_at
        `,
        { count: 'exact' }
      )
      .eq('user_id', appUser.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return ok({
      success: true,
      entries: data || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (err) {
    console.error('[User Journey GET]', err.message)
    return serverError('Failed to fetch journey entries')
  }
}