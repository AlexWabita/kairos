# KAIROS — Project Handoff Document
_Last updated: Phase 7J complete — pre-deployment session_

---

## What Kairos Is

A Biblical AI life companion web app. Not a utility tool — a companion. Every design and architectural decision should serve that identity. Users come with real questions, pain, doubt, and faith. Kairos listens, responds with scripture wisdom, and helps them record their spiritual journey.

**Stack:** Next.js 16 (App Router, webpack), Supabase (auth + DB), Groq (primary AI), OpenRouter + Gemini (fallback chain), Jina AI (RAG embeddings, 768-dim), bible-api.com

**Repo:** `AlexWabita/kairos` (private) — branches: `main`, `dev`

**Design inspiration:** Leonardo AI — ultra-dark void (`#060912`), floating pill nav, sidebar navigation on all app pages, subtle card borders (`rgba(255,255,255,0.07)`), gold accents used sparingly

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
│   │   ├── layout.jsx          ← root layout, SettingsProvider + ThemeApplier inside
│   │   ├── page.jsx            ← homepage (full rebuild Phase 7J)
│   │   ├── globals.css
│   │   ├── loading.jsx
│   │   ├── error.jsx
│   │   ├── not-found.jsx
│   │   ├── (auth)/
│   │   │   ├── layout.jsx
│   │   │   ├── login/page.jsx          ← UPDATED: returnTo support, Suspense wrapper
│   │   │   ├── register/page.jsx
│   │   │   └── forgot-password/page.jsx
│   │   ├── account/page.jsx            ← REDESIGNED: sidebar nav, stats strip, section cards
│   │   ├── settings/page.jsx           ← REDESIGNED: sidebar nav, theme/accent/font/translation/companion/notifications
│   │   ├── bible/page.jsx              ← REDESIGNED: 3-panel layout, verse selection, action bar
│   │   ├── plans/
│   │   │   ├── page.jsx                ← REDESIGNED: sidebar nav, active enrollments, category badges
│   │   │   ├── [id]/page.jsx           ← REDESIGNED: sidebar nav, progress strip, day grid ← PASTE IN NEXT SESSION
│   │   │   └── [id]/day/[day]/page.jsx ← REDESIGNED: sidebar nav, all original logic preserved ← PASTE IN NEXT SESSION
│   │   ├── journey/
│   │   │   ├── page.jsx                ← AI companion (CompanionCore, sidebar nav)
│   │   │   └── saved/page.jsx          ← REDESIGNED: sidebar filter/sort, mobile bottom nav, single filter&sort button
│   │   ├── privacy/page.jsx
│   │   └── api/
│   │       ├── ai/companion/route.js
│   │       ├── ai/guidance/route.js
│   │       ├── auth/callback/route.js
│   │       ├── auth/route.js
│   │       ├── bible/chapter/route.js
│   │       ├── bible/verse/route.js
│   │       ├── bible/debug/route.js
│   │       ├── contact/route.js        ← BUILT: Resend auto-replies, Supabase save ← PASTE IN NEXT SESSION
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
│   │   │   ├── CompanionCore.jsx       ← UPDATED: sidebar nav, VotD/ActivePlan/Prompts gated by settings
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
│   │   │   ├── Hero.jsx               ← UPDATED: buttons wired up, CSS blur orbs
│   │   │   ├── About.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── ScriptureBanner.jsx
│   │   │   ├── Testimonials.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── Contact.jsx            ← form wired to /api/contact ← WIRE IN NEXT SESSION
│   │   │   └── FinalCTA.jsx           ← "use client" component
│   │   ├── shared/
│   │   │   ├── Navbar.jsx             ← REDESIGNED: floating pill, app links, avatar chip
│   │   │   ├── HomepageNavbar.jsx     ← NEW: transparent→frosted on scroll, marketing links
│   │   │   ├── ThemeApplier.jsx       ← NEW: global CSS variable injection for theme/accent/font
│   │   │   ├── Footer.jsx
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
│   │   ├── SettingsContext.jsx        ← keys: theme, accentColor, readingFont, bibleTranslation,
│   │   │                                       fontSize, lineSpacing, showVotD, showActivePlan,
│   │   │                                       showExamplePrompts, dailyReminder, votdNotification
│   │   └── UserContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useAuthState.js             ← reactive onAuthStateChange hook
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
- **Colors:** `--color-void`, `--color-divine`, `--color-gold-warm`, `--color-gold-deep`, `--color-soft`, `--color-muted`, `--color-faint`, `--color-border`, `--color-border-hover`, `--color-elevated`, `--color-surface`
- **All interactive elements:** minimum 44px touch target height
- **Border conflict rule:** NEVER mix `border` shorthand with `borderColor` in event handlers — always use `borderWidth`/`borderStyle`/`borderColor` separately
- **Sidebar pattern:** `220px` sticky sidebar, all app pages consistent
- **Mobile nav:** Fixed `58px` bottom bar, `z-index: 100`, `env(safe-area-inset-bottom)` padding
- **"use client"** required on any component using hooks, event handlers, or browser APIs
- Surgical edits only — never regenerate full files without being asked

