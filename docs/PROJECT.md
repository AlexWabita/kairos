# KAIROS — Project Memory Document
> Version: 3.0.0 | Started: 2026 | Status: Phase 5 — Supabase ✅ COMPLETE

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
- People from different religious, social, and cultural backgrounds with genuine questions

**Organisational Users (Future — Tier 3 monetization):**
- Churches and ministries wanting to deploy Kairos for their community
- NGOs doing faith-based counseling or outreach
- Christian schools or universities
- Mission organisations reaching unreached people groups
These pay a small monthly fee. Their members always use it free.

---

## 5. HOW KAIROS IS DIFFERENT FROM OTHER AI

| | ChatGPT / Claude / Gemini | Kairos |
|---|---|---|
| Foundation | Neutral — no worldview | Biblical truth — clear conviction |
| Purpose | Everything to everyone | One mission — truth and healing |
| Hard questions | Diplomatically dodges | Engages honestly and humbly |
| Manipulation | Can be convinced to contradict itself | Unshakeable foundation |
| Memory | Session only | Knows your full journey |
| Goal | Answer your question | Walk with you toward truth |
| Feel | Chatbot | Trusted companion |
| Tone | Generic helpful assistant | Warm elder who has read every book and actually cares |
| Scripture | Avoided or treated as one opinion | Natural, gentle, always accurate |
| Crisis | Generic safety disclaimer | Genuine human care + real resources |

**Why responses feel different:**
General AI is trained to be everything to everyone and offend no one — so it hedges, it balances, it never takes a side. Kairos has a declared foundation, a clear identity, and a specific mission. It speaks with the warmth and conviction of someone who actually believes what they are saying. That difference is felt immediately.

---

## 6. WHAT THE PRODUCT FEELS LIKE (NOT a chatbot)

- **Voice first** — speaking feels more human than typing
- **It asks YOU first** — opens with "What are you carrying today?" not "How can I help?"
- **Sacred space design** — deep midnight background, gold particles, ambient glow orbs
- **Remembers your story** — knows your background, your questions, your journey over time
- **Connects to real humans** — after deep conversations, bridges the user to a pastor, counselor, or community

---

## 7. TECH STACK

| Layer | Tool | Status |
|---|---|---|
| IDE | VS Code | ✅ Active |
| Version Control | GitHub (private) | ✅ Active — main + dev branches |
| Frontend Framework | Next.js 16.1.6 | ✅ Installed |
| Styling | Tailwind CSS + CSS Variables | ✅ Installed |
| Database & Auth | Supabase | ✅ Phase 5 Complete |
| AI Engine (Primary) | OpenRouter API | ✅ Working — 5 model fallback chain |
| AI Engine (Backup) | Google Gemini API | ✅ Configured — key pending billing resolution |
| Bible API (Primary) | scripture.api.bible | ✅ Key registered — Phase 6 implementation |
| Bible API (Fallback) | bible-api.com | ✅ Planned — no key required |
| Hosting | Vercel or Netlify | 🔜 Phase 8 |
| Platform | Web-based (PWA) | 🔜 Phase 8 |

**AI Architecture — Dual Fallback Chain (Updated):**
- Phase 1: OpenRouter (5 free models tried in order)
  1. Llama 3.3 70B (meta-llama/llama-3.3-70b-instruct:free)
  2. GPT OSS 120B (openai/gpt-oss-120b:free)
  3. Arcee Trinity Large (arcee-ai/arcee-trinity-large-preview:free)
  4. StepFun Step 3.5 Flash (stepfun/step-3.5-flash:free)
  5. GLM 4.5 Air (z-ai/glm-4.5-air:free)
- Phase 2: Google Gemini (3 models tried in order)
  1. gemini-2.0-flash
  2. gemini-2.0-flash-lite
  3. gemini-1.5-flash-002
- Total: 8 fallback options across 2 independent API providers
- Model switching is completely invisible to users
- All failures logged to VS Code terminal only — never shown to users
- Production: swap to Claude or Gemini Pro with one line change

