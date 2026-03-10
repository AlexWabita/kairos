# KAIROS — Project Memory Document
> Version: 5.0.0 | Started: 2026 | Status: Phase 7 ✅ COMPLETE — Moving to Phase 7B

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
| AI Primary | OpenRouter API | ✅ 4 model fallback |
| AI Backup | Google Gemini API | ✅ 3 model fallback |
| Bible API Primary | rest.api.bible | ✅ Live |
| Bible API Fallback | bible-api.com | ✅ Live |
| Embeddings | Jina AI jina-embeddings-v2-base-en | ✅ 768 dims, free |
| RAG | Supabase pgvector + match_knowledge_base() | ✅ 30 entries seeded |
| Hosting | Vercel | 🔜 Phase 9 |

**AI Fallback Chain:**
OpenRouter: Llama 3.3 70B → GPT OSS 120B → StepFun Step 3.5 Flash → GLM 4.5 Air
Gemini: gemini-2.0-flash → gemini-2.0-flash-lite → gemini-1.5-flash-002

**Bible API:**
- Base URL: `https://rest.api.bible/v1`
- WEB Bible ID: `9879dbb7cfe39e4d-01` | KJV: `de4e12af7f28f599-02`
- Fallback: `bible-api.com` — no auth, always available
- Default translation: WEB — user can select WEB/KJV/ASV/BBE in companion header

**RAG:**
- Embeddings: Jina AI, 768 dimensions
- DB column: `knowledge_base.embedding vector(768)`
- SQL function: `match_knowledge_base(query_embedding vector(768), match_threshold float DEFAULT 0.5, match_count int DEFAULT 3)`
- Threshold for search: messages with 4+ words
- Seed command (dev only): `POST /api/admin/seed` with `Authorization: Bearer kairos-seed-dev`

---

