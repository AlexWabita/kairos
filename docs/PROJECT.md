# KAIROS — Project Handoff Document
> Last updated: Phase 7I complete
> Continue from: **Read this file fully, then follow the "Prompt for New Chat" section at the bottom**

---

## Stack
- **Framework:** Next.js (App Router)
- **Auth + DB:** Supabase
- **Primary AI:** Groq
- **Bible API:** bible-api.com (primary for chapters) + rest.api.bible (fallback + verse search)
- **Styling:** Inline styles + CSS custom properties (tokens.css)

---

## Phase Map

```
Phase 7E ✅  Model chain overhaul, identity hardening
Phase 7F ✅  Settings page, theme system, accent colors, font pairings, ConfirmModal
Phase 7G ✅  Journey: search, sort, filter, pin vs favourite, delete confirm, SaveMomentModal
Phase 7H ✅  In-App Bible Reader
Phase 7I ✅  Reading Plans + Guided Study + Daily Verse + Notes to Journey
Phase 8      Organisation Portal (deferred — 3 architecture questions unresolved)
Phase 9      Launch
```

---

## Completed This Session (7I — Reading Plans + Guided Study)

### SQL Migration
File: `supabase/migrations/004_reading_plans.sql` — run in Supabase dashboard.

**4 tables created:**

| Table | Purpose |
|---|---|
| `reading_plans` | Plan definitions (curated + user-created, `is_curated` flag) |
| `plan_days` | Pre-authored day content per plan |
| `user_plans` | Enrollment tracking (`current_day`, `status`, `group_id` nullable hook for Phase 8, `catch_up_used_at`) |
| `user_plan_progress` | Completed days with optional `kairos_reflection` |

RLS enabled on all 4 tables with appropriate policies.

---

### Seed Data
File: `src/lib/plans/seed.js` — run via `node -r dotenv/config src/lib/plans/seed.js`

**8 curated plans seeded (557 total days):**

| Plan | Days |
|---|---|
| New Believer Foundation | 7 |
| Overcoming Anxiety | 14 |
| Identity in Christ | 10 |
| Prayer & Fasting | 7 |
| Healing & Forgiveness | 10 |
| Walking in Purpose | 14 |
| 30 Days in the Psalms | 30 |
| Bible in 365 Days | 365 |

Seed uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS. Inserts in batches of 50.

---

### New Files Created

| File | Purpose |
|---|---|
| `src/lib/bible/daily-verses.js` | 60 curated verse refs + devotional thoughts, `getTodaysVerse()` cycles by day of year |
| `src/lib/plans/seed.js` | One-time seed script for 8 curated plans |
| `src/app/api/plans/route.js` | `GET` all plans with enrollment state · `POST` enroll user |
| `src/app/api/plans/[id]/route.js` | `GET` single plan + all days enriched with completion state |
| `src/app/api/plans/progress/route.js` | `POST` actions: `complete` (mark day done + save notes to Journey) · `catch_up` (jump to max(completed)+1) |
| `src/app/plans/page.jsx` | Discovery page — grid of all plans, category filter, enrollment filter, active plans strip |
| `src/app/plans/[id]/page.jsx` | Plan detail — header, progress bar, Catch Me Up button, day list with locked/unlocked/completed states |
| `src/app/plans/[id]/day/[day]/page.jsx` | Day reading — devotional, scripture pills, reflection prompt, prayer prompt, personal notes, Complete Day CTA, Reflect with Kairos |

### Modified Files

| File | Changes |
|---|---|
| `src/components/companion/CompanionCore.jsx` | Added Verse of the Day card + Active Plan card above companion welcome prompt |
| `src/components/shared/Navbar.jsx` | Added Plans link between Bible and Settings in `navItems` |
| `src/app/api/plans/progress/route.js` | Option B: personal notes from day page saved to `journey_entries` on day completion |

---

### Phase 7I — Feature Details

#### Daily Verse (Verse of the Day)
- `getTodaysVerse()` returns `{ ref, thought }` indexed by day-of-year mod 60
- On mount, `CompanionCore` fetches verse text from `/api/bible/verse` and shows the card
- Card shows: verse text, reference, 2-line devotional thought, "Reflect with Kairos" button (pre-loads prompt into companion), "Open in Bible" link
- Always visible to all users (no auth required)
- Disappears once a conversation starts

