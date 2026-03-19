# KAIROS — Project Handoff Document
_Last updated: Phase 7J (Session end)_

---

## What Kairos Is

A Biblical AI life companion web app. Not a utility tool — a companion. Every design and architectural decision should serve that identity. Users come with real questions, pain, doubt, and faith. Kairos listens, responds with scripture wisdom, and helps them record their spiritual journey.

**Stack:** Next.js 16 (App Router, Turbopack), Supabase (auth + DB), Groq (primary AI), OpenRouter + Gemini (fallback chain), Jina AI (RAG embeddings, 768-dim), bible-api.com

**Repo:** `AlexWabita/kairos` (private) — branches: `main`, `dev`

---

## Current Project File Structure

```
kairos/
├── docs/
│   ├── PROJECT.md          ← this file
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   ├── DECISIONS.md
│   ├── Phase7.md
│   └── PHASES.md
├── public/
│   ├── favicon.ico
│   ├── icon.png
│   ├── apple-touch-icon.png
│   ├── og-image.png
│   ├── manifest.json
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── fonts/
│   ├── icons/
│   └── images/
│       ├── logo-full.png       ← 8-pointed star + KAIROS wordmark (black bg, mix-blend-mode: screen)
│       └── logo-mark.png       ← star only
├── src/
│   ├── app/
│   │   ├── layout.jsx          ← root layout, metadata, viewport export fixed
│   │   ├── page.jsx            ← homepage (full rebuild, Phase 7J)
│   │   ├── globals.css
│   │   ├── loading.jsx
│   │   ├── error.jsx
│   │   ├── not-found.jsx
│   │   ├── (auth)/
│   │   │   ├── layout.jsx
│   │   │   ├── login/page.jsx          ← UPDATED: returnTo support, Suspense wrapper
│   │   │   ├── register/page.jsx
│   │   │   └── forgot-password/page.jsx
│   │   ├── (main)/
│   │   │   ├── layout.jsx              ← minimal passthrough
│   │   │   ├── journey/page.jsx        ← AI companion page (PENDING UI redesign)
│   │   │   ├── explore/page.jsx
│   │   │   ├── profile/page.jsx
│   │   │   └── resources/page.jsx
│   │   ├── account/page.jsx
│   │   ├── settings/page.jsx
│   │   ├── bible/page.jsx              ← Bible reader
│   │   ├── plans/
│   │   │   ├── page.jsx                ← UPDATED: useAuthState hook
│   │   │   ├── [id]/page.jsx
│   │   │   └── [id]/day/[day]/page.jsx
│   │   ├── journey/
│   │   │   └── saved/page.jsx          ← REDESIGNED: two-column layout, sidebar
│   │   ├── privacy/page.jsx
│   │   └── api/
│   │       ├── ai/companion/route.js
│   │       ├── ai/guidance/route.js
│   │       ├── auth/callback/route.js
│   │       ├── auth/route.js
│   │       ├── bible/chapter/route.js
│   │       ├── bible/verse/route.js
│   │       ├── bible/debug/route.js
│   │       ├── journey/save/route.js
│   │       ├── plans/route.js
│   │       ├── plans/[id]/route.js
│   │       ├── plans/progress/route.js
│   │       ├── user/journey/route.js
│   │       ├── user/profile/route.js
│   │       ├── account/delete/route.js
│   │       ├── account/export/route.js
│   │       └── admin/seed/route.js
│   ├── components/
│   │   ├── companion/
│   │   │   ├── CompanionCore.jsx       ← UPDATED: useAuthState + InlineSignInModal
│   │   │   ├── CompanionPrompt.jsx
│   │   │   ├── CompanionResponse.jsx
│   │   │   ├── CompanionVoice.jsx
│   │   │   ├── BibleVerse.jsx
│   │   │   └── SaveMomentModal.jsx
│   │   ├── journey/
│   │   │   ├── JourneyEntry.jsx
│   │   │   ├── JourneyMap.jsx
│   │   │   └── JourneyTimeline.jsx
│   │   ├── landing/
│   │   │   ├── Hero.jsx               ← UPDATED: buttons wired up
│   │   │   ├── About.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── ScriptureBanner.jsx
│   │   │   ├── Testimonials.jsx
│   │   │   ├── FAQ.jsx
│   │   │   └── Contact.jsx            ← form UI done, /api/contact route PENDING
│   │   ├── shared/
│   │   │   ├── Navbar.jsx             ← UPDATED: logo with mix-blend-mode: screen
│   │   │   ├── Footer.jsx             ← NEW: client component
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   └── SEOHead.jsx
│   │   └── ui/
│   │       ├── Avatar.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Input.jsx
│   │       ├── Loader.jsx
│   │       └── Modal.jsx
│   ├── context/
│   │   ├── CompanionContext.jsx
│   │   ├── JourneyContext.jsx
│   │   ├── SettingsContext.jsx
│   │   └── UserContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useAuthState.js             ← NEW: reactive onAuthStateChange hook
│   │   ├── useCompanion.js
│   │   ├── useJourney.js
│   │   └── useVoice.js
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.js
│   │   │   ├── context.js
│   │   │   ├── guardrails.js
│   │   │   └── prompts.js
│   │   ├── bible/
│   │   │   ├── client.js
│   │   │   └── daily-verses.js
│   │   ├── constants/
│   │   │   ├── languages.js
│   │   │   ├── scripture.js
│   │   │   └── topics.js
│   │   ├── plans/seed.js
│   │   ├── rag/
│   │   │   ├── embeddings.js
│   │   │   └── search.js
│   │   ├── supabase/
│   │   │   ├── client.js               ← FIXED: createBrowserClient (was createClient)
│   │   │   ├── server.js
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── conversations.js
│   │   │   ├── middleware.js
│   │   │   └── sessions.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   ├── helpers.js
│   │   │   └── validators.js
│   │   ├── rateLimit.js
│   │   └── settings.js
│   ├── styles/
│   │   ├── animations.css
│   │   ├── tokens.css
│   │   └── typography.css
│   └── types/
│       ├── companion.js
│       ├── journey.js
│       └── user.js
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_user_profiles.sql
│   │   ├── 003_journeys.sql
│   │   └── 004_reading_plans.sql
│   └── seed.sql
├── middleware.js                        ← UPDATED: returnTo param on redirects
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
├── package.json
└── .env.local
```