## 7. ENVIRONMENT VARIABLES (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://zvleavbmqgxlybnmizst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role key]
OPENROUTER_API_KEY=[key]
GEMINI_API_KEY=[key]
SCRIPTURE_API_KEY=[key]
JINA_API_KEY=[key]
SEED_SECRET=kairos-seed-dev
```

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
| knowledge_base | RAG knowledge base — 30 entries | ✅ Live + seeded |

**Extensions:** pgvector enabled

**journey_entries columns:**
| column | type | nullable |
|---|---|---|
| id | uuid | NO — gen_random_uuid() |
| user_id | uuid | YES |
| conversation_id | uuid | YES |
| entry_type | text | YES — CHECK constraint: reflection, prayer, milestone, question, scripture |
| content | text | NO |
| is_pinned | boolean | YES — default false |
| created_at | timestamptz | YES — default now() |
| title | text | YES |
| scripture_ref | text | YES |

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

### Phase 7B — Saved Moments Library 🔜 NEXT
- [ ] /journey/saved page — browse all saved entries
- [ ] List view — title, date, scripture_ref, is_pinned indicator
- [ ] Full entry view — read complete content of a saved moment
- [ ] Rename title inline
- [ ] Pin / unpin toggle (is_pinned column ready)
- [ ] Delete individual entry
- [ ] Empty state — warm prompt to start a conversation

### Phase 7C — Security Hardening 🔜 NEXT (parallel to 7B)
- [ ] Rate limiting on /api/ai/companion — prevent abuse and cost overrun
- [ ] Privacy policy page — plain language, what is stored, retention, deletion, no selling
- [ ] Data export — user can download all their journey entries as JSON or PDF
- [ ] Input sanitization audit

### Phase 8 — Organisation Portal 🔜 FUTURE
- [ ] Organisation account type, admin dashboard, white-label, Stripe billing

### Phase 9 — Launch 🔜 FUTURE
- [ ] Voice, multi-language, SEO, PWA, Vercel deploy, domain
- [ ] Encryption at rest for message content (beyond Supabase infrastructure-level)
- [ ] Uptime monitoring + error alerting

---

## 10. CURRENT FILE STRUCTURE (Phase 7 complete)
```
kairos/
├── docs/
│   ├── PROJECT.md              ✅ v5.0.0
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
│   │   │   ├── login/page.jsx          ✅ + migrateAnonymousSession on login
│   │   │   ├── register/page.jsx       ✅
│   │   │   └── forgot-password/page.jsx ✅
│   │   ├── (main)/
│   │   │   ├── layout.jsx
│   │   │   └── journey/page.jsx        ✅ Companion page
│   │   ├── account/
│   │   │   └── page.jsx                ✅ Identity, security, navigation, danger zone
│   │   └── api/
│   │       ├── ai/companion/route.js   ✅ RAG + verse + guardrails
│   │       ├── bible/verse/route.js    ✅
│   │       ├── bible/debug/route.js    ⚠️ Remove before prod
│   │       ├── auth/callback/route.js  ✅
│   │       ├── journey/save/route.js   ✅ Admin client pattern
│   │       ├── account/delete/route.js ✅ Service role auth delete
│   │       └── admin/seed/route.js     ⚠️ Remove before prod
│   ├── components/
│   │   ├── companion/
│   │   │   ├── CompanionCore.jsx       ✅ Save button + auth gate + sessionType
│   │   │   └── BibleVerse.jsx          ✅
│   │   ├── landing/Hero.jsx            ✅
│   │   └── shared/
│   │       ├── Navbar.jsx              ✅ Auth-aware
│   │       └── Footer.jsx              ✅
│   └── lib/
│       ├── ai/
│       │   ├── client.js               ✅
│       │   ├── prompts.js              ✅
│       │   └── guardrails.js           ✅
│       ├── bible/client.js             ✅
│       ├── rag/
│       │   ├── embeddings.js           ✅
│       │   └── search.js               ✅
│       └── supabase/
│           ├── client.js               ✅
│           ├── admin.js                ✅
│           ├── server.js               ✅ async createSupabaseServerClient()
│           ├── auth.js                 ✅
│           ├── sessions.js             ✅ migrateAnonymousSession(authUserId)
│           └── conversations.js        ✅
├── middleware.js                        ✅
├── .env.local                           ✅ All 8 keys — never committed
└── package.json                         ✅ Next.js 16.1.6
```

---

## 11. DECISIONS LOG (Sessions 1–7)

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
| 6 | vector(768) | Jina uses 768 dims, not 1536 |
| 6 | RAG threshold: 4 word minimum | 8 was too high |
| 6 | Auth callback handles PKCE + OTP | Supabase sends token_hash by default |
| 7 | entry_type = 'reflection' | Matched existing DB check constraint; semantically accurate |
| 7 | Admin client for /api/journey/save | Server cookie session unreliable for API routes; userId passed from client and verified in DB |
| 7 | await createSupabaseServerClient() | Function is async due to await cookies() — all callers must await |
| 7 | extractTitle() — first sentence, max 60 chars | Auto-title without requiring user input |
| 7 | Saved moments library deferred to Phase 7B | Saving without viewing is incomplete UX — needs dedicated page |
| 7 | Privacy hardening deferred to Phase 7C | Non-negotiable before launch; rate limiting + privacy policy + data export |

---

## 12. KNOWN ISSUES / WATCH LIST

| Issue | Status | Notes |
|---|---|---|
| Gemini billing Kenya (OR_BACR2_44) | Open | OpenRouter sufficient; Gemini stays in chain |
| GET /undefined 404 | Minor | Middleware redirect with null URL; cosmetic |
| Slow cold-start compile (15-20s) | Cosmetic | Turbopack first-compile; subsequent requests fast |
| Model voice inconsistency | Deferred | Switching models mid-conversation changes tone |
| Llama 3.3 70B provider errors | Open | Intermittent — fallback chain handles it |
| No rate limiting on companion API | Phase 7C | Cost and abuse risk — must fix before launch |
| No privacy policy | Phase 7C | Required before real users |
| No data export | Phase 7C | GDPR + right thing to do |
| /api/admin/seed in codebase | Remove before prod | |
| /api/bible/debug in codebase | Remove before prod | |

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

---

## 14. PRIVACY & SECURITY ASSESSMENT (CIA Triad)

### Confidentiality
**Have:** RLS on all tables, users see only their own data, anonymous sessions isolated by token, no ads, no data selling by design.
**Need:** Privacy policy page, data export for users, explicit retention policy, consideration of message content encryption beyond infrastructure level.

### Integrity
**Have:** Auth token verification via Supabase, service role key server-side only, user IDs verified in DB before writes, RLS prevents cross-user writes.
**Need:** Input sanitization audit, rate limiting on companion API, audit logging (future).

### Availability
**Have:** Dual AI fallback (7 models), dual Bible API fallback, Supabase managed infrastructure.
**Need:** Vercel deployment, uptime monitoring, error alerting, graceful degradation if all AI providers fail.

---

## 15. MONETIZATION

**Tier 1 — Individual (Always Free):** Full access, no credit card ever.
**Tier 2 — Voluntary:** "Keep the light on for others" — optional donation after meaningful interactions.
**Tier 3 — Organisations (Small Monthly Fee):** Churches/ministries/NGOs. Their members always free.

Implement after Phase 7 when real users exist.

---

## 16. HOW TO START THE NEXT CHAT

Paste this at the start of the new chat:

---

I am building Kairos — a Biblical AI life companion. You are my senior development partner and have been building this with me from the beginning. Read this entire PROJECT.md carefully, then continue exactly where we left off — same tone, same standards, same workflow. Do not assume file contents. Ask me to paste any file you need before writing code.

[PASTE ENTIRE PROJECT.md HERE]

We completed Phase 7. Phase 7B is next — the saved moments library page.
Start by asking me what you need before writing any code.

---

*"For such a time as this." — Esther 4:14*
*"He has made everything beautiful in its time." — Ecclesiastes 3:11*