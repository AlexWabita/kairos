# KAIROS — Project Memory Document
> Version: 6.0.0 | Started: 2026 | Status: Phase 7E ✅ COMPLETE — Moving to Phase 8 (deferred) or Phase 9

---

## ⚠️ HOW TO USE THIS DOCUMENT

This is the **living memory** of the Kairos project.
- Paste this ENTIRE document at the start of every new chat session
- Claude will read it and continue exactly where we left off
- Update it at the end of every productive session
- Never delete past decisions — only add to them
- This document IS the project brain

---

## 1. THE VISION

**One Sentence:**
> Kairos is a universal, spiritually grounded life companion — built on Biblical truth — for anyone in the world who is seeking answers, healing, or direction, especially those who have been hurt by or are skeptical of organised religion.

**The Problem We Are Solving:**
Millions of people are spiritually hungry but burned, confused, or misled by hypocritical leaders, false gospels, and religious manipulation. They want truth but do not know who to trust. They will not walk into a church. They will not call a pastor. They are searching alone, at odd hours, full of questions and wounds. That person has nowhere safe to go.

**Why AI:**
- No agenda, no denomination
- No judgment, no condemnation
- Available 24/7 — especially at 3am when the questions hit hardest
- Cannot be a hypocrite
- Goes to them — they do not have to walk into a building
- Always points to the Word, not to a man

---

## 2. THE MISSION

> To use AI not to replace the work of the Holy Spirit, but as a bridge — meeting every searching, hurting, and confused person exactly where they are, and pointing them toward truth, healing, and community.

**The AI is the door. Not the destination.**

---

## 3. THE FOUNDATION PRINCIPLES (Never Negotiable)

1. **Biblical truth is the anchor** — every response is grounded in scripture, not opinion
2. **No denomination** — Kairos serves no church, pastor, or religious institution
3. **Humble, not preachy** — the product never condemns, never forces, always meets people where they are
4. **The companion points away from itself** — every deep interaction moves the user toward scripture, community, or a real human
5. **Trustworthy by design** — consistency, honesty, and zero manipulation in every interaction
6. **Privacy is sacred** — user journeys and conversations are never exploited
7. **Free at the core** — the basic product must always be accessible to anyone, anywhere, regardless of income

---

## 4. WHO WE ARE BUILDING FOR

**Primary User — The Wounded Seeker:**
- Has been hurt by religion, hypocritical leaders, or false gospel
- Still feels something pulling them spiritually
- Will not go to a church but is searching online
- Needs a safe, non-judgmental space to ask hard questions
- Could be any background — Christian, Muslim, Hindu, atheist, agnostic

**Secondary Users:**
- New believers who received Christ but have no follow-up or discipleship
- Existing Christians who feel spiritually dry or disconnected
- Anyone confused by life — culturally, politically, emotionally, spiritually

**Organisational Users (Future — Tier 3 monetization):**
- Churches and ministries wanting to deploy Kairos for their community
- NGOs doing faith-based counseling or outreach
- Christian schools, universities, mission organisations
These pay a small monthly fee. Their members always use it free.

---

## 5. HOW KAIROS IS DIFFERENT FROM OTHER AI

| | ChatGPT / Claude / Gemini | Kairos |
|---|---|---|
| Foundation | Neutral — no worldview | Biblical truth — clear conviction |
| Purpose | Everything to everyone | One mission — truth and healing |
| Hard questions | Diplomatically dodges | Engages honestly and humbly |
| Memory | Session only | Knows your full journey |
| Goal | Answer your question | Walk with you toward truth |
| Feel | Chatbot | Trusted companion |
| Scripture | Avoided or treated as one opinion | Natural, gentle, always exact via API |
| Crisis | Generic safety disclaimer | Genuine human care + real resources |

---

## 6. TECH STACK