**Bible API Architecture (Phase 6):**
- Primary: scripture.api.bible — full search, 2500+ translations, user-selectable version
- Fallback: bible-api.com — no auth required, always available, KJV/WEB
- User preferred translation stored in Supabase users table
- Same dual-fallback pattern as AI chain — invisible to user

---

## 8. PRODUCT NAME

**Kairos**
- Greek word meaning "the appointed time" — the right moment, the divine turning point
- Deeply Biblical — used throughout scripture for God's perfect timing
- Positions the product as a moment, a door, not a destination
- Universal — non-Christians can connect to the concept of "the right moment"
- Theologically humble — does not appropriate any name or title belonging to God

**Rejected:** Aletheia — appropriates Jesus' own declaration ("I am the Way, the Truth...")

---

## 9. PHASES OF DEVELOPMENT

### Phase 1 — Foundation ✅ COMPLETE
- [x] Vision, mission, principles, users defined
- [x] Tech stack decided, product named
- [x] Full file structure created (PowerShell script)
- [x] PROJECT.md created

### Phase 2 — Architecture ✅ COMPLETE
- [x] Database schema — 7 tables designed
- [x] AI companion logic — identity, context injection, guardrails, learning system
- [x] API routes planned
- [x] 4 user flows mapped (first visit, returning, crisis, non-Christian)
- [x] ARCHITECTURE.md created

### Phase 3 — Design Language ✅ COMPLETE
- [x] Sacred Light concept — deep midnight + gold
- [x] Three-font system: Cinzel + Cormorant Garamond + Nunito
- [x] Full animation system — breathe, particle float, sacred enter
- [x] 3D strategy defined (Three.js)
- [x] DESIGN.md created

### Phase 4 — Core Feature ✅ COMPLETE
- [x] Foundation files — package.json, configs, all installed
- [x] Base styles — tokens.css, typography.css, animations.css, globals.css
- [x] Landing page — Hero, Navbar (with hamburger animation), sections, footer
- [x] Companion interaction — CompanionCore.jsx working end to end
- [x] AI identity prompts + guardrails system
- [x] API route — /api/ai/companion live and responding
- [x] Dual API fallback chain — OpenRouter + Gemini
- [x] First real conversation tested and confirmed premium quality

### Phase 5 — Supabase Integration ✅ COMPLETE
- [x] GitHub repository created — private, main + dev branches, push protection on main
- [x] Supabase project created — region: eu-west-2 London
- [x] Database migration — all 7 tables live with RLS and indexes
- [x] pgvector extension enabled — ready for Phase 6 RAG embeddings
- [x] Supabase client wired — client.js, admin.js, server.js, middleware.js
- [x] Anonymous session management — working end to end
- [x] Conversations saved to database on first message
- [x] Every message (user + Kairos) saved to messages table
- [x] conversationId passed back to frontend — all messages in same session attach correctly
- [x] AI fallback chain updated — 5 OpenRouter models + 3 Gemini models
- [x] Scripture API key registered — scripture.api.bible (key in .env.local)
- [x] Auth placeholder pages fixed — (auth)/layout.jsx + forgot-password/page.jsx
- [ ] User authentication (email signup) — deferred to Phase 5b or Phase 6 start
- [ ] Profile creation and onboarding conversation — deferred
- [ ] Journey entry saving UI — deferred

### Phase 6 — Bible API + RAG + Response Quality 🔜 NEXT
- [ ] Wire scripture.api.bible — exact verse lookup, keyword search
- [ ] Wire bible-api.com as fallback
- [ ] Add preferred_bible_version to users table in Supabase
- [ ] Build settings UI — user can select preferred Bible translation
- [ ] Detect when a scripture reference is needed in conversation
- [ ] Pull exact verse text from API before responding — never generate from memory
- [ ] Build Kairos Knowledge Base in Supabase (curated Biblical content, commentaries)
- [ ] Implement RAG — Kairos searches knowledge base before every response
- [ ] Response quality testing across different user types
- [ ] Refine identity prompt based on real conversation feedback
- [ ] User authentication (email signup) — carry over from Phase 5
- [ ] Profile creation and onboarding conversation
- [ ] Journey entry saving UI