#### Active Plan Card
- Shown on the Journey page above the companion welcome prompt
- Only visible to authenticated users who have an active plan enrollment
- Shows: plan name, progress bar, Day X of Y, "Continue" button → `/plans/[id]/day/[current_day]`
- Hidden once conversation starts

#### Option B — Notes to Journey
- Personal notes written on a day page are saved to `journey_entries` on "Complete Day"
- Entry title: `Day {N}: {day title}` (e.g. "Day 7: The Weight You Are Carrying")
- Entry type: `scripture`
- Scripture ref: day's scripture refs joined as string
- Day completion always succeeds even if Journey save fails (non-blocking)
- After completion, inline confirmation: "Completed · Notes saved to Journey"

#### Catch Me Up
- Button on plan detail page, only shown if user is behind (current_day < latest completed + 1)
- Calls `POST /api/plans/progress` with `action: "catch_up"`
- Moves `current_day` to `max(completed) + 1` without creating false completions
- Records `catch_up_used_at` timestamp on `user_plans`

#### Reading Plan Architecture Decisions

| Decision | Detail |
|---|---|
| Plans | Both curated (Kairos-original) + user-created, same schema, `is_curated` flag |
| AI involvement | Pre-authored content; Kairos invoked ON DEMAND only via "Reflect with Kairos" button |
| Social | Strictly personal for Phase 7I; `group_id` nullable column added as Phase 8 hook |
| Content | Original Kairos-authored plans, not borrowed from YouVersion |
| Voice/tone | Intimate & Conversational as base + Reverent & Contemplative as texture |

---

## Navbar navItems (current order)
```js
const navItems = [
  { label: "About",        href: "/#about"        },
  { label: "How It Works", href: "/#how-it-works"  },
  { label: "Journey",      href: "/journey"        },
  { label: "Bible",        href: "/bible"          },
  { label: "Plans",        href: "/plans"          },
  { label: "Settings",     href: "/settings"       },
]
```

---

## Key Architecture Decisions (all standing)

| Decision | Reason |
|---|---|
| Light mode = Coming Soon | Components have hardcoded rgba values; full CSS variable migration is a separate pass |
| Accent overrides gold variables | All components reference gold vars — no rewrites needed |
| `--font-display` (Cinzel) never overridden | Brand identity fixed |
| Valid spacing tokens: 1,2,3,4,5,6,8,10,16,24 | No `--space-7` or `--space-9` — will resolve to zero |
| bible-api.com is chapter primary | Returns clean verse array; rest.api.bible returns blob |
| Book/chapter counts are hardcoded | 66 books never change; eliminates API plan risk |
| sessionStorage for verse→companion context | Ephemeral, no DB needed, cleared on read |
| Bible highlights = session-only | Product is a companion not a study tool; DB overhead not justified yet |
| Bible notes → SaveMomentModal flow | Intentional save philosophy consistent with Journey |
| Bible page uses internal profile ID | Save route expects `users.id` not Supabase auth UUID — fetched via `auth_id` lookup |
| Semantic alias tokens in tokens.css | Prevents transparent panels when CSS variables undefined in inline styles |
| Plan progress API — non-blocking Journey save | Day completion must always succeed; Journey entry failure is logged, not thrown |
| Phase 8 (Org Portal) deferred | 3 architecture questions unresolved |

---

## Database — Current Table State

### `users`
Standard auth columns + `settings JSONB DEFAULT '{}'`

### `journey_entries`
`id, user_id, conversation_id, entry_type, context, is_pinned, is_favourite, created_at, title, scripture_ref, content`

**Valid entry_type values:** `reflection | prayer | milestone | question | scripture`

### `sessions`
`id, user_id, session_token, device_hint, created_at, expires_at`

### `reading_plans`
`id, title, description, category, duration_days, is_curated, author_name, cover_color, created_at`