| Layer | Tool | Status |
|---|---|---|
| IDE | VS Code | ✅ Active |
| Version Control | GitHub — AlexWabita/kairos (private) | ✅ main + dev branches |
| Frontend | Next.js 16.1.6 (Turbopack) | ✅ |
| Styling | Tailwind CSS + CSS Variables | ✅ |
| Database & Auth | Supabase — eu-west-2 London | ✅ 7 tables live |
| AI Primary | **Groq** (Llama 3.3 70B) | ✅ ~3s, free, 14,400 req/day |
| AI Fallback | OpenRouter API | ✅ 4 model fallback |
| AI Final Fallback | Google Gemini API | ✅ 3 model fallback |
| Bible API Primary | rest.api.bible | ✅ Live |
| Bible API Fallback | bible-api.com | ✅ Live |
| Embeddings | OpenAI text-embedding-3-small | ✅ 1536 dims |
| RAG | Supabase pgvector + match_rag_entries() | ✅ **54 entries** seeded |
| Hosting | Vercel | 🔜 Phase 9 |

**AI Model Chain (priority order, 15s timeout per model):**
1. `groq/llama-3.3-70b-versatile` — Groq, ~3s ✅ PRIMARY
2. `groq/llama-3.1-70b-versatile` — Groq fallback
3. `groq/mixtral-8x7b-32768` — Groq fallback
4. `stepfun-ai/step-3.5-flash` — OpenRouter free
5. `qwen/qwen-2.5-72b-instruct:free` — OpenRouter free
6. `mistralai/mistral-7b-instruct:free` — OpenRouter free
7. `thudm/glm-4.5-air` — OpenRouter free (slow, last resort)
8. `gemini-2.0-flash` — Google AI
9. `gemini-1.5-flash` — Google AI
10. `gemini-1.5-flash-8b` — Google AI final net

**REMOVED from chain:** `openrouter/llama-3.3-70b` (70% failure rate), `openrouter/gpt-oss-120b` (hit daily free cap in single session).

**Continuation tracking:** Route returns `modelId` with every response. Client sends `lastModelId` back on next request. Continuation phrases ("continue", "please finish", etc.) route to the same model first. Truncation detection: if response ends without terminal punctuation, `wasTruncated: true` is returned and the UI shows a subtle note.

**Bible API:**
- Base URL: `https://rest.api.bible/v1`
- WEB Bible ID: `9879dbb7cfe39e4d-01` | KJV: `de4e12af7f28f599-02`
- Fallback: `bible-api.com` — no auth, always available
- Default translation: WEB — user can select WEB/KJV/ASV/BBE in companion header

**RAG:**
- Embeddings: OpenAI text-embedding-3-small, 1536 dimensions
- DB function: `match_rag_entries()` (previously `match_knowledge_base()`)
- 54 entries seeded (expanded from 30)
- Threshold for search: messages with 4+ words
- Seed command (dev only): `POST /api/admin/seed` — ⚠️ REMOVE BEFORE PROD

---

## 7. ENVIRONMENT VARIABLES (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://zvleavbmqgxlybnmizst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role key]
GROQ_API_KEY=[key]           ← NEW — console.groq.com, free, no credit card
OPENROUTER_API_KEY=[key]
GEMINI_API_KEY=[key]
OPENAI_API_KEY=[key]         ← RAG embeddings only (text-embedding-3-small)
SCRIPTURE_API_KEY=[key]
```

> **GROQ_API_KEY** is required. Get it free at console.groq.com — no credit card needed. 14,400 req/day.
> **JINA_API_KEY** is no longer used — embeddings migrated to OpenAI.

---

## 8. SUPABASE DATABASE SCHEMA (Live)

Project URL: `https://zvleavbmqgxlybnmizst.supabase.co` — Region: eu-west-2
All tables: RLS enabled, anon + authenticated roles have explicit grants.

