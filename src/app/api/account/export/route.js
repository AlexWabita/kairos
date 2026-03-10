/**
 * KAIROS — Data Export Route
 * GET /api/account/export
 *
 * Returns a complete JSON export of the authenticated user's data.
 * Includes profile, saved journey entries, and account metadata.
 */

import { NextResponse }   from "next/server"
import { createClient }   from "@supabase/supabase-js"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  try {
    // ── Get userId from query param, verified against DB ────
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    // ── Verify user exists and is not anonymous ──────────────
    const { data: profile, error: profileError } = await adminClient
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (profile.is_anonymous) {
      return NextResponse.json({ error: "Anonymous users cannot export data" }, { status: 403 })
    }

    // ── Fetch journey entries ────────────────────────────────
    const { data: entries } = await adminClient
      .from("journey_entries")
      .select("id, title, content, scripture_ref, entry_type, is_pinned, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // ── Build export payload ─────────────────────────────────
    const exportData = {
      exported_at:   new Date().toISOString(),
      kairos_export: true,
      version:       "1.0",
      profile: {
        display_name:        profile.display_name     || null,
        background_faith:    profile.background_faith  || null,
        background_culture:  profile.background_culture || null,
        current_life_season: profile.current_life_season || null,
        primary_need:        profile.primary_need      || null,
        member_since:        profile.created_at,
      },
      saved_moments: (entries || []).map(e => ({
        title:        e.title        || "Untitled moment",
        content:      e.content,
        scripture:    e.scripture_ref || null,
        type:         e.entry_type,
        pinned:       e.is_pinned,
        saved_at:     e.created_at,
      })),
      summary: {
        total_saved_moments: (entries || []).length,
        pinned_moments:      (entries || []).filter(e => e.is_pinned).length,
      },
    }

    // ── Return as downloadable JSON file ─────────────────────
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status:  200,
      headers: {
        "Content-Type":        "application/json",
        "Content-Disposition": `attachment; filename="kairos-export-${Date.now()}.json"`,
      },
    })

  } catch (error) {
    console.error("[Kairos Export] Error:", error.message)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}