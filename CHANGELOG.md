# Changelog

All notable changes to Kairos are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

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
- `ThemeApplier.jsx` — global CSS variable injection for theme/accent/font; placed inside `SettingsProvider` in root layout
- `FinalCTA.jsx` — `"use client"` component with scroll-triggered animation
- **Contact form system** — `/api/contact/route.js` with Resend, 6 type-aware auto-replies, Supabase `contact_messages` table
- `InlineSignInModal` — preserves chat state during unauthenticated save flows
- `returnTo` redirect logic in middleware and login page
- `useAuthState.js` — reactive `onAuthStateChange` hook replacing static `getUser()` calls

### Changed
- All app pages redesigned to Leonardo AI aesthetic: 220px sidebar + 58px mobile bottom nav
- `/journey` (CompanionCore) — sidebar nav, VotD card, active plan card, example prompts
- `/journey/saved` — sidebar filter/sort, desktop search-only toolbar, single mobile "Filter & Sort" button
- `/bible` — 3-panel layout, fixed action bar, book drawer with `inDrawer` prop
- `/plans` — sidebar nav, active enrollments, category filters
- `/plans/[id]` — sidebar nav, progress strip, day grid
- `/plans/[id]/day/[day]` — sidebar nav, all logic preserved, sticky complete button
- `/account` — sidebar nav, stats strip, section cards
- `/settings` — sidebar nav, full theme/accent/font/translation/companion/notification controls
- `Navbar.jsx` — floating pill nav, app links, avatar chip, theme-synced
- `supabase/client.js` — migrated from `createClient` to `createBrowserClient`

### Fixed
- Bible action bar obscured by browser chrome on iOS Safari — `calc(58px + env(safe-area-inset-bottom))`
- Bible mobile drawer: `BookPanel` `inDrawer` prop skips CSS `display:none` override
- Bible double panel on desktop: removed inline `display:"flex"` overriding CSS `display:none`
- Bible verse key warning: `key={v-${num}-${selectedChapter}}` with `?? (i+1)` fallback
- Journey/saved duplicate search bar on mobile
- Journey/saved duplicate `<Navbar />` (sidebar handles navigation)
- Auth loop caused by `createClient` vs `createBrowserClient` distinction
- `--space-7` token usage — does not exist; replaced with valid tokens

---

## [0.8.0] — Phase 7I — Reading Plans + Daily Experience

### Added
- Verse of the Day — static array of 365 curated verses, cycling by `dayOfYear` index (zero API dependency)
- VotD card in `CompanionCore` — gated by `settings.showVotD`
- Active Plan card in `CompanionCore` — gated by `settings.showActivePlan`
- Example prompts in `CompanionCore` — gated by `settings.showExamplePrompts`
- `/plans/[id]/day/[day]/page.jsx` — full day reading page with devotional, reflection, prayer prompts
- Personal notes on day completion auto-saved as `journey_entries` (Option B)
- `handleAskKairos` — writes full day context to `sessionStorage` for companion handoff
- `handleCatchUp` — advances `current_day` to next unread day without marking skipped days complete
- `handleComplete` — marks day complete, optionally saves personal notes to Journey
- `noteSavedToJourney` response flag from progress API
- Reading plan enrollment flow end-to-end

### Changed
- `CompanionCore` renders daily experience surface (VotD + Active Plan) before any conversation starts — modeled on Glorify's structure
- Plans progress API extended with `catch_up` action
- Settings keys added: `showVotD`, `showActivePlan`, `showExamplePrompts`, `dailyReminder`, `votdNotification`

---

## [0.7.0] — Phase 7H — Bible Reader

### Added
- `/bible/page.jsx` — 3-panel layout: book panel, chapter panel, verse panel
- Static 66-book data structure (no API dependency for book/chapter metadata)
- `bible-api.com` as primary chapter fetch source (WEB, KJV, ASV, BBE — no key required)
- Session-based verse highlighting (not persisted)
- Notes flow through `SaveMomentModal`
- `sessionStorage`-based "Ask Kairos about this" handoff to companion
- `/api/bible/chapter/route.js` and `/api/bible/verse/route.js`
- `/api/bible/debug/route.js` for translation testing

### Fixed
- **Critical:** Bible save actions were passing Supabase auth UUID instead of internal `users.id` profile ID to save route — silently failing all saves. Root cause: missing profile resolution step. Fix: resolve `users.id` from `auth_id` before every data operation.

---

## [0.6.0] — Phase 7G — Journey Saved Page

