-- ─────────────────────────────────────────
-- 004_reading_plans.sql
-- Phase 7I: Reading Plans + Guided Study
-- ─────────────────────────────────────────

-- 1. READING PLANS
-- Stores both curated (Kairos-authored) and user-created plan definitions
CREATE TABLE IF NOT EXISTS public.reading_plans (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  description      text,
  duration_days    integer NOT NULL,
  category         text,
  cover_image_url  text,
  is_curated       boolean NOT NULL DEFAULT false,
  created_by       uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- 2. PLAN DAYS
-- One row per day per plan. All content is pre-authored.
CREATE TABLE IF NOT EXISTS public.plan_days (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id            uuid NOT NULL REFERENCES public.reading_plans(id) ON DELETE CASCADE,
  day_number         integer NOT NULL,
  title              text NOT NULL,
  devotional_text    text NOT NULL,
  scripture_refs     text[] NOT NULL DEFAULT '{}',
  reflection_prompt  text,
  prayer_prompt      text,
  UNIQUE (plan_id, day_number)
);

-- 3. USER PLANS
-- Tracks a user's enrollment in a plan and their progress state
CREATE TABLE IF NOT EXISTS public.user_plans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id           uuid NOT NULL REFERENCES public.reading_plans(id) ON DELETE CASCADE,
  started_at        timestamptz NOT NULL DEFAULT now(),
  current_day       integer NOT NULL DEFAULT 1,
  status            text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'paused', 'completed')),
  is_private        boolean NOT NULL DEFAULT false,
  group_id          uuid,                          -- nullable: Phase 8 org hook
  catch_up_used_at  timestamptz,                   -- nullable: last catch-up timestamp
  UNIQUE (user_id, plan_id)
);

-- 4. USER PLAN PROGRESS
-- One row per completed day per user plan
CREATE TABLE IF NOT EXISTS public.user_plan_progress (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plan_id        uuid NOT NULL REFERENCES public.user_plans(id) ON DELETE CASCADE,
  day_number          integer NOT NULL,
  completed_at        timestamptz NOT NULL DEFAULT now(),
  kairos_reflection   text,                        -- nullable: saved AI response
  UNIQUE (user_plan_id, day_number)
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_plan_days_plan_id
  ON public.plan_days(plan_id);

CREATE INDEX IF NOT EXISTS idx_user_plans_user_id
  ON public.user_plans(user_id);

CREATE INDEX IF NOT EXISTS idx_user_plan_progress_user_plan_id
  ON public.user_plan_progress(user_plan_id);

-- ─────────────────────────────────────────
-- RLS (Row Level Security)
-- ─────────────────────────────────────────
ALTER TABLE public.reading_plans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_days          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plan_progress ENABLE ROW LEVEL SECURITY;

-- ==================== READING_PLANS POLICIES ====================

-- Anyone can read reading plans (public read access)
DROP POLICY IF EXISTS "Public read for reading_plans" ON public.reading_plans;
CREATE POLICY "Public read for reading_plans"
  ON public.reading_plans FOR SELECT TO public
  USING (true);

-- Users can create their own plans (or curated plans can be inserted)
DROP POLICY IF EXISTS "Users can create their own plans" ON public.reading_plans;
CREATE POLICY "Users can create their own plans"
  ON public.reading_plans FOR INSERT TO public
  WITH CHECK (created_by = auth.uid() OR is_curated = true);

-- ==================== PLAN_DAYS POLICIES ====================

-- plan_days: publicly readable
DROP POLICY IF EXISTS "Public read for plan_days" ON public.plan_days;
CREATE POLICY "Public read for plan_days"
  ON public.plan_days FOR SELECT TO public
  USING (true);

-- ==================== USER_PLANS POLICIES ====================

-- user_plans: private to owner (full CRUD)
DROP POLICY IF EXISTS "Users manage their own user_plans" ON public.user_plans;
CREATE POLICY "Users manage their own user_plans"
  ON public.user_plans FOR ALL TO public
  USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- ==================== USER_PLAN_PROGRESS POLICIES ====================

-- user_plan_progress: private to owner via user_plan
DROP POLICY IF EXISTS "Users manage their own progress" ON public.user_plan_progress;
CREATE POLICY "Users manage their own progress"
  ON public.user_plan_progress FOR ALL TO public
  USING (
    user_plan_id IN (
      SELECT id FROM public.user_plans
      WHERE user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
  );