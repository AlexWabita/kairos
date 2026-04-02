<p align="center">
  <img src="public/images/logo-full.png" alt="Kairos" height="80" />
</p>

<h1 align="center">Kairos</h1>
<p align="center"><em>A Biblical AI Life Companion</em></p>

<p align="center">
  <a href="https://kairos-ebon.vercel.app"><img src="https://img.shields.io/badge/Live-kairos--ebon.vercel.app-f0c060?style=flat-square&logo=vercel&logoColor=black" alt="Live" /></a>
  <img src="https://img.shields.io/badge/Version-1.1.0-f0c060?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/AI-Groq%20%2B%20OpenRouter%20%2B%20Gemini-orange?style=flat-square" alt="AI" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

<p align="center">
  <a href="https://kairos-ebon.vercel.app">Live App</a> ·
  <a href="ARCHITECTURE.md">Architecture</a> ·
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="docs/CHALLENGES.md">Engineering Challenges</a> ·
  <a href="CHANGELOG.md">Changelog</a>
</p>

---

## What is Kairos?

Kairos is a full-stack Biblical AI companion web application — not a chatbot, not a search engine, and deliberately not a replacement for church, scripture, or pastoral care. It is a **companion**: something that listens to where you actually are, engages your real questions, and grounds every response in scripture.

The name *Kairos* (καιρός) is a Greek word meaning **the appointed time** — the right moment, as distinct from *chronos* (clock time). It reflects the product's philosophy: not productivity, not efficiency, but meeting people at the exact moment they need to be met.

The project was designed, built, and shipped solo — from zero to production — across a disciplined phase-based development process.

