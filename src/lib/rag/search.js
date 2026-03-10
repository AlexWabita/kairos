/**
 * KAIROS — RAG Search Module
 *
 * Searches the Supabase knowledge base using vector similarity.
 * Called before every substantive AI response to ground Kairos
 * in curated, verified content rather than pure model knowledge.
 *
 * Flow:
 *   1. Generate query embedding from user message
 *   2. Call Supabase match_knowledge_base() function
 *   3. Format results into a prompt context block
 *   4. Inject into system prompt before AI call
 *
 * Server-side only.
 */

import { createClient }         from "@supabase/supabase-js"
import { generateQueryEmbedding } from "./embeddings"

// Use service role for server-side reads
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Determine if a message is substantive enough to warrant a RAG search.
 * Skips greetings, one-liners, and very short acknowledgements.
 *
 * @param {string} message
 * @returns {boolean}
 */
export function isSubstantiveMessage(message) {
  if (!message || typeof message !== "string") return false

  const trimmed    = message.trim()
  const wordCount  = trimmed.split(/\s+/).filter(Boolean).length

  // Skip very short messages
  if (wordCount < 4) return false

  // Skip pure greetings
  const greetings = /^(hi|hello|hey|ok|okay|yes|no|sure|thanks|thank you|great|good|got it|i see|alright|sounds good|perfect|awesome)[\s!.]*$/i
  if (greetings.test(trimmed)) return false

  return true
}

/**
 * Search the knowledge base for content relevant to the user's message.
 * Returns formatted context string ready for prompt injection, or null
 * if nothing relevant was found or search was skipped.
 *
 * @param {string} message — the user's message
 * @returns {string|null} — formatted knowledge context, or null
 */
export async function searchKnowledgeBase(message) {
  if (!isSubstantiveMessage(message)) {
    return null
  }

  try {
    // Generate query embedding
    const embedding = await generateQueryEmbedding(message)

    // Search Supabase using our match_knowledge_base function
    const { data, error } = await supabase.rpc("match_knowledge_base", {
      query_embedding: embedding,
      match_threshold: 0.5,  // minimum similarity score (0-1)
      match_count:     3,    // return top 3 matches
    })

    if (error) {
      console.error("[Kairos RAG] Search error:", error.message)
      return null
    }

    if (!data || data.length === 0) {
      console.log("[Kairos RAG] No relevant knowledge found for this message")
      return null
    }

    console.log(`[Kairos RAG] Found ${data.length} relevant entries (top similarity: ${data[0].similarity.toFixed(3)})`)

    // Format results into a prompt context block
    return formatKnowledgeContext(data)

  } catch (error) {
    // RAG failure should never break the conversation
    // Kairos falls back to pure model knowledge silently
    console.error("[Kairos RAG] Failed silently:", error.message)
    return null
  }
}

/**
 * Format knowledge base results into a clear prompt context block.
 * The AI is instructed to draw from this but not quote it verbatim.
 *
 * @param {Array} entries — matched knowledge base entries
 * @returns {string}
 */
function formatKnowledgeContext(entries) {
  const formatted = entries.map((entry, i) => {
    let block = `[${i + 1}] ${entry.title}`
    if (entry.category)     block += ` (${entry.category})`
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