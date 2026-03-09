/**
 * KAIROS — Bible API Dual Fallback Client
 *
 * Provider 1: rest.api.bible — full search, 2500+ translations
 * Provider 2: bible-api.com — no auth, always available, KJV/WEB
 *
 * Flow:
 *   1. Try rest.api.bible
 *   2. If it fails → automatically fall back to bible-api.com
 *   3. All failures logged to terminal — never shown to users
 *
 * Server-side only. API keys never reach the browser.
 */

const BASE_URL = "https://rest.api.bible/v1"

// ── TRANSLATION MAP ───────────────────────────────────────────
// rest.api.bible Bible IDs for common translations
const TRANSLATION_IDS = {
  WEB: "9879dbb7cfe39e4d-01", // World English Bible — default
  KJV: "de4e12af7f28f599-02", // King James Version
  ASV: "685d1470fe4d5c3b-01", // American Standard Version
  BBE: "40072c4a5ade2ef3-01", // Bible in Basic English
}

const DEFAULT_TRANSLATION = "WEB"

// ── REST.API.BIBLE ────────────────────────────────────────────
async function fetchFromScriptureApi(reference, translation = DEFAULT_TRANSLATION) {
  const apiKey  = process.env.SCRIPTURE_API_KEY
  if (!apiKey) throw new Error("SCRIPTURE_API_KEY not set in .env.local")

  const bibleId = TRANSLATION_IDS[translation] || TRANSLATION_IDS[DEFAULT_TRANSLATION]
  const encoded = encodeURIComponent(reference)

  // Try search endpoint first
  const searchRes = await fetch(
    `${BASE_URL}/bibles/${bibleId}/search?query=${encoded}&limit=1`,
    {
      headers: {
        "api-key":      apiKey,
        "Content-Type": "application/json",
      },
    }
  )

  const searchData = await searchRes.json()

  if (!searchRes.ok) {
    const reason = searchData?.message || searchData?.error || `HTTP ${searchRes.status}`
    throw new Error(reason)
  }

  const passages = searchData?.data?.passages
  if (passages && passages.length > 0) {
    return {
      reference:   passages[0].reference,
      text:        stripHtml(passages[0].content),
      translation: translation,
      source:      "rest.api.bible",
    }
  }

  // Fall back to passage endpoint if search returns nothing
  return await fetchPassageFromScriptureApi(reference, bibleId, apiKey, translation)
}

async function fetchPassageFromScriptureApi(reference, bibleId, apiKey, translation) {
  const passageId = referenceToPassageId(reference)
  if (!passageId) throw new Error(`Could not parse reference: ${reference}`)

  const res  = await fetch(
    `${BASE_URL}/bibles/${bibleId}/passages/${passageId}?content-type=text`,
    {
      headers: { "api-key": apiKey },
    }
  )

  const data = await res.json()

  if (!res.ok || !data?.data?.content) {
    const reason = data?.message || data?.error || `HTTP ${res.status}`
    throw new Error(reason)
  }

  return {
    reference:   data.data.reference,
    text:        stripHtml(data.data.content).trim(),
    translation: translation,
    source:      "rest.api.bible",
  }
}

// ── BIBLE-API.COM (FALLBACK) ──────────────────────────────────
async function fetchFromBibleApiCom(reference, translation = DEFAULT_TRANSLATION) {
  const translationMap = { WEB: "web", KJV: "kjv", ASV: "asv", BBE: "bbe" }
  const t              = translationMap[translation] || "web"
  const encoded        = encodeURIComponent(reference)

  const response = await fetch(`https://bible-api.com/${encoded}?translation=${t}`)
  const data     = await response.json()

  if (!response.ok || data.error) {
    throw new Error(data.error || `HTTP ${response.status}`)
  }

  if (!data.text) throw new Error("No text returned")

  return {
    reference:   data.reference,
    text:        data.text.trim(),
    translation: translation,
    source:      "bible-api.com",
  }
}

// ── MAIN EXPORT: FETCH VERSE ──────────────────────────────────
export async function fetchVerse(reference, translation = DEFAULT_TRANSLATION) {
  // Try rest.api.bible first
  try {
    const result = await fetchFromScriptureApi(reference, translation)
    console.log(`[Kairos Bible] ✓ rest.api.bible — ${result.reference}`)
    return result
  } catch (error) {
    console.warn(`[Kairos Bible] rest.api.bible failed: ${error.message} — trying fallback`)
  }

  // Fall back to bible-api.com
  try {
    const result = await fetchFromBibleApiCom(reference, translation)
    console.log(`[Kairos Bible] ✓ bible-api.com (fallback) — ${result.reference}`)
    return result
  } catch (error) {
    console.error(`[Kairos Bible] Both providers failed for: ${reference}`)
    throw new Error(`Could not retrieve verse: ${reference}. Please check the reference and try again.`)
  }
}

