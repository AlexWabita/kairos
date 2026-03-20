# Architecture

> Technical deep dive into how Kairos is built, why each decision was made, and how the major systems fit together.

---

## Overview

Kairos is a **full-stack Next.js application** using the App Router paradigm. It is a monorepo — the entire product (frontend, backend API routes, database schema, and documentation) lives in a single repository.

The architecture was designed with three constraints in mind:

1. **Zero infrastructure cost at launch** — every service used has a meaningful free tier
2. **Companion-first, not utility-first** — architectural decisions serve the product's identity, not generic SaaS patterns
3. **Solo maintainability** — no orchestration complexity, no microservices, no separate backend

---

## Request Lifecycle

```
Browser
  │
  ▼
Next.js Middleware (middleware.js)
  │  • Checks Supabase auth session
  │  • Redirects unauthenticated users with ?returnTo=
  │  • Passes session to layout via headers
  ▼
Next.js App Router
  │
  ├── Server Components (layout.jsx, page.jsx)
  │     • Static metadata
  │     • Initial HTML shell
  │
  └── Client Components ("use client")
        • Auth state via useAuthState hook
        • Settings via SettingsContext
        • All interactive UI
        │
        ▼
      API Routes (/api/*)
        • All run as Node.js serverless functions on Vercel
        • Auth: resolve users.id from Supabase auth
        • AI: Groq → OpenRouter → Gemini fallback chain
        • Bible: bible-api.com proxy
        • Contact: Resend email + Supabase insert
```

---

## Database Schema

### Tables

```sql
-- User profiles (separate from Supabase auth.users)
users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id     uuid UNIQUE REFERENCES auth.users(id),
  email       text,
  full_name   text,
  created_at  timestamptz DEFAULT now()
)

-- Spiritual journal entries
journey_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  title           text NOT NULL,
  content         text,
  entry_type      text DEFAULT 'reflection',  -- reflection|prayer|insight|verse|note
  scripture_ref   text,
  source          text,  -- companion|bible|plans
  created_at      timestamptz DEFAULT now()
)

-- Reading plan templates
reading_plans (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  category      text,
  duration_days integer,
  is_active     boolean DEFAULT true
)

-- Individual days within a plan
plan_days (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id          uuid REFERENCES reading_plans(id),
  day_number       integer NOT NULL,
  title            text NOT NULL,
  scripture_refs   text[],
  devotional_text  text,
  reflection_prompt text,
  prayer_prompt    text
)

-- User plan enrollments
user_plans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_id     uuid REFERENCES reading_plans(id),
  current_day integer DEFAULT 1,
  status      text DEFAULT 'active',  -- active|completed
  enrolled_at timestamptz DEFAULT now()
)

-- Individual day completion records
user_plan_progress (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plan_id      uuid REFERENCES user_plans(id),
  day_number        integer,
  completed_at      timestamptz DEFAULT now(),
  personal_notes    text,
  kairos_reflection text
)

-- Contact form messages
contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  type       text NOT NULL DEFAULT 'other',
  message    text NOT NULL,
  created_at timestamptz DEFAULT now()
)

-- RAG knowledge base
biblical_knowledge (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content   text NOT NULL,
  source    text,
  embedding vector(768)  -- Jina AI 768-dimension vectors
)
```

### Row Level Security

All user-data tables have RLS enabled. The pattern:

```sql
-- Users can only read/write their own data
CREATE POLICY "Users own their journey entries"
  ON journey_entries
  FOR ALL
  USING (user_id = (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));
```

Service role key (used in API routes only, never exposed to client) bypasses RLS for admin operations.

---

## AI System

### Fallback Chain

```
Request arrives at /api/ai/companion
          │
          ▼
    Build context
    (user history + RAG results)
          │
          ▼
    ┌─────────────┐
    │   GROQ      │  llama-3.3-70b-versatile (primary — fastest)
    └─────────────┘
          │ fail?
          ▼
    ┌─────────────────┐
    │  OPENROUTER     │  4-model chain (secondary)
    │  • llama-3.1    │
    │  • mistral      │
    │  • claude-haiku │
    │  • qwen         │
    └─────────────────┘
          │ fail?
          ▼
    ┌─────────────┐
    │   GEMINI    │  3-model chain (tertiary)
    └─────────────┘
```

