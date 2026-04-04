-- ─────────────────────────────────────────────────────────────────────────
-- 009_reading_plans_slug.sql
-- Adds slug column to reading_plans for situation chip filtering.
-- Backfills existing rows from title using a deterministic slug transform.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Add the column (nullable first so backfill can run)
alter table reading_plans
  add column if not exists slug text;

-- 2. Backfill existing rows from title
--    Transforms: lowercase → replace spaces/& with hyphens → strip non-alphanum-hyphen
update reading_plans
set slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(title, '&', 'and', 'g'),   -- "Prayer & Fasting" → "Prayer and Fasting"
      '\s+', '-', 'g'                            -- spaces → hyphens
    ),
    '[^a-z0-9\-]', '', 'g'                       -- strip everything else
  )
)
where slug is null;

-- 3. Enforce unique + not null now that rows are backfilled
alter table reading_plans
  alter column slug set not null;

alter table reading_plans
  add constraint reading_plans_slug_unique unique (slug);

-- 4. Index for fast slug lookups
create index if not exists idx_reading_plans_slug
  on reading_plans (slug);

-- ─────────────────────────────────────────────────────────────────────────
-- VERIFY (run manually to confirm backfill):
--   select id, title, slug from reading_plans order by created_at;
--
-- Expected slugs for the 8 original plans:
--   new-believer-foundation
--   overcoming-anxiety
--   identity-in-christ
--   30-days-in-the-psalms
--   prayer-and-fasting
--   healing-and-forgiveness
--   walking-in-purpose
--   bible-in-365-days
--
-- If a slug looks wrong after backfill, update it manually:
--   update reading_plans set slug = 'correct-slug' where title = 'Plan Title';
--
-- The 4 new plans (Breaking Free, When God Feels Distant, etc.) will get
-- their correct slugs automatically when seeded since the seed script now
-- passes slug through the upsert (after adding it to the INSERT logic).
-- ─────────────────────────────────────────────────────────────────────────