/**
 * KAIROS — AI Companion Route
 * POST /api/ai/companion
 *
 * Model chain (in priority order):
 *   Groq  → Groq fallback → OpenRouter chain → Gemini chain
 *
 * FREE PROVIDERS USED:
 *   Groq        — Free tier, very fast (~1-3s), highly reliable
 *                 Docs: https://console.groq.com
 *                 Env:  GROQ_API_KEY
 *
 *   OpenRouter  — Free models with daily caps per model
 *                 Docs: https://openrouter.ai/docs
 *                 Env:  OPENROUTER_API_KEY
 *
 *   Google AI   — Gemini free tier (generous quota)
 *                 Docs: https://ai.google.dev
 *                 Env:  GEMINI_API_KEY
 *
 * FEATURES:
 *   - 15s timeout per model (fail fast, try next)
 *   - Model tracking: continuation requests route to same model
 *   - Truncation detection: auto-complete if response is cut off
 *   - Rate limiting (20 req/min per user or IP)
 *   - Memory injection: recent journey entries for conversational continuity
 */

import { NextResponse }        from "next/server"
import { rateLimit }           from "@/lib/rateLimit"
import {
  buildSystemPrompt,
  buildProfileContext,
  buildMemoryContext,
  inferResponseMode,
} from "@/lib/ai/prompts"
import { searchKnowledgeBase } from "@/lib/rag/search"
import { createClient }        from "@supabase/supabase-js"
import { GoogleGenerativeAI }  from "@google/generative-ai"
import { getRequestAppUser }   from "@/lib/server/auth/getRequestAppUser"

/* ── Supabase admin client ──────────────────────────────────────────────── */
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/* ── Timeouts ───────────────────────────────────────────────────────────── */
const MODEL_TIMEOUT_MS = 15_000   // 15 seconds per model attempt
const MAX_TOKENS       = 1800     // Enough for a full Kairos response

/* ── Model chain definitions ────────────────────────────────────────────── */

/**
 * Groq — fastest and most reliable free tier.
 * Sign up at https://console.groq.com — API key is free.
 * Models: https://console.groq.com/docs/models
 */
const GROQ_MODELS = [
  {
    id:    "groq/llama-3.3-70b-versatile",
    name:  "Groq Llama 3.3 70B",
    model: "llama-3.3-70b-versatile",
  },
  {
    id:    "groq/llama-3.1-70b-versatile",
    name:  "Groq Llama 3.1 70B",
    model: "llama-3.1-70b-versatile",
  },
  {
    id:    "groq/mixtral-8x7b-32768",
    name:  "Groq Mixtral 8x7B",
    model: "mixtral-8x7b-32768",
  },
]

/**
 * OpenRouter free models.
 * Free models are marked with :free suffix.
 * Sign up at https://openrouter.ai — get credits for paid models.
 *
 * Free model list: https://openrouter.ai/models?q=free
 */
const OPENROUTER_MODELS = [
  {
    id:    "openrouter/stepfun-step-3.5-flash",
    name:  "StepFun Step 3.5 Flash",
    model: "stepfun-ai/step-3.5-flash",
  },
  {
    id:    "openrouter/qwen-2.5-72b-free",
    name:  "Qwen 2.5 72B",
    model: "qwen/qwen-2.5-72b-instruct:free",
  },
  {
    id:    "openrouter/mistral-7b-free",
    name:  "Mistral 7B",
    model: "mistralai/mistral-7b-instruct:free",
  },
  {
    id:    "openrouter/glm-4.5-air",
    name:  "GLM 4.5 Air",
    model: "thudm/glm-4.5-air",
  },
]

/**
 * Gemini via Google AI SDK.
 * Free tier is generous. Set up at https://ai.google.dev
 * Env: GEMINI_API_KEY
 */
const GEMINI_MODELS = [
  { id: "gemini/flash-2.0",  name: "Gemini 2.0 Flash",  model: "gemini-2.0-flash"    },
  { id: "gemini/flash-1.5",  name: "Gemini 1.5 Flash",  model: "gemini-1.5-flash"    },
  { id: "gemini/flash-lite", name: "Gemini Flash Lite", model: "gemini-1.5-flash-8b" },
]