### Phase 7 — Organisation Portal 🔜 FUTURE
- [ ] Organisation account type in database
- [ ] Admin dashboard for churches/ministries
- [ ] White-label configuration
- [ ] Usage reports and community analytics
- [ ] Billing integration (Stripe — small monthly fee)

### Phase 8 — Launch Preparation 🔜 FUTURE
- [ ] Voice capability
- [ ] Multi-language support
- [ ] SEO strategy execution
- [ ] PWA configuration
- [ ] Deploy to Vercel
- [ ] Domain setup

---

## 10. DECISIONS LOG

| Session | Decision | Reason |
|---|---|---|
| 1 | Web-based platform | Accessibility, SEO, no app store gates |
| 1 | Next.js as framework | SEO-friendly, free, industry standard |
| 1 | Supabase for database | Free tier, handles auth and DB together |
| 1 | Name: Kairos | Biblically grounded, theologically humble |
| 1 | Rejected: Aletheia | Appropriates Jesus' declaration |
| 1 | Not a chatbot | Chat UI destroys trust before conversation starts |
| 1 | AI points away from itself | Product is the door, not the destination |
| 3 | OpenRouter for AI | Free models for dev, one-line swap to Claude for production |
| 3 | Monetization: Hybrid Path 3 | Individuals free, orgs pay small fee, mission stays pure |
| 3 | Next.js upgraded to latest | Security vulnerability in 14.2.5 |
| 4 | Dual API fallback chain | OpenRouter + Gemini = multiple fallback options, zero downtime risk |
| 4 | Privacy settings on OpenRouter | Required to unlock free model access |
| 4 | Anonymous first, save after interaction | Remove all barriers for wounded seekers |
| 5 | GitHub private repo — main + dev | Protect codebase, clean branch strategy |
| 5 | Supabase region: eu-west-2 London | Closest available region to Kenya |
| 5 | RLS enabled per table with explicit role grants | Security by default, anon users can still write |
| 5 | pgvector extension enabled | Future-ready for Phase 6 RAG embeddings |
| 5 | conversationId stored in frontend state | All messages in session attach to same conversation |
| 5 | OpenRouter model list updated | Old model IDs deprecated — 5 fresh verified free models |
| 5 | scripture.api.bible as primary Bible API | 2500+ translations, search, free tier sufficient |
| 5 | bible-api.com as Bible API fallback | No auth required, always available, same pattern as AI chain |
| 5 | User-selectable Bible translation | Stored in users table, applies to all scripture references |
| 5 | Exact verse from API, not AI memory | AI can hallucinate references — API guarantees accuracy |
| 5 | Deferred email auth to Phase 6 | Anonymous flow working cleanly — auth adds complexity, build it right |

---

## 11. MONETIZATION STRATEGY

### The Core Principle
> The wounded seeker never pays. Ever.
> Organisations with resources sustain it so individuals never have to.

**Tier 1 — Individual Users (Always Free)**
Full companion access, generous daily limit, journey tracking, no credit card ever.

**Tier 2 — Voluntary "Keep the Light On"**
Non-pushy prompt after meaningful interactions. One-time or recurring donation.
Framed as: "keeping the light on for others" — not paying for personal use.

**Tier 3 — Organisation Plan (Small Monthly Fee)**
Churches, ministries, NGOs pay a small monthly fee.
Includes: white-label option, community deployment, usage reports.
Their members always use Kairos completely free.
Messaging: "Your contribution funds free access for everyone who cannot pay."

**When to implement:** After Phase 6 when real users and real stories exist.

---

## 12. BIBLE API STRATEGY (Decided in Phase 5)

