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
  │  • Checks Supabase auth session via createSupabaseServerClient
  │  • Redirects unauthenticated users with ?returnTo=
  │  • Passes session to layout via headers
  ▼
Next.js App Router
  │
  ├── Server Components (layout.jsx, page.jsx)
  │     • Static metadata + SEO
  │     • Environment validation (lib/env/server.js)
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
        • Auth: server-derived identity via shared auth utilities
        • AI: Groq → OpenRouter → Gemini fallback chain
        • RAG: Jina AI embeddings + Supabase pgvector
        • Bible: bible-api.com proxy
        • Contact: Resend email + Supabase insert
```

---

## Server-Derived Identity (Critical Architecture Rule)

All protected API routes resolve identity on the server. No client-provided user ID is trusted for authorization.

### Identity Resolution Flow

```
Incoming request (cookies)
        │
        ▼
getRequestUser()          ← lib/server/auth/getRequestUser.js
Creates Supabase server client from cookies
Calls supabase.auth.getUser()
Returns { user, error }
        │
        ▼
getRequestAppUser()       ← lib/server/auth/getRequestAppUser.js
Resolves app-level profile row from users table
Lookup: users.auth_id = authUser.id  (primary)
Fallback: users.id = authUser.id     (legacy safety)
Returns { authUser, appUser, error }
        │
        ▼
requireRequestAppUser()   ← lib/server/auth/requireRequestAppUser.js
Wraps getRequestAppUser()
Returns a 401 response directly if unauthenticated
Used in all strictly protected routes
```

### Why auth_id, Not id

`users.id` is an internal profile UUID. `users.auth_id` is the Supabase auth UUID. These are different values. All identity checks use `auth_id` as the resolution key — never the profile ID from the client, which would allow impersonation.

### Standardised HTTP Responses

All API routes use shared response helpers from `lib/server/http/responses.js`:

```js
ok(data)                  // 200
badRequest(message)       // 400
unauthorized(message)     // 401
forbidden(message)        // 403
notFound(message)         // 404
serverError(message)      // 500
```

---

## Database Schema

### Core Tables

```sql
-- User profiles (separate from Supabase auth.users)
users (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id              uuid UNIQUE REFERENCES auth.users(id),
  email                text,
  display_name         text,
  background_faith     text,
  background_culture   text,
  current_life_season  text,
  primary_need         text,
  is_anonymous         boolean DEFAULT false,
  settings             jsonb,
  created_at           timestamptz DEFAULT now()
)

-- Spiritual journal entries
journey_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  title           text NOT NULL,
  content         text,
  entry_type      text DEFAULT 'reflection',
  scripture_ref   text,
  source          text,
  created_at      timestamptz DEFAULT now()
)

-- AI conversation threads
conversations (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid REFERENCES users(id) ON DELETE CASCADE,
  title     text,
  created_at timestamptz DEFAULT now()
)

-- Individual conversation messages
messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid REFERENCES conversations(id) ON DELETE CASCADE,
  role             text,   -- 'user' | 'assistant'
  content          text,
  model_used       text,
  created_at       timestamptz DEFAULT now()
)

-- Reading plan templates
reading_plans (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  description      text,
  duration_days    int,
  category         text,
  cover_image_url  text,
  is_curated       boolean DEFAULT false,
  created_by       uuid REFERENCES users(id),
  created_at       timestamptz DEFAULT now()
)

-- Individual plan days
plan_days (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id            uuid REFERENCES reading_plans(id) ON DELETE CASCADE,
  day_number         int,
  title              text,
  devotional_text    text,
  scripture_refs     text[],
  reflection_prompt  text,
  prayer_prompt      text
)

-- User plan enrollments
user_plans (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_id          uuid REFERENCES reading_plans(id),
  current_day      int DEFAULT 1,
  status           text DEFAULT 'active',
  started_at       timestamptz DEFAULT now(),
  catch_up_used_at timestamptz,
  is_private       boolean DEFAULT false
)

-- Day-level progress
user_plan_progress (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plan_id       uuid REFERENCES user_plans(id) ON DELETE CASCADE,
  day_number         int,
  completed_at       timestamptz,
  kairos_reflection  text,
  UNIQUE (user_plan_id, day_number)
)

-- RAG knowledge base
knowledge_base (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text UNIQUE NOT NULL,
  content        text,
  category       text,
  scripture_ref  text,
  source         text,
  embedding      vector(768),
  tags           text[]  DEFAULT '{}',
  audience       text[]  DEFAULT ARRAY['anyone'],
  mode_affinity  text[]  DEFAULT '{}',
  weight         integer DEFAULT 1,
  created_at     timestamptz DEFAULT now()
)