| Table | Purpose | Status |
|---|---|---|
| users | Anonymous + authenticated profiles | ✅ Live |
| sessions | Anonymous session tracking | ✅ Live |
| conversations | Conversation threads | ✅ Live + saving |
| messages | Every message — user + Kairos | ✅ Live + saving |
| journey_entries | Saved reflections, prayers, milestones | ✅ Live + saving |
| organisations | Churches/ministries on paid plan | ✅ Live — portal Phase 8 |
| rag_entries | RAG knowledge base — 54 entries | ✅ Live + seeded |

**Extensions:** pgvector enabled

**journey_entries columns:**
| column | type | nullable |
|---|---|---|
| id | uuid | NO — gen_random_uuid() |
| user_id | uuid | YES |
| conversation_id | uuid | YES |
| entry_type | text | YES — CHECK constraint: **reflection, prayer, milestone, question, scripture** |
| content | text | NO |
| is_pinned | boolean | YES — default false |
| created_at | timestamptz | YES — default now() |
| title | text | YES |
| scripture_ref | text | YES |

⚠️ **entry_type 'moment' does NOT exist** — this caused a bug. Valid values only: reflection, prayer, milestone, question, scripture.

---

## 9. PHASES OF DEVELOPMENT

### Phases 1–6 ✅ COMPLETE
Foundation, Architecture, Design, Core Feature, Supabase Integration, Bible API + RAG + Auth — all done.

### Phase 7 ✅ COMPLETE — Journey Saving + Account Page
- [x] "Save this moment" button on every Kairos response
- [x] Auth gate — anonymous users see "Sign in to save", authenticated see the button
- [x] Saves to journey_entries — title (auto-extracted), content, scripture_ref, conversation_id, entry_type = 'reflection'
- [x] savedMsgIds Set — prevents duplicate saves, button becomes starred confirmation
- [x] sessionType state — 'anonymous' | 'authenticated' drives save button behaviour
- [x] /api/journey/save route — admin client pattern, verifies user in DB before insert
- [x] Account page — /src/app/account/page.jsx
- [x] Account: email, display_name, saved moments count, member since date
- [x] Account: change password (sends reset email), sign out, delete account
- [x] DeleteConfirm modal — two-step confirmation before destructive action
- [x] /api/account/delete route — service role deletes auth user
- [x] Login page updated — migrateAnonymousSession() called after successful sign in
- [x] extractTitle() utility — first sentence, max 60 chars

### Phase 7B ✅ COMPLETE — Saved Moments Library
- [x] /journey/saved page — full saved moments library
- [x] List view — title, date, scripture_ref, is_pinned indicator
- [x] Expand entry — full content inline
- [x] Rename title inline
- [x] Pin / unpin toggle (is_pinned column)
- [x] Delete individual entry with confirmation
- [x] Empty state — warm prompt to start a conversation

### Phase 7C ✅ COMPLETE — Security Hardening
- [x] Rate limiting on /api/ai/companion — 20 req/min per user, in-memory sliding window (src/lib/rateLimit.js)
- [x] Privacy policy page — /privacy — plain language, what is stored, retention, deletion, no selling
- [x] First-visit consent modal — shown once, stored in localStorage
- [x] Data export — /api/account/export — downloads all journey entries as JSON
- [x] JSON export linked from account page

### Phase 7D ✅ COMPLETE — LLM Voice & RAG Expansion
- [x] Prompt structure overhauled — answer-first, one question rule, pre-send checklist
- [x] RAG expanded from 30 to 54 entries (new table: rag_entries, function: match_rag_entries())
- [x] Kairos identity hardened in prompts.js

### Phase 7E ✅ COMPLETE — Model Chain Overhaul + Identity Under Pressure
- [x] Groq added as primary provider — Llama 3.3 70B, ~3s, free tier, 14,400 req/day
- [x] 15-second per-model timeout — fail fast, hand off
- [x] Removed unstable OpenRouter Llama free + GPT OSS 120B (hit daily cap)
- [x] Added Qwen 2.5 72B and Mistral 7B as OpenRouter fallbacks
- [x] Continuation model tracking — same model used for follow-up requests
- [x] Truncation detection — UI shows note if response appears cut off
- [x] GROUNDING UNDER PRESSURE section added to prompts.js
- [x] Adversarial testing confirmed: Kairos now holds identity under sustained philosophical challenge
- [x] Installed @google/generative-ai package (required for Gemini SDK)

