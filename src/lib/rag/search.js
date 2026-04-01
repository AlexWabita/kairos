/**
 * KAIROS — RAG Search Module
 *
 * Searches the knowledge base using vector similarity plus optional
 * metadata pre-filtering by audience and conversation mode.
 *
 * Flow:
 *   1. Classify the message to infer audience hint and mode hint
 *   2. Generate query embedding from user message (Jina AI, 768-dim)
 *   3. Call match_knowledge_base() with optional metadata filters
 *   4. Format results into a prompt context block
 *   5. Inject into system prompt before AI call
 *
 * Server-side only.
 */

import { createClient }          from "@supabase/supabase-js"
import { generateQueryEmbedding } from "./embeddings"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/* ── Message classification ─────────────────────────────────────────────────
 *
 * Lightweight heuristic classifiers that infer audience and mode hints
 * from the message text. These are optional hints — they narrow the search
 * without blocking results when no hint is detected.
 *
 * Design principle: err toward no filter rather than wrong filter.
 * If classification is uncertain, return null and let vector similarity
 * handle everything. A wrong filter is worse than no filter.
 */

/**
 * Infer a mode hint from the message.
 * Returns a small array of likely modes, or null if unclear.
 *
 * @param {string} message
 * @returns {string[]|null}
 */
function inferModeHint(message) {
  const text = message.toLowerCase()

  // LAMENT — deep grief, crying out, loss, "where is God"
  const lamentPatterns = [
    /where is god/i, /god doesn.t care/i, /god abandoned/i, /god is unfair/i,
    /why did (god|this) (let|allow|happen)/i, /i (lost|lost my)/i,
    /\b(died|dead|death|dying|grief|grieving|mourning)\b/i,
    /i can.t feel (anything|god)/i, /god feels (absent|distant|silent|gone)/i,
  ]
  if (lamentPatterns.some(p => p.test(text))) return ["LAMENT", "PASTORAL"]

  // APOLOGETICS — doubt, philosophical challenge, "is it true"
  const apologeticsPatterns = [
    /\b(prove|proof|evidence|real|exist|true|false)\b/i,
    /\b(doubt|doubting|skeptic|atheist|agnostic|science)\b/i,
    /why (should i|would anyone|do you) believe/i,
    /\b(evolution|bible (wrong|reliable|accurate)|contradiction)\b/i,
    /how (can|could) (god|christianity|the bible)/i,
    /i don.t (know if|think) (god|this) is real/i,
  ]
  if (apologeticsPatterns.some(p => p.test(text))) return ["APOLOGETICS", "CLARITY"]

  // FORMATION — growth, change, discipline, habits
  const formationPatterns = [
    /how (do i|can i|should i) (grow|change|become|pray|read|fast)/i,
    /\b(discipline|habit|accountability|sanctif|holiness|obedien)\b/i,
    /i keep (doing|sinning|falling|struggling with)/i,
    /want to (be better|grow|change|stop|overcome)/i,
    /\b(repent|confess|forgive myself|rule of life)\b/i,
  ]
  if (formationPatterns.some(p => p.test(text))) return ["FORMATION", "PASTORAL"]

  // COURAGE — hard conversations, decisions, forgiveness of others
  const couragePatterns = [
    /\b(forgive|forgiving|forgiveness)\b/i,
    /hard (conversation|talk|discussion)/i,
    /\b(confess|apologise|apolog|reconcile)\b/i,
    /need to (tell|confront|face|talk to)/i,
    /\b(leaving|quitting|standing up|boundary|boundaries)\b/i,
  ]
  if (couragePatterns.some(p => p.test(text))) return ["COURAGE", "PASTORAL"]

  // RELEASE — letting go, unsent letters, closure
  const releasePatterns = [
    /let(ting)? go/i, /can.t (move on|get over|forget)/i,
    /letter (to|for)/i, /closure/i,
    /\b(haunting|haunted|past|what if|regret)\b/i,
  ]
  if (releasePatterns.some(p => p.test(text))) return ["RELEASE", "PASTORAL"]

  // PASTORAL — pain, anxiety, fear, loneliness (broad default for emotional messages)
  const pastoralPatterns = [
    /\b(anxious|anxiety|afraid|fear|scared|lonely|alone|empty|numb)\b/i,
    /\b(depressed|depression|sad|hopeless|worthless|tired|exhausted)\b/i,
    /i (feel|am) (so |really )?(broken|lost|stuck|overwhelmed|hurt)/i,
    /don.t (know what to do|know how|understand why)/i,
  ]
  if (pastoralPatterns.some(p => p.test(text))) return ["PASTORAL"]

  return null
}

/**
 * Infer an audience hint from the message.
 * Returns an audience array for filtering, or null if unclear.
 *
 * @param {string} message
 * @returns {string[]|null}
 */
