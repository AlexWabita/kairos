-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007: Knowledge Base Metadata
-- Adds retrieval intelligence columns to knowledge_base table.
--
-- Purpose:
--   Enables context-aware RAG retrieval — matching content not just by vector
--   similarity, but by who it is for, which conversation modes it suits, and
--   what specific topics it covers.
--
-- New columns:
--   tags          text[]   — granular topic tags (lowercase, snake_case)
--   audience      text[]   — who this entry is for; multiple values allowed
--                            valid: anyone | seeker | new_believer | growing | mature
--   mode_affinity text[]   — Kairos response modes this entry best serves
--                            valid: PASTORAL | CLARITY | LAMENT | FORMATION |
--                                   APOLOGETICS | COURAGE | RELEASE
--   weight        integer  — retrieval priority (default 1; higher = boosted)
--
-- Convention:
--   - tags are always lowercase snake_case (e.g. spiritual_dryness, not Dryness)
--   - audience defaults to {anyone} — treat {} as "needs tagging"
--   - mode_affinity is enforced by CHECK constraint — no typos allowed
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE knowledge_base
  ADD COLUMN IF NOT EXISTS tags          text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS audience      text[]  DEFAULT ARRAY['anyone'],
  ADD COLUMN IF NOT EXISTS mode_affinity text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weight        integer DEFAULT 1;

-- ── CHECK constraint: mode_affinity values must match the 7 Kairos modes ─────
-- Prevents silent data corruption from typos or case inconsistency.
-- Uses the <@ (contained by) operator — every element in mode_affinity must
-- be a member of the allowed set.

ALTER TABLE knowledge_base
  ADD CONSTRAINT mode_affinity_valid
  CHECK (
    mode_affinity <@ ARRAY[
      'PASTORAL',
      'CLARITY',
      'LAMENT',
      'FORMATION',
      'APOLOGETICS',
      'COURAGE',
      'RELEASE'
    ]
  );

-- ── GIN indexes on array columns ──────────────────────────────────────────────
-- Enables efficient overlap queries (&&) when pre-filtering by audience
-- or mode before running vector similarity search.

CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags
  ON knowledge_base USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_audience
  ON knowledge_base USING GIN (audience);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_mode_affinity
  ON knowledge_base USING GIN (mode_affinity);

-- ── Partial index for boosted content (future use) ───────────────────────────
-- No entries have weight > 1 yet. Index activates automatically
-- when you begin boosting core theological entries.

CREATE INDEX IF NOT EXISTS idx_knowledge_base_high_weight
  ON knowledge_base (weight)
  WHERE weight > 1;

-- ── Backfill defaults for existing 63 entries ────────────────────────────────
-- Applies sensible mode_affinity and audience by category so retrieval
-- continues working before each entry is individually tagged.
-- Condition: mode_affinity = '{}' catches DEFAULT-initialised rows.

-- Apologetics entries
UPDATE knowledge_base
SET
  mode_affinity = ARRAY['APOLOGETICS', 'CLARITY'],
  audience      = ARRAY['anyone', 'seeker', 'growing', 'mature'],
  weight        = 1
WHERE category = 'apologetics'
  AND mode_affinity = '{}';

-- Pastoral entries
UPDATE knowledge_base
SET
  mode_affinity = ARRAY['PASTORAL', 'LAMENT', 'COURAGE'],
  audience      = ARRAY['anyone'],
  weight        = 1
WHERE category = 'pastoral'
  AND mode_affinity = '{}';

-- Scripture context entries
UPDATE knowledge_base
SET
  mode_affinity = ARRAY['CLARITY'],
  audience      = ARRAY['anyone'],
  weight        = 1
WHERE category = 'scripture_context'
  AND mode_affinity = '{}';

-- FAQ entries
UPDATE knowledge_base
SET
  mode_affinity = ARRAY['CLARITY', 'APOLOGETICS'],
  audience      = ARRAY['anyone', 'seeker'],
  weight        = 1
WHERE category = 'faq'
  AND mode_affinity = '{}';