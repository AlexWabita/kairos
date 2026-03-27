import { createClient } from '@supabase/supabase-js'

import { requireRequestAppUser } from '@/lib/server/auth/requireRequestAppUser'
import {
  badRequest,
  ok,
  serverError,
  unauthorized,
} from '@/lib/server/http/responses'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const VALID_ENTRY_TYPES = [
  'reflection',
  'prayer',
  'milestone',
  'question',
  'scripture',
]

export async function POST(req) {
  try {
    const { appUser, response } = await requireRequestAppUser()

    if (response) {
      return response
    }

    const body = await req.json()

    const content =
      typeof body.content === 'string' ? body.content.trim() : ''

    const title =
      typeof body.title === 'string' && body.title.trim().length > 0
        ? body.title.trim()
        : null

    const scriptureRef =
      typeof body.scripture_ref === 'string' && body.scripture_ref.trim().length > 0
        ? body.scripture_ref.trim()
        : null

    const conversationId =
      typeof body.conversation_id === 'string' && body.conversation_id.trim().length > 0
        ? body.conversation_id.trim()
        : null

    const safeType = VALID_ENTRY_TYPES.includes(body.entry_type)
      ? body.entry_type
      : 'reflection'

    if (!content) {
      return badRequest('Content is required')
    }

    if (appUser.is_anonymous) {
      return unauthorized('Authentication required')
    }

    const { data, error } = await admin
      .from('journey_entries')
      .insert({
        user_id: appUser.id,
        conversation_id: conversationId,
        entry_type: safeType,
        content,
        title,
        scripture_ref: scriptureRef,
      })
      .select('id')
      .single()

    if (error) {
      throw error
    }

    return ok({ success: true, id: data.id })
  } catch (err) {
    console.error('[Journey Save]', err.message)
    return serverError('Failed to save')
  }
}