-- Contact messages
contact_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text,
  email       text,
  type        text,
  message     text,
  created_at  timestamptz DEFAULT now()
)
```

### Row Level Security

All 12 public schema tables have RLS enabled. Key policies:

- `journey_entries` — users can only read/write their own entries (`user_id = auth.uid()` resolved via `users.auth_id`)
- `contact_messages` — insert only, no user reads (service role only)
- `reading_plans INSERT` — only `created_by = auth.uid()` (no `is_curated` loophole)
- `users` — each user can only read/update their own row (`auth_id = auth.uid()`)
- `sessions` — owner-scoped policies via `user_id` join

---

## AI Companion System

### Model Fallback Chain

```
User message
      │
      ▼
POST /api/ai/companion
      │
      ├── Rate limit check (20 req/min per user or IP)
      ├── Escalation detection (crisis keywords)
      ├── Identity resolution (getRequestAppUser)
      │
      ▼
┌─────────────────────┐
│    GROQ             │  Primary — fastest, most reliable free tier
│  • llama-3.3-70b    │  15s timeout per model
│  • llama-3.1-70b    │
│  • mixtral-8x7b     │
└─────────────────────┘
        │ fail?
        ▼
┌─────────────────────┐
│  OPENROUTER         │  Secondary — free models with daily caps
│  • stepfun-3.5      │
│  • qwen-2.5-72b     │
│  • mistral-7b       │
│  • glm-4.5-air      │
└─────────────────────┘
        │ fail?
        ▼
┌─────────────────────┐
│   GEMINI            │  Tertiary — final safety net
│  • gemini-2.0-flash │
│  • gemini-1.5-flash │
│  • gemini-flash-8b  │
└─────────────────────┘
```

Continuation requests (when the user asks Kairos to continue a truncated response) route to the same model that generated the previous response, tracked via `modelId` returned from each response.

### RAG Pipeline

```
User message
      │
      ▼
isSubstantiveMessage()
(skip greetings and short acks)
      │
      ▼
inferModeHint()          ← heuristic classification from message text
inferAudienceHint()      ← heuristic classification from message text
      │
      ▼
generateQueryEmbedding() ← Jina AI API, jina-embeddings-v2-base-en
(message → 768-dim vector, task: "retrieval.query")
      │
      ▼
match_knowledge_base()   ← Supabase pgvector RPC
  • vector cosine similarity (threshold: 0.5)
  • optional audience filter (GIN index)
  • optional mode filter (GIN index)
  • weight-boosted scoring: score × (1 + (weight-1) × 0.1)
  • returns top 3 matches
      │
      │ if filtered search returns nothing:
      │   retry without filters (fallback)
      ▼
formatKnowledgeContext() ← injects as KNOWLEDGE BASE block in system prompt
```

Knowledge base: ~113 curated entries across apologetics, pastoral, scripture context, FAQ, formation, and advanced spirituality. Each entry carries `tags`, `audience`, `mode_affinity`, and `weight` metadata for context-aware retrieval.

### System Prompt Architecture

`lib/ai/prompts.js` builds the system prompt from five layers:

```
KAIROS_IDENTITY          ← who Kairos is, theological commitments, voice rules
RESPONSE_MODES           ← 7 modes: Pastoral, Clarity, Lament, Formation,
                           Apologetics, Courage, Release — with mode-specific
                           posture and closing guidance
RESPONSE_STRUCTURE       ← Presence → Answer → Depth → Closing (mode-dependent)
profileContext           ← buildProfileContext(profile): name, faith background,
                           cultural background, life season, primary need
memoryContext            ← buildMemoryContext(journeyEntries): last 5 journey
                           entries, truncated to 300 chars each
ragContext               ← buildRagContext(searchKnowledgeBase result)
verseContext             ← verse text from Bible reader handoff (if present)
```

### Memory Injection

For authenticated users, the companion route fetches the last 5 journey entries in parallel with the profile and RAG search:

```js
const [profile, ragContext, journeyEntries] = await Promise.all([
  fetchProfile(identityUserId),
  searchKnowledgeBase(message),
  fetchRecentJourney(identityUserId),
])
```

These are injected into the system prompt as recent context, giving Kairos continuity without explicitly referencing the memory mechanism to the user.

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
Exchanges code or token_hash for session
        │
        ▼
Sets Supabase session cookie
        │
        ▼
Redirects to ?returnTo= destination
(or /journey by default)
```

### returnTo Pattern

Unauthenticated users attempting protected routes are redirected with destination preserved:

```
/journey/saved → /login?returnTo=%2Fjourney%2Fsaved
                      after login →  /journey/saved
```

Implemented in `middleware.js` and consumed in `login/page.jsx` via `useSearchParams`.

