-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 008: Context-Aware RAG Retrieval Function
--
-- Replaces the old match_knowledge_base function with an enhanced version
-- that supports optional audience and mode_affinity filtering.
--
-- Fully backwards compatible and idempotent.
-- Called from: src/lib/rag/search.js (or wherever you use it)
-- ─────────────────────────────────────────────────────────────────────────────

-- =============================================
-- 1. Drop old function versions (safe)
-- =============================================
DROP FUNCTION IF EXISTS public.match_knowledge_base(vector, float, int);
DROP FUNCTION IF EXISTS public.match_knowledge_base(vector, float, int, text[], text[]);

-- =============================================
-- 2. Create / Replace the updated function
-- =============================================
CREATE OR REPLACE FUNCTION public.match_knowledge_base(
  query_embedding  vector(768),
  match_threshold  float     DEFAULT 0.5,
  match_count      int       DEFAULT 3,
  filter_audience  text[]    DEFAULT NULL,
  filter_mode      text[]    DEFAULT NULL
)
RETURNS TABLE (
  id             uuid,
  title          text,
  content        text,
  category       text,
  scripture_ref  text,
  tags           text[],
  audience       text[],
  mode_affinity  text[],
  weight         int,
  similarity     float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.category,
    kb.scripture_ref,
    kb.tags,
    kb.audience,
    kb.mode_affinity,
    kb.weight,
    -- Weight-boosted similarity:
    -- weight 1 → ×1.0 (no change)
    -- weight 2 → ×1.1 (+10%)
    -- weight 3 → ×1.2 (+20%)
    (1 - (kb.embedding <=> query_embedding)) * (1 + (kb.weight - 1) * 0.1) AS similarity
  FROM public.knowledge_base kb
  WHERE
    -- Core vector similarity filter
    (1 - (kb.embedding <=> query_embedding)) > match_threshold

    -- Audience filter (optional)
    -- 'anyone' entries are always included
    AND (
      filter_audience IS NULL
      OR kb.audience && filter_audience
      OR kb.audience @> ARRAY['anyone']
    )

    -- Mode filter (optional)
    -- Empty mode_affinity = broadly applicable
    AND (
      filter_mode IS NULL
      OR kb.mode_affinity = '{}'
      OR kb.mode_affinity && filter_mode
    )

  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- =============================================
-- 3. Grant execute permissions
-- =============================================
GRANT EXECUTE ON FUNCTION public.match_knowledge_base(vector, float, int, text[], text[])
  TO authenticated, service_role;

-- Optional: Add comment for documentation
COMMENT ON FUNCTION public.match_knowledge_base(vector, float, int, text[], text[]) 
IS 'Context-aware RAG search with audience + mode affinity filtering + weight boosting';