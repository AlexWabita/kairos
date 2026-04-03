-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007: Knowledge Base Metadata
-- Adds retrieval intelligence columns + indexes for context-aware RAG
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on knowledge_base if not already done
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 1. Add new columns (idempotent)
-- =============================================
ALTER TABLE public.knowledge_base
  ADD COLUMN IF NOT EXISTS tags          text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS audience      text[]  DEFAULT ARRAY['anyone'],
  ADD COLUMN IF NOT EXISTS mode_affinity text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weight        integer DEFAULT 1;

-- =============================================
-- 2. CHECK constraint for mode_affinity
-- =============================================
-- Drop first in case the constraint name or definition changed
ALTER TABLE public.knowledge_base 
  DROP CONSTRAINT IF EXISTS mode_affinity_valid;

ALTER TABLE public.knowledge_base
  ADD CONSTRAINT mode_affinity_valid
  CHECK (
    mode_affinity <@ ARRAY[
      'PASTORAL', 'CLARITY', 'LAMENT', 'FORMATION',
      'APOLOGETICS', 'COURAGE', 'RELEASE'
    ]::text[]
  );

-- =============================================
-- 3. GIN Indexes for fast array filtering
-- =============================================
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags
  ON public.knowledge_base USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_audience
  ON public.knowledge_base USING GIN (audience);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_mode_affinity
  ON public.knowledge_base USING GIN (mode_affinity);

-- Partial index for boosted entries (future use)
CREATE INDEX IF NOT EXISTS idx_knowledge_base_high_weight
  ON public.knowledge_base (weight)
  WHERE weight > 1;

-- =============================================
-- 4. Backfill defaults for existing rows
-- =============================================
-- Only update rows that haven't been tagged yet (mode_affinity still default)
UPDATE public.knowledge_base
SET 
  mode_affinity = ARRAY['APOLOGETICS', 'CLARITY'],
  audience      = ARRAY['anyone', 'seeker', 'growing', 'mature'],
  weight        = 1
WHERE category = 'apologetics'
  AND (mode_affinity IS NULL OR mode_affinity = '{}');

UPDATE public.knowledge_base
SET 
  mode_affinity = ARRAY['PASTORAL', 'LAMENT', 'COURAGE'],
  audience      = ARRAY['anyone'],
  weight        = 1
WHERE category = 'pastoral'
  AND (mode_affinity IS NULL OR mode_affinity = '{}');

UPDATE public.knowledge_base
SET 
  mode_affinity = ARRAY['CLARITY'],
  audience      = ARRAY['anyone'],
  weight        = 1
WHERE category = 'scripture_context'
  AND (mode_affinity IS NULL OR mode_affinity = '{}');

UPDATE public.knowledge_base
SET 
  mode_affinity = ARRAY['CLARITY', 'APOLOGETICS'],
  audience      = ARRAY['anyone', 'seeker'],
  weight        = 1
WHERE category = 'faq'
  AND (mode_affinity IS NULL OR mode_affinity = '{}');

-- Optional: Add helpful comment
COMMENT ON TABLE public.knowledge_base IS 'Knowledge base with context-aware RAG metadata (tags, audience, mode_affinity)';