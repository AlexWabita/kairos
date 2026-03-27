
/**
 * KAIROS — Data Export Route
 * GET /api/account/export
 *
 * Returns a complete JSON export of the authenticated user's data.
 * Includes profile, saved journey entries, and account metadata.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { requireRequestAppUser } from '@/lib/server/auth/requireRequestAppUser'
import { forbidden, serverError } from '@/lib/server/http/responses'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    const { appUser, response } = await requireRequestAppUser()

    if (response) {
      return response
    }

    if (appUser.is_anonymous) {
      return forbidden('Anonymous users cannot export data')
    }

    const { data: entries, error: entriesError } = await adminClient
      .from('journey_entries')
      .select(
        'id, title, content, scripture_ref, entry_type, is_pinned, created_at'
      )
      .eq('user_id', appUser.id)
      .order('created_at', { ascending: false })

    if (entriesError) {
      throw entriesError
    }

    declare interface exportDataType {}