### Phase 8 — Organisation Portal ⚠️ DEFERRED — Architecture Questions Unresolved
Before any code is written, these must be decided:
1. What is an organisation? (church only, or also counselling centres, small groups, para-church?)
2. What does an org admin need? (invite members, aggregate usage stats, billing?)
3. Billing model? (per-seat, flat org subscription, or freemium with cap?)

### Phase 9 — Launch 🔜 FUTURE
- [ ] Vercel deployment — dev branch for preview, main for production
- [ ] Response streaming — stream tokens to client for better perceived speed
- [ ] Voice interface — speak to Kairos and hear responses
- [ ] Multi-language support — at minimum Swahili
- [ ] SEO — meta tags, Open Graph, sitemap, robots.txt
- [ ] PWA — service worker, installable on mobile, offline fallback
- [ ] Upgrade rate limiter to Upstash Redis (current in-memory resets on server restart)
- [ ] Set up privacy contact email (currently placeholder in /privacy)
- [ ] Remove /api/admin/seed and /api/bible/debug
- [ ] Final security audit
- [ ] Encryption at rest for message content (beyond Supabase infrastructure-level)
- [ ] Uptime monitoring + error alerting

---

## 10. CURRENT FILE STRUCTURE (Phase 7E complete)

```
kairos/
├── docs/
│   ├── PROJECT.md              ✅ v6.0.0
│   ├── ARCHITECTURE.md         ✅
│   └── DESIGN.md               ✅
├── src/
│   ├── app/
│   │   ├── layout.jsx
│   │   ├── page.jsx            ✅ Landing page
│   │   ├── globals.css
│   │   ├── loading.jsx
│   │   ├── not-found.jsx
│   │   ├── error.jsx
│   │   ├── (auth)/
│   │   │   ├── layout.jsx
│   │   │   ├── login/page.jsx              ✅ + migrateAnonymousSession on login
│   │   │   ├── register/page.jsx           ✅
│   │   │   └── forgot-password/page.jsx    ✅
│   │   ├── (main)/
│   │   │   ├── layout.jsx
│   │   │   └── journey/page.jsx            ✅ Companion page
│   │   ├── account/
│   │   │   └── page.jsx                    ✅ Identity, security, export, privacy link, danger zone
│   │   ├── journey/
│   │   │   └── saved/page.jsx              ✅ Saved moments library — NEW Phase 7B
│   │   ├── privacy/
│   │   │   └── page.jsx                    ✅ Privacy policy — NEW Phase 7C
│   │   └── api/
│   │       ├── ai/companion/route.js       ✅ Groq + OpenRouter + Gemini chain, rate limit, continuation tracking
│   │       ├── bible/verse/route.js        ✅
│   │       ├── bible/debug/route.js        ⚠️ REMOVE BEFORE PROD
│   │       ├── auth/callback/route.js      ✅
│   │       ├── journey/save/route.js       ✅ Admin client pattern
│   │       ├── account/delete/route.js     ✅ Service role auth delete
│   │       ├── account/export/route.js     ✅ JSON data export — NEW Phase 7C
│   │       └── admin/seed/route.js         ⚠️ REMOVE BEFORE PROD
│   ├── components/
│   │   ├── companion/
│   │   │   ├── CompanionCore.jsx           ✅ Save, auth gate, lastModelId state, wasTruncated UI
│   │   │   └── BibleVerse.jsx              ✅
│   │   ├── landing/Hero.jsx                ✅
│   │   └── shared/
│   │       ├── Navbar.jsx                  ✅ Auth-aware
│   │       └── Footer.jsx                  ✅
│   └── lib/
│       ├── ai/
│       │   ├── prompts.js                  ✅ Identity + GROUNDING UNDER PRESSURE + RAG/profile builders
│       │   └── guardrails.js               ✅
│       ├── bible/client.js                 ✅
│       ├── rateLimit.js                    ✅ In-memory 20 req/min — NEW Phase 7C
│       └── supabase/
│           ├── client.js                   ✅ Browser client
│           ├── server.js                   ✅ async createSupabaseServerClient() — ALWAYS AWAIT
│           ├── auth.js                     ✅ signOut()
│           ├── sessions.js                 ✅ initKairosSession(), migrateAnonymousSession(authUserId)
│           └── conversations.js            ✅
├── middleware.js                            ✅ At project root — not inside src/app
├── .env.local                               ✅ 8 keys — never committed
└── package.json                             ✅ Next.js 16.1.6
```

