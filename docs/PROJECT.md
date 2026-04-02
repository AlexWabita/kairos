# KAIROS — Project Log
# Live handoff document. Updated at the end of every session.
# Internal only — not for public distribution.

---

## Current State

**Version:** 1.1.0
**Branch:** dev (clean, up to date with origin)
**Production:** https://kairos-ebon.vercel.app (main branch, auto-deployed)
**Repo:** https://github.com/AlexWabita/kairos (public)

---

## Phases Complete

| Phase | Status | Summary |
|-------|--------|---------|
| 1–7J | ✅ Complete | Full product build through production launch |
| 1.0.0 | ✅ Live | Production deployment, Google Search Console, v1.0.0 tag |
| 8A | ✅ Complete | Security hardening — server-derived identity across all routes |
| 8B | ✅ Complete | Companion premium upgrade — modes, memory, capability cards |
| 8C | ✅ Complete | RAG corpus expansion + context-aware retrieval |
| 8D | ✅ Complete | Codebase hardening — empty files removed, routes completed |
| 8E | ✅ Complete | Documentation pass — ARCHITECTURE, README, CHANGELOG updated |

---

## What Was Done This Session (8A → 8E)

### 8A — Critical Backend Trust Refactor
- Built shared identity utilities: `getRequestUser`, `getRequestAppUser`, `requireRequestUser`, `requireRequestAppUser`
- Built shared HTTP response helpers: `lib/server/http/responses.js`
- Refactored all 5 vulnerable routes to server-derived identity: `account/export`, `journey/save`, `plans`, `plans/[id]`, `plans/progress`
- Fixed companion route: removed OpenAI `fetchRagEntries` (wrong provider, wrong dimensions), replaced with `searchKnowledgeBase` from `lib/rag/search.js` (Jina AI, 768-dim)
- Removed orphaned `<meta>` tag from `src/app/page.jsx`
- Cleaned `CompanionCore.jsx` — removed client-sent `userId` from companion request body
- Built `GET /api/user/journey` — paginated journey entries, foundation for memory

### 8B — Companion Premium Upgrade
- Added `RESPONSE_MODES` to `prompts.js` — 7 modes with distinct posture and closing guidance
- Updated `RESPONSE_STRUCTURE` — forced question replaced with mode-dependent closing
- Added `buildMemoryContext()` — formats last 5 journey entries for system prompt injection
- Updated companion route — fetches profile, RAG, and journey entries in parallel
- Replaced `PROMPTS` with `CAPABILITIES` in `CompanionCore` — 19 cards across 6 emotional groups
- Added `handleCapabilityClick` — injects framing bubble, opens conversation in correct posture
- Fixed compound input box — flat underline design, aligned textarea and send button
- Authored `docs/KAIROS_PRINCIPLES.md` (gitignored) — internal design principles document

### 8C — RAG Corpus Expansion
- Migration 007: `tags`, `audience`, `mode_affinity`, `weight` columns + GIN indexes + CHECK constraint on mode_affinity
- Migration 008: updated `match_knowledge_base()` RPC with audience/mode filters + weight-boosted scoring
- Authored `docs/KAIROS_TAG_TAXONOMY.md` (gitignored) — master tag list, conventions, entry checklist
- Wrote 50 new knowledge base entries across 5 domains (formation, advanced spirituality, addiction, unanswered prayer, social faith)
- Added shame vs conviction entry
- Rewrote 8 entries with trigger-anchored opening lines
- Updated `lib/rag/search.js` — message classification, metadata filtering, unfiltered fallback
- Updated seed route upsert to pass new metadata fields

### 8D — Codebase Hardening
- Built `src/app/api/user/profile/route.js` — GET + PATCH, whitelisted fields, server-derived identity
- Updated `src/app/api/account/delete/route.js` — aligned with shared auth utilities
- Built `src/lib/env/server.js` — startup environment validation
- Deleted 15 empty stub files (all verified as unimported before deletion)

### 8E — Documentation Pass
- `ARCHITECTURE.md` — full rewrite reflecting actual post-8D system
- `README.md` — version bump, feature list updated, phase table extended, security section added, roadmap updated
- `CHANGELOG.md` — 8A through 8E fully documented
- `docs/PROJECT.md` — this file