The fallback chain means the companion never returns an error to the user on the first attempt. Each model is tried in sequence; only if all fail does an error surface.

### RAG Pipeline

```
User message
     │
     ▼
Jina AI Embedding API
(message → 768-dim vector)
     │
     ▼
Supabase pgvector
cosine similarity search
against biblical_knowledge
     │
     ▼
Top-k results (k=5)
retrieved as text chunks
     │
     ▼
Injected into system prompt
as "relevant knowledge context"
     │
     ▼
LLM generates response
grounded in retrieved content
```

This means the AI's Biblical knowledge is not dependent on what was in the LLM's training data — it is shaped by a curated knowledge base that can be updated at any time by inserting new embeddings.

### Guardrails

`lib/ai/guardrails.js` enforces:
- Tone constraints (no clickbait optimism, no clinical detachment)
- Epistemic humility (the AI never claims authority it doesn't have)
- Scope boundaries (Kairos is not a therapist, financial advisor, or medical professional)
- Scripture grounding (responses should connect to the text, not float free of it)

---

## Authentication System

### Flow

```
User submits login form
        │
        ▼
Supabase Auth (email/password)
        │
  ┌─────┴──────┐
  │            │
PKCE flow    OTP/magic link
(code param) (token_hash param)
  │            │
  └─────┬──────┘
        ▼
/api/auth/callback
Exchanges code or token_hash
for session
        │
        ▼
Sets Supabase session cookie
        │
        ▼
Redirects to ?returnTo= destination
(or /journey by default)
```

### Profile Resolution Pattern

**The rule:** every API route that touches user data must resolve `users.id` before operating. Never trust a client-sent user ID.

```js
// Pattern used in every protected API route
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

const { data: profile } = await supabase
  .from("users")
  .select("id")
  .eq("auth_id", user.id)
  .maybeSingle()

if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

// Now use profile.id for all data operations
```

This separation means:
- Auth provider can change without touching data queries
- Users cannot spoof another user's profile ID (auth UUID is validated server-side)
- Anonymous/unauthenticated users are caught before any DB operation

### returnTo Pattern

Unauthenticated users attempting to access protected routes are redirected with their destination preserved:

```
/journey/saved → /login?returnTo=%2Fjourney%2Fsaved
                      after login →  /journey/saved
```

Implemented in `middleware.js` and consumed in `login/page.jsx` via `useSearchParams`.

---

## Settings & Theme System

### SettingsContext

All user preferences live in `localStorage` via `SettingsContext`. No database persistence for settings — they are per-device and per-browser by design (a mobile and desktop user might want different font sizes).

```js
// Settings keys
{
  theme:               "dark" | "light" | "system",
  accentColor:         "gold" | "blue" | "purple" | "green" | "rose",
  readingFont:         "default" | "serif" | "mono",
  bibleTranslation:    "WEB" | "KJV" | "ASV" | "BBE",
  fontSize:            "sm" | "md" | "lg",
  lineSpacing:         "tight" | "normal" | "relaxed",
  showVotD:            boolean,
  showActivePlan:      boolean,
  showExamplePrompts:  boolean,
  dailyReminder:       boolean,
  votdNotification:    boolean,
}
```

### ThemeApplier

`ThemeApplier.jsx` is a renderless client component placed inside `SettingsProvider` in the root layout. On every settings change it:

1. Sets `data-theme` attribute on `<html>`
2. Injects a `<style id="kairos-theme">` tag with CSS variable overrides

This pattern was chosen over class-based theming because:
- CSS variables cascade to all descendants without prop drilling
- The `<style>` tag injection is instant and doesn't cause layout shift
- Any component — including third-party — responds to the CSS variable changes

---

## Bible Reader

### Data Flow

```
User selects book + chapter
          │
          ▼
/api/bible/chapter?book=John&chapter=3&translation=WEB
          │
          ▼
bible-api.com (external)
Returns verse array
          │
          ▼
Cached in component state
Rendered as verse list
          │
     User actions:
     ├── Highlight → sessionStorage
     ├── Save note → SaveMomentModal → /api/journey/save
     └── Ask Kairos → sessionStorage context → /journey
```

### Bible → Companion Handoff

```js
// In Bible reader
const ctx = `Book: ${book}, Chapter: ${chapter}\nVerse ${verseNum}: ${verseText}\n\nSurrounding context: ...`
sessionStorage.setItem("kairos_verse_context", ctx)
router.push("/journey")

// In CompanionCore on mount
const ctx = sessionStorage.getItem("kairos_verse_context")
if (ctx) {
  sessionStorage.removeItem("kairos_verse_context")
  // Pre-populate companion with verse context
}
```

This is a single-use, session-scoped handoff — the context is consumed and removed on read.

---

## Component Architecture

### Page Pattern (all app pages)

```
AppPage
├── <style>{css}</style>          ← scoped CSS with CSS class names
├── .layout (flex row)
│   ├── <aside> .sidebar          ← 220px sticky, 100vh
│   │   ├── Logo
│   │   ├── <nav> SidebarLinks
│   │   └── UserChip
│   └── <main> .main              ← flex: 1, overflow-y: auto
│       └── page content
└── <nav> .mobile-nav             ← position: fixed, 58px, z-index: 100
```

The sidebar is identical across all app pages. `SidebarLink` components take `active` prop — the active page gets a gold dot and highlighted background.

### Styling Approach

No CSS-in-JS library, no Tailwind utility classes in components (Tailwind is configured but used only as a reference). All styling uses:
- **CSS variables** from `tokens.css` — for every color, spacing, radius, shadow, font
- **Inline styles** — for component-specific styles with variable references
- **Scoped `<style>` tags** — for pseudo-classes, media queries, and `[data-theme]` overrides that can't be expressed in inline styles

This approach was chosen because it keeps components completely self-contained — no stylesheet dependencies, no class name collisions, and no build-time CSS processing.

---

## API Routes

All API routes are Next.js serverless functions deployed on Vercel.

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /api/ai/companion` | Optional | Main AI conversation |
| `POST /api/ai/guidance` | Optional | Structured guidance |
| `GET /api/bible/chapter` | None | Bible chapter fetch |
| `GET /api/bible/verse` | None | Single verse fetch |
| `POST /api/journey/save` | Required | Save journey entry |
| `GET /api/user/journey` | Required | Fetch user's entries |
| `GET /api/user/profile` | Required | Fetch user profile |
| `GET /api/plans` | Optional | List reading plans |
| `POST /api/plans` | Required | Enroll in plan |
| `GET /api/plans/[id]` | Optional | Plan detail + days |
| `POST /api/plans/progress` | Required | Mark day complete / catch up |
| `POST /api/contact` | None | Contact form + email |
| `POST /api/auth` | None | Auth helpers |
| `GET /api/auth/callback` | None | PKCE/OTP callback |
| `DELETE /api/account/delete` | Required | Delete account |
| `GET /api/account/export` | Required | Export user data |
| `GET /api/admin/seed` | Secret | Seed reading plans |

---

## Deployment Architecture

```
GitHub (main branch)
        │
        │ push triggers
        ▼
Vercel Build Pipeline
  • npm install --legacy-peer-deps
  • next build (Turbopack)
  • Static pages prerendered
  • API routes → serverless functions
        │
        ▼
Vercel Edge Network
  • Global CDN for static assets
  • Serverless functions in iad1 (US East)
  • Middleware runs at edge
```

### Environment Separation

- `dev` branch — development, not auto-deployed
- `main` branch — production, auto-deployed by Vercel on every push
- Preview deployments — Vercel generates preview URLs for any PR or non-main branch push

---

## Performance Considerations

**Static prerendering:** The homepage and all non-auth pages are statically prerendered at build time. Only pages that require auth state (`/journey`, `/bible`, etc.) are client-rendered.

**Turbopack:** Next.js 16 uses Turbopack by default for builds, reducing build time significantly.

**No global stylesheets in components:** Components import no external CSS. All styles are inline or in scoped `<style>` tags, eliminating CSS cascade issues and unused style accumulation.

**Verse of the Day:** A static array of 365 verses indexed by day-of-year. Zero API call, zero latency, zero cost, zero dependency.

**bible-api.com caching:** Bible chapter fetches are cached in component state. Navigating between chapters in the same session doesn't re-fetch previously loaded chapters.