import { createClient } from '@supabase/supabase-js'

// Never import this file in frontend components
// Server-side only — API routes and server actions
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)