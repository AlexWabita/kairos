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

    const exportData = {
      exported_at: new Date().toISOString(),
      kairos_export: true,
      version: '1.0',
      profile: {
        display_name: appUser.display_name || null,
        background_faith: appUser.background_faith || null,
        background_culture: appUser.background_culture || null,
        current_life_season: appUser.current_life_season || null,
        primary_need: appUser.primary_need || null,
        member_since: appUser.created_at,
      },
      saved_moments: (entries || []).map((entry) => ({
        title: entry.title || 'Untitled moment',
        content: entry.content,
        scripture: entry.scripture_ref || null,
        type: entry.entry_type,
        pinned: entry.is_pinned,
        saved_at: entry.created_at,
      })),
      summary: {
        total_saved_moments: (entries || []).length,
        pinned_moments: (entries || []).filter((entry) => entry.is_pinned).length,
      },
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="kairos-export-${Date.now()}.json"`,
      },
    })
  } catch (error) {
    console.error('[Kairos Export] Error:', error.message)
    return serverError('Export failed')
  }
}