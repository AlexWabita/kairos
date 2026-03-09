/**
 * KAIROS — Companion API Route
 * POST /api/ai/companion
 *
 * This is the server-side bridge between the user and the AI.
 * API keys never touch the browser.
 * All guardrails run here before and after AI response.
 */

import { NextResponse }   from "next/server"
import { sendToAI }       from "@/lib/ai/client"
import {
  KAIROS_IDENTITY,
  buildUserContext,
  CRISIS_INSTRUCTION,
}                         from "@/lib/ai/prompts"
import {
  preSendCheck,
  postResponseCheck,
  CRISIS_RESOURCES,
  HARMFUL_RESPONSE,
}                         from "@/lib/ai/guardrails"

export async function POST(request) {
  try {
    // ── 1. Parse request ─────────────────────────────────────
    const body = await request.json()
    const { message, history = [], profile = null } = body

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // ── 2. Pre-send guardrail check ──────────────────────────
    const check = preSendCheck(message)

    // Block genuinely harmful content
    if (!check.safe) {
      return NextResponse.json(HARMFUL_RESPONSE)
    }

    // ── 3. Build the system prompt ───────────────────────────
    // Layer 1: Core identity (never changes)
    let systemPrompt = KAIROS_IDENTITY

    // Layer 2: User context (personalisation)
    const userContext = buildUserContext(profile)
    if (userContext) {
      systemPrompt += `\n\n${userContext}`
    }

    // Layer 3: Crisis instruction (only when needed)
    if (check.type === "crisis") {
      systemPrompt += `\n\n${CRISIS_INSTRUCTION}`
    }

    // ── 4. Build conversation history ───────────────────────
    // Keep last 10 messages for context (5 exchanges)
    // Too much history = slower and more expensive
    const recentHistory = history.slice(-10)

    const messages = [
      ...recentHistory,
      { role: "user", content: message },
    ]

    // ── 5. Send to AI ────────────────────────────────────────
    const rawResponse = await sendToAI(messages, systemPrompt)

    // ── 6. Post-response check ───────────────────────────────
    let reply = postResponseCheck(rawResponse)

    // Append crisis resources if crisis was detected
    if (check.type === "crisis") {
      reply += `\n\n---\n${CRISIS_RESOURCES}`
    }

    // ── 7. Return response ───────────────────────────────────
    return NextResponse.json({
      reply,
      escalated:     check.type === "crisis",
      messageType:   check.type,
    })

  } catch (error) {
    console.error("Companion API error:", error.message)

    // Never expose internal errors to the client
    return NextResponse.json(
      {
        reply: "Something stilled for a moment. Please try again — your words matter.",
        escalated: false,
        error: true,
      },
      { status: 500 }
    )
  }
}