---

## App-Wide Layout Pattern (All App Pages)

Every app page (companion, saved, bible, plans, account, settings) follows this exact pattern:

```jsx
// Desktop: 220px sidebar + 1fr main, min-height: 100vh
// Sidebar: sticky, 100vh, logo → nav links → user chip at bottom
// Mobile (≤768px): sidebar hidden, mobile bottom nav (58px fixed)
// Active nav item: highlighted background + gold dot on right
// Safe area: env(safe-area-inset-bottom) on mobile nav padding
```

---

## Phase 7J — What Was Completed

### Full App Redesign (Leonardo AI aesthetic)
All pages redesigned with consistent sidebar + mobile bottom nav:

| Page | Status |
|------|--------|
| `/` (homepage) | ✅ Full rebuild — Hero, About, Features, HowItWorks, ScriptureBanner, Testimonials, FAQ, Contact, FinalCTA |
| `/journey` (CompanionCore) | ✅ Sidebar nav, VotD card, active plan card, example prompts, chat bubbles, save button |
| `/journey/saved` | ✅ Sidebar filter/sort, desktop search-only toolbar, single mobile "Filter & Sort" button + active chips, mobile bottom nav |
| `/bible` | ✅ 3-panel layout, verse selection + action bar (position:fixed on mobile), book drawer, mobile bottom nav |
| `/plans` | ✅ Sidebar nav, active enrollments, category filters, mobile bottom nav |
| `/plans/[id]` | ✅ Sidebar nav, progress strip, day grid (current/completed/locked states), enroll/continue CTA |
| `/plans/[id]/day/[day]` | ✅ Sidebar nav, all original logic preserved, sticky complete button, mobile-safe |
| `/account` | ✅ Sidebar nav, avatar, stats strip, section cards (Identity/Security/Data/Links/Danger) |
| `/settings` | ✅ Sidebar nav, theme/accent palette/reading font/translation/companion toggles/notifications |

### Navigation System
- `Navbar.jsx` — floating pill nav (`top:12px`, `border-radius:16px`), app links, avatar → `/account`, theme-synced
- `HomepageNavbar.jsx` — transparent → frosted pill on scroll, marketing + app links, mobile overlay
- `ThemeApplier.jsx` — global CSS variable injection; place inside `SettingsProvider` in `layout.jsx`:
  ```jsx
  <SettingsProvider>
    <ThemeApplier />   {/* ← required for theme to work globally */}
    {children}
  </SettingsProvider>
  ```

### Theme System (ThemeApplier.jsx)
Watches `settings.theme`, `settings.accentColor`, `settings.readingFont` and injects a `<style id="kairos-theme">` tag with full CSS variable overrides:
- **Themes:** dark (default), light, system (listens to `prefers-color-scheme`)
- **Accents:** gold (default), blue (Ocean), purple (Dusk), green (Forest), rose (Rose)
- **Reading fonts:** default (Kairos vars), serif (Georgia), mono (JetBrains Mono)

### Settings Keys (SettingsContext)
All keys written via `updateSetting(key, value)`, reset via `resetSettings()`:

