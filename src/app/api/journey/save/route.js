import { createClient } from '@supabase/supabase-js'
import { NextResponse }  from 'next/server'

// Use service role — bypasses cookie session, verifies user directly in DB
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { content, title, scripture_ref, conversation_id, userId } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify this is a real, non-anonymous user in our DB
    const { data: user, error: userError } = await admin
      .from('users')
      .select('id, is_anonymous')
      .eq('id', userId)
      .maybeSingle()

    if (userError || !user || user.is_anonymous) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data, error } = await admin
      .from('journey_entries')
      .insert({
        user_id:         userId,
        conversation_id: conversation_id || null,
        entry_type: 'reflection',
        content,
        title:           title || null,
        scripture_ref:   scripture_ref || null,
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, id: data.id })

  } catch (err) {
    console.error('[Journey Save]', err.message)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}