/* ── Detect if this is a continuation request ───────────────────────────── */
const CONTINUATION_PATTERNS = [
  /continue/i,
  /please finish/i,
  /you didn.t complete/i,
  /finish your (thought|response|answer)/i,
  /you were cut off/i,
  /go on/i,
  /keep going/i,
  /what were you saying/i,
]

function isContinuationRequest(message) {
  return CONTINUATION_PATTERNS.some(p => p.test(message))
}

/* ── Detect truncated responses ─────────────────────────────────────────── */
function isTruncated(text) {
  if (!text || text.length < 50) return true
  const trimmed  = text.trimEnd()
  const lastChar = trimmed[trimmed.length - 1]
  const endsAbruptly = ![".", "!", "?", '"', "'", "…", ")", "]"].includes(lastChar)
  const tooShort     = trimmed.length < 100
  return endsAbruptly || tooShort
}

/* ── Fetch user profile for personalisation ─────────────────────────────── */
async function fetchProfile(appUserId) {
  if (!appUserId) return null
  try {
    const { data } = await adminClient
      .from("users")
      .select("display_name, background_faith, background_culture, current_life_season, primary_need")
      .eq("id", appUserId)
      .maybeSingle()
    return data
  } catch {
    return null
  }
}

/* ── Fetch recent journey entries for memory context ────────────────────── */
// Returns the last 5 entries — enough for continuity, small enough for token budget.
// Silent on failure — memory is enrichment, never a blocker.
async function fetchRecentJourney(appUserId) {
  if (!appUserId) return []
  try {
    const { data } = await adminClient
      .from("journey_entries")
      .select("title, content, entry_type, scripture_ref, created_at")
      .eq("user_id", appUserId)
      .order("created_at", { ascending: false })
      .limit(5)
    return data || []
  } catch {
    return []
  }
}

/* ── Groq API call ──────────────────────────────────────────────────────── */
async function callGroq(modelDef, systemPrompt, messages, signal) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:       modelDef.model,
      max_tokens:  MAX_TOKENS,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
    signal,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `HTTP ${res.status}`)
  }

  const data  = await res.json()
  const reply = data.choices?.[0]?.message?.content?.trim()

  if (!reply) throw new Error("Response contained no content")
  return reply
}

/* ── OpenRouter API call ────────────────────────────────────────────────── */
async function callOpenRouter(modelDef, systemPrompt, messages, signal) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer":  "https://kairos.app",
      "X-Title":       "Kairos",
    },
    body: JSON.stringify({
      model:       modelDef.model,
      max_tokens:  MAX_TOKENS,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
    signal,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `HTTP ${res.status}`)
  }

  const data  = await res.json()
  const reply = data.choices?.[0]?.message?.content?.trim()

  if (!reply) throw new Error("Response contained no content")
  return reply
}

/* ── Gemini API call ────────────────────────────────────────────────────── */
async function callGemini(modelDef, systemPrompt, messages) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model:             modelDef.model,
    systemInstruction: systemPrompt,
  })

  const history = messages.slice(0, -1).map(m => ({
    role:  m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }))

  const lastMessage = messages[messages.length - 1].content
  const chat        = model.startChat({ history })

  // Gemini doesn't support AbortSignal natively — handled by outer timeout
  const result = await chat.sendMessage(lastMessage)
  const reply  = result.response.text()?.trim()

  if (!reply) throw new Error("Response contained no content")
  return reply
}

/* ── Try a model with timeout ───────────────────────────────────────────── */
async function tryModel(provider, modelDef, systemPrompt, messages, failures) {
  const controller = new AbortController()
  const timer      = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS)

  try {
    console.log(`[Kairos AI] [${provider}] Trying: ${modelDef.name}`)

    let reply

    if (provider === "groq") {
      reply = await callGroq(modelDef, systemPrompt, messages, controller.signal)
    } else if (provider === "openrouter") {
      reply = await callOpenRouter(modelDef, systemPrompt, messages, controller.signal)
    } else if (provider === "gemini") {
      reply = await callGemini(modelDef, systemPrompt, messages)
    }

    console.log(`[Kairos AI] [${provider}] Success: ${modelDef.name}`)
    return { reply, modelId: modelDef.id, modelName: modelDef.name }

  } catch (err) {
    const reason = controller.signal.aborted ? "Timeout (15s)" : err.message
    console.log(`[Kairos AI] [${provider}] Failed: ${modelDef.name} — ${reason}`)
    failures.push({ name: `${provider}/${modelDef.name}`, reason })
    return null

  } finally {
    clearTimeout(timer)
  }
}

