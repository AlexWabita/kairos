ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create their own plans" ON public.reading_plans;
CREATE POLICY "Users can create their own plans"
  ON public.reading_plans FOR INSERT TO public
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "anon_insert_users" ON public.users;
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

DROP POLICY IF EXISTS "open_select_sessions" ON public.sessions;
DROP POLICY IF EXISTS "open_insert_sessions" ON public.sessions;
DROP POLICY IF EXISTS "open_update_sessions" ON public.sessions;

CREATE POLICY "owner_select_sessions"
  ON public.sessions FOR SELECT TO public
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "owner_insert_sessions"
  ON public.sessions FOR INSERT TO public
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "owner_update_sessions"
  ON public.sessions FOR UPDATE TO public
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));