---

## Design System Rules (Never Violate)

- **Spacing tokens:** `--space-1` through `--space-6`, then `--space-8`, `--space-10`, `--space-16`, `--space-24` — `--space-7` and `--space-9` do NOT exist
- **Font families:** `--font-display`, `--font-heading`, `--font-body`
- **Colors:** `--color-void`, `--color-divine`, `--color-gold-warm`, `--color-gold-deep`, `--color-soft`, `--color-muted`, `--color-faint`, `--color-border`, `--color-border-hover`, `--color-elevated`, `--color-surface`, `--color-life`
- **All interactive elements:** minimum 44px touch target height
- **"use client"** required on any component using hooks, event handlers, or browser APIs
- Surgical edits only — never regenerate full files without being asked

---

## What Was Completed This Session (Phase 7J)

### Homepage Full Rebuild
- `src/app/page.jsx` — full SEO metadata, viewport export, metadataBase
- `src/components/landing/About.jsx` — manifesto split layout, scroll animations
- `src/components/landing/Features.jsx` — 4 product feature cards
- `src/components/landing/HowItWorks.jsx` — 3-step with connecting timeline
- `src/components/landing/ScriptureBanner.jsx` — Ecclesiastes 3:11 ornament
- `src/components/landing/Testimonials.jsx` — 6 testimonials, masonry grid
- `src/components/landing/FAQ.jsx` — 10 questions, animated accordion
- `src/components/landing/Contact.jsx` — split layout form, success state (API route PENDING)
- `src/components/shared/Footer.jsx` — NEW client component, 4-column nav
- Hero buttons wired: "Begin Journey" → `/journey`, "Learn More" → `#about`

### Branding
- Logo: 8-pointed star + KAIROS wordmark (Image 7)
- `mix-blend-mode: screen` on Navbar logo — makes black bg invisible on dark nav
- `layout.jsx` fixed: manifest inside metadata, separate viewport export
- `manifest.json` created for PWA
- OG image, icon.png, apple-touch-icon.png, logo-full.png, logo-mark.png all in place