// ── SEARCH THE BIBLE ──────────────────────────────────────────
export async function searchBible(query, translation = DEFAULT_TRANSLATION) {
  const apiKey  = process.env.SCRIPTURE_API_KEY
  if (!apiKey) throw new Error("SCRIPTURE_API_KEY not set in .env.local")

  const bibleId = TRANSLATION_IDS[translation] || TRANSLATION_IDS[DEFAULT_TRANSLATION]
  const encoded = encodeURIComponent(query)

  try {
    const response = await fetch(
      `${BASE_URL}/bibles/${bibleId}/search?query=${encoded}&limit=5`,
      {
        headers: { "api-key": apiKey },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}`)
    }

    const verses = data?.data?.verses || []
    return verses.map(v => ({
      reference:   v.reference,
      text:        stripHtml(v.text),
      translation: translation,
    }))
  } catch (error) {
    console.error(`[Kairos Bible] Search failed: ${error.message}`)
    throw new Error(`Search failed for: "${query}"`)
  }
}

// ── AVAILABLE TRANSLATIONS ────────────────────────────────────
export function getAvailableTranslations() {
  return [
    { code: "WEB", name: "World English Bible",    description: "Modern English, public domain" },
    { code: "KJV", name: "King James Version",     description: "Classic, traditional" },
    { code: "ASV", name: "American Standard Version", description: "Accurate, formal" },
    { code: "BBE", name: "Bible in Basic English", description: "Simple, accessible" },
  ]
}

// ── HELPERS ───────────────────────────────────────────────────

function stripHtml(html) {
  if (!html) return ""
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function referenceToPassageId(reference) {
  const bookMap = {
    "genesis": "GEN", "exodus": "EXO", "leviticus": "LEV", "numbers": "NUM",
    "deuteronomy": "DEU", "joshua": "JOS", "judges": "JDG", "ruth": "RUT",
    "1 samuel": "1SA", "2 samuel": "2SA", "1 kings": "1KI", "2 kings": "2KI",
    "1 chronicles": "1CH", "2 chronicles": "2CH", "ezra": "EZR", "nehemiah": "NEH",
    "esther": "EST", "job": "JOB", "psalms": "PSA", "psalm": "PSA",
    "proverbs": "PRO", "ecclesiastes": "ECC", "song of solomon": "SNG",
    "isaiah": "ISA", "jeremiah": "JER", "lamentations": "LAM", "ezekiel": "EZK",
    "daniel": "DAN", "hosea": "HOS", "joel": "JOL", "amos": "AMO",
    "obadiah": "OBA", "jonah": "JON", "micah": "MIC", "nahum": "NAH",
    "habakkuk": "HAB", "zephaniah": "ZEP", "haggai": "HAG", "zechariah": "ZEC",
    "malachi": "MAL", "matthew": "MAT", "mark": "MRK", "luke": "LUK",
    "john": "JHN", "acts": "ACT", "romans": "ROM", "1 corinthians": "1CO",
    "2 corinthians": "2CO", "galatians": "GAL", "ephesians": "EPH",
    "philippians": "PHP", "colossians": "COL", "1 thessalonians": "1TH",
    "2 thessalonians": "2TH", "1 timothy": "1TI", "2 timothy": "2TI",
    "titus": "TIT", "philemon": "PHM", "hebrews": "HEB", "james": "JAS",
    "1 peter": "1PE", "2 peter": "2PE", "1 john": "1JN", "2 john": "2JN",
    "3 john": "3JN", "jude": "JUD", "revelation": "REV",
  }

  const match = reference.toLowerCase().match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/)
  if (!match) return null

  const [, book, chapter, verseStart, verseEnd] = match
  const bookCode = bookMap[book.trim()]
  if (!bookCode) return null

  if (verseStart && verseEnd) return `${bookCode}.${chapter}.${verseStart}-${bookCode}.${chapter}.${verseEnd}`
  if (verseStart) return `${bookCode}.${chapter}.${verseStart}`
  return `${bookCode}.${chapter}`
}