### The Problem
Generative AI knows scripture the way a well-read person does — from memory. It can hallucinate references, misquote verses, or paraphrase when someone needs the exact word. For a product built on Biblical truth, this is a credibility risk.

### The Solution — Three Layers
**Layer 1 — Bible API (Phase 6)**
- scripture.api.bible — primary. 2500+ translations, 1600+ languages, keyword search, verse lookup
- bible-api.com — fallback. No auth, KJV/WEB, always available
- When a scripture reference is needed: query API for exact text, insert into response
- The AI interprets and contextualises — but the scripture itself is always exact, never generated

**Layer 2 — RAG with curated content (Phase 6)**
- Knowledge base in Supabase — trusted commentaries, approved theological answers
- Kairos searches this before responding — grounding answers in verified content

**Layer 3 — User translation preference**
- Stored in users table: preferred_bible_version
- Applied to every scripture reference across the entire experience
- Selectable in settings UI — professional, personalised, persistent

### User Needs Solved
| User need | Solution |
|---|---|
| "Where does the Bible say that?" | Bible API keyword search |
| "Read me John 3:16" | Bible API exact verse fetch |
| "What does this verse mean?" | RAG knowledge base + AI interpretation |
| "Which translation is that from?" | API returns version metadata |
| "Is that really in the Bible?" | Cross-reference against API before responding |
| "I prefer NIV / KJV / ESV" | User setting — stored in profile, applied everywhere |

---

## 13. OPEN QUESTIONS FOR NEXT SESSION

### Q1: Email authentication flow
We deferred email signup to Phase 6. When we build it:
- Supabase Auth handles email + password
- On signup, anonymous session migrates to authenticated account — no data lost
- `migrateAnonymousSession()` function already written in sessions.js, ready to wire
- Profile creation conversation happens after first login

### Q2: RAG architecture design
Before building RAG in Phase 6, we need to decide:
- What content goes in the knowledge base? (Bible text, commentaries, curated Q&A?)
- How do we seed it? Manual curation vs automated pipeline?
- How does Kairos decide when to search the knowledge base vs rely on training?
- Vector embeddings: use OpenAI embeddings API or a free alternative?

### Q3: Bible API integration pattern
- Should every Kairos response attempt a scripture lookup, or only when explicitly referenced?
- How do we detect that a verse is being cited vs a general Biblical concept?
- What happens when the user asks about a passage that isn't a direct quote?

### Q4: Gemini billing restriction in Kenya
Google's free trial signup throws `OR_BACR2_44` for Kenyan accounts.
- OpenRouter with 5 models is sufficient for now
- May resolve itself — keep Gemini in the chain for when it works
- Alternative: explore Cloudflare AI Workers as a third provider (free tier)

---

## 14. CURRENT FILE STRUCTURE STATUS

