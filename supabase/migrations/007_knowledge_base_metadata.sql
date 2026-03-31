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
--   tags          text[]   — granular topic tags (e.g. repentance, grief, prayer)
--   audience      text[]   — who this entry is written for; multiple allowed
--                            values: anyone, seeker, new_believer, growing, mature
--   mode_affinity text[]   — which Kairos response modes this entry best serves
--                            values: PASTORAL, CLARITY, LAMENT, FORMATION,
--                                    APOLOGETICS, COURAGE, RELEASE
--   weight        integer  — retrieval priority weight (default 1, higher = boosted)
--                            use later to prioritise core theology over edge content
--
-- All columns are nullable and default to safe values — existing rows are
-- unaffected and the seed route continues to work unchanged.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE knowledge_base
  ADD COLUMN IF NOT EXISTS tags         text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS audience     text[]  DEFAULT '{"anyone"}',
  ADD COLUMN IF NOT EXISTS mode_affinity text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weight       integer DEFAULT 1;

-- ── Indexes ──────────────────────────────────────────────────────────────────
-- GIN indexes on array columns allow efficient overlap queries (&&).
-- Useful when filtering by audience or mode before vector similarity search.

CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags
  ON knowledge_base USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_audience
  ON knowledge_base USING GIN (audience);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_mode_affinity
  ON knowledge_base USING GIN (mode_affinity);

-- ── Backfill defaults for existing rows ──────────────────────────────────────
-- Existing entries get sensible defaults so retrieval continues to work
-- before each entry is individually tagged in the corpus expansion pass.

-- Apologetics entries → APOLOGETICS + CLARITY modes, mature/growing audience
UPDATE knowledge_base
SET
  mode_affinity = ARRAY['APOLOGETICS', 'CLARITY'],
  audience      = ARRAY['anyone', 'seeker', 'growing', 'mature'],
  weight        = 1
WHERE category = 'apologetics'
  AND (mode_affinity IS NULL OR mode_affinity = '{}');

-- Pastoral entries → PASTORAL + LAMENT + COURAGE modes, broad audience
UPDATE knowledge_base
SET
  mode_affinity = ARRAY['PASTORAL', 'LAMENT', 'COURAGE'],
  audience      = ARRAY['anyone'],
  weight        = 1
WHERE category = 'pastoral'
  AND (mode_affinity IS NULL OR mode_affinity = '{}');

-- Scripture context entries → CLARITY mode, broad audience
UPDATE knowledge_base
SET
  mode_affinity = ARRAY['CLARITY'],
  audience      = ARRAY['anyone'],
  weight        = 1
WHERE category = 'scripture_context'
  AND (mode_affinity IS NULL OR mode_affinity = '{}');

-- FAQ entries → CLARITY + APOLOGETICS modes, seeker-friendly
UPDATE knowledge_base
SET
  mode_affinity = ARRAY['CLARITY', 'APOLOGETICS'],
  audience      = ARRAY['anyone', 'seeker'],
  weight        = 1
WHERE category = 'faq'
  AND (mode_affinity IS NULL OR mode_affinity = '{}');