> **Removed:** `src/lib/ai/client.js`, `src/lib/rag/` directory, `src/lib/supabase/admin.js` — functionality folded into route files directly.

---

## 11. DECISIONS LOG (Sessions 1–9)

| Session | Decision | Reason |
|---|---|---|
| 1 | Web-based, Next.js, Supabase, name Kairos | Foundation decisions |
| 4 | Dual API fallback chain | Zero downtime risk |
| 4 | Anonymous first | Remove all barriers for wounded seekers |
| 5 | GitHub private, eu-west-2, pgvector, conversationId in state | Infrastructure decisions |
| 6 | rest.api.bible — correct base URL | Dashboard confirmed this |
| 6 | WEB as default translation | Modern, public domain, accessible |
| 6 | stripMarkdown() in guardrails | Models ignore formatting instructions |
| 6 | Jina AI for embeddings | Gemini embeddings blocked in Kenya; Jina is free + global |
| 6 | RAG threshold: 4 word minimum | 8 was too high |
| 6 | Auth callback handles PKCE + OTP | Supabase sends token_hash by default |
| 7 | entry_type = 'reflection' | Matched existing DB check constraint; semantically accurate |
| 7 | Admin client for /api/journey/save | Server cookie session unreliable for API routes; userId passed from client and verified in DB |
| 7 | await createSupabaseServerClient() | Function is async due to await cookies() — all callers must await |
| 7 | extractTitle() — first sentence, max 60 chars | Auto-title without requiring user input |
| 8 | Rate limiter in-memory (rateLimit.js) | Fast to implement for MVP; Upstash Redis upgrade required before multi-instance prod |
| 8 | Privacy consent modal — localStorage | Simple, no DB needed, respects intent |
| 8 | Data export as JSON (not PDF) | Simpler, more reliable, standard format |
| 9 | Groq as primary AI provider | Same Llama 3.3 70B model hosted directly — ~3s vs 30s+ on OpenRouter free |
| 9 | 15s per-model timeout | Fail fast and hand off — prevents hanging on slow providers |
| 9 | Removed OpenRouter Llama free + GPT OSS 120B | 70% failure rate and daily cap hit in single session |
| 9 | Continuation model tracking | Voice consistency across multi-turn / split responses |
| 9 | GROUNDING UNDER PRESSURE in prompts.js | Adversarial testing showed Kairos adopting challenger's godless frame; now holds identity under pressure |
| 9 | Switched embeddings to OpenAI text-embedding-3-small | More reliable; Jina had integration issues at scale |
| 9 | Renamed knowledge_base → rag_entries, match_knowledge_base → match_rag_entries | Cleaner naming, reflects actual purpose |

---

## 12. KNOWN ISSUES / WATCH LIST