---

## Settings & Theme System

All user preferences live in `localStorage` via `SettingsContext`. No database persistence — settings are per-device by design.

`ThemeApplier.jsx` is a renderless client component placed inside `SettingsProvider`. On every settings change it sets the `data-theme` attribute on `<html>` and injects a `<style id="kairos-theme">` tag with CSS variable overrides. This pattern avoids class-based theming and ensures all components — including third-party — respond to changes without prop drilling.

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
bible-api.com (external, no API key required)
Returns verse array
          │
          ▼
Cached in component state
Rendered as verse list
          │
     User actions:
     ├── Highlight → sessionStorage (session-only)
     ├── Save note → SaveMomentModal → /api/journey/save
     └── Ask Kairos → sessionStorage context → /journey
```

### Bible → Companion Handoff

```js
// In Bible reader — sendToCompanion()
const prompt = `I'd like to reflect on ${ref}: "${snippet}" — what does this mean for my life today?`
sessionStorage.setItem("kairos_verse_context", prompt)
window.location.href = "/journey"

// In CompanionCore on mount
const ctx = sessionStorage.getItem("kairos_verse_context")
if (ctx) {
  sessionStorage.removeItem("kairos_verse_context")
  setInput(ctx)
  setStarted(true)
}
```

Single-use, session-scoped. Context is consumed and removed on read.

---

## API Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /api/ai/companion` | Optional | Main AI conversation |
| `GET /api/bible/chapter` | None | Bible chapter fetch |
| `GET /api/bible/verse` | None | Single verse fetch |
| `POST /api/journey/save` | Required | Save journey entry |
| `GET /api/user/journey` | Required | Fetch user's entries (paginated) |
| `GET /api/user/profile` | Required | Fetch user profile |
| `PATCH /api/user/profile` | Required | Update profile fields |
| `GET /api/plans` | Optional | List reading plans |
| `POST /api/plans` | Required | Enroll in plan |
| `GET /api/plans/[id]` | Optional | Plan detail + days + enrollment |
| `POST /api/plans/progress` | Required | Mark day complete / catch up |
| `POST /api/contact` | None | Contact form + Resend email |
| `GET /api/auth/callback` | None | PKCE/OTP callback |
| `DELETE /api/account/delete` | Required | Delete account |
| `GET /api/account/export` | Required | Export user data as JSON |
| `POST /api/admin/seed` | Secret | Seed knowledge base entries |

All protected routes use `requireRequestAppUser()` or `getRequestAppUser()`. No route accepts a client-provided user ID for authorization.

---

## Component Architecture

### Page Pattern (all app pages)

```
AppPage
├── <style>{css}</style>          ← scoped CSS
├── .layout (CSS grid: 220px 1fr)
│   ├── <aside> .sidebar          ← 220px sticky, 100vh
│   │   ├── Logo → homepage
│   │   ├── <nav> links with active gold dot
│   │   └── UserChip / SignIn link
│   └── <main> .main              ← flex: 1, overflow-y: auto
│       └── page content
└── <nav> .mobile-nav             ← position: fixed, 58px, z-index: 100
                                     env(safe-area-inset-bottom) padding
```

### Styling Approach

No CSS-in-JS, no Tailwind utility classes in components. All styling uses:
- **CSS variables** from `tokens.css` — colors, spacing, radius, shadow, font
- **Inline styles** — component-specific values with variable references
- **Scoped `<style>` tags** — pseudo-classes, media queries, `[data-theme]` overrides

Design rule: `--space-7` and `--space-9` do not exist in the token scale. Valid spacing ends at `--space-6`, then jumps to `--space-8`.

---

## Deployment Architecture

```
GitHub (main branch)
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

- `dev` branch — active development, not auto-deployed
- `main` branch — production, auto-deployed on every push
- Migrations applied manually in Supabase SQL editor, committed to `supabase/migrations/`

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# AI providers (at least one required)
GROQ_API_KEY
OPENROUTER_API_KEY
GEMINI_API_KEY

# RAG embeddings
JINA_API_KEY

# Contact form
RESEND_API_KEY
CONTACT_FROM_EMAIL
CONTACT_TEAM_EMAIL

# Admin
SEED_SECRET
```

Validated at startup by `lib/env/server.js`. Missing required vars throw on boot. Missing optional vars log warnings.

---

## Performance Notes

- Homepage and all non-auth pages are statically prerendered at build time
- Bible chapter fetches are cached in component state — no re-fetch on chapter revisit
- Verse of the Day is a static array of 365 entries indexed by day-of-year — zero API call
- RAG search runs in parallel with profile fetch and memory fetch — no sequential blocking
- All AI model calls have 15s individual timeouts with automatic failover