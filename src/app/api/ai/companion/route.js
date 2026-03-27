import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rateLimit"
import { buildSystemPrompt } from "@/lib/ai/prompts"
import { searchKnowledgeBase } from "@/lib/rag/search"
import { createClient } from "@supabase/supabase-js"
import { GoogleGenerativeAI } from "@google/generative-ai"

import { getRequestAppUser } from "@/lib/server/auth/getRequestAppUser"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/* ── Timeouts ───────────────────────────────────────────── */
const MODEL_TIMEOUT_MS = 15_000
const MAX_TOKENS = 1800

/* ── (MODEL CONFIGS UNCHANGED — KEEP AS IS) ── */

/* ── Fetch profile (SAFE) ───────────────────────────────── */
async function fetchProfile(appUserId) {
  if (!appUserId) return null

  try {
    const { data } = await adminClient
      .from("users")
      .select(
        "display_name, background_faith, background_culture, current_life_season, primary_need"
      )
      .eq("id", appUserId)
      .maybeSingle()

    return data
  } catch {
    return null
  }
}

/* ── Ensure conversation (SAFE OWNERSHIP) ───────────────── */
async function ensureConversation(appUserId, conversationId) {
  if (conversationId) return conversationId

  try {
    const { data } = await adminClient
      .from("conversations")
      .insert({
        user_id: appUserId || null,
        title: "Untitled conversation",
      })
      .select("id")
      .single()

    return data?.id || null
  } catch {
    return null
  }
}

/* ── Main route ─────────────────────────────────────────── */
export async function POST(request) {
  try {
    const {
      message,
      history = [],
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

    // ✅ SERVER-DERIVED IDENTITY
    const { appUser } = await getRequestAppUser()

    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"

    const isAuthenticated = !!appUser && !appUser.is_anonymous
    const identityUserId = isAuthenticated ? appUser.id : null

    // ✅ SECURE RATE LIMIT KEY
    const key = identityUserId ? `user:${identityUserId}` : `ip:${ip}`

    const { allowed, resetMs } = rateLimit(key, 20, 60_000)

    if (!allowed) {
      const retryAfter = Math.ceil((resetMs - Date.now()) / 1000)

      return NextResponse.json(
        {
          reply:
            "You have sent a lot of messages in a short time. Take a breath — Kairos will be here when you return.",
          escalated: false,
          limited: true,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      )
    }

    // ── Escalation ──
    const escalated = /suicid|kill myself|end my life|self.harm/i.test(message)

    // ── Profile + RAG ──
    const [profile, ragContext] = await Promise.all([
      profileOverride
        ? Promise.resolve(profileOverride)
        : fetchProfile(identityUserId),
      searchKnowledgeBase(message),
    ])

    const systemPrompt = buildSystemPrompt({
      ragContext: ragContext || "",
      profileContext: profile
        ? [
            profile.display_name && `User's name: ${profile.display_name}`,
            profile.background_faith &&
              `Faith background: ${profile.background_faith}`,
            profile.background_culture &&
              `Cultural background: ${profile.background_culture}`,
            profile.current_life_season &&
              `Current life season: ${profile.current_life_season}`,
            profile.primary_need &&
              `Primary need: ${profile.primary_need}`,
          ]
            .filter(Boolean)
            .join("\n")
        : "",
      verseContext: verseContext || "",
    })

    const messages = [...history.slice(-20), { role: "user", content: message }]

    const result = await runModelChain(
      systemPrompt,
      messages,
      lastModelId
    )

    if (!result) {
      return NextResponse.json(
        {
          reply:
            "Something stilled for a moment. The connection is struggling. Please try again.",
          escalated: false,
          error: true,
        },
        { status: 503 }
      )
    }

    let { reply, modelId, modelName } = result

    const activeConversationId = await ensureConversation(
      identityUserId,
      conversationId
    )

    if (activeConversationId) {
      try {
        await adminClient.from("messages").insert({
          conversation_id: activeConversationId,
          role: "assistant",
          content: reply,
          model_used: modelName,
        })
      } catch {}
    }

    return NextResponse.json({
      reply,
      escalated,
      conversationId: activeConversationId,
      modelId,
    })
  } catch (error) {
    console.error("[Kairos AI] Route error:", error.message)

    return NextResponse.json(
      {
        reply: "Something stilled for a moment. Please try again.",
        escalated: false,
        error: true,
      },
      { status: 500 }
    )
  }
}