function inferAudienceHint(message) {
  const text = message.toLowerCase()

  // Seeker / non-believer signals
  const seekerPatterns = [
    /\b(i don.t believe|not sure (i|if) believe|never (believed|been christian))\b/i,
    /\b(atheist|agnostic|no (faith|religion)|grew up (without|not))\b/i,
    /\b(trying to (understand|figure out|explore) (faith|christianity|god))\b/i,
  ]
  if (seekerPatterns.some(p => p.test(text))) return ["anyone", "seeker"]

  // New believer signals
  const newBelieverPatterns = [
    /\b(just (became|started|gave my life|accepted|committed))\b/i,
    /\b(new (christian|believer|to faith)|recently (saved|baptised|baptized))\b/i,
    /\b(first time (praying|reading the bible|going to church))\b/i,
  ]
  if (newBelieverPatterns.some(p => p.test(text))) return ["anyone", "new_believer"]

  // Advanced / mature signals
  const maturePatterns = [
    /\b(years? (of faith|as a christian|in ministry|following (god|christ)))\b/i,
    /\b(contemplat|mystical|dark night|spiritual director|discernment)\b/i,
    /\b(theology|theological|hermeneutic|eschatolog|soteriology)\b/i,
  ]
  if (maturePatterns.some(p => p.test(text))) return ["growing", "mature"]

  // Default: no restriction — anyone
  return null
}

/* ── Substantive message check ──────────────────────────────────────────────*/

/**
 * Determine if a message is substantive enough to warrant a RAG search.
 * Skips greetings, one-liners, and very short acknowledgements.
 *
 * @param {string} message
 * @returns {boolean}
 */
export function isSubstantiveMessage(message) {
  if (!message || typeof message !== "string") return false

  const trimmed   = message.trim()
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length

  if (wordCount < 4) return false

  const greetings = /^(hi|hello|hey|ok|okay|yes|no|sure|thanks|thank you|great|good|got it|i see|alright|sounds good|perfect|awesome)[\s!.]*$/i
  if (greetings.test(trimmed)) return false

  return true
}

/* ── Main search function ───────────────────────────────────────────────────*/

/**
 * Search the knowledge base for content relevant to the user's message.
 * Returns formatted context string ready for prompt injection, or null.
 *
 * Uses lightweight heuristic classification to narrow results by audience
 * and mode before vector similarity runs. Falls back gracefully at every step.
 *
 * @param {string}   message          — the user's message
 * @param {object}   [options]
 * @param {string[]} [options.modeHint]     — override mode filter (from caller)
 * @param {string[]} [options.audienceHint] — override audience filter (from caller)
 * @returns {string|null}
 */
export async function searchKnowledgeBase(message, options = {}) {
  if (!isSubstantiveMessage(message)) return null

  try {
    const embedding = await generateQueryEmbedding(message)

    // Use caller-provided hints, or classify from message text
    const modeHint     = options.modeHint     ?? inferModeHint(message)
    const audienceHint = options.audienceHint ?? inferAudienceHint(message)

    const { data, error } = await supabase.rpc("match_knowledge_base", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count:     3,
      filter_audience: audienceHint || null,
      filter_mode:     modeHint     || null,
    })

    // If filtered search returned nothing, retry without filters
    // This ensures a response is always possible when content exists
    if (!error && (!data || data.length === 0) && (modeHint || audienceHint)) {
      console.log("[Kairos RAG] No results with filters — retrying without")
      const { data: fallbackData, error: fallbackError } = await supabase.rpc(
        "match_knowledge_base",
        {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count:     3,
          filter_audience: null,
          filter_mode:     null,
        }
      )

      if (fallbackError) {
        console.error("[Kairos RAG] Fallback search error:", fallbackError.message)
        return null
      }

      if (!fallbackData || fallbackData.length === 0) {
        console.log("[Kairos RAG] No relevant knowledge found")
        return null
      }

      console.log(
        `[Kairos RAG] Fallback found ${fallbackData.length} entries ` +
        `(top similarity: ${fallbackData[0].similarity.toFixed(3)})`
      )
      return formatKnowledgeContext(fallbackData)
    }

    if (error) {
      console.error("[Kairos RAG] Search error:", error.message)
      return null
    }

    if (!data || data.length === 0) {
      console.log("[Kairos RAG] No relevant knowledge found")
      return null
    }

    const filterSummary = [
      modeHint     ? `mode:${modeHint.join(",")}` : null,
      audienceHint ? `audience:${audienceHint.join(",")}` : null,
    ].filter(Boolean).join(" ") || "no filters"

    console.log(
      `[Kairos RAG] Found ${data.length} entries (${filterSummary}) ` +
      `(top similarity: ${data[0].similarity.toFixed(3)})`
    )

    return formatKnowledgeContext(data)

  } catch (err) {
    console.error("[Kairos RAG] Failed silently:", err.message)
    return null
  }
}

/* ── Format results ─────────────────────────────────────────────────────────*/

/**
 * Format knowledge base results into a clear prompt context block.
 *
 * @param {Array} entries — matched knowledge base entries
 * @returns {string}
 */
function formatKnowledgeContext(entries) {
  const formatted = entries.map((entry, i) => {
    let block = `[${i + 1}] ${entry.title}`
    if (entry.category)      block += ` (${entry.category})`
    if (entry.scripture_ref) block += `\nScripture: ${entry.scripture_ref}`
    block += `\n${entry.content}`
    return block
  }).join("\n\n")

  return `
KNOWLEDGE BASE — VERIFIED CONTEXT:
The following has been retrieved from Kairos' curated knowledge base.
Draw from this naturally in your response. Do not quote it verbatim.
Let it inform and deepen what you say without referencing it directly.

${formatted}

END KNOWLEDGE BASE
`.trim()
}