/* ── Full model chain ───────────────────────────────────────────────────── */
async function runModelChain(systemPrompt, messages, preferredModelId = null) {
  const timestamp = new Date().toLocaleTimeString("en-US", { hour12: true })
  const failures  = []

  const groqModels       = [...GROQ_MODELS]
  const openrouterModels = [...OPENROUTER_MODELS]
  const geminiModels     = [...GEMINI_MODELS]

  // If a preferred model is specified (continuation), try it first
  if (preferredModelId) {
    const preferred =
      groqModels.find(m => m.id === preferredModelId)       ||
      openrouterModels.find(m => m.id === preferredModelId) ||
      geminiModels.find(m => m.id === preferredModelId)

    if (preferred) {
      console.log(`[Kairos AI] ${timestamp} — Continuation: preferring ${preferred.name}`)

      const provider =
        groqModels.find(m => m.id === preferredModelId)       ? "groq"       :
        openrouterModels.find(m => m.id === preferredModelId) ? "openrouter" : "gemini"

      const result = await tryModel(provider, preferred, systemPrompt, messages, failures)
      if (result) return { ...result, failures }
    }
  }

  console.log(`[Kairos AI] ${timestamp} — Starting chain: Groq (${groqModels.length}) → OpenRouter (${openrouterModels.length}) → Gemini (${geminiModels.length})`)

  // 1. Groq — fastest, most reliable free tier
  for (const m of groqModels) {
    if (preferredModelId === m.id) continue
    const result = await tryModel("groq", m, systemPrompt, messages, failures)
    if (result) {
      if (failures.length > 0) {
        console.log(`[Kairos AI] Recovered after ${failures.length} failure(s)`)
        failures.forEach(f => console.log(`[Kairos AI]   ✗ ${f.name}: ${f.reason}`))
      }
      return { ...result, failures }
    }
  }

  // 2. OpenRouter free models
  for (const m of openrouterModels) {
    if (preferredModelId === m.id) continue
    const result = await tryModel("openrouter", m, systemPrompt, messages, failures)
    if (result) {
      console.log(`[Kairos AI] Recovered after ${failures.length} failure(s)`)
      failures.forEach(f => console.log(`[Kairos AI]   ✗ ${f.name}: ${f.reason}`))
      return { ...result, failures }
    }
  }

  // 3. Gemini — final safety net
  for (const m of geminiModels) {
    if (preferredModelId === m.id) continue
    const result = await tryModel("gemini", m, systemPrompt, messages, failures)
    if (result) {
      console.log(`[Kairos AI] Recovered after ${failures.length} failure(s)`)
      failures.forEach(f => console.log(`[Kairos AI]   ✗ ${f.name}: ${f.reason}`))
      return { ...result, failures }
    }
  }

  // All models failed
  console.error(`[Kairos AI] All models failed:`)
  failures.forEach(f => console.error(`[Kairos AI]   ✗ ${f.name}: ${f.reason}`))
  return null
}

