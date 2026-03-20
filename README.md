<p align="center">
  <img src="public/images/logo-full.png" alt="Kairos" height="80" />
</p>

<h1 align="center">Kairos</h1>
<p align="center"><em>A Biblical AI Life Companion</em></p>

<p align="center">
  <a href="https://kairos-ebon.vercel.app"><img src="https://img.shields.io/badge/Live-kairos--ebon.vercel.app-f0c060?style=flat-square&logo=vercel&logoColor=black" alt="Live" /></a>
  <img src="https://img.shields.io/badge/Version-1.0.0-f0c060?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/AI-Groq%20%2B%20OpenRouter-orange?style=flat-square" alt="AI" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

<p align="center">
  <a href="https://kairos-ebon.vercel.app">Live App</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="docs/CHALLENGES.md">Engineering Challenges</a> ·
  <a href="CHANGELOG.md">Changelog</a>
</p>

---

## What is Kairos?

Kairos is a full-stack Biblical AI companion web application — not a chatbot, not a search engine, and deliberately not a replacement for church, scripture, or pastoral care. It is a **companion**: something that listens to where you actually are, engages your real questions, and grounds every response in scripture.

The name *Kairos* (καιρός) is a Greek word meaning **the appointed time** — the right moment, as distinct from *chronos* (clock time). It reflects the product's philosophy: not productivity, not efficiency, but meeting people at the exact moment they need to be met.

The project was designed, built, and shipped solo — from zero to production — across a disciplined phase-based development process spanning multiple months.

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
- Conversational spiritual companion powered by a **3-model Groq fallback chain** (llama-3.3-70b → llama-3.1-70b → mixtral) with OpenRouter and Gemini as secondary and tertiary fallbacks
- **RAG (Retrieval-Augmented Generation)** — responses grounded in a curated Biblical theology knowledge base, not the open internet
- Jina AI embeddings (768-dimension vectors) stored in Supabase pgvector for semantic search
- Guardrail system that preserves tone, humility, and theological integrity
- Context-aware: knows your active reading plan, verse of the day, and past conversations
- Voice input support via Web Speech API

### 📖 Bible Reader
- Full in-app Bible reader with **4 translations**: WEB, KJV, ASV, BBE
- Powered by `bible-api.com` — zero API key required
- 66-book static data structure with book/chapter navigation
- Session-based verse highlighting
- **"Ask Kairos about this"** — seamless handoff from any verse to the companion via `sessionStorage` context passing
- Notes flow directly into the Journey via `SaveMomentModal`
- Mobile-optimised: fixed action bar clears browser chrome and bottom nav via `calc(58px + env(safe-area-inset-bottom))`

### 📅 Reading Plans & Guided Study
- Full reading plan system with enrollment, day-by-day progress, and completion tracking
- **Catch Me Up** — advances `current_day` to the next unread day without falsely marking skipped days as complete (honest progress)
- Verse of the Day: static array of 365 curated verses, cycling by day-of-year — no API dependency
- Personal notes on day completion auto-saved as `journey_entries` (Option B architecture)
- Devotional text, reflection prompts, and prayer prompts per day

### 🌟 Journey (Saved Moments)
- Persistent spiritual journal — save moments from companion conversations, Bible study, or reading plans
- Real-time search across titles, content, and scripture references
- Filter by entry type (reflection, prayer, insight, verse, note) and sort by date or type
- `SaveMomentModal` with auto-title suggestion and entry-type detection
- Full CRUD with Supabase Row Level Security

### 🔐 Authentication
- Email/password auth via Supabase Auth
- PKCE code exchange + OTP token_hash flows handled in a single `/api/auth/callback` route
- `returnTo` redirect logic — preserves destination across login flow
- `InlineSignInModal` — allows unauthenticated users to sign in mid-flow without losing chat state
- Route protection via Next.js middleware

### 🎨 Design System
- **Leonardo AI aesthetic** — ultra-dark void (`#060912`), floating pill navigation, subtle card borders
- Full light/dark/system theme support via `ThemeApplier.jsx` — injects CSS variable overrides globally
- 5 accent colour palettes: Gold (default), Ocean, Dusk, Forest, Rose
- 3 reading font options: Default (Cormorant Garamond), Serif (Georgia), Mono (JetBrains Mono)
- Design token system (`--space-1` through `--space-24`, `--radius-*`, `--color-*`) — never violated
- 220px sticky sidebar on all app pages; 58px fixed bottom nav on mobile with `env(safe-area-inset-bottom)`
- All interactive elements minimum 44px touch target