---

## Pending Manual Tasks

- [ ] Take 6 README screenshots and commit to `docs/screenshots/`
- [ ] Move `BingSiteAuth.xml` to `public/` and re-verify in Bing Webmaster Tools
- [ ] Move `googlec2130cab6004c15d.html` to `public/` and re-verify in Google Search Console
- [ ] Fix contact email placeholder in `Contact.jsx`: `hello@kairos.app` → `kairos.app.official@gmail.com`

---

## Next Phase

### Companion UI/UX Redesign + Conversation Persistence

Two interconnected workstreams:

**Conversation persistence (backend + frontend):**
- `GET /api/user/conversations` — fetch recent conversations with their messages
- Update companion route to store user messages (currently only stores assistant messages)
- Load most recent active conversation on companion page mount
- Auto-resume — conversation is simply there, no friction
- "New conversation" button to start fresh
- Save entire conversation as a single journey entry (replaces per-message save)
- Anonymous users: no persistence (natural call to action for account creation)

**Companion page UI redesign:**
- Alex has modern UX ideas to share at session start
- Full redesign scope: pre-conversation screen, active conversation, VotD/active plan placement, capability cards layout, input area, mobile experience
- Must accommodate the new conversation persistence patterns

---

## Architecture Decisions Log

### Identity resolution (8A)
`users.auth_id` is the Supabase auth UUID. `users.id` is the internal profile UUID. All server-side identity resolution uses `auth_id` as the lookup key. These are different values and must never be confused.

### RAG embeddings provider
Jina AI (`jina-embeddings-v2-base-en`, 768-dim). Switched from Gemini in Phase 5 due to regional billing restrictions. Never use OpenAI embeddings — vectors would be incompatible dimensions with stored pgvector data.

### Companion route — memory injection
Last 5 journey entries fetched in parallel with profile and RAG (`Promise.all`). Injected into system prompt via `buildMemoryContext()`. Never revealed to the user as a mechanism — simply informs Kairos' awareness.

### match_knowledge_base RPC
Not defined in committed migrations (was created directly in Supabase dashboard originally). Migration 008 replaces it with the authoritative version. The function is now version-controlled and reproducible.

### Empty file deletions (8D)
15 files deleted after verifying zero imports across the entire codebase. Verification command:
```bash
grep -rn "JourneyEntry\|JourneyMap\|CompanionContext\|useCompanion\|useJourney\|useVoice\|useAuth\b" \
  src --include="*.js" --include="*.jsx" | grep "import"
```
Result: no results. Safe to delete.

---

## Design System Rules (permanent)

- Spacing tokens: `--space-1` through `--space-6`, then `--space-8`, `--space-10`, `--space-16`, `--space-24` — `--space-7` and `--space-9` do NOT exist
- Font families: `--font-display` (Cinzel), `--font-heading` (Cormorant Garamond), `--font-body` (Nunito)
- Colors: always use CSS vars — never hardcode `rgba(255,255,255,x)` for text/backgrounds
- Touch targets: all interactive elements minimum 44px height
- Sidebar: `220px` sticky on all app pages
- Mobile nav: fixed `58px`, `z-index: 100`, `env(safe-area-inset-bottom)` padding
- Border rule: never mix `border` shorthand with `borderColor` in JS event handlers
- Surgical edits only — never regenerate full files without being asked

---

## Git Workflow

```bash
# Work on dev
git checkout dev
git add .
git commit -m "type: description"
git push origin dev

# Deploy to production
git checkout main
git merge dev
git push origin main
git checkout dev
```

Commit types: `feat`, `fix`, `refactor`, `chore`, `docs`

---

## Environment Variables (current)

```
NEXT_PUBLIC_APP_URL=https://kairos-ebon.vercel.app
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=
GEMINI_API_KEY=
JINA_API_KEY=
SCRIPTURE_API_KEY=      (unused — kept for future)
SEED_SECRET=
RESEND_API_KEY=
CONTACT_FROM_EMAIL=onboarding@resend.dev
CONTACT_TEAM_EMAIL=kairos.app.official@gmail.com
```