| Key | Type | Default | Controls |
|-----|------|---------|---------|
| `theme` | string | `"dark"` | Global theme |
| `accentColor` | string | `"gold"` | Accent colour everywhere |
| `readingFont` | string | `"default"` | Body + heading font |
| `bibleTranslation` | string | `"WEB"` | Bible reader + companion |
| `fontSize` | string | `"md"` | Bible reader text size |
| `lineSpacing` | string | `"normal"` | Bible reader line spacing |
| `showVotD` | bool | `true` | Verse of Day in CompanionCore |
| `showActivePlan` | bool | `true` | Active plan card in CompanionCore |
| `showExamplePrompts` | bool | `true` | Example prompts in CompanionCore |
| `dailyReminder` | bool | `false` | Browser notification — reading reminder |
| `votdNotification` | bool | `false` | Browser notification — VotD |

### Key Fixes Applied
- **Bible action bar:** moved outside `.br-scroll` container (`position:fixed` on mobile, `flex-shrink:0` on desktop), clears both our nav bar and browser chrome via `bottom: calc(58px + env(safe-area-inset-bottom))`
- **Bible mobile drawer:** `BookPanel` accepts `inDrawer` prop to skip `.br-bookpanel { display:none }` CSS class
- **Bible double panel on desktop:** mobile bar button had `display:"flex"` inline style overriding CSS `display:none` — removed
- **Bible verse key warning:** `key={\`v-${num}-${selectedChapter}\`}` with `?? (i+1)` fallback
- **Journey/saved duplicate search:** mobile search wrapped in `.js-mobile-only` class, desktop in `.js-desktop-sorts`
- **Journey/saved duplicate nav:** `<Navbar />` removed from saved page (sidebar handles navigation)
- **Companion toggles wired:** `settings.showVotD !== false`, `settings.showActivePlan !== false`, `settings.showExamplePrompts !== false` gate rendering in CompanionCore
- **Notification permission flow:** real `Notification.requestPermission()` with denied-state detection and browser instructions

---

## Contact Form Setup (Next Session — Step by Step)

### 1. Supabase table
```sql
create table contact_messages (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  email       text not null,
  type        text not null default 'other',
  message     text not null,
  created_at  timestamptz default now()
);
```

### 2. Install Resend
```bash
npm install resend
```

### 3. Resend account setup (free tier: 3,000 emails/month)
1. Go to `resend.com` → Sign up free
2. Dashboard → Domains → Add Domain → enter `kairos.app`
3. Add the DNS records shown (3 TXT records + 1 MX record) to your domain registrar
4. Wait for verification (usually 5–15 minutes)
5. Dashboard → API Keys → Create API Key → copy it

### 4. Environment variables
Add to `.env.local` AND to Vercel project settings (Settings → Environment Variables):
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
CONTACT_FROM_EMAIL=hello@kairos.app
CONTACT_TEAM_EMAIL=hello@kairos.app
```

### 5. Wire Contact.jsx
In `src/components/landing/Contact.jsx`, replace the `setTimeout` simulation:
```js
// Replace:
await new Promise((r) => setTimeout(r, 1200))
setStatus("success")