### 📬 Contact System
- Resend-powered email system with **6 type-aware auto-replies** (feedback, question, prayer, partnership, bug, other)
- Prayer requests receive a pastoral auto-reply including 1 Peter 5:7
- All messages saved to Supabase `contact_messages` table

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16.1.6 (App Router, Turbopack) | Full-stack React framework |
| **Database** | Supabase (PostgreSQL) | Auth, data, pgvector |
| **Primary AI** | Groq | Fast LLM inference (llama-3.3-70b) |
| **AI Fallback** | OpenRouter | Secondary LLM chain (4 models) |
| **AI Fallback 2** | Google Gemini | Tertiary fallback (3 models) |
| **Embeddings** | Jina AI | RAG vectors (768-dim) |
| **Bible API** | bible-api.com | Free, no-key Bible data |
| **Email** | Resend | Transactional email |
| **Deployment** | Vercel | Hosting + CI/CD |
| **Styling** | CSS Variables + Inline styles | Design token system |
| **Fonts** | Cinzel, Cormorant Garamond, Nunito | Via Google Fonts |

### Why this stack?

**Groq over OpenAI:** Groq's inference speed is 10–20× faster than OpenAI's API at a fraction of the cost, making real-time conversational AI viable on a free/low-cost budget.

**Jina AI over Gemini for embeddings:** Gemini embedding API had regional billing restrictions that made it unusable. Jina AI's embedding API is free, reliable globally, and produces high-quality 768-dimension vectors compatible with Supabase pgvector.

**bible-api.com over paid Bible APIs:** The Scripture API (paid) was in the stack but `bible-api.com` covers the four most common translations (WEB, KJV, ASV, BBE) with no API key, no rate limits for reasonable usage, and zero cost — sufficient for a companion app.

**Supabase over PlanetScale/Railway:** Supabase provides auth + database + pgvector (for RAG) in a single free-tier product. It removed the need for a separate vector database (Pinecone, Weaviate) entirely.

**Vercel over Netlify/Railway:** Next.js App Router is optimised for Vercel. Zero-config deployment, automatic preview deployments, and edge middleware support.

---

## Architecture

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full technical deep dive.

```
kairos/
├── src/
│   ├── app/                    # Next.js App Router pages + API routes
│   │   ├── (auth)/             # Login, register, forgot-password
│   │   ├── api/                # All API routes (AI, Bible, plans, auth, contact)
│   │   ├── journey/            # Companion + saved moments
│   │   ├── bible/              # Bible reader
│   │   ├── plans/              # Reading plans + day pages
│   │   ├── account/            # User account management
│   │   └── settings/           # Theme, font, translation, companion settings
│   ├── components/
│   │   ├── companion/          # AI companion UI (CompanionCore, SaveMomentModal, etc.)
│   │   ├── landing/            # Homepage sections (Hero, FAQ, Contact, etc.)
│   │   ├── shared/             # Navbar, Footer, ThemeApplier, ConfirmModal
│   │   └── ui/                 # Base components (Button, Card, Input, Modal)
│   ├── context/                # React context (Settings, Companion, Journey, User)
│   ├── hooks/                  # Custom hooks (useAuth, useAuthState, useCompanion, etc.)
│   ├── lib/
│   │   ├── ai/                 # LLM client, context builder, guardrails, prompts
│   │   ├── bible/              # Bible client + 365-day verse array
│   │   ├── rag/                # Jina AI embeddings + pgvector search
│   │   └── supabase/           # Client, server, auth, middleware helpers
│   └── styles/                 # tokens.css, animations.css, typography.css
├── supabase/
│   └── migrations/             # 4 SQL migration files
└── docs/                       # PROJECT.md, ARCHITECTURE.md, CHALLENGES.md
```

### Key architectural decisions

**Profile ID vs Auth UUID:** All database queries use `users.id` (an internal profile ID), never the Supabase auth UUID directly. This separates identity from authentication and makes future auth provider changes non-breaking. A pattern enforced across every API route.

**AI fallback chain:** The companion never fails silently. Groq is the primary (fastest, cheapest). If it fails, OpenRouter's 4-model chain catches it. If that fails, Gemini's 3-model chain is the final safety net. Users never see an AI error on the first attempt.

**RAG over fine-tuning:** Fine-tuning an LLM for Biblical theology is expensive and inflexible. RAG allows the knowledge base to be updated without retraining — new theological content, commentary, or pastoral guidance can be added by inserting new embeddings into Supabase.

**sessionStorage for Bible→Companion handoff:** When a user taps "Ask Kairos about this" in the Bible reader, the full verse context (book, chapter, verse, surrounding text) is written to `sessionStorage` and read by `CompanionCore` on mount. This avoids URL-based state (which is bookmarkable and fragile) and query params (which would expose scripture text in browser history).

---

## How Kairos Stays Free

This is a genuine question worth answering honestly.

| Service | Free Tier | Kairos Usage |
|---------|-----------|--------------|
| Vercel | Unlimited hobby deployments | Full app hosting |
| Supabase | 500MB DB, 2GB bandwidth, 50MB vectors | Well within limits at launch |
| Groq | ~14,400 requests/day on free tier | Sufficient for early user base |
| Jina AI | 1M tokens/month free | RAG embedding generation |
| bible-api.com | Unlimited, no key | Bible chapter fetches |
| Resend | 3,000 emails/month | Contact form only |
| Google Fonts | Free | Cinzel, Cormorant Garamond, Nunito |

