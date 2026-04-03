-- =============================================
-- RLS Policies Migration (006)
-- Enable RLS and set proper policies
-- =============================================

-- Enable RLS on contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ======================
-- READING_PLANS Policies
-- ======================

-- Anyone can read reading plans (public read)
DROP POLICY IF EXISTS "Public read for reading_plans" ON public.reading_plans;
CREATE POLICY "Public read for reading_plans"
  ON public.reading_plans FOR SELECT TO public
  USING (true);

-- Users can only create their own plans
DROP POLICY IF EXISTS "Users can create their own plans" ON public.reading_plans;
CREATE POLICY "Users can create their own plans"
  ON public.reading_plans FOR INSERT TO public
  WITH CHECK (created_by = auth.uid());

-- ======================
-- USERS Policies
-- ======================

DROP POLICY IF EXISTS "anon_insert_users" ON public.users;
DROP POLICY IF EXISTS "owner_insert_users" ON public.users;
CREATE POLICY "owner_insert_users"
  ON public.users FOR INSERT TO public
  WITH CHECK (auth_id = auth.uid());

DROP POLICY IF EXISTS "owner_select_users" ON public.users;
CREATE POLICY "owner_select_users"
  ON public.users FOR SELECT TO public
  USING (auth_id = auth.uid());

DROP POLICY IF EXISTS "owner_update_users" ON public.users;
CREATE POLICY "owner_update_users"
  ON public.users FOR UPDATE TO public
  USING (auth_id = auth.uid());

-- ======================
-- SESSIONS Policies
-- ======================

-- Clean up any old session policies
DROP POLICY IF EXISTS "open_select_sessions" ON public.sessions;
DROP POLICY IF EXISTS "open_insert_sessions" ON public.sessions;
DROP POLICY IF EXISTS "open_update_sessions" ON public.sessions;

-- New owner-based policies for sessions
DROP POLICY IF EXISTS "owner_select_sessions" ON public.sessions;
CREATE POLICY "owner_select_sessions"
  ON public.sessions FOR SELECT TO public
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "owner_insert_sessions" ON public.sessions;
CREATE POLICY "owner_insert_sessions"
  ON public.sessions FOR INSERT TO public
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "owner_update_sessions" ON public.sessions;
CREATE POLICY "owner_update_sessions"
  ON public.sessions FOR UPDATE TO public
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Optional: Add comment for future reference
COMMENT ON TABLE public.reading_plans IS 'Policies updated in migration 006';