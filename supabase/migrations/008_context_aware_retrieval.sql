-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 008: Context-Aware RAG Retrieval
--
-- Replaces the match_knowledge_base function with an updated version that
-- accepts optional metadata filters: audience and mode_affinity.
--
-- This enables the retrieval layer to pre-filter by who the content is for
-- and which conversation mode it serves, before running vector similarity.
--
-- The function is fully backwards-compatible:
--   - filter_audience  defaults to NULL  → no audience filtering
--   - filter_mode      defaults to NULL  → no mode filtering
--   - weight boosting  is always applied → higher weight entries rank higher
--
-- Called from: src/lib/rag/search.js
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop the old version if it exists (safe — we are replacing it)
DROP FUNCTION IF EXISTS match_knowledge_base(vector, float, int);
DROP FUNCTION IF EXISTS match_knowledge_base(vector, float, int, text[], text[]);

-- ── Updated function ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION match_knowledge_base(
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
    -- Weight-boosted similarity score:
    -- Multiplying by (1 + (weight - 1) * 0.1) means:
    --   weight 1 → score × 1.0   (unchanged)
    --   weight 2 → score × 1.1   (+10%)
    --   weight 3 → score × 1.2   (+20%)
    -- This nudges high-weight entries up without overwhelming vector similarity.
    (1 - (kb.embedding <=> query_embedding)) * (1 + (kb.weight - 1) * 0.1) AS similarity
  FROM knowledge_base kb
  WHERE
    -- Vector similarity threshold (applied before weight boost for efficiency)
    (1 - (kb.embedding <=> query_embedding)) > match_threshold

    -- Audience filter: if provided, entry must overlap with requested audience.
    -- 'anyone' entries always pass — they are universally applicable.
    AND (
      filter_audience IS NULL
      OR kb.audience && filter_audience
      OR kb.audience @> ARRAY['anyone']
    )

    -- Mode filter: if provided, entry must serve at least one of the requested modes.
    -- Entries with empty mode_affinity pass through — they are broadly applicable.
    AND (
      filter_mode IS NULL
      OR kb.mode_affinity = '{}'
      OR kb.mode_affinity && filter_mode
    )

  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- ── Grant access to authenticated and service role ────────────────────────────
GRANT EXECUTE ON FUNCTION match_knowledge_base(vector, float, int, text[], text[])
  TO authenticated, service_role;