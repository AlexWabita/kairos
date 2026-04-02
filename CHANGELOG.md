# Changelog

All notable changes to Kairos are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.1.0] — Phase 8A–8E — Post-Launch Hardening & Premium Upgrade

### Phase 8E — Documentation & Architecture Pass

#### Changed
- `ARCHITECTURE.md` fully rewritten to reflect actual production system — server-derived identity layer, context-aware RAG pipeline, 7-mode response system, memory injection, updated API route table
- `README.md` updated: phase table extended through 8E, roadmap updated, screenshots section maintained
- `CHANGELOG.md` updated with full 8A–8E history
- `docs/PROJECT.md` updated with current session state

---

### Phase 8D — Codebase Hardening

#### Added
- `src/app/api/user/profile/route.js` — GET and PATCH endpoints for authenticated user profile, server-derived identity, whitelisted fields only
- `src/lib/env/server.js` — startup environment variable validation with required/optional distinction and provider detection

#### Changed
- `src/app/api/account/delete/route.js` — aligned with shared auth utilities (`requireRequestAppUser`), uses `appUser.auth_id` for deletion

#### Removed
- `src/app/api/ai/guidance/route.js` — never implemented; Bible→Companion handoff uses `sessionStorage` pattern, not this route
- `src/app/api/auth/route.js` — empty stub, unused
- `src/components/journey/JourneyEntry.jsx` — empty stub, unimported
- `src/components/journey/JourneyMap.jsx` — empty stub, unimported
- `src/components/journey/JourneyTimeline.jsx` — empty stub, unimported
- `src/components/companion/CompanionVoice.jsx` — empty stub, unimported
- `src/context/CompanionContext.jsx` — empty stub, unimported
- `src/context/JourneyContext.jsx` — empty stub, unimported
- `src/hooks/useAuth.js` — empty stub, unimported
- `src/hooks/useCompanion.js` — empty stub, unimported
- `src/hooks/useJourney.js` — empty stub, unimported
- `src/hooks/useVoice.js` — empty stub, unimported
- `src/types/companion.js` — empty stub, unimported
- `src/types/journey.js` — empty stub, unimported
- `src/types/user.js` — empty stub, unimported

---

### Phase 8C — RAG Corpus Expansion & Retrieval Intelligence

#### Added
- `supabase/migrations/007_knowledge_base_metadata.sql` — adds `tags text[]`, `audience text[]`, `mode_affinity text[]`, `weight integer` columns to `knowledge_base`; GIN indexes on all array columns; partial index for weight boosting; backfill defaults for existing 63 entries
- `supabase/migrations/008_context_aware_retrieval.sql` — replaces `match_knowledge_base()` RPC with updated version accepting `filter_audience` and `filter_mode` parameters; weight-boosted similarity scoring; backwards compatible with null parameters
- `docs/KAIROS_TAG_TAXONOMY.md` (gitignored) — internal tag taxonomy v1: master tag list, audience and mode affinity values, entry writing checklist, example entry
- 50 new knowledge base entries across 5 domains:
  - Formation (15): repentance, sanctification, Holy Spirit, spiritual disciplines, discernment, persistent sin, Sabbath, accountability, vocation, rule of life, gratitude, and others
  - Advanced spirituality (10): spiritual dryness, contemplative prayer, mystical experience, dark night of the soul, spiritual warfare, angels, suffering and holiness, death and dying, afterlife, union with God
  - Addiction & struggle (8): awareness stage, shame cycle, relapse, spiritual roots of addiction, community in recovery, long-term freedom, pornography, emotional addiction
  - Unanswered prayer (7): years without answer, delay vs no answer, praying in anger, hollow prayer, accepting a different answer, intercession, simplicity in prayer
  - Social faith (10): justice and mercy, conflict between believers, service, family without shared faith, cultural pressure, spiritual leadership, forgiveness in relationships, blessing enemies, building community, church hurt

#### Changed
- `src/lib/rag/search.js` — context-aware retrieval: lightweight message classification infers mode and audience hints; passes filters to updated RPC; filtered search with automatic unfiltered fallback; detailed logging
- `src/app/api/admin/seed/route.js` — upsert now passes `tags`, `audience`, `mode_affinity`, `weight` fields; comment updated to reflect 113 total entries
- 1 new entry added: shame vs conviction (weight 2)
- 8 entries rewritten with trigger-anchored opening lines (opening at the moment of use rather than at a topic definition)

---

### Phase 8B — Companion Premium Upgrade