### Added
- `/journey/saved/page.jsx` — full redesign
- Real-time search across title, content, scripture references
- Filter by entry type: reflection, prayer, insight, verse, note
- Sort options: newest, oldest, type
- `SaveMomentModal` with auto-title suggestion and entry-type detection
- Mobile: single "Filter & Sort" button + active filter chips
- Desktop: search-only toolbar (filter/sort in sidebar)

### Fixed
- CSS token `--space-7` does not exist in design system (valid scale ends at `--space-6`, then `--space-8`). All usages replaced.

---

## [0.5.0] — Phase 7A–7F — App Page Redesigns

### Added
- `/account/page.jsx` — avatar, stats strip, section cards (Identity/Security/Data/Links/Danger)
- `/settings/page.jsx` — theme, accent palette, reading font, translation, companion toggles, notification settings
- `/api/account/delete/route.js` — full account deletion
- `/api/account/export/route.js` — data export
- Real `Notification.requestPermission()` flow with denied-state detection

### Changed
- All app pages standardised to 220px sidebar + 58px mobile bottom nav pattern
- `SettingsContext` extended with full settings key set

---

## [0.4.0] — Phase 6 — Auth + Bible API

### Added
- Email/password authentication — login, register, forgot-password pages
- Supabase auth helpers — `client.js`, `server.js`, `auth.js`, `admin.js`
- `/api/auth/callback/route.js` — handles both PKCE code exchange and OTP `token_hash` flows
- Middleware for route protection with auth state detection
- Auth-aware `Navbar.jsx`
- `/api/bible/chapter/route.js` — initial Bible API integration
- `ScriptureAPI` as secondary Bible source

### Fixed
- Auth callback required handling two separate flows in one route: PKCE `code` exchange (email/password) and OTP `token_hash` (magic link/reset). Both handled with conditional logic in a single route.

---

## [0.3.0] — Phase 4–5 — AI Core + RAG

### Added
- Groq primary AI integration (`llama-3.3-70b-versatile`)
- OpenRouter fallback chain (4 models)
- Google Gemini fallback chain (3 models)
- `/api/ai/companion/route.js` — main conversation endpoint
- `/api/ai/guidance/route.js` — structured guidance endpoint
- RAG system: Jina AI embeddings (768-dim), Supabase pgvector
- `lib/rag/embeddings.js` — vector generation
- `lib/rag/search.js` — semantic similarity search
- `lib/ai/guardrails.js` — tone and integrity guardrails
- `lib/ai/prompts.js` — system prompt construction
- `lib/ai/context.js` — context assembly (user history + RAG results)
- `/api/admin/seed/route.js` — reading plan seeding

### Changed
- **Embedding provider switched mid-phase from Gemini to Jina AI** — Gemini embedding API had regional billing restrictions blocking access from Kenya. Jina AI: free, globally accessible, 768-dim vectors (schema-compatible). Zero migration cost.

---

## [0.2.0] — Phase 2–3 — Data Layer + Journey

### Added
- Supabase schema: 4 migration files (initial schema, user profiles, journeys, reading plans)
- `users` table with `auth_id` foreign key to Supabase auth
- `journey_entries` table with RLS policies
- `user_plans`, `plan_days`, `reading_plans` tables
- `/api/journey/save/route.js`
- `/api/user/journey/route.js`
- `/api/user/profile/route.js`
- `JourneyContext`, `UserContext`, `SettingsContext`, `CompanionContext`
- Custom hooks: `useAuth`, `useCompanion`, `useJourney`, `useVoice`
- Design token system — `src/styles/tokens.css`

---

## [0.1.0] — Phase 1 — Foundation

### Added
- Next.js 16.1.6 project scaffold (App Router, Turbopack, webpack)
- Supabase project setup and local config
- Base component library: `Button`, `Card`, `Input`, `Loader`, `Modal`, `Avatar`
- `globals.css`, `animations.css`, `typography.css`
- `jsconfig.json` with `@/` path aliases
- `tailwind.config.js` (utility reference only — primary styling via CSS variables)
- `next.config.js` with image domains and webpack config
- `manifest.json`, `robots.txt`, `sitemap.xml`
- Initial `docs/PROJECT.md` — live handoff document maintained throughout development
- Git repository initialised with `main` and `dev` branches

---

## Versioning Strategy

- `main` branch = production (deployed to Vercel on every push)
- `dev` branch = active development
- Each phase committed to `dev` at completion, then merged to `main` for deployment
- Tags applied at major milestones: `v0.9.0` (pre-launch), `v1.0.0` (launch)