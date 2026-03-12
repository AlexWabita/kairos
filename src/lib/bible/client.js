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
const TRANSLATION_IDS = {
  WEB: "9879dbb7cfe39e4d-01",
  KJV: "de4e12af7f28f599-02",
  ASV: "685d1470fe4d5c3b-01",
  BBE: "40072c4a5ade2ef3-01",
}

const DEFAULT_TRANSLATION = "WEB"

// ── BIBLE BOOKS (66) ──────────────────────────────────────────
// Hardcoded — 66 books never change; eliminates API plan risk.
// `id` matches rest.api.bible passage IDs and BIBLE_API_COM_NAMES keys.
export const BIBLE_BOOKS = [
  // ── Old Testament (39) ────────────────────────────────────
  { id: "GEN", name: "Genesis",          chapters: 50,  testament: "OT" },
  { id: "EXO", name: "Exodus",           chapters: 40,  testament: "OT" },
  { id: "LEV", name: "Leviticus",        chapters: 27,  testament: "OT" },
  { id: "NUM", name: "Numbers",          chapters: 36,  testament: "OT" },
  { id: "DEU", name: "Deuteronomy",      chapters: 34,  testament: "OT" },
  { id: "JOS", name: "Joshua",           chapters: 24,  testament: "OT" },
  { id: "JDG", name: "Judges",           chapters: 21,  testament: "OT" },
  { id: "RUT", name: "Ruth",             chapters: 4,   testament: "OT" },
  { id: "1SA", name: "1 Samuel",         chapters: 31,  testament: "OT" },
  { id: "2SA", name: "2 Samuel",         chapters: 24,  testament: "OT" },
  { id: "1KI", name: "1 Kings",          chapters: 22,  testament: "OT" },
  { id: "2KI", name: "2 Kings",          chapters: 25,  testament: "OT" },
  { id: "1CH", name: "1 Chronicles",     chapters: 29,  testament: "OT" },
  { id: "2CH", name: "2 Chronicles",     chapters: 36,  testament: "OT" },
  { id: "EZR", name: "Ezra",             chapters: 10,  testament: "OT" },
  { id: "NEH", name: "Nehemiah",         chapters: 13,  testament: "OT" },
  { id: "EST", name: "Esther",           chapters: 10,  testament: "OT" },
  { id: "JOB", name: "Job",              chapters: 42,  testament: "OT" },
  { id: "PSA", name: "Psalms",           chapters: 150, testament: "OT" },
  { id: "PRO", name: "Proverbs",         chapters: 31,  testament: "OT" },
  { id: "ECC", name: "Ecclesiastes",     chapters: 12,  testament: "OT" },
  { id: "SNG", name: "Song of Solomon",  chapters: 8,   testament: "OT" },
  { id: "ISA", name: "Isaiah",           chapters: 66,  testament: "OT" },
  { id: "JER", name: "Jeremiah",         chapters: 52,  testament: "OT" },
  { id: "LAM", name: "Lamentations",     chapters: 5,   testament: "OT" },
  { id: "EZK", name: "Ezekiel",          chapters: 48,  testament: "OT" },
  { id: "DAN", name: "Daniel",           chapters: 12,  testament: "OT" },
  { id: "HOS", name: "Hosea",            chapters: 14,  testament: "OT" },
  { id: "JOL", name: "Joel",             chapters: 3,   testament: "OT" },
  { id: "AMO", name: "Amos",             chapters: 9,   testament: "OT" },
  { id: "OBA", name: "Obadiah",          chapters: 1,   testament: "OT" },
  { id: "JON", name: "Jonah",            chapters: 4,   testament: "OT" },
  { id: "MIC", name: "Micah",            chapters: 7,   testament: "OT" },
  { id: "NAH", name: "Nahum",            chapters: 3,   testament: "OT" },
  { id: "HAB", name: "Habakkuk",         chapters: 3,   testament: "OT" },
  { id: "ZEP", name: "Zephaniah",        chapters: 3,   testament: "OT" },
  { id: "HAG", name: "Haggai",           chapters: 2,   testament: "OT" },
  { id: "ZEC", name: "Zechariah",        chapters: 14,  testament: "OT" },
  { id: "MAL", name: "Malachi",          chapters: 4,   testament: "OT" },
  // ── New Testament (27) ────────────────────────────────────
  { id: "MAT", name: "Matthew",          chapters: 28,  testament: "NT" },
  { id: "MRK", name: "Mark",             chapters: 16,  testament: "NT" },
  { id: "LUK", name: "Luke",             chapters: 24,  testament: "NT" },
  { id: "JHN", name: "John",             chapters: 21,  testament: "NT" },
  { id: "ACT", name: "Acts",             chapters: 28,  testament: "NT" },
  { id: "ROM", name: "Romans",           chapters: 16,  testament: "NT" },
  { id: "1CO", name: "1 Corinthians",    chapters: 16,  testament: "NT" },
  { id: "2CO", name: "2 Corinthians",    chapters: 13,  testament: "NT" },
  { id: "GAL", name: "Galatians",        chapters: 6,   testament: "NT" },
  { id: "EPH", name: "Ephesians",        chapters: 6,   testament: "NT" },
  { id: "PHP", name: "Philippians",      chapters: 4,   testament: "NT" },
  { id: "COL", name: "Colossians",       chapters: 4,   testament: "NT" },
  { id: "1TH", name: "1 Thessalonians",  chapters: 5,   testament: "NT" },
  { id: "2TH", name: "2 Thessalonians",  chapters: 3,   testament: "NT" },
  { id: "1TI", name: "1 Timothy",        chapters: 6,   testament: "NT" },
  { id: "2TI", name: "2 Timothy",        chapters: 4,   testament: "NT" },
  { id: "TIT", name: "Titus",            chapters: 3,   testament: "NT" },
  { id: "PHM", name: "Philemon",         chapters: 1,   testament: "NT" },
  { id: "HEB", name: "Hebrews",          chapters: 13,  testament: "NT" },
  { id: "JAS", name: "James",            chapters: 5,   testament: "NT" },
  { id: "1PE", name: "1 Peter",          chapters: 5,   testament: "NT" },
  { id: "2PE", name: "2 Peter",          chapters: 3,   testament: "NT" },
  { id: "1JN", name: "1 John",           chapters: 5,   testament: "NT" },
  { id: "2JN", name: "2 John",           chapters: 1,   testament: "NT" },
  { id: "3JN", name: "3 John",           chapters: 1,   testament: "NT" },
  { id: "JUD", name: "Jude",             chapters: 1,   testament: "NT" },
  { id: "REV", name: "Revelation",       chapters: 22,  testament: "NT" },
]