#### Added
- `RESPONSE_MODES` in `src/lib/ai/prompts.js` — 7 response modes (Pastoral, Clarity, Lament, Formation, Apologetics, Courage, Release) with distinct posture and mode-dependent closing guidance
- `buildMemoryContext()` in `src/lib/ai/prompts.js` — formats last 5 journey entries (300 chars each) for system prompt injection
- `buildProfileContext()` and `buildRagContext()` — consolidated profile/RAG string building into shared helpers
- `fetchRecentJourney()` in companion route — fetches last 5 journey entries for authenticated users, silent on failure
- `src/app/api/user/journey/route.js` — GET with pagination; foundation for memory-driven personalization
- Capability cards in `CompanionCore` — 19 capabilities across 6 emotional groups replacing example prompts; each card injects a Kairos framing bubble on click
- `handleCapabilityClick` — injects framing message as Kairos bubble, opens conversation in correct posture
- `docs/KAIROS_PRINCIPLES.md` (gitignored) — internal design principles document: identity, audience, theological commitments, boundary policy, application to RAG/Plans/Memory/Response
- `docs/KAIROS_TAG_TAXONOMY.md` (gitignored) — internal tag taxonomy

#### Changed
- `RESPONSE_STRUCTURE` in `src/lib/ai/prompts.js` — step 4 (closing) is now mode-dependent; forced question removed; mode-specific closing guidance for all 7 modes
- `buildSystemPrompt()` — accepts new `memoryContext` parameter; injection order: Identity → Modes → Structure → Profile → Memory → RAG → Verse
- Companion route now fetches profile, RAG, and journey entries in parallel (`Promise.all`)
- `CompanionCore` input bar — nested box removed; flat underline input with gold focus state; `alignItems: center` for textarea/button alignment

#### Fixed
- Companion route was calling OpenAI `text-embedding-3-small` for RAG query embeddings (wrong provider, wrong dimensions) — replaced with `searchKnowledgeBase()` from `lib/rag/search.js` (Jina AI, 768-dim, correct)
- `src/app/page.jsx` — orphaned `<meta name="msvalidate.01">` tag before imports removed (Bing verification already handled by `metadata.verification.bing`)
- Client-sent `userId` removed from companion request body (`CompanionCore.jsx` line 781) — server now derives identity independently

---

### Phase 8A — Critical Backend Trust Refactor

#### Added
- `src/lib/server/auth/getRequestUser.js` — resolves Supabase auth session from cookies
- `src/lib/server/auth/getRequestAppUser.js` — resolves app-level profile row; primary lookup by `auth_id`, fallback by `id`
- `src/lib/server/auth/requireRequestUser.js` — wraps `getRequestUser`, returns 401 if unauthenticated
- `src/lib/server/auth/requireRequestAppUser.js` — wraps `getRequestAppUser`, returns 401 if unauthenticated or anonymous
- `src/lib/server/http/responses.js` — standardised response helpers: `ok`, `badRequest`, `unauthorized`, `forbidden`, `notFound`, `serverError`
- `supabase/migrations/006_rls_policies_audit.sql` — RLS audit and fixes across all 12 public schema tables

#### Changed
- `src/app/api/account/export/route.js` — server-derived identity; no longer accepts `userId` from query params
- `src/app/api/journey/save/route.js` — server-derived identity; no longer accepts `userId` from request body
- `src/app/api/plans/route.js` — server-derived identity; GET returns public plans + authenticated user enrollment; POST accepts only `{planId, isPrivate}`
- `src/app/api/plans/[id]/route.js` — server-derived identity; uses `getRequestAppUser` (optional auth, public-first route)
- `src/app/api/plans/progress/route.js` — server-derived identity; all ownership checks use `appUser.id`; journey writes use `appUser.id`
- `src/app/api/ai/companion/route.js` — server-derived identity; dual-mode support (authenticated → `appUser.id`, anonymous → IP fallback); rate limiting no longer bypassable via client userId
- Multiple frontend pages cleaned of `userId` in API fetch calls: `account/page.jsx`, `bible/page.jsx`, `plans/page.jsx`, `plans/[id]/page.jsx`, `plans/[id]/day/[day]/page.jsx`

#### Fixed
- Authorization pattern across 5 API routes — client-provided `userId` was trusted for permission decisions; replaced with server-derived `appUser.id` throughout
- `typings/` directory removed from git tracking and added to `.gitignore`

---

## [1.0.0] — 2026-03-20 — Production Launch