### Journey Saved Page Redesign (`src/app/journey/saved/page.jsx`)
- Two-column layout: sticky sidebar (260px) + main content
- Sidebar: journey title, pinned/favourites stat tiles, type breakdown with progress bars, quick nav links
- Sort pills (Newest/Oldest/Pinned/Favourites/A→Z) replacing dropdown
- Premium entry cards: left accent bar, hover glow, staggered entrance animations
- All existing logic (pin, favourite, rename, delete, search, filter) preserved exactly

### Auth Fixes Attempted
- `src/lib/supabase/client.js` — **FIXED**: switched from `createClient` to `createBrowserClient` (cookie-based sessions)
- `middleware.js` — **UPDATED**: adds `?returnTo=` on protected route redirects; honours returnTo when redirecting logged-in users away from auth pages
- `src/app/(auth)/login/page.jsx` — **UPDATED**: reads `returnTo` from searchParams, redirects there after login; wrapped in `<Suspense>`
- `src/app/plans/page.jsx` — **UPDATED**: uses `useAuthState` hook, waits for auth before fetching plans
- `src/components/companion/CompanionCore.jsx` — **UPDATED**: uses `useAuthState`, added `InlineSignInModal` so unauthenticated users can sign in without leaving the chat to save a moment
- `src/hooks/useAuthState.js` — **NEW**: reactive `onAuthStateChange` hook that never misses the session

---

## 🔴 Active Bug — Authentication Loop (UNRESOLVED)

### Symptoms
1. User signs in successfully
2. Plans page shows as unauthenticated (no progress, "Sign in to start" buttons)
3. Clicking "Sign in to start" on individual plan opens that plan correctly
4. Returning to plans page — shows unauthenticated again
5. "Sign in" button at bottom of plans page does nothing on repeated attempts
6. Companion chat save button triggers sign-in; after signing in, page reloads and conversation is lost; trying to save again prompts sign-in again

### Root Cause — Current Best Understanding
The `createBrowserClient` fix should theoretically resolve this. The fact that it hasn't suggests one of:

**Hypothesis A — The files weren't actually saved correctly.**
The outputs were generated but may not have been copied to the correct paths in the actual project. Specifically verify these three files are exactly as generated:
- `src/lib/supabase/client.js` — must be `createBrowserClient`, nothing else
- `src/hooks/useAuthState.js` — must exist at this exact path
- `src/app/plans/page.jsx` — must import from `@/hooks/useAuthState`

**Hypothesis B — Supabase cookie domain/SameSite mismatch.**
The network warning in the terminal: `Cross origin request detected from 192.168.0.100 to /_next/* resource` suggests the app is being accessed from two different IPs (localhost AND 192.168.0.100 from another device or network interface). Supabase cookies set on `localhost` won't be sent to `192.168.0.100`. Always test on `http://localhost:3000` only.

**Hypothesis C — `initKairosSession` in CompanionCore still interfering.**
`initKairosSession` from `src/lib/supabase/sessions.js` is still called on mount. If that function creates an anonymous session or calls `supabase.auth.signInAnonymously()`, it would overwrite the real session. **Paste `sessions.js` in the next chat.**

**Hypothesis D — Supabase Auth email confirmation not completed.**
If the account was registered but the confirmation email was never clicked, Supabase considers the account unconfirmed. The `getUser()` call may return the user but `is_anonymous` behaviour varies. Check Supabase dashboard → Authentication → Users → confirm the account shows as "Confirmed".

### Diagnostics to Run at Start of Next Chat
```powershell
# 1. Confirm client.js is correct
cat src/lib/supabase/client.js

# 2. Confirm useAuthState exists
cat src/hooks/useAuthState.js

# 3. Check sessions.js — likely culprit
cat src/lib/supabase/sessions.js

# 4. Check if plans page actually uses the hook
cat src/app/plans/page.jsx | Select-String "useAuthState"
```

Also open browser DevTools → Application → Cookies → `http://localhost:3000` and confirm `sb-zvleavbmqgxlybnmizst-auth-token` cookie is present after signing in.

---

## Pending Work (Agreed Before Auth Issues Began)

### UI Redesign — Leonard AI Inspired (High Priority)
The goal is to make the entire app feel like a premium, editorial product similar to Leonardo AI's latest interface: clean sidebar navigation, rich content cards, clear visual hierarchy, generous spacing, and a cohesive dark luxury aesthetic.