// With:
const res  = await fetch("/api/contact", {
  method:  "POST",
  headers: { "Content-Type": "application/json" },
  body:    JSON.stringify(form),
})
const data = await res.json()
if (data.success) setStatus("success")
else setStatus("error")
```

### Auto-reply behaviour
Each contact type gets a different auto-reply tone:
- `feedback` → warm gratitude
- `question` → 24h response promise
- `prayer` → pastoral acknowledgment ("You are not alone")
- `partnership` → 2 business day reply
- `bug` → technical confirmation
- `other` → generic warm reply

No GitHub link in contact. Users are people in spiritual need, not developers.

---

## Vercel Deployment (Next Session)

### Pre-deploy checklist
- [ ] Plans detail pages pasted and verified (`/plans/[id]` and `/plans/[id]/day/[day]`)
- [ ] Contact API route pasted (`/api/contact/route.js`)
- [ ] Contact.jsx wired to real API
- [ ] `npm run build` passes locally with no errors
- [ ] All env vars confirmed in `.env.local`

### Deploy steps
1. Push dev branch: `git add . && git commit -m "feat: Phase 7J complete" && git push origin dev`
2. Merge to main: `git checkout main && git merge dev && git push origin main`
3. Go to `vercel.com` → Import Git Repository → select `AlexWabita/kairos`
4. Framework: Next.js (auto-detected)
5. Add all environment variables (copy from `.env.local`)
6. Deploy → get production URL

### Post-deploy real-device testing
- Light theme across all pages
- Bible action bar on iOS Safari, Android Chrome, Brave
- Bottom nav safe area on notched phones
- Plans enrollment flow end-to-end
- Contact form sends real email

---

## Architecture Rules (Permanent)

- All Supabase DB queries use `users.id` (profile ID) — NOT the auth UUID. Always resolve via `users` table query on `auth_id`
- Bible API: `bible-api.com` — free, no key needed for WEB/KJV/ASV/BBE
- AI chain: Groq (3 models) → OpenRouter (4 models) → Gemini (3 models)
- RAG: Jina AI embeddings, 768-dim vectors in Supabase pgvector
- `journey/saved` is at `src/app/journey/saved/` — NOT inside `(main)` route group
- All app pages import their own inline CSS via `<style>{css}</style>` — no global stylesheet dependencies beyond tokens

---

## Phase 8 — Organisation Portal (Deliberately Deferred)

Do not start until Phase 7 is fully deployed and tested. Three unresolved architecture questions:
1. Org-user relationship model (one user, many orgs vs separate accounts)
2. Group plan progress ownership (individual or org-level)
3. Auth separation for org admins

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
RESEND_API_KEY
CONTACT_FROM_EMAIL
CONTACT_TEAM_EMAIL
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

**KAIROS — Continuing from Phase 7J (pre-deployment)**

I'm building Kairos, a Biblical AI life companion web app. Stack: Next.js 16 (App Router, webpack), Supabase, Groq, bible-api.com. Repo: AlexWabita/kairos (private), working on `dev` branch. Design: Leonardo AI aesthetic — dark void, 220px sidebar on all app pages, mobile bottom nav (58px fixed).

**All app pages have been redesigned. Phase 7J is complete.** The next session goal is to finish the remaining loose ends and deploy to Vercel.

**What needs to happen this session, in order:**

**Step 1 — Paste and verify Plans detail pages**
I have two files to paste:
- `src/app/plans/[id]/page.jsx` — plan detail page (has `PlanDetailPage`, `DayRow`, `ProgressBar`, `handleEnroll`, `handleCatchUp`, `showAllDays` state)
- `src/app/plans/[id]/day/[day]/page.jsx` — day reading page (has `DayPage`, `handleComplete`, `handleAskKairos`, `personalNotes`, `notesOpen`, `completing`, `completed` state)

These need to be redesigned to match the rest of the app (220px sidebar, mobile bottom nav, dark void background) while preserving ALL existing logic exactly. The sidebar and mobile nav pattern is identical to what was done for `/account`, `/settings`, `/bible`, `/plans`.

**Step 2 — Paste contact API route**
File: `src/app/api/contact/route.js`
Built with Resend — saves to `contact_messages` Supabase table, sends team notification, sends type-aware auto-reply. Needs:
- `npm install resend`
- Supabase table creation (SQL provided in PROJECT.md)
- Resend account setup (step by step in PROJECT.md)
- Wire `Contact.jsx` to replace `setTimeout` with real `fetch("/api/contact", ...)`

**Step 3 — Verify build passes**
Run `npm run build` and fix any errors before deploying.

**Step 4 — Deploy to Vercel**
Push dev → merge to main → import to Vercel → add env vars → deploy.

**Step 5 — Post-deploy device testing**
Test on real phones: light theme, Bible action bar (iOS Safari, Brave), bottom nav safe areas, plans enrollment flow, contact form email delivery.

Full project context including all design system rules, component patterns, and setup instructions is in `docs/PROJECT.md`.

---