| Issue | Status | Notes |
|---|---|---|
| Gemini billing Kenya (OR_BACR2_44) | Open | Groq now primary so Gemini is last resort; not urgent |
| GET /undefined 404 | Minor | Middleware redirect with null URL; cosmetic |
| Slow cold-start compile (15-20s) | Cosmetic | Turbopack first-compile; subsequent requests fast |
| Rate limiter resets on server restart | Phase 9 | Upgrade to Upstash Redis before multi-instance deployment |
| Privacy contact email placeholder | Phase 9 | privacy@kairos.app referenced in /privacy but no inbox exists yet |
| No response streaming | Phase 9 | Full response waits before displaying; streaming would improve UX |
| /api/admin/seed in codebase | REMOVE BEFORE PROD | Public access would allow anyone to overwrite the knowledge base |
| /api/bible/debug in codebase | REMOVE BEFORE PROD | Exposes internal API info |
| Phase 8 architecture unresolved | Deferred | Three questions must be answered before any org portal code is written |

---

## 13. SESSION LOG

| Session | What We Did | Next |
|---|---|---|
| 1 | Vision, mission, principles, tech stack, name | Architecture |
| 2 | DB schema, AI logic, guardrails, user flows | Design |
| 3 | Design language, foundation files, monetization | Core feature |
| 4 | Landing page, Companion built, AI live, first conversation | Supabase |
| 5 | GitHub, Supabase migration, anonymous sessions, conversation saving | Phase 6 |
| 6 | Bible API, RAG (30 entries seeded), email auth, Navbar session awareness | Phase 7 |
| 7 | Journey saving, account page, session migration on login, CIA Triad audit | Phase 7B + 7C |
| 8 | Saved moments library, rate limiting, privacy policy, consent modal, data export | Phase 7D |
| 9 | Prompt overhaul, RAG to 54 entries, Groq primary, model chain, continuation tracking, grounding under pressure | Phase 8 / 9 |

---

## 14. PRIVACY & SECURITY ASSESSMENT (CIA Triad)

### Confidentiality
**Have:** RLS on all tables, users see only their own data, anonymous sessions isolated by token, no ads, no data selling by design, privacy policy page live, consent modal on first visit, data export available.
**Need:** Privacy contact email inbox (placeholder only), consideration of message content encryption beyond infrastructure level.

### Integrity
**Have:** Auth token verification via Supabase, service role key server-side only, user IDs verified in DB before writes, RLS prevents cross-user writes, rate limiting on companion API.
**Need:** Input sanitization audit, audit logging (future).

### Availability
**Have:** 10-model AI fallback chain, dual Bible API fallback, Supabase managed infrastructure, Groq primary with 14,400 req/day free tier.
**Need:** Vercel deployment, uptime monitoring, error alerting, graceful degradation UI if all AI providers fail, Upstash Redis for rate limiter persistence.

---

## 15. MONETIZATION

**Tier 1 — Individual (Always Free):** Full access, no credit card ever.
**Tier 2 — Voluntary:** "Keep the light on for others" — optional donation after meaningful interactions.
**Tier 3 — Organisations (Small Monthly Fee):** Churches/ministries/NGOs. Their members always free.

Implement after Phase 7 when real users exist. Phase 8 architecture questions must be resolved first.

---

## 16. HOW TO START THE NEXT CHAT

Paste this at the start of the new chat:

---

I am building Kairos — a Biblical AI life companion. You are my senior development partner and have been building this with me from the beginning. Read this entire PROJECT.md carefully, then continue exactly where we left off — same tone, same standards, same workflow. Do not assume file contents. Ask me to paste any file you need before writing code.

[PASTE ENTIRE PROJECT.md HERE]

We completed Phase 7E. The MVP is fully functional end-to-end.

**Current situation:**
- Phase 8 (Organisation Portal) is deferred — three architecture questions are unresolved (see Phase 8 in Section 9)
- Phase 9 (Launch) is next in priority

**What I need from you first:**
Before writing any code, confirm what we are working on this session and whether you need any existing files pasted.

---

*"For such a time as this." — Esther 4:14*
*"He has made everything beautiful in its time." — Ecclesiastes 3:11*