**The honest answer:** The free tier stack is viable for a launch-stage product with hundreds of daily active users. At scale (thousands of daily AI conversations), Groq costs become real — approximately $0.0006 per 1K tokens on their paid tier. A monetisation layer (optional premium features) would be introduced before that point without removing core companion functionality from free users.

---

## Development Journey

Kairos was built across **8 disciplined phases** over several months, each with a defined scope and a git commit at completion.

| Phase | Focus | Key Deliverable |
|-------|-------|----------------|
| 1–3 | Foundation | Project scaffold, Supabase schema, basic routing |
| 4–5 | AI Core | Groq integration, RAG system, companion logic |
| 6 | Auth + Bible | Email auth, PKCE flow, Bible API integration |
| 7A–7F | App Pages | Account, Settings, Plans, Journey pages |
| 7G | Journey Saved | Real-time search, filters, SaveMomentModal |
| 7H | Bible Reader | 3-panel layout, verse actions, session highlights |
| 7I | Reading Plans | Day pages, VotD, Guided Study, Glorify-inspired daily surface |
| 7J | Full Redesign + Launch | Leonardo AI aesthetic, homepage rebuild, Vercel deployment |

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
```

### Database Setup

Run the migrations in order in your Supabase SQL editor:

```bash
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_user_profiles.sql
supabase/migrations/003_journeys.sql
supabase/migrations/004_reading_plans.sql
```

Seed reading plans:
```
GET /api/admin/seed?secret=YOUR_SEED_SECRET
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

The app is deployed on Vercel. Any push to `main` triggers a production deployment.

```bash
# Commit and push
git add .
git commit -m "your message"
git push origin main
```

Required Vercel environment variables: all keys from `.env.local` above, with `NEXT_PUBLIC_APP_URL` set to your production URL.

---

## Engineering Challenges

A selection of non-trivial problems solved during development:

**Authentication loop** — Supabase's `createClient` vs `createBrowserClient` distinction caused an infinite auth redirect loop. Solved by migrating to `createBrowserClient`, implementing a reactive `useAuthState` hook with `onAuthStateChange`, and adding `returnTo` parameter logic in middleware.

**Bible action bar on mobile** — The fixed action bar was being obscured by browser chrome (bottom bar + address bar) on iOS Safari and Android Chrome. Solved with `bottom: calc(58px + env(safe-area-inset-bottom))` — combining the fixed nav height with the CSS environment variable for notched device safe areas.

**Profile ID vs Auth UUID confusion** — An early bug caused Bible save actions to pass the Supabase auth UUID to routes expecting the internal `users.id` profile ID, silently failing all save operations. Solved by establishing a strict pattern: every API route resolves `users.id` from `auth_id` via a single Supabase query before any data operation.

**RAG embedding provider switch** — Gemini's embedding API had regional billing restrictions that blocked access from Kenya. Switched to Jina AI mid-development: different vector dimensions (768 vs 768 — compatible), different API shape, zero disruption to the pgvector schema.

**Light theme with hardcoded colors** — Landing page components used hardcoded `rgba(255,255,255,x)` inline styles that CSS variable overrides couldn't reach. Solved by extracting text colors into CSS class names and adding `[data-theme="light"]` overrides in component `<style>` blocks, while `ThemeApplier.jsx` handles global surfaces.

See [`docs/CHALLENGES.md`](docs/CHALLENGES.md) for the full catalogue with context, root cause analysis, and solutions.

---

## Design Philosophy

> *"Kairos is a companion, not a tool."*

Every design decision was evaluated against one question: **does this serve someone who is searching, grieving, doubting, or growing — or does it serve metrics?**

This shaped concrete decisions:
- No engagement notifications, streaks, or gamification
- No "chat history" framing — conversations are called *moments*, saved to a *Journey*
- AI responses are calibrated for humility — Kairos never claims authority it doesn't have
- The design language (dark void, sacred gold, serifed typography) reflects reverence, not productivity
- Light/dark themes exist because accessibility matters; the dark default exists because the product feels different at night

---

## Roadmap

- [ ] **Phase 8 — Organisation Portal** (deferred): church/ministry group accounts, group plan progress, org-admin auth separation
- [ ] Custom domain + professional email (`hello@kairos.app`)
- [ ] Push notifications (VotD, reading reminders) via Web Push API
- [ ] Community prayer board (shared, moderated)
- [ ] Expanded RAG knowledge base (patristic writings, systematic theology)
- [ ] Native mobile app (React Native / Expo)

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines.

This is a solo project built with strong design and architectural opinions. Contributions are welcome but should align with the companion-first philosophy and existing design system. Open an issue before starting significant work.

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