### `plan_days`
`id, plan_id, day_number, title, scripture_refs (text[]), devotional_text, reflection_prompt, prayer_prompt, created_at`

### `user_plans`
`id, user_id, plan_id, current_day, status (active|completed|paused), started_at, completed_at, catch_up_used_at, group_id (nullable — Phase 8 hook)`

### `user_plan_progress`
`id, user_plan_id, day_number, completed_at, kairos_reflection (nullable), created_at`
Unique constraint: `(user_plan_id, day_number)`

---

## Bible API

**rest.api.bible** (verse lookup + search + chapter fallback)
- Env var: `SCRIPTURE_API_KEY`
- Translation IDs: WEB `9879dbb7cfe39e4d-01`, KJV `de4e12af7f28f599-02`, ASV `685d1470fe4d5c3b-01`, BBE `40072c4a5ade2ef3-01`

**bible-api.com** (primary chapter fetch)
- No auth required
- Supports: web, kjv, asv, bbe
- Chapter URL: `https://bible-api.com/{book-name}+{chapter}?translation={t}`

---

## File Structure (current — relevant files only)

```
src/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── companion/route.js
│   │   │   └── guidance/route.js
│   │   ├── bible/
│   │   │   ├── chapter/route.js
│   │   │   ├── debug/route.js
│   │   │   └── verse/route.js
│   │   ├── journey/
│   │   │   └── save/route.js
│   │   ├── plans/
│   │   │   ├── [id]/route.js           ← 7I
│   │   │   ├── progress/route.js       ← 7I
│   │   │   └── route.js                ← 7I
│   │   ├── account/
│   │   │   ├── delete/route.js
│   │   │   └── export/route.js
│   │   ├── admin/seed/route.js
│   │   ├── auth/
│   │   │   ├── callback/route.js
│   │   │   └── route.js
│   │   └── user/
│   │       ├── journey/route.js
│   │       └── profile/route.js
│   ├── (auth)/
│   │   ├── layout.jsx
│   │   ├── forgot-password/page.jsx
│   │   ├── login/page.jsx
│   │   └── register/page.jsx
│   ├── account/page.jsx
│   ├── bible/page.jsx
│   ├── journey/
│   │   └── saved/page.jsx
│   ├── plans/
│   │   ├── page.jsx                    ← 7I
│   │   ├── [id]/page.jsx               ← 7I
│   │   └── [id]/day/[day]/page.jsx     ← 7I
│   ├── privacy/page.jsx
│   ├── settings/page.jsx
│   ├── error.jsx
│   ├── globals.css
│   ├── layout.jsx
│   ├── loading.jsx
│   ├── not-found.jsx
│   └── page.jsx
├── components/
│   ├── companion/
│   │   ├── BibleVerse.jsx
│   │   ├── CompanionCore.jsx           ← UPDATED 7I
│   │   ├── CompanionPrompt.jsx
│   │   ├── CompanionResponse.jsx
│   │   ├── CompanionVoice.jsx
│   │   └── SaveMomentModal.jsx
│   ├── journey/
│   │   ├── JourneyEntry.jsx
│   │   ├── JourneyMap.jsx
│   │   └── JourneyTimeline.jsx
│   ├── landing/
│   │   ├── About.jsx
│   │   ├── Hero.jsx
│   │   ├── HowItWorks.jsx
│   │   └── Testimonials.jsx
│   ├── shared/
│   │   ├── ConfirmModal.jsx
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx                  ← UPDATED 7I
│   │   ├── SEOHead.jsx
│   │   └── Sidebar.jsx
│   └── ui/
│       ├── Avatar.jsx
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Input.jsx
│       ├── Loader.jsx
│       └── Modal.jsx
├── context/
│   ├── CompanionContext.jsx
│   ├── JourneyContext.jsx
│   ├── SettingsContext.jsx
│   └── UserContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useCompanion.js
│   ├── useJourney.js
│   └── useVoice.js
├── lib/
│   ├── ai/
│   │   ├── client.js
│   │   ├── context.js
│   │   ├── guardrails.js
│   │   └── prompts.js
│   ├── bible/
│   │   ├── client.js
│   │   └── daily-verses.js             ← NEW 7I
│   ├── constants/
│   │   ├── languages.js
│   │   ├── scripture.js
│   │   └── topics.js
│   ├── plans/
│   │   └── seed.js                     ← NEW 7I
│   ├── rag/
│   │   ├── embeddings.js
│   │   └── search.js
│   ├── supabase/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── client.js
│   │   ├── conversations.js
│   │   ├── middleware.js
│   │   ├── server.js
│   │   └── sessions.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── rateLimit.js
│   └── settings.js
└── styles/
    ├── animations.css
    ├── tokens.css
    └── typography.css

supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_user_profiles.sql
│   ├── 003_journeys.sql
│   └── 004_reading_plans.sql           ← NEW 7I
└── seed.sql
```

