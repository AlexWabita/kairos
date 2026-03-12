/**
 * KAIROS — Bible Chapter API Route
 *
 * GET /api/bible/chapter?book=JHN&chapter=3&translation=WEB
 *
 * Returns:
 * {
 *   success: true,
 *   reference: "John 3",
 *   verses: [{ number: 1, text: "..." }],
 *   translation: "WEB",
 *   source: "bible-api.com"
 * }
 *
 * Errors:
 *   400 — missing/invalid params
 *   500 — both providers failed
 */

import { NextResponse } from "next/server"
import { fetchChapter, BIBLE_BOOKS } from "@/lib/bible/client"

const VALID_TRANSLATIONS = ["WEB", "KJV", "ASV", "BBE"]

export async function GET(request) {
  const { searchParams } = new URL(request.url)

  const book        = searchParams.get("book")?.toUpperCase().trim()
  const chapterRaw  = searchParams.get("chapter")
  const translation = searchParams.get("translation")?.toUpperCase().trim() || "WEB"

  // ── Validate: book ─────────────────────────────────────────
  if (!book) {
    return NextResponse.json(
      { success: false, error: "Missing required parameter: book" },
      { status: 400 }
    )
  }

  const bookEntry = BIBLE_BOOKS.find(b => b.id === book)
  if (!bookEntry) {
    return NextResponse.json(
      { success: false, error: `Unknown book ID: "${book}". Use standard abbreviations e.g. GEN, JHN, REV.` },
      { status: 400 }
    )
  }

  // ── Validate: chapter ──────────────────────────────────────
  if (!chapterRaw) {
    return NextResponse.json(
      { success: false, error: "Missing required parameter: chapter" },
      { status: 400 }
    )
  }

  const chapter = parseInt(chapterRaw, 10)
  if (isNaN(chapter) || chapter < 1 || chapter > bookEntry.chapters) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid chapter: "${chapterRaw}". ${bookEntry.name} has ${bookEntry.chapters} chapter${bookEntry.chapters === 1 ? "" : "s"}.`,
      },
      { status: 400 }
    )
  }

  // ── Validate: translation ──────────────────────────────────
  if (!VALID_TRANSLATIONS.includes(translation)) {
    return NextResponse.json(
      {
        success: false,
        error: `Unknown translation: "${translation}". Valid options: ${VALID_TRANSLATIONS.join(", ")}.`,
      },
      { status: 400 }
    )
  }

  // ── Fetch ──────────────────────────────────────────────────
  try {
    const result = await fetchChapter(book, chapter, translation)

    return NextResponse.json({
      success:     true,
      reference:   result.reference,
      verses:      result.verses,
      translation: result.translation,
      source:      result.source,
    })
  } catch (error) {
    console.error(`[Kairos API] /api/bible/chapter failed — ${book} ${chapter} (${translation}): ${error.message}`)

    return NextResponse.json(
      {
        success: false,
        error:   error.message || "Could not load chapter. Please try again.",
      },
      { status: 500 }
    )
  }
}