First public release. Deployed to [kairos-ebon.vercel.app](https://kairos-ebon.vercel.app).

### Added
- Full production deployment via Vercel
- `.npmrc` with `legacy-peer-deps=true` for Vercel build compatibility
- `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TEAM_EMAIL` environment variables
- Post-launch fixes: testimonials `id`, light theme hardcoded color overrides, FAQ mobile sticky overlap, hamburger solid background, email address updates

### Changed
- `NEXT_PUBLIC_APP_URL` updated to production Vercel URL
- `CONTACT_TEAM_EMAIL` updated to dedicated Kairos Gmail

---

## [0.9.0] — Phase 7J — Full Redesign + Pre-Launch

### Added
- **Homepage full rebuild** — Hero, About, Features, HowItWorks, ScriptureBanner, Testimonials, FAQ, Contact, FinalCTA sections
- `HomepageNavbar.jsx` — transparent → frosted pill on scroll, mobile overlay with staggered link animations
- `ThemeApplier.jsx` — global CSS variable injection for theme/accent/font
- `FinalCTA.jsx` — scroll-triggered animation
- **Contact form system** — `/api/contact/route.js` with Resend, 6 type-aware auto-replies, `contact_messages` table
- `InlineSignInModal` — preserves chat state during unauthenticated save flows
- `returnTo` redirect logic in middleware and login page
- `useAuthState.js` — reactive `onAuthStateChange` hook

### Changed
- All app pages redesigned to Leonardo AI aesthetic: 220px sidebar + 58px mobile bottom nav
- `supabase/client.js` — migrated from `createClient` to `createBrowserClient`

### Fixed
- Mobile nav CSS stacking context bug — `hn-mobile-menu` div moved to sibling of `<nav>` element; overlay z-index corrected

---

## [0.8.0] — Phase 7I — Reading Plans + Daily Experience

### Added
- Verse of the Day — static array of 365 curated verses, cycling by `dayOfYear`
- VotD card, Active Plan card, example prompts in `CompanionCore` — all gated by settings
- `/plans/[id]/day/[day]/page.jsx` — devotional, reflection, prayer prompts per day
- Personal notes auto-saved as journey entries on day completion
- `handleCatchUp` — advances `current_day` without falsely marking skipped days complete

---

## [0.7.0] — Phase 7H — Bible Reader

### Added
- `/bible/page.jsx` — 3-panel layout: book panel, chapter panel, verse panel
- `bible-api.com` integration (WEB, KJV, ASV, BBE — no key required)
- Session-based verse highlighting
- `sessionStorage`-based "Ask Kairos about this" handoff to companion

### Fixed
- Bible save actions were passing Supabase auth UUID instead of internal `users.id` — silently failing all saves

---

## [0.6.0] — Phase 7G — Journey Saved Page

### Added
- `/journey/saved/page.jsx` — real-time search, filter by entry type, sort options
- `SaveMomentModal` with auto-title suggestion and entry-type detection

### Fixed
- CSS token `--space-7` does not exist — all usages replaced with valid tokens

---

## [0.5.0] — Phase 7A–7F — App Page Redesigns

### Added
- `/account/page.jsx`, `/settings/page.jsx`
- `/api/account/delete/route.js`, `/api/account/export/route.js`
- Full settings key set in `SettingsContext`

---

## [0.4.0] — Phase 6 — Auth + Bible API

### Added
- Email/password authentication — login, register, forgot-password
- `/api/auth/callback/route.js` — PKCE code exchange and OTP `token_hash` in single route
- Middleware for route protection

---

## [0.3.0] — Phase 4–5 — AI Core + RAG

### Added
- Groq primary AI integration
- OpenRouter and Gemini fallback chains
- RAG system: Jina AI embeddings (768-dim), Supabase pgvector
- `lib/rag/embeddings.js`, `lib/rag/search.js`
- `lib/ai/prompts.js` — system prompt construction
- `/api/admin/seed/route.js` — knowledge base seeding

### Changed
- Embedding provider switched from Gemini to Jina AI — Gemini had regional billing restrictions blocking access from Kenya

---

## [0.2.0] — Phase 2–3 — Data Layer + Journey

### Added
- Supabase schema: 4 migration files
- `users` table with `auth_id` foreign key
- `journey_entries`, `user_plans`, `plan_days`, `reading_plans` tables
- `/api/journey/save/route.js`
- Design token system — `src/styles/tokens.css`

---

## [0.1.0] — Phase 1 — Foundation

### Added
- Next.js 16.1.6 project scaffold (App Router, Turbopack)
- Supabase project setup
- Base component library: `Button`, `Card`, `Input`, `Loader`, `Modal`, `Avatar`
- `jsconfig.json` with `@/` path aliases
- `manifest.json`, `robots.txt`, `sitemap.xml`
- Git repository with `main` and `dev` branches

---

## Versioning Strategy

- `main` branch = production (auto-deployed by Vercel on every push)
- `dev` branch = active development
- Each phase committed to `dev` at completion, merged to `main` for deployment