> **Live:** [kairos-ebon.vercel.app](https://kairos-ebon.vercel.app)

---

## Screenshots

> _Homepage, Companion, Bible Reader, Reading Plans, Journey — dark and light themes_

| Homepage | Companion | Bible Reader |
|----------|-----------|--------------|
| ![Homepage](docs/screenshots/homepage.png) | ![Companion](docs/screenshots/companion.png) | ![Bible](docs/screenshots/bible.png) |

| Reading Plans | Journey Saved | Settings |
|---------------|---------------|----------|
| ![Plans](docs/screenshots/plans.png) | ![Journey](docs/screenshots/journey.png) | ![Settings](docs/screenshots/settings.png) |

---

## Features

### 🤖 AI Companion
- Conversational spiritual companion powered by a **3-provider fallback chain**: Groq (primary, 3 models) → OpenRouter (4 free models) → Gemini (3 models)
- **7 response modes** — Pastoral, Clarity, Lament, Formation, Apologetics, Courage, Release — each with distinct posture and closing guidance
- **RAG (Retrieval-Augmented Generation)** — responses grounded in a curated Biblical theology knowledge base (~113 entries) with context-aware retrieval using audience and mode metadata filters
- **Memory injection** — last 5 journey entries injected into every conversation for continuity; Kairos knows something of where you have been
- **19 guided capability cards** — grouped by emotional state (When something is wrong / When you need truth / When you're searching at depth / etc.), each opening with a Kairos framing message
- Jina AI embeddings (768-dim vectors) stored in Supabase pgvector with weight-boosted similarity scoring
- Escalation detection for crisis keywords with appropriate response handling
- Rate limiting: 20 requests/minute per user or IP

### 📖 Bible Reader
- Full in-app Bible reader with **4 translations**: WEB, KJV, ASV, BBE
- Powered by `bible-api.com` — zero API key required
- Session-based verse highlighting
- **"Ask Kairos about this"** — seamless handoff from any verse to the companion via `sessionStorage` context
- Notes flow directly into the Journey via `SaveMomentModal`
- Mobile-optimised with `env(safe-area-inset-bottom)` safe area handling

### 📅 Reading Plans
- 8 curated reading plans: New Believer Foundation, Overcoming Anxiety, Identity in Christ, 30 Days in the Psalms, Prayer & Fasting, Healing & Forgiveness, Walking in Purpose, Bible in 365 Days
- Full enrollment, day-by-day progress, and completion tracking
- **Catch Me Up** — advances `current_day` without falsely marking skipped days as complete
- Personal notes on day completion auto-saved as journey entries
- Devotional text, reflection prompts, and prayer prompts per day

### 🌟 Journey (Saved Moments)
- Persistent spiritual journal — save moments from companion conversations, Bible study, or reading plans
- Real-time search across titles, content, and scripture references
- Filter by entry type and sort by date or type
- `SaveMomentModal` with auto-title suggestion and entry-type detection
- Full CRUD with Supabase Row Level Security

### 🔐 Authentication & Security
- Email/password auth via Supabase Auth with PKCE code exchange and OTP flows
- **Server-derived identity** — no API route trusts a client-provided user ID; all identity resolved server-side via shared auth utilities
- `returnTo` redirect logic preserves destination across login flow
- `InlineSignInModal` — allows unauthenticated users to sign in mid-flow without losing state
- Route protection via Next.js middleware
- RLS enforced on all 12 public schema tables

### 🎨 Design System
- **Leonardo AI aesthetic** — ultra-dark void (`#060912`), floating pill navigation, sacred serifed typography
- Full light/dark/system theme support via `ThemeApplier.jsx`
- 5 accent colour palettes, 3 reading font options
- Design token system — never violated across the codebase
- 220px sticky sidebar on all app pages; 58px fixed bottom nav on mobile
- All interactive elements minimum 44px touch target

### 📬 Contact System
- Resend-powered with **6 type-aware auto-replies** (feedback, question, prayer, partnership, bug, other)
- All messages saved to Supabase

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16.1.6 (App Router, Turbopack) | Full-stack React framework |
| **Database** | Supabase (PostgreSQL + pgvector) | Auth, data, vector search |
| **Primary AI** | Groq | Fast LLM inference (llama-3.3-70b) |
| **AI Fallback** | OpenRouter | Secondary LLM chain (4 models) |
| **AI Fallback 2** | Google Gemini | Tertiary fallback (3 models) |
| **Embeddings** | Jina AI | RAG vectors (768-dim, free tier) |
| **Bible API** | bible-api.com | Free, no-key Bible data |
| **Email** | Resend | Contact form delivery |
| **Deployment** | Vercel | Hosting + serverless functions |

---

## Architecture Overview

```
Browser → Next.js Middleware → App Router
                                    │
                         ┌──────────┴──────────┐
                    Server Components      Client Components
                    (metadata, layout)     (auth, settings, UI)
                                                │
                                           API Routes
                                                │
                         ┌──────────────────────┼───────────────┐
                    Supabase              AI Chain           Jina AI
                    (auth + DB)     Groq → OpenRouter     (embeddings)
                                       → Gemini             │
                                                       pgvector RAG
```

For the complete technical breakdown see [ARCHITECTURE.md](ARCHITECTURE.md).

### Key architectural decisions

**Server-derived identity:** No API route accepts a user ID from the client. All identity is resolved server-side via shared utilities in `lib/server/auth/`. This eliminates a class of impersonation vulnerabilities and creates a consistent trust boundary across all protected routes.

**AI fallback chain:** The companion never fails on the first attempt. Groq (fastest) → OpenRouter (4 free models) → Gemini (3 models). Only if all 10 models fail does an error surface.

**Context-aware RAG:** The knowledge base (~113 curated entries) is retrieved not just by vector similarity but by audience and mode metadata filters. A person in lament gets lament-appropriate content. A seeker gets accessible content. Retrieval degrades gracefully to unfiltered search when no matches are found with filters.

**Memory injection:** The last 5 journey entries are fetched in parallel with RAG search and injected into every companion response. Kairos knows something of where you have been without ever referencing the mechanism explicitly.

**sessionStorage for Bible→Companion handoff:** Verse context is written to `sessionStorage` and consumed once on mount. Avoids URL-based state (bookmarkable, fragile) and query params (browser history exposure).

---

## Security & Trust

Kairos handles personal spiritual content — doubt, grief, confession, prayer. That creates obligations.

**Data handling:**
- Journey entries are private by default. RLS policies enforce this at the database level, not just the application level.
- No data is sold or shared with third parties. No advertising of any kind.
- Account export (`GET /api/account/export`) gives users full access to their own data as JSON.
- Account deletion (`DELETE /api/account/delete`) permanently removes all data via cascade.

**Identity security:**
- All protected routes resolve identity server-side from the authenticated session cookie. No client-provided user ID is trusted.
- Anonymous users can use the companion but cannot save moments or access personalised features.

**AI safety:**
- Escalation detection on every message. Crisis keywords trigger a specific response directing users to professional support.
- The system prompt enforces theological integrity and scope boundaries — Kairos is explicitly not a therapist, medical professional, or financial advisor.
- Rate limiting prevents abuse of AI endpoints.

---

## How Kairos Stays Free

| Service | Free Tier | Kairos Usage |
|---------|-----------|--------------|
| Vercel | Unlimited hobby deployments | Full app hosting |
| Supabase | 500MB DB, 2GB bandwidth, 50MB vectors | Within limits at launch scale |
| Groq | ~14,400 requests/day | Sufficient for early user base |
| Jina AI | 1M tokens/month | RAG embedding generation |
| bible-api.com | Unlimited, no key | Bible chapter fetches |
| Resend | 3,000 emails/month | Contact form only |

The free tier stack is viable for hundreds of daily active users. At scale, a monetisation layer (optional premium features) would be introduced before Groq costs become significant — without removing core companion functionality from free users.

---

## Development Journey

Kairos was built across **8 disciplined phases**, each with a defined scope and a git commit at completion.

| Phase | Focus | Key Deliverable |
|-------|-------|----------------|
| 1–3 | Foundation | Project scaffold, Supabase schema, routing |
| 4–5 | AI Core | Groq integration, RAG system, companion logic |
| 6 | Auth + Bible | Email auth, PKCE flow, Bible API |
| 7A–7F | App Pages | Account, Settings, Plans, Journey pages |
| 7G | Journey Saved | Real-time search, filters, SaveMomentModal |
| 7H | Bible Reader | 3-panel layout, verse actions, Ask Kairos handoff |
| 7I | Reading Plans | Day pages, VotD, Catch Me Up, daily surface |
| 7J | Redesign + Launch | Leonardo AI aesthetic, homepage, Vercel deployment |
| 1.0.0 | Production Launch | Live deployment, Google Search Console, v1 tag |
| 8A | Security Hardening | Server-derived identity across all API routes |
| 8B | Companion Premium | 7 response modes, memory injection, capability cards |
| 8C | RAG Expansion | ~113 entries, context-aware retrieval, tag taxonomy |
| 8D | Codebase Hardening | Empty file cleanup, user/profile route, env validation |
| 8E | Documentation | ARCHITECTURE.md reconciliation, README, CHANGELOG |

See [`CHANGELOG.md`](CHANGELOG.md) for the complete version history and [`docs/CHALLENGES.md`](docs/CHALLENGES.md) for the engineering problems encountered and solved at each phase.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- A Groq API key (free at [console.groq.com](https://console.groq.com))
- A Jina AI API key (free at [jina.ai](https://jina.ai))

### Installation

```bash
git clone https://github.com/AlexWabita/kairos.git
cd kairos
npm install --legacy-peer-deps
```

### Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

GROQ_API_KEY=your_groq_key
OPENROUTER_API_KEY=your_openrouter_key
GEMINI_API_KEY=your_gemini_key
JINA_API_KEY=your_jina_key

RESEND_API_KEY=your_resend_key
CONTACT_FROM_EMAIL=onboarding@resend.dev
CONTACT_TEAM_EMAIL=your@email.com

SEED_SECRET=your_seed_secret
```

### Database Setup

Run migrations in order in your Supabase SQL editor:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_user_profiles.sql
supabase/migrations/003_journeys.sql
supabase/migrations/004_reading_plans.sql
supabase/migrations/005_auth_users_sync.sql
supabase/migrations/006_rls_policies_audit.sql
supabase/migrations/007_knowledge_base_metadata.sql
supabase/migrations/008_context_aware_retrieval.sql
```

Then seed the knowledge base via the admin route (requires `SEED_SECRET`):

```bash
curl -X POST https://your-domain.vercel.app/api/admin/seed \
  -H "Authorization: Bearer YOUR_SEED_SECRET"
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Any push to `main` triggers a production deployment on Vercel.

```bash
git checkout main
git merge dev
git push origin main
```

Required Vercel environment variables: all keys from `.env.local` above, with `NEXT_PUBLIC_APP_URL` set to your production URL.

---

## Design Philosophy

> *"Kairos is a companion, not a tool."*

Every design decision was evaluated against one question: **does this serve someone who is searching, grieving, doubting, or growing — or does it serve metrics?**

This shaped concrete decisions:
- No engagement notifications, streaks, or gamification
- No "chat history" framing — conversations are called *moments*, saved to a *Journey*
- AI responses calibrated for humility — Kairos never claims authority it does not have
- The design language (dark void, sacred gold, serifed typography) reflects reverence, not productivity
- 7 response modes ensure Kairos responds differently to grief than to intellectual questioning, to lament than to formation

---

## Roadmap

- [ ] **Conversation persistence** — load and resume previous conversations; save full conversations as journey entries
- [ ] **Companion UI redesign** — modern companion page layout with improved visual hierarchy
- [ ] **Phase 8 — Organisation Portal** (deferred): church/ministry group accounts, group plan progress, org-admin auth separation
- [ ] Custom domain + professional email
- [ ] Push notifications (VotD, reading reminders) via Web Push API
- [ ] Expanded plans catalog: prayer formation tiers, addiction recovery, grief, spiritual dryness
- [ ] Native mobile app (React Native / Expo)

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines.

This is a solo project with strong design and architectural opinions. Contributions are welcome but must align with the companion-first philosophy and existing design system. Open an issue before starting significant work.

---

## License

MIT — see [`LICENSE`](LICENSE).

---

## Author

**Alex Wabita**
Nairobi, Kenya

Built with discipline, care, and a genuine belief that technology can serve the searching soul.

---

<p align="center">
  <em>"For everything there is a season, and a time for every matter under heaven."</em><br/>
  — Ecclesiastes 3:1
</p>