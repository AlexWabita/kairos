/**
 * KAIROS — Companion API Route
 * POST /api/ai/companion
 *
 * This is the server-side bridge between the user and the AI.
 * API keys never touch the browser.
 * All guardrails run here before and after AI response.
 */

import { NextResponse }          from "next/server"
import { sendToAI }              from "@/lib/ai/client"
import {
  KAIROS_IDENTITY,
  buildUserContext,
  buildVerseContext,
  CRISIS_INSTRUCTION,
}                                from "@/lib/ai/prompts"
import {
  preSendCheck,
  postResponseCheck,
  CRISIS_RESOURCES,
  HARMFUL_RESPONSE,
}                                from "@/lib/ai/guardrails"
import {
  getOrCreateConversation,
  saveMessage,
  updateConversation,
}                                from "@/lib/supabase/conversations"
import { searchKnowledgeBase }   from "@/lib/rag/search"

export async function POST(request) {
  try {
    // ── 1. Parse request ─────────────────────────────────────
    const body = await request.json()
    const {
      message,
      history        = [],
      profile        = null,
      userId         = null,
      conversationId = null,
      verseContext   = null,
      isVerseRequest = false,
      isSearch       = false,
    } = body

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // ── 2. Pre-send guardrail check ──────────────────────────
    const check = preSendCheck(message)

    if (!check.safe) {
      return NextResponse.json(HARMFUL_RESPONSE)
    }

    // ── 3. Persist conversation + user message ───────────────
    let activeConversationId = null

    if (userId) {
      activeConversationId = await getOrCreateConversation(userId, conversationId)
      await saveMessage(activeConversationId, "user", message)
      await updateConversation(activeConversationId, message)
    }

    // ── 4. RAG — search knowledge base in parallel with setup
    // Runs concurrently so it adds minimal latency
    const [knowledgeContext] = await Promise.all([
      searchKnowledgeBase(message),
    ])

    // ── 5. Build the system prompt ───────────────────────────
    // Layer 1: Core identity (never changes)
    let systemPrompt = KAIROS_IDENTITY

    // Layer 2: User context (personalisation)
    const userContext = buildUserContext(profile)
    if (userContext) {
      systemPrompt += `\n\n${userContext}`
    }

    // Layer 3: Verified verse text (when Bible API already fetched exact text)
    const versePrompt = buildVerseContext(verseContext)
    if (versePrompt) {
      systemPrompt += `\n\n${versePrompt}`
    }

    // Layer 4: RAG knowledge base context (curated, verified content)
    // Only injected when relevant content was found
    if (knowledgeContext) {
      systemPrompt += `\n\n${knowledgeContext}`
    }

    // Layer 5: Crisis instruction (only when needed)
    if (check.type === "crisis") {
      systemPrompt += `\n\n${CRISIS_INSTRUCTION}`
    }

    // ── 6. Build conversation history ────────────────────────
    const recentHistory = history.slice(-10)

    const messages = [
      ...recentHistory,
      { role: "user", content: message },
    ]

    // ── 7. Send to AI ────────────────────────────────────────
    const rawResponse = await sendToAI(messages, systemPrompt)

    // ── 8. Post-response check ───────────────────────────────
    let reply = postResponseCheck(rawResponse)

    if (check.type === "crisis") {
      reply += `\n\n---\n${CRISIS_RESOURCES}`
    }

    // ── 9. Save Kairos response ──────────────────────────────
    if (userId && activeConversationId) {
      await saveMessage(activeConversationId, "assistant", reply)
    }

    // ── 10. Return response ──────────────────────────────────
    return NextResponse.json({
      reply,
      escalated:      check.type === "crisis",
      messageType:    check.type,
      conversationId: activeConversationId,
    })

  } catch (error) {
    console.error("Companion API error:", error.message)

    return NextResponse.json(
      {
        reply:     "Something stilled for a moment. Please try again — your words matter.",
        escalated: false,
        error:     true,
      },
      { status: 500 }
    )
  }
}