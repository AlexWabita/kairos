-- ─────────────────────────────────────────
-- 004_reading_plans.sql
-- Phase 7I: Reading Plans + Guided Study
-- ─────────────────────────────────────────

-- 1. READING PLANS
-- Stores both curated (Kairos-authored) and user-created plan definitions
create table if not exists reading_plans (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text,
  duration_days    integer not null,
  category         text,
  cover_image_url  text,
  is_curated       boolean not null default false,
  created_by       uuid references users(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- 2. PLAN DAYS
-- One row per day per plan. All content is pre-authored.
create table if not exists plan_days (
  id                 uuid primary key default gen_random_uuid(),
  plan_id            uuid not null references reading_plans(id) on delete cascade,
  day_number         integer not null,
  title              text not null,
  devotional_text    text not null,
  scripture_refs     text[] not null default '{}',
  reflection_prompt  text,
  prayer_prompt      text,
  unique (plan_id, day_number)
);

-- 3. USER PLANS
-- Tracks a user's enrollment in a plan and their progress state
create table if not exists user_plans (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  plan_id           uuid not null references reading_plans(id) on delete cascade,
  started_at        timestamptz not null default now(),
  current_day       integer not null default 1,
  status            text not null default 'active'
                    check (status in ('active', 'paused', 'completed')),
  is_private        boolean not null default false,
  group_id          uuid,                          -- nullable: Phase 8 org hook
  catch_up_used_at  timestamptz,                   -- nullable: last catch-up timestamp
  unique (user_id, plan_id)
);

-- 4. USER PLAN PROGRESS
-- One row per completed day per user plan
create table if not exists user_plan_progress (
  id                  uuid primary key default gen_random_uuid(),
  user_plan_id        uuid not null references user_plans(id) on delete cascade,
  day_number          integer not null,
  completed_at        timestamptz not null default now(),
  kairos_reflection   text,                        -- nullable: saved AI response
  unique (user_plan_id, day_number)
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
create index if not exists idx_plan_days_plan_id
  on plan_days(plan_id);

create index if not exists idx_user_plans_user_id
  on user_plans(user_id);

create index if not exists idx_user_plan_progress_user_plan_id
  on user_plan_progress(user_plan_id);

-- ─────────────────────────────────────────
-- RLS (Row Level Security)
-- ─────────────────────────────────────────
alter table reading_plans      enable row level security;
alter table plan_days          enable row level security;
alter table user_plans         enable row level security;
alter table user_plan_progress enable row level security;

-- reading_plans: anyone can read, only owner or curated can exist
create policy "Public read for reading_plans"
  on reading_plans for select using (true);

create policy "Users can create their own plans"
  on reading_plans for insert
  with check (created_by = auth.uid() or is_curated = true);

-- plan_days: publicly readable
create policy "Public read for plan_days"
  on plan_days for select using (true);

-- user_plans: private to owner
create policy "Users manage their own user_plans"
  on user_plans for all
  using (user_id = (select id from users where auth_id = auth.uid()));

-- user_plan_progress: private to owner via user_plan
create policy "Users manage their own progress"
  on user_plan_progress for all
  using (
    user_plan_id in (
      select id from user_plans
      where user_id = (select id from users where auth_id = auth.uid())
    )
  );