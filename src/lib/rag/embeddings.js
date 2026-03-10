/**
 * KAIROS — Embeddings Client
 *
 * Converts text into vector embeddings using Jina AI's free embedding API.
 * 768 dimensions — matches our Supabase pgvector setup exactly.
 * Free tier: 1M tokens, no credit card, works globally.
 *
 * Server-side only. Never import in client components.
 */

const JINA_EMBEDDING_URL = "https://api.jina.ai/v1/embeddings"
const JINA_MODEL         = "jina-embeddings-v2-base-en"

/**
 * Core embedding function — shared by both document and query variants.
 * @param {string} text
 * @param {string} task — "retrieval.passage" or "retrieval.query"
 * @returns {number[]} — 768-dimension embedding vector
 */
async function embed(text, task = "retrieval.passage") {
  const apiKey = process.env.JINA_API_KEY
  if (!apiKey) throw new Error("JINA_API_KEY not set in .env.local")

  const input = text.slice(0, 4000).trim()

  const response = await fetch(JINA_EMBEDDING_URL, {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
      "Accept":        "application/json",
    },
    body: JSON.stringify({
      model: JINA_MODEL,
      input: [input],
      task,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const reason = data?.detail || data?.message || `HTTP ${response.status}`
    throw new Error(`Embedding failed: ${reason}`)
  }

  const values = data?.data?.[0]?.embedding
  if (!values || !Array.isArray(values)) {
    throw new Error("Embedding response contained no values")
  }

  return values
}

/**
 * Generate an embedding for a knowledge base entry (document).
 * @param {string} text
 * @returns {number[]} — 768-dimension vector
 */
export async function generateEmbedding(text) {
  return embed(text, "retrieval.passage")
}

/**
 * Generate an embedding optimised for search queries.
 * @param {string} query
 * @returns {number[]} — 768-dimension vector
 */
export async function generateQueryEmbedding(query) {
  return embed(query, "retrieval.query")
}