/**
 * KAIROS — User Conversations Route
 * GET    /api/user/conversations        — fetch recent conversations + messages
 * PATCH  /api/user/conversations        — rename a conversation
 * DELETE /api/user/conversations?id=x  — delete a conversation
 */

import { createClient }          from "@supabase/supabase-js"
import { requireRequestAppUser } from "@/lib/server/auth/requireRequestAppUser"
import { ok, serverError }       from "@/lib/server/http/responses"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  try {
    const { appUser, response } = await requireRequestAppUser()
    if (response) return response

    const { searchParams } = new URL(req.url)
    const limit  = Math.min(parseInt(searchParams.get("limit")  || "20"), 50)
    const offset = parseInt(searchParams.get("offset") || "0")

    const { data: conversations, error: convError } = await admin
      .from("conversations")
      .select("id, title, created_at, updated_at, is_pinned")
      .eq("user_id", appUser.id)
      .order("is_pinned",  { ascending: false })
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (convError) throw convError
    if (!conversations?.length) return ok({ success: true, conversations: [] })

    const ids = conversations.map(c => c.id)
    const { data: messages, error: msgError } = await admin
      .from("messages")
      .select("id, conversation_id, role, content, model_used, created_at")
      .in("conversation_id", ids)
      .order("created_at", { ascending: true })

    if (msgError) throw msgError

    const map = {}
    for (const m of messages || []) {
      if (!map[m.conversation_id]) map[m.conversation_id] = []
      map[m.conversation_id].push(m)
    }

    return ok({
      success: true,
      conversations: conversations.map(c => ({ ...c, messages: map[c.id] || [] })),
    })

  } catch (err) {
    console.error("[Conversations GET]", err.message)
    return serverError("Failed to fetch conversations")
  }
}

export async function PATCH(req) {
  try {
    const { appUser, response } = await requireRequestAppUser()
    if (response) return response

    const body = await req.json().catch(() => null)
    if (!body?.id) return serverError("id required")

    const updates = {}
    if (body.title    !== undefined) updates.title     = body.title.trim()
    if (body.is_pinned !== undefined) updates.is_pinned = !!body.is_pinned

    if (!Object.keys(updates).length) return serverError("No fields to update")

    const { error } = await admin
      .from("conversations")
      .update(updates)
      .eq("id", body.id)
      .eq("user_id", appUser.id)

    if (error) throw error
    return ok({ success: true })

  } catch (err) {
    console.error("[Conversations PATCH]", err.message)
    return serverError("Failed to update conversation")
  }
}

export async function DELETE(req) {
  try {
    const { appUser, response } = await requireRequestAppUser()
    if (response) return response

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return serverError("id required")

    const { error } = await admin
      .from("conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", appUser.id)

    if (error) throw error
    return ok({ success: true })

  } catch (err) {
    console.error("[Conversations DELETE]", err.message)
    return serverError("Failed to delete conversation")
  }
}