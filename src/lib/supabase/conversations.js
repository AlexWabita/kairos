import { supabaseAdmin } from './admin'

// Get or create a conversation for this session
export async function getOrCreateConversation(userId, conversationId = null) {
  // If we already have a conversation ID, return it
  if (conversationId) return conversationId

  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert({
      user_id: userId,
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('[Kairos] Conversation creation error:', error.message)
    return null
  }

  return data.id
}

// Save a single message to the database
export async function saveMessage(conversationId, role, content) {
  if (!conversationId) return

  const { error } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })

  if (error) {
    console.error('[Kairos] Message save error:', error.message)
  }
}

// Update conversation timestamp and auto-generate a title
export async function updateConversation(conversationId, lastMessage) {
  if (!conversationId) return

  // Use first 60 chars of first user message as title
  const title = lastMessage.slice(0, 60) + (lastMessage.length > 60 ? '...' : '')

  await supabaseAdmin
    .from('conversations')
    .update({
      last_message_at: new Date().toISOString(),
      title,
    })
    .eq('id', conversationId)
    .is('title', null) // Only set title once — on first message
}