/* ── Ensure conversation record ─────────────────────────────────────────── */
// Uses `started_at` instead of `created_at` — actual DB column name.
async function ensureConversation(appUserId, conversationId) {
  if (conversationId) return conversationId
  if (!appUserId) return null

  try {
    const { data } = await adminClient
      .from("conversations")
      .insert({
        user_id:    appUserId,
        title:      "Untitled conversation",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    return data?.id || null
  } catch (err) {
    console.error("[Kairos AI] ensureConversation error:", err.message)
    return null
  }
}

/* ── Escalation detection ───────────────────────────────────────────────── */
const ESCALATION_PATTERNS = [
  /suicid/i, /kill myself/i, /end my life/i, /self.harm/i,
  /cutting myself/i, /don't want to live/i, /no reason to live/i,
]

function isEscalated(message) {
  return ESCALATION_PATTERNS.some(p => p.test(message))
}

/* ── Main route handler ─────────────────────────────────────────────────── */
export async function POST(request) {
  try {
    // ── 1. Parse request ──────────────────────────────────────────────────
    const {
      message,
      history        = [],
      profile: profileOverride,
      conversationId,
      verseContext,
      isVerseRequest,
      isSearch,
      lastModelId,
    } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 })
    }

    // ── 2. Server-derived identity ────────────────────────────────────────
    const { appUser } = await getRequestAppUser()

    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip")       ??
      "unknown"

    const isAuthenticated = !!appUser && !appUser.is_anonymous
    const identityUserId  = isAuthenticated ? appUser.id : null

    // ── 3. Rate limit ─────────────────────────────────────────────────────
    const key = identityUserId ? `user:${identityUserId}` : `ip:${ip}`
    const { allowed, resetMs } = rateLimit(key, 20, 60_000)

    if (!allowed) {
      const retryAfter = Math.ceil((resetMs - Date.now()) / 1000)
      return NextResponse.json(
        {
          reply:     "You have sent a lot of messages in a short time. Take a breath — Kairos will be here when you return.",
          escalated: false,
          limited:   true,
        },
        {
          status:  429,
          headers: { "Retry-After": String(retryAfter) },
        }
      )
    }

    // ── 4. Escalation check ───────────────────────────────────────────────
    const escalated = isEscalated(message)

    // ── 5. Fetch profile + RAG + memory in parallel ───────────────────────
    // Memory is only meaningful for authenticated users — anonymous sessions
    // have no journey entries. All three are non-blocking on failure.
    const [profile, ragContext, journeyEntries] = await Promise.all([
      profileOverride ? Promise.resolve(profileOverride) : fetchProfile(identityUserId),
      searchKnowledgeBase(message),
      fetchRecentJourney(identityUserId),
    ])

    // ── 6. Build system prompt ────────────────────────────────────────────
    const systemPrompt = buildSystemPrompt({
      ragContext:     ragContext || "",
      profileContext: buildProfileContext(profile),
      verseContext:   verseContext || "",
      memoryContext:  buildMemoryContext(journeyEntries),
    })

    // ── 7. Build message chain ────────────────────────────────────────────
    // Cap history at last 20 messages to control token usage
    const messages = [
      ...history.slice(-20),
      { role: "user", content: message },
    ]

    // ── 8. Detect continuation ────────────────────────────────────────────
    const isContinuation = isContinuationRequest(message)
    const preferredModel = isContinuation ? lastModelId : null

    // ── 9. Run model chain ────────────────────────────────────────────────
    const result = await runModelChain(systemPrompt, messages, preferredModel)

    if (!result) {
      return NextResponse.json(
        {
          reply:     "Something stilled for a moment. The connection is struggling. Please try again.",
          escalated: false,
          error:     true,
        },
        { status: 503 }
      )
    }

    let { reply, modelId, modelName } = result

    // ── 10. Truncation detection ──────────────────────────────────────────
    const wasTruncated = isTruncated(reply)
    if (wasTruncated) {
      console.warn(`[Kairos AI] Truncation detected from ${modelName}`)
    }

    // ── 11. Ensure conversation record ────────────────────────────────────
    const activeConversationId = await ensureConversation(identityUserId, conversationId)

    // ── 12. Store messages + touch last_message_at ────────────────────────
    if (activeConversationId) {
      try {
        await adminClient.from("messages").insert([
          {
            conversation_id: activeConversationId,
            role:            "user",
            content:         message,
          },
          {
            conversation_id: activeConversationId,
            role:            "assistant",
            content:         reply,
          },
        ])
        // Touch last_message_at so conversation list sorts by recency
        // (updated_at also exists on the table so we set both to be safe)
        await adminClient
          .from("conversations")
          .update({
            last_message_at: new Date().toISOString(),
            updated_at:      new Date().toISOString(),
          })
          .eq("id", activeConversationId)
      } catch (err) {
        // Non-fatal — AI response is already generated, don't fail the request
        console.error("[Kairos AI] Message storage error:", err.message)
      }
    }

    // ── 13. Return response ───────────────────────────────────────────────
    return NextResponse.json({
      reply,
      escalated:      escalated,
      conversationId: activeConversationId,
      modelId,
      wasTruncated,
    })

  } catch (error) {
    console.error("[Kairos AI] Route error:", error.message)
    return NextResponse.json(
      {
        reply:     "Something stilled for a moment. Please try again.",
        escalated: false,
        error:     true,
      },
      { status: 500 }
    )
  }
}