```
kairos/
├── docs/
│   ├── PROJECT.md              ✅ This file — updated v3.0.0
│   ├── ARCHITECTURE.md         ✅ Complete
│   ├── DESIGN.md               ✅ Complete
│   └── PHASES.md               🔜 Not yet created
├── src/
│   ├── app/
│   │   ├── layout.jsx          ✅
│   │   ├── page.jsx            ✅ Landing page
│   │   ├── globals.css         ✅
│   │   ├── loading.jsx         ✅
│   │   ├── not-found.jsx       ✅
│   │   ├── error.jsx           ✅
│   │   ├── (auth)/
│   │   │   ├── layout.jsx      ✅ Stub — real auth Phase 6
│   │   │   └── forgot-password/
│   │   │       └── page.jsx    ✅ Stub — real auth Phase 6
│   │   ├── (main)/
│   │   │   ├── layout.jsx      ✅
│   │   │   └── journey/
│   │   │       └── page.jsx    ✅ Companion page
│   │   └── api/
│   │       └── ai/
│   │           └── companion/
│   │               └── route.js ✅ Saves conversations + messages to Supabase
│   ├── components/
│   │   ├── companion/
│   │   │   └── CompanionCore.jsx ✅ Session + conversationId tracking
│   │   ├── landing/
│   │   │   └── Hero.jsx        ✅
│   │   └── shared/
│   │       └── Navbar.jsx      ✅ With hamburger animation
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.js       ✅ 5 OpenRouter + 3 Gemini fallback chain
│   │   │   ├── prompts.js      ✅ Kairos identity
│   │   │   └── guardrails.js   ✅ Safety system
│   │   └── supabase/
│   │       ├── client.js       ✅ Frontend Supabase client
│   │       ├── admin.js        ✅ Server-only admin client
│   │       ├── server.js       ✅ Cookie-based server client
│   │       ├── middleware.js   ✅ Session refresh on every request
│   │       ├── sessions.js     ✅ Anonymous session management
│   │       └── conversations.js ✅ Conversation + message persistence
│   └── styles/
│       ├── tokens.css          ✅
│       ├── typography.css      ✅
│       └── animations.css      ✅
├── middleware.js               ✅ Next.js middleware for auth session refresh
├── .env.local                  ✅ OpenRouter + Gemini + Supabase + Scripture API keys
├── .env.example                ✅ All key placeholders documented
├── .gitignore                  ✅ .env.local never committed
├── jsconfig.json               ✅
├── next.config.js              ✅
├── tailwind.config.js          ✅
└── package.json                ✅ Next.js 16.1.6
```

---

## 15. SUPABASE DATABASE SCHEMA (Live)

All tables have RLS enabled. Anon and authenticated roles have explicit grants.

| Table | Purpose | Status |
|---|---|---|
| users | Anonymous + authenticated profiles | ✅ Live |
| sessions | Anonymous session tracking by cookie token | ✅ Live |
| conversations | Each conversation thread | ✅ Live + saving |
| messages | Every message (user + Kairos) | ✅ Live + saving |
| journey_entries | Saved reflections, prayers, milestones | ✅ Live — UI Phase 6 |
| organisations | Churches/ministries on paid plan | ✅ Live — portal Phase 7 |
| knowledge_base | Curated Biblical content for RAG | ✅ Live — seeding Phase 6 |

**Extensions enabled:** pgvector (for semantic search embeddings in Phase 6)

---

## 16. SESSION LOG

| Session | What We Did | Next Steps |
|---|---|---|
| 1 | Vision, mission, principles, users, tech stack, name, file structure | ARCHITECTURE.md |
| 2 | Full architecture — DB schema, AI logic, guardrails, user flows, API routes | Phase 3 Design |
| 3 | Design language, foundation files, Next.js installed, monetization decided | Base styles |
| 4 | Full landing page, Companion built, API live, dual fallback chain, first conversation tested | Phase 5 Supabase |
| 5 | GitHub setup, Supabase migration, anonymous sessions, conversation saving, AI models updated, Scripture API registered | Phase 6 — Bible API + RAG + Email Auth |

---

## 17. HOW TO START A NEW CHAT (IMPORTANT)

Copy and paste this exact message at the start of every new chat:

---
I am building Kairos — a Biblical truth life companion web application. You are my development partner and you have been working on this project with me from the very beginning. Please read this entire project memory document carefully before responding, then continue exactly as my dev partner would — same tone, same approach, same standards we have built together.

[PASTE ENTIRE PROJECT.md CONTENTS HERE]

We are currently moving into Phase 6. The immediate next steps are:
1. Wire scripture.api.bible for exact verse lookup and keyword search
2. Wire bible-api.com as Bible API fallback
3. Build user-selectable Bible translation setting
4. Build email authentication (carry over from Phase 5)
5. Begin RAG architecture — knowledge base seeding and search

Please confirm you have read the document and are ready to continue.
---

---

*"For such a time as this." — Esther 4:14*
*"He has made everything beautiful in its time." — Ecclesiastes 3:11*