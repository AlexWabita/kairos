/**
 * KAIROS — Bible Verse API Route
 * GET /api/bible/verse?ref=John+3:16&translation=WEB
 * GET /api/bible/verse?search=love+your+enemies&translation=WEB
 */

import { NextResponse } from "next/server"
import { fetchVerse, searchBible } from "@/lib/bible/client"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const ref         = searchParams.get("ref")
    const search      = searchParams.get("search")
    const translation = searchParams.get("translation") || "WEB"

    // ── Verse lookup ─────────────────────────────────────────
    if (ref) {
      const result = await fetchVerse(ref, translation)
      return NextResponse.json({ success: true, ...result })
    }

    // ── Keyword search ────────────────────────────────────────
    if (search) {
      const results = await searchBible(search, translation)
      return NextResponse.json({ success: true, results, translation })
    }

    return NextResponse.json(
      { error: "Provide either ?ref=John+3:16 or ?search=your+query" },
      { status: 400 }
    )

  } catch (error) {
    console.error("[Kairos Bible API]", error.message)
    return NextResponse.json(
      { error: error.message || "Could not retrieve verse" },
      { status: 500 }
    )
  }
}