---

## Settings Defaults (Phase 7F)

```js
{
  theme:            "dark",       // light = "Coming Soon"
  accentColor:      "covenant",   // 7 palette options
  fontFamily:       "standard",   // 3 font pairings
  bibleTranslation: "WEB",
  language:         "en",         // sw = "Coming Soon"
}
```

**Accent colours (7):** covenant (#6366F1), stillwaters (#0EA5E9), crimsongrace (#E11D48), olivebranch (#65A30D), dawn (#F59E0B), dusk (#7C3AED), selah (#64748B)

**Font pairings (3):** standard (Cormorant Garamond + Nunito), scholar (Playfair Display + Lato), pilgrim (Cormorant Garamond + Source Sans 3)

---

## Rules That Always Apply

- Never use CSS token values not in the valid spacing scale (1,2,3,4,5,6,8,10,16,24)
- Never use `--space-7`, `--space-9` or any undefined token
- Never assume file contents — always ask the user to paste a file before modifying it
- All buttons and touch targets minimum 44px height
- Commits happen at the end of each phase with full `git add && git commit -m && git push -u origin dev` command
- Never rewrite a file from memory — confirm existing contents first
- Always provide PowerShell commands for file/folder creation

---

## Phase 8 — Organisation Portal (NEXT MAJOR PHASE)

**Status: Deferred — 3 architecture questions unresolved**

### What Phase 8 covers
- Organisation accounts (churches, small groups, ministries)
- Admin portal for org leaders — create group plans, assign members, view progress
- Group reading plan support (the `group_id` nullable column on `user_plans` is already in place as a hook)

### Unresolved questions before any code is written

1. **Org↔User relationship** — Is a user a member of one org or many? Does leaving an org delete their personal journey data or only group data?

2. **Group plan ownership** — When an org admin assigns a plan to a group, does each member get their own `user_plans` row (personal progress), or is progress tracked at group level? Both? What happens when a member leaves the group mid-plan?

3. **Auth separation** — Do org admins log in through the same Supabase auth or a separate admin path? Is there a superadmin (Kairos staff) tier above org admins?

These must be answered and a DB schema confirmed before any Phase 8 code is written.

---

## Prompt for New Chat

Paste this at the start of the new conversation, then attach this PROJECT.md file:

---

> You are helping me continue building **Kairos** — a Biblical AI life companion app built with Next.js, Supabase, and Groq.
>
> I have attached PROJECT.md which contains the full project state, all architecture decisions, completed phases, and the exact continuation plan. Please read it fully before responding.
>
> Phase 7I is complete. We are moving into **Phase 8 — Organisation Portal**, or we may choose to do pre-launch polish work first (bug fixes, performance, SEO, empty states, error handling).
>
> **Before writing a single line of code**, your first task is to ask me what we are tackling next and align on the approach. If Phase 8, review the 3 unresolved architecture questions in PROJECT.md and ask me to answer them before proposing any schema or writing any code.
>
> Rules that always apply:
> - Never use CSS token values not in the valid spacing scale (1,2,3,4,5,6,8,10,16,24)
> - Never use `--space-7`, `--space-9` or any undefined token
> - Never assume file contents — always ask me to paste a file before modifying it
> - All buttons and touch targets minimum 44px height
> - No guessing — confirm before acting
> - Commits happen at the end of each phase
> - Always provide PowerShell commands for file/folder creation