/**
 * KAIROS — Dual API Smart Fallback Chain
 *
 * Provider 1: OpenRouter  (multiple free models)
 * Provider 2: Google Gemini (direct API — completely free)
 *
 * Flow:
 *   1. Try OpenRouter models in order
 *   2. If ALL OpenRouter models fail → automatically switch to Gemini
 *   3. If Gemini also fails → clear error logged to terminal
 *
 * Adding more models: just add entries to OPENROUTER_MODELS or GEMINI_MODELS
 * Server-side only. No API keys ever reach the browser.
 */

// ── API ENDPOINTS ─────────────────────────────────────────────
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const GEMINI_URL     = "https://generativelanguage.googleapis.com/v1beta/models"

// ── OPENROUTER MODEL CHAIN ────────────────────────────────────
const OPENROUTER_MODELS = [
  {
    id:    "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3 70B",
  },
  {
    id:    "deepseek/deepseek-chat-v3-0324:free",
    label: "DeepSeek Chat V3",
  },
  {
    id:    "qwen/qwen3-14b:free",
    label: "Qwen3 14B",
  },
  {
    id:    "mistralai/mistral-small-3.1-24b-instruct:free",
    label: "Mistral Small 3.1",
  },
]

// ── GEMINI MODEL CHAIN ────────────────────────────────────────
// Completely free — no credits needed
// Get your free key at: aistudio.google.com
const GEMINI_MODELS = [
  {
    id:    "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
  },
  {
    id:    "gemini-1.5-flash",
    label: "Gemini 1.5 Flash",
  },
  {
    id:    "gemini-1.5-flash-8b",
    label: "Gemini 1.5 Flash 8B",
  },
]

// ── DEV LOGGER ────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === "development"

function log(type, message) {
  if (!isDev) return
  const timestamp = new Date().toLocaleTimeString()
  const colors = {
    info:     "\x1b[36m",  // Cyan
    success:  "\x1b[32m",  // Green
    warn:     "\x1b[33m",  // Yellow
    error:    "\x1b[31m",  // Red
    provider: "\x1b[35m",  // Magenta — for provider switches
  }
  const color  = colors[type] || ""
  const reset  = "\x1b[0m"
  const label  = `${color}[Kairos AI]${reset}`
  console.log(`${label} ${timestamp} — ${message}`)
}

// ── OPENROUTER ATTEMPT ────────────────────────────────────────
async function tryOpenRouter(model, messages, systemPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set in .env.local")

  log("info", `[OpenRouter] Trying: ${model.label}`)

  const response = await fetch(OPENROUTER_URL, {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
      "HTTP-Referer":  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title":       "Kairos",
    },
    body: JSON.stringify({
      model:       model.id,
      max_tokens:  600,
      temperature: 0.75,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const reason = data?.error?.message || data?.error?.code || `HTTP ${response.status}`
    throw new Error(reason)
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Response contained no content")

  return content
}

// ── GEMINI ATTEMPT ────────────────────────────────────────────
async function tryGemini(model, messages, systemPrompt) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY not set in .env.local")

  log("info", `[Gemini]     Trying: ${model.label}`)

  // Convert OpenAI-style messages to Gemini format
  // Gemini uses 'user'/'model' roles instead of 'user'/'assistant'
  // System prompt becomes the first user message in Gemini
  const geminiContents = [
    // Inject system prompt as opening context
    {
      role:  "user",
      parts: [{ text: `[SYSTEM INSTRUCTIONS — follow these throughout]\n\n${systemPrompt}\n\n[END SYSTEM INSTRUCTIONS]\n\nAcknowledge you understand and are ready.` }],
    },
    {
      role:  "model",
      parts: [{ text: "Understood. I am Kairos, ready to serve as your compassionate companion." }],
    },
    // Convert conversation history
    ...messages.map(m => ({
      role:  m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  ]

  const response = await fetch(
    `${GEMINI_URL}/${model.id}:generateContent?key=${apiKey}`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          maxOutputTokens: 600,
          temperature:     0.75,
        },
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    const reason = data?.error?.message || `HTTP ${response.status}`
    throw new Error(reason)
  }

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error("Response contained no content")

  return content
}

// ── MAIN EXPORT: SEND TO AI ───────────────────────────────────
export async function sendToAI(messages, systemPrompt) {
  const failures = []

  log("info", `Starting dual-API chain — OpenRouter (${OPENROUTER_MODELS.length}) → Gemini (${GEMINI_MODELS.length})`)

  // ── PHASE 1: Try OpenRouter ───────────────────────────────
  if (process.env.OPENROUTER_API_KEY) {
    for (const model of OPENROUTER_MODELS) {
      try {
        const content = await tryOpenRouter(model, messages, systemPrompt)
        log("success", `[OpenRouter] Success: ${model.label}`)
        if (failures.length > 0) {
          log("warn", `Recovered after ${failures.length} failure(s)`)
          failures.forEach(f => log("warn", `  ✗ ${f.model}: ${f.reason}`))
        }
        return content
      } catch (error) {
        const reason = error.message || "Unknown error"
        log("warn", `[OpenRouter] Failed: ${model.label} — ${reason}`)
        failures.push({ model: `OpenRouter/${model.label}`, reason })
      }
    }
    log("provider", `OpenRouter exhausted — switching to Gemini...`)
  } else {
    log("warn", "OPENROUTER_API_KEY not set — skipping OpenRouter")
  }

  // ── PHASE 2: Try Gemini ───────────────────────────────────
  if (process.env.GEMINI_API_KEY) {
    for (const model of GEMINI_MODELS) {
      try {
        const content = await tryGemini(model, messages, systemPrompt)
        log("success", `[Gemini]     Success: ${model.label}`)
        log("provider", `Served by Gemini after OpenRouter failures`)
        failures.forEach(f => log("warn", `  ✗ ${f.model}: ${f.reason}`))
        return content
      } catch (error) {
        const reason = error.message || "Unknown error"
        log("warn", `[Gemini]     Failed: ${model.label} — ${reason}`)
        failures.push({ model: `Gemini/${model.label}`, reason })
      }
    }
  } else {
    log("warn", "GEMINI_API_KEY not set — skipping Gemini (add to .env.local)")
  }

  // ── ALL FAILED ────────────────────────────────────────────
  log("error", "All providers and models failed:")
  failures.forEach(f => log("error", `  ✗ ${f.model}: ${f.reason}`))
  log("error", "Check openrouter.ai/models or aistudio.google.com for availability")

  throw new Error("All models across all providers failed. Check terminal for details.")
}
