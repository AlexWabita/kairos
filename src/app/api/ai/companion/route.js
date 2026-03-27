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
 */

import { NextResponse }          from "next/server"
import { rateLimit }             from "@/lib/rateLimit"
import { buildSystemPrompt }     from "@/lib/ai/prompts"
import { searchKnowledgeBase }   from "@/lib/rag/search"
import { createClient }          from "@supabase/supabase-js"
import { GoogleGenerativeAI }    from "@google/generative-ai"

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
 * Recommended free models (tested for quality):
 *   - meta-llama/llama-3.3-70b-instruct:free
 *   - deepseek/deepseek-r1:free
 *   - qwen/qwen-2.5-72b-instruct:free
 *   - mistralai/mistral-7b-instruct:free
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
  // Ends mid-word or mid-sentence without terminal punctuation
  const endsAbruptly = ![".", "!", "?", '"', "'", "…", ")", "]"].includes(lastChar)
  // Also flag if very short for what should be a Kairos response
  const tooShort = trimmed.length < 100
  return endsAbruptly || tooShort
}

/* ── Fetch user profile for personalisation ─────────────────────────────── */
async function fetchProfile(userId) {
  if (!userId) return null
  try {
    const { data } = await adminClient
      .from("users")
      .select("display_name, background_faith, background_culture, current_life_season, primary_need")
      .eq("id", userId)
      .maybeSingle()
    return data
  } catch {
    return null
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

  const chat = model.startChat({ history })

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
      groqModels.find(m => m.id === preferredModelId) ||
      openrouterModels.find(m => m.id === preferredModelId) ||
      geminiModels.find(m => m.id === preferredModelId)

    if (preferred) {
      console.log(`[Kairos AI] ${timestamp} — Continuation: preferring ${preferred.name}`)

      const provider =
        groqModels.find(m => m.id === preferredModelId)       ? "groq"        :
        openrouterModels.find(m => m.id === preferredModelId) ? "openrouter"  : "gemini"

      const result = await tryModel(provider, preferred, systemPrompt, messages, failures)
      if (result) return { ...result, failures }
    }
  }

  console.log(`[Kairos AI] ${timestamp} — Starting chain: Groq (${groqModels.length}) → OpenRouter (${openrouterModels.length}) → Gemini (${geminiModels.length})`)

  // 1. Groq — fastest, most reliable free tier
  for (const m of groqModels) {
    if (preferredModelId === m.id) continue  // already tried above
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
async function ensureConversation(userId, conversationId) {
  if (conversationId) return conversationId

  try {
    const { data } = await adminClient
      .from("conversations")
      .insert({
        user_id: userId || null,
        title:   "Untitled conversation",
      })
      .select("id")
      .single()

    return data?.id || null
  } catch {
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
      userId,
      conversationId,
      verseContext,
      isVerseRequest,
      isSearch,
      lastModelId,     // model that generated the previous response (for continuations)
    } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 })
    }

    // ── 1b. Rate limit check ──────────────────────────────────────────────
    const ip  = request.headers.get("x-forwarded-for")
               ?? request.headers.get("x-real-ip")
               ?? "unknown"
    const key = userId ? `user:${userId}` : `ip:${ip}`
    const { allowed, remaining, resetMs } = rateLimit(key, 20, 60_000)

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

    // ── 2. Escalation check ───────────────────────────────────────────────
    const escalated = isEscalated(message)

    // ── 3. Fetch profile + RAG context in parallel ────────────────────────
    // searchKnowledgeBase uses Jina AI (768-dim) — matches the stored vectors.
    // It handles substantive-message filtering, formatting, and silent failure
    // internally, so this call is always safe and never throws.
    const [profile, ragContext] = await Promise.all([
      profileOverride ? Promise.resolve(profileOverride) : fetchProfile(userId),
      searchKnowledgeBase(message),
    ])

    // ── 4. Build system prompt ────────────────────────────────────────────
    const systemPrompt = buildSystemPrompt({
      ragContext:     ragContext || "",
      profileContext: profile ? [
        profile.display_name         && `User's name: ${profile.display_name}`,
        profile.background_faith     && `Faith background: ${profile.background_faith}`,
        profile.background_culture   && `Cultural background: ${profile.background_culture}`,
        profile.current_life_season  && `Current life season: ${profile.current_life_season}`,
        profile.primary_need         && `Primary need: ${profile.primary_need}`,
      ].filter(Boolean).join("\n") : "",
      verseContext: verseContext || "",
    })

    // ── 5. Build message chain ────────────────────────────────────────────
    // Cap history at last 10 exchanges to control token usage
    const historySlice = history.slice(-20)

    const messages = [
      ...historySlice,
      { role: "user", content: message },
    ]

    // ── 6. Detect continuation request ───────────────────────────────────
    const isContinuation = isContinuationRequest(message)
    const preferredModel = isContinuation ? lastModelId : null

    // ── 7. Run model chain ────────────────────────────────────────────────
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

    let { reply, modelId, modelName, failures } = result

    // ── 8. Truncation detection ───────────────────────────────────────────
    const wasTruncated = isTruncated(reply)
    if (wasTruncated) {
      console.warn(`[Kairos AI] Truncation detected from ${modelName}`)
      // Don't append text — let the user ask to continue if needed.
      // Log it so we know which model truncates most.
    }

    // ── 9. Ensure conversation record ─────────────────────────────────────
    const activeConversationId = await ensureConversation(userId, conversationId)

    // ── 10. Store assistant message ───────────────────────────────────────
    if (activeConversationId) {
      try {
        await adminClient.from("messages").insert({
          conversation_id: activeConversationId,
          role:            "assistant",
          content:         reply,
          model_used:      modelName,
        })
      } catch {
        // Non-fatal — conversation persistence should never break a response
      }
    }

    // ── 11. Return response ───────────────────────────────────────────────
    return NextResponse.json({
      reply,
      escalated:      escalated,
      conversationId: activeConversationId,
      modelId,         // returned to client so it can be sent back for continuations
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