// ── BIBLE-API.COM BOOK NAME MAP ───────────────────────────────
// Maps book IDs → URL-safe names used by bible-api.com
// e.g. fetchChapter("SNG", 1) → "song+of+solomon+1"
export const BIBLE_API_COM_NAMES = {
  GEN: "genesis",        EXO: "exodus",          LEV: "leviticus",
  NUM: "numbers",        DEU: "deuteronomy",      JOS: "joshua",
  JDG: "judges",         RUT: "ruth",             "1SA": "1+samuel",
  "2SA": "2+samuel",     "1KI": "1+kings",        "2KI": "2+kings",
  "1CH": "1+chronicles", "2CH": "2+chronicles",   EZR: "ezra",
  NEH: "nehemiah",       EST: "esther",           JOB: "job",
  PSA: "psalms",         PRO: "proverbs",         ECC: "ecclesiastes",
  SNG: "song+of+solomon",ISA: "isaiah",           JER: "jeremiah",
  LAM: "lamentations",   EZK: "ezekiel",          DAN: "daniel",
  HOS: "hosea",          JOL: "joel",             AMO: "amos",
  OBA: "obadiah",        JON: "jonah",            MIC: "micah",
  NAH: "nahum",          HAB: "habakkuk",         ZEP: "zephaniah",
  HAG: "haggai",         ZEC: "zechariah",        MAL: "malachi",
  MAT: "matthew",        MRK: "mark",             LUK: "luke",
  JHN: "john",           ACT: "acts",             ROM: "romans",
  "1CO": "1+corinthians","2CO": "2+corinthians",  GAL: "galatians",
  EPH: "ephesians",      PHP: "philippians",      COL: "colossians",
  "1TH": "1+thessalonians","2TH": "2+thessalonians",
  "1TI": "1+timothy",    "2TI": "2+timothy",      TIT: "titus",
  PHM: "philemon",       HEB: "hebrews",          JAS: "james",
  "1PE": "1+peter",      "2PE": "2+peter",        "1JN": "1+john",
  "2JN": "2+john",       "3JN": "3+john",         JUD: "jude",
  REV: "revelation",
}

// ── FETCH CHAPTER ─────────────────────────────────────────────
// Primary: bible-api.com (returns clean verse array)
// Fallback: rest.api.bible passage endpoint (returns text blob → parsed)
//
// Returns: { reference, verses: [{number, text}], translation, source }

export async function fetchChapter(bookId, chapter, translation = DEFAULT_TRANSLATION) {
  const book = BIBLE_BOOKS.find(b => b.id === bookId)
  if (!book) throw new Error(`Unknown book ID: ${bookId}`)

  // ── Primary: bible-api.com ───────────────────────────────
  try {
    const result = await fetchChapterFromBibleApiCom(book, chapter, translation)
    console.log(`[Kairos Bible] ✓ chapter bible-api.com — ${result.reference}`)
    return result
  } catch (err) {
    console.warn(`[Kairos Bible] bible-api.com chapter failed: ${err.message} — trying rest.api.bible`)
  }

  // ── Fallback: rest.api.bible passage endpoint ────────────
  try {
    const result = await fetchChapterFromScriptureApi(book, chapter, translation)
    console.log(`[Kairos Bible] ✓ chapter rest.api.bible — ${result.reference}`)
    return result
  } catch (err) {
    console.error(`[Kairos Bible] Both providers failed for ${book.name} ${chapter}`)
    throw new Error(`Could not load ${book.name} chapter ${chapter}. Please try again.`)
  }
}

async function fetchChapterFromBibleApiCom(book, chapter, translation) {
  const translationMap = { WEB: "web", KJV: "kjv", ASV: "asv", BBE: "bbe" }
  const t    = translationMap[translation] || "web"
  const name = BIBLE_API_COM_NAMES[book.id]
  if (!name) throw new Error(`No bible-api.com name for book: ${book.id}`)

  const url      = `https://bible-api.com/${name}+${chapter}?translation=${t}`
  const response = await fetch(url)
  const data     = await response.json()

  if (!response.ok || data.error) throw new Error(data.error || `HTTP ${response.status}`)
  if (!data.verses || data.verses.length === 0) throw new Error("No verses returned")

  const verses = data.verses.map(v => ({
    number: v.verse,
    text:   v.text.trim().replace(/\n/g, " "),
  }))

  return {
    reference:   `${book.name} ${chapter}`,
    verses,
    translation,
    source: "bible-api.com",
  }
}

async function fetchChapterFromScriptureApi(book, chapter, translation) {
  const apiKey = process.env.SCRIPTURE_API_KEY
  if (!apiKey) throw new Error("SCRIPTURE_API_KEY not set in .env.local")

  const bibleId   = TRANSLATION_IDS[translation] || TRANSLATION_IDS[DEFAULT_TRANSLATION]
  const passageId = `${book.id}.${chapter}`

  const res  = await fetch(
    `${BASE_URL}/bibles/${bibleId}/chapters/${passageId}/verses`,
    { headers: { "api-key": apiKey } }
  )
  const data = await res.json()

  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`)

  const verseList = data?.data || []
  if (verseList.length === 0) throw new Error("No verses returned")

  // Fetch each verse text — rest.api.bible /verses endpoint returns metadata only
  // so we parse what we can from the id field and fetch the passage blob as backup
  const passageRes  = await fetch(
    `${BASE_URL}/bibles/${bibleId}/passages/${passageId}?content-type=text`,
    { headers: { "api-key": apiKey } }
  )
  const passageData = await passageRes.json()

  if (!passageRes.ok || !passageData?.data?.content) {
    throw new Error(passageData?.message || "No passage content returned")
  }

  const verses = parseVerseText(passageData.data.content, verseList.length)

  return {
    reference:   `${book.name} ${chapter}`,
    verses,
    translation,
    source: "rest.api.bible",
  }
}

// ── PARSE VERSE TEXT ──────────────────────────────────────────
// Parses rest.api.bible plain-text chapter blob into verse array.
// The blob typically looks like:  "1 In the beginning... 2 And the..."
// Returns: [{number, text}]
function parseVerseText(rawText, verseCount) {
  const cleaned = stripHtml(rawText)
  const verses  = []

  // Split on verse numbers (a digit or digits at a word boundary)
  const parts = cleaned.split(/(?=\b\d{1,3}\b\s)/)

  for (const part of parts) {
    const match = part.match(/^(\d{1,3})\s+(.+)/)
    if (match) {
      const num  = parseInt(match[1], 10)
      const text = match[2].trim()
      if (num >= 1 && num <= (verseCount || 999) && text.length > 0) {
        verses.push({ number: num, text })
      }
    }
  }

  // If parsing produced nothing useful, return the whole blob as verse 1
  if (verses.length === 0) {
    return [{ number: 1, text: cleaned.trim() }]
  }

  return verses
}

// ── REST.API.BIBLE ────────────────────────────────────────────
async function fetchFromScriptureApi(reference, translation = DEFAULT_TRANSLATION) {
  const apiKey  = process.env.SCRIPTURE_API_KEY
  if (!apiKey) throw new Error("SCRIPTURE_API_KEY not set in .env.local")

  const bibleId = TRANSLATION_IDS[translation] || TRANSLATION_IDS[DEFAULT_TRANSLATION]
  const encoded = encodeURIComponent(reference)

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

// ── BIBLE-API.COM (FALLBACK FOR VERSES) ──────────────────────
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
  try {
    const result = await fetchFromScriptureApi(reference, translation)
    console.log(`[Kairos Bible] ✓ rest.api.bible — ${result.reference}`)
    return result
  } catch (error) {
    console.warn(`[Kairos Bible] rest.api.bible failed: ${error.message} — trying fallback`)
  }

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
    { code: "WEB", name: "World English Bible",       description: "Modern English, public domain" },
    { code: "KJV", name: "King James Version",        description: "Classic, traditional" },
    { code: "ASV", name: "American Standard Version", description: "Accurate, formal" },
    { code: "BBE", name: "Bible in Basic English",    description: "Simple, accessible" },
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