
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
    id:    "openai/gpt-oss-120b:free",
    label: "GPT OSS 120B",
  },
  {
    id:    "arcee-ai/arcee-trinity-large-preview:free",
    label: "Arcee Trinity Large",
  },
  {
    id:    "stepfun/step-3.5-flash:free",
    label: "StepFun Step 3.5 Flash",
  },
  {
    id:    "z-ai/glm-4.5-air:free",
    label: "GLM 4.5 Air",
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
    id:    "gemini-2.0-flash-lite",
    label: "Gemini 2.0 Flash Lite",
  },
  {
    id:    "gemini-1.5-flash-002",
    label: "Gemini 1.5 Flash 002",
  },
]

// ── DEV LOGGER ────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === "development"

function log(type, message) {
  if (!isDev) return
  const timestamp = new Date().toLocaleTimeString()
  declare interface colorsType {
	static info: any;

	static success: any;

	static warn: any;

	static error: any;

	static provider: any[];
}