**Pages to redesign in order:**
1. `src/app/(main)/journey/page.jsx` — the AI companion chat page (PRIMARY — this was the intended target before auth issues)
2. `src/app/plans/page.jsx` — reading plans (partial redesign done, needs polish)
3. `src/app/plans/[id]/page.jsx` — individual plan view
4. `src/app/plans/[id]/day/[day]/page.jsx` — daily reading
5. `src/app/bible/page.jsx` — Bible reader
6. `src/app/account/page.jsx` — account page
7. `src/app/settings/page.jsx` — settings

### Feature Work (Deferred)
- `/api/contact` route for the Contact form
- Phase 8 — Organisation Portal (deliberately deferred, 3 architecture questions unresolved)

---

## Phase 8 Architecture Questions (Still Unresolved — Do Not Start)
1. Org-user relationship model (one user, many orgs vs separate accounts)
2. Group plan progress ownership (individual or org-level)
3. Auth separation for org admins

---

## Key Architectural Rules
- `journey/saved` is at `src/app/journey/saved/` — NOT inside `(main)` route group, so no parent layout provides Navbar. Navbar is imported directly.
- `src/app/(main)/journey/page.jsx` IS inside `(main)` — check whether `(main)/layout.jsx` provides Navbar before adding one
- All Supabase DB queries use the internal `users.id` (profile ID) not the auth UUID. Always resolve `profile.id` via `users` table query on `auth_id`
- Bible API: `bible-api.com` — free, no key needed for WEB/KJV/ASV/BBE
- AI chain: Groq (3 models) → OpenRouter (4 models) → Gemini (3 models)
- RAG: Jina AI embeddings, 768-dim vectors in Supabase pgvector

---

## Environment Variables Required
```
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GROQ_API_KEY
OPENROUTER_API_KEY
GEMINI_API_KEY
JINA_API_KEY
SCRIPTURE_API_KEY
SEED_SECRET
```

---

## Git Workflow
- Work branch: `dev`
- Commit at end of each phase
- `git add . && git commit -m "..." && git push -u origin dev`

---

## Prompt for Next Chat Session

Paste this at the start of the next conversation:

---

**KAIROS — Continuing from Phase 7J**

I'm building Kairos, a Biblical AI life companion web app. Stack: Next.js 16 (App Router), Supabase, Groq, bible-api.com. Repo: AlexWabita/kairos (private), working on `dev` branch.

**We have an unresolved authentication loop bug.** Here is the exact situation:

- `src/lib/supabase/client.js` was changed from `createClient` to `createBrowserClient` from `@supabase/ssr` — this should fix cookie-based sessions
- `middleware.js` was updated to add `?returnTo=` on protected route redirects
- `src/app/(auth)/login/page.jsx` was updated to read `returnTo` and redirect there after login
- `src/app/plans/page.jsx` was updated to use a new `useAuthState` hook
- `src/components/companion/CompanionCore.jsx` was updated to use `useAuthState` and show an `InlineSignInModal` when unauthenticated users try to save a moment
- `src/hooks/useAuthState.js` was created — reactive `onAuthStateChange`-based hook

**Despite all these changes, the bug persists:**
1. After signing in, plans page still shows as unauthenticated
2. The bottom sign-in button on plans page does nothing
3. The companion save button still triggers sign-in; after sign-in, page reloads and conversation is lost; trying to save again prompts sign-in again

**Start by asking me to paste these files so you can diagnose:**
- `src/lib/supabase/sessions.js` (suspected culprit — may be creating anonymous sessions that overwrite real sessions)
- `src/lib/supabase/client.js` (confirm the fix was actually saved)
- `src/hooks/useAuthState.js` (confirm it exists)
- `src/app/plans/page.jsx` (confirm it uses the hook)
- Browser DevTools → Application → Cookies → `http://localhost:3000` — screenshot or list of cookie names present after signing in

Also check Supabase dashboard → Authentication → Users — confirm the test account shows status "Confirmed" not "Unconfirmed".

**After fixing auth, the next planned work is:**
1. Redesign `src/app/(main)/journey/page.jsx` — the AI companion chat page — in a premium Leonard AI-inspired style (the `journey/saved` page was already redesigned as a reference for the visual direction)
2. Continue redesigning remaining pages in order: plans, bible, account, settings
3. Create `/api/contact` route for the Contact form

Full project structure and context is in `docs/PROJECT.md`.

---