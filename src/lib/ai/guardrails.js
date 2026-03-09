/**
 * KAIROS — Guardrails System
 * Protects users and maintains Kairos' integrity.
 * Runs BEFORE sending to AI and AFTER receiving response.
 *
 * Server-side only. Never expose to client.
 */

// ── CRISIS DETECTION ─────────────────────────────────────────
const CRISIS_PATTERNS = [
  /\b(suicide|suicidal|kill myself|end my life|want to die|don't want to live)\b/i,
  /\b(self.?harm|cutting myself|hurting myself)\b/i,
  /\b(no reason to live|life is not worth|can't go on)\b/i,
  /\b(abuse|being abused|someone is hurting me)\b/i,
]

// ── MANIPULATION DETECTION ───────────────────────────────────
const MANIPULATION_PATTERNS = [
  /ignore (your|all|previous) (instructions|prompt|rules)/i,
  /you are (now|actually) (a different|an? (?!Kairos))/i,
  /pretend (you are|to be|you're) (not Kairos|a different|an? AI)/i,
  /jailbreak|dan mode|developer mode/i,
  /forget (your|all) (instructions|identity|purpose)/i,
]

// ── HARMFUL CONTENT ──────────────────────────────────────────
const HARMFUL_PATTERNS = [
  /\b(how to make|instructions for|guide to) (bomb|weapon|poison|drug)/i,
  /\b(child|minor).{0,20}(sexual|explicit|nude)/i,
]

/**
 * Pre-send check — runs on the user's message BEFORE sending to AI
 * Returns: { safe: boolean, type: string|null, message: string|null }
 */
export function preSendCheck(userMessage) {
  if (!userMessage || typeof userMessage !== "string") {
    return { safe: false, type: "invalid", message: null }
  }

  const text = userMessage.trim()

  // Check for crisis signals
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(text)) {
      return { safe: true, type: "crisis", message: text }
    }
  }

  // Check for manipulation attempts
  for (const pattern of MANIPULATION_PATTERNS) {
    if (pattern.test(text)) {
      return { safe: true, type: "manipulation", message: text }
    }
  }

  // Check for harmful content requests
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(text)) {
      return { safe: false, type: "harmful", message: null }
    }
  }

  return { safe: true, type: "normal", message: text }
}

/**
 * Crisis resources — returned when crisis is detected
 * Localised for common regions
 */
export const CRISIS_RESOURCES = `
You are not alone. Right now, real help is available:

• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
• Crisis Text Line (US/UK/Canada/Ireland): Text HOME to 741741
• Befrienders Worldwide: https://www.befrienders.org
• Kenya: Befrienders Kenya +254 722 178 177

Please reach out to one of these, or to someone you trust.
I am here with you right now, and I care deeply — but a real human voice can hold you in ways I cannot.`

/**
 * Harmful content response — returned when harmful request detected
 */
export const HARMFUL_RESPONSE = {
  reply: "That is something Kairos is not able to help with. But if there is something deeper going on — something you are carrying — I am here for that conversation.",
  escalated: false,
}

/**
 * Post-response check — basic sanity check on AI response
 * Returns cleaned response string
 */
export function postResponseCheck(response) {
  if (!response || typeof response !== "string") {
    return "Something went quiet for a moment. Please share what is on your heart again."
  }

  // Trim excessive length
  const MAX_CHARS = 1800
  if (response.length > MAX_CHARS) {
    const trimmed = response.slice(0, MAX_CHARS)
    const lastPeriod = trimmed.lastIndexOf(".")
    return lastPeriod > MAX_CHARS * 0.7
      ? trimmed.slice(0, lastPeriod + 1)
      : trimmed
  }

  return response.trim()
}
