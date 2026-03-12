# KAIROS — Project Handoff Document
> Last updated: Phase 7H complete, Phase 7I pending discussion
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
Phase 7H ✅  In-App Bible Reader (COMPLETE)
Phase 7I 🔄  Reading Plans + Guided Study (NEXT — discuss before writing any code)
Phase 8      Organisation Portal (deferred — 3 architecture questions unresolved)
Phase 9      Launch
```

---

## Completed This Session (7H — Bible Reader)

### SQL migrations run
No new migrations were required for Phase 7H.
Bible reader is fully public (no auth gate).
Notes save through existing `journey_entries` table.

---

### New Files Created

| File | Purpose |
|---|---|
| `src/lib/bible/client.js` | Updated — added `BIBLE_BOOKS`, `BIBLE_API_COM_NAMES`, `fetchChapter()`, `parseVerseText()` |
| `src/app/api/bible/chapter/route.js` | GET `/api/bible/chapter?book=JHN&chapter=3&translation=WEB` |
| `src/app/bible/page.jsx` | Full Bible reader page (see details below) |

### Modified Files

| File | Changes |
|---|---|
| `src/components/companion/CompanionCore.jsx` | Added `sessionStorage` verse context check on mount |
| `src/components/shared/Navbar.jsx` | Added Bible link between Journey and Settings in `navItems` array |
| `src/styles/tokens.css` | Added semantic alias variables to `:root` and `[data-theme="light"]` |

---

### Phase 7H — Feature Details

#### `src/lib/bible/client.js`
- `BIBLE_BOOKS` — exported array of 66 books, each `{id, name, chapters, testament}`
- `BIBLE_API_COM_NAMES` — maps book IDs to URL-safe names for bible-api.com
- `fetchChapter(bookId, chapter, translation)` — primary: bible-api.com, fallback: rest.api.bible
- `parseVerseText()` — parses rest.api.bible plain-text blob into `[{number, text}]`
- All existing exports (`fetchVerse`, `searchBible`, `getAvailableTranslations`) preserved unchanged

#### `src/app/api/bible/chapter/route.js`
- `GET /api/bible/chapter?book=JHN&chapter=3&translation=WEB`
- Validates: book against `BIBLE_BOOKS`, chapter range per book, translation in `[WEB, KJV, ASV, BBE]`
- Returns `{ success, reference, verses: [{number, text}], translation, source }`
- Returns 400 for invalid params, 500 on fetch failure

#### `src/app/bible/page.jsx` — Full feature list
**Navigation:**
- Two-panel desktop (sidebar + reading pane), mobile slide-in sidebar
- OT / NT tabs → book list → chapter grid (all hardcoded, zero API calls)
- Last position persisted via `localStorage` key `kairos_bible_pos`
- Prev / Next chapter navigation with cross-book boundaries (Genesis→Exodus, etc.)
- Defaults to John 1 on first visit

**Multi-verse selection:**
- Tap any verse to enter selection mode — all verses show selection checkboxes
- Tap additional verses to add to selection, tap again to deselect
- Clearing selection: tap × in toolbar, or change chapter
- Session-only (not persisted to DB) — by product design decision

**Floating action toolbar:**
- Slides up from bottom on first selection, fully hidden (`-200px`) when no selection
- Shows: `N verses ×` | Highlight | Copy | Note | Ask Kairos
- Mobile: `flexWrap: "wrap"`, `width: "min(520px, calc(100vw - 2rem))"`, label text hidden on very small screens via `.bible-toolbar-actions` class

**Highlight:**
- Session-only gold tint on highlighted verses
- Button label toggles "Highlight" / "Remove" based on whether all selected verses are already highlighted

**Copy (multi-verse):**
- Builds: `[1] verse text [2] verse text\n— Book Chapter:1–2 (TRANSLATION)`
- Contiguous range uses em-dash (1–3), non-contiguous uses comma list (1, 3, 5)

**Note drawer:**
- Slides up above toolbar when Note button active
- Shows verse range reference in header
- Textarea for user's reflection
- Flows through `SaveMomentModal` — user sets title and entry type before saving
- Saves to `journey_entries` with `entry_type: "scripture"` auto-detected
- "Save to Journey" disabled and labelled "Sign in to save" for unauthenticated users

**Ask Kairos (multi-verse):**
- Builds: `I'd like to reflect on Book Chapter:1–3 (TRANSLATION):\n\n1. verse\n2. verse`
- Writes to `sessionStorage` key `kairos_verse_context`
- Navigates to `/journey` — CompanionCore reads and clears on mount

**Display settings panel (Aa):**
- Slides in from right, backdrop overlay behind it
- Translation: WEB / KJV / ASV / BBE (duplicated from header for discoverability)
- Text size: Small / Default / Large (actual `A` rendered at each size)
- Line spacing: Tight / Normal / Spacious

**Auth fix (critical):**
- Bible page fetches `users.id` (internal profile ID) via `auth_id` lookup
- Save route expects `users.id` not Supabase auth UUID
- Without this fix notes saved silently with 401 and never appeared in Journey

**Background transparency fix:**
- Added semantic alias tokens to `tokens.css` (see below)
- Sidebar, settings panel, note drawer use hardcoded hex values as fallback safety

---

### tokens.css additions

Added inside `:root {}` and `[data-theme="light"]`:

```css
/* ── SEMANTIC ALIASES (used by Bible reader + future components) ── */
--color-bg-primary:     var(--color-void);
--color-bg-secondary:   var(--color-deep);
--color-bg-tertiary:    var(--color-surface);
--color-border-subtle:  var(--color-border);
--color-text-primary:   var(--color-divine);
--color-text-secondary: var(--color-soft);
--color-text-muted:     var(--color-muted);
```

---

### Navbar navItems (current order)
```js
const navItems = [
  { label: "About",        href: "/#about"       },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Journey",      href: "/journey"       },
  { label: "Bible",        href: "/bible"         },
  { label: "Settings",     href: "/settings"      },
]
```

---

## Key Architecture Decisions (standing + new)

| Decision | Reason |
|---|---|
| Light mode = Coming Soon | Components have hardcoded rgba values; full CSS variable migration is a separate pass |
| Accent overrides gold variables | All components reference gold vars — no rewrites needed |
| `--font-display` (Cinzel) never overridden | Brand identity fixed |
| Valid spacing tokens: 1,2,3,4,5,6,8,10,16,24 | No space-7 or space-9 — will resolve to zero |
| bible-api.com is chapter primary | Returns clean verse array; rest.api.bible returns blob |
| Book/chapter counts are hardcoded | 66 books never change; eliminates API plan risk |
| sessionStorage for verse→companion context | Ephemeral, no DB needed, cleared on read |
| Bible highlights = session-only | Product is a companion not a study tool; DB overhead not justified yet |
| Bible notes → SaveMomentModal flow | Intentional save philosophy consistent with Journey; zero new infrastructure |
| Bible page uses internal profile ID | Save route expects `users.id` not Supabase auth UUID — fetched via `auth_id` lookup |
| Semantic alias tokens in tokens.css | Prevents transparent panels when CSS variables undefined in inline styles |
| Phase 8 (Org Portal) deferred | 3 architecture questions unresolved |

---

## Database — Current Table State

### `users`
Standard auth columns + `settings JSONB DEFAULT '{}'`

### `journey_entries`
`id, user_id, conversation_id, entry_type, context, is_pinned, is_favourite, created_at, title, scripture_ref`

**Valid entry_type values:** `reflection | prayer | milestone | question | scripture`

**Note:** `conversation_id` is nullable — Bible notes save without one. The saved page queries all entries by `user_id` only, so this is safe.

### `sessions`
`id, user_id, session_token, device_hint, created_at, expires_at`

---

## Bible API

**rest.api.bible** (verse lookup + search + chapter fallback)
- Env var: `SCRIPTURE_API_KEY`
- Translation IDs: WEB `9879dbb7cfe39e4d-01`, KJV `de4e12af7f28f599-02`, ASV `685d1470fe4d5c3b-01`, BBE `40072c4a5ade2ef3-01`

**bible-api.com** (primary chapter fetch)
- No auth required
- Supports: web, kjv, asv, bbe
- Chapter URL: `https://bible-api.com/{book-name}+{chapter}?translation={t}`
- Returns `{ reference, verses: [{book_id, book_name, chapter, verse, text}] }`

---

## File Structure (current — relevant files only)

```
src/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   └── companion/route.js
│   │   ├── bible/
│   │   │   ├── chapter/route.js        ← NEW 7H
│   │   │   └── verse/route.js
│   │   └── journey/
│   │       └── save/route.js
│   ├── account/page.jsx
│   ├── bible/
│   │   └── page.jsx                    ← NEW 7H
│   ├── journey/
│   │   ├── page.jsx
│   │   └── saved/page.jsx
│   ├── settings/page.jsx
│   ├── layout.jsx
│   └── globals.css
├── components/
│   ├── companion/
│   │   ├── CompanionCore.jsx           ← UPDATED 7H
│   │   ├── BibleVerse.jsx
│   │   └── SaveMomentModal.jsx
│   └── shared/
│       ├── ConfirmModal.jsx
│       └── Navbar.jsx                  ← UPDATED 7H
├── context/
│   └── SettingsContext.jsx
├── lib/
│   ├── bible/
│   │   └── client.js                   ← UPDATED 7H
│   ├── supabase/
│   │   ├── client.js
│   │   ├── auth.js
│   │   └── sessions.js
│   └── settings.js
└── styles/
    └── tokens.css                      ← UPDATED 7H
```

---

## Phase 7I — Reading Plans + Guided Study (NEXT)

### Status: DISCUSSION REQUIRED before any code is written

This is the first thing to do in the new chat. The previous session ended with the decision to discuss and align on the professional approach before writing anything.

### What the phase map says
**Reading Plans** — structured, time-based Bible reading schedules
**Guided Study** — deeper AI-led engagement with a topic or book

### Why these need discussion first
Reading Plans and Guided Study sound related but are architecturally different:
- Reading Plans are **sequential, date-aware, progress-tracked**
- Guided Study is more **conversational, Kairos-led, topic-driven**

They may share a DB table or need separate ones. The AI involvement level differs. The UI patterns differ. Getting this wrong creates rework.

### Questions the new chat must answer BEFORE writing code

1. **Reading Plans — curated or user-created?**
   Are these plans Kairos ships (e.g. "Read the Bible in a year"), plans users build themselves, or both? This determines whether plan definitions live in the DB or in static files.

2. **Guided Study — structured lessons or AI conversation?**
   Is this a set curriculum with fixed content per session, or is Kairos dynamically generating study content based on a chosen topic? Or a hybrid?

3. **Progress tracking — passive or active?**
   Does Kairos remind users about incomplete plans (push/email), or does the user simply check their own progress when they open the app?

4. **Social dimension — personal only or group?**
   Is Phase 7I strictly personal, or does group study tie into Phase 8's Organisation Portal? If group study is in scope here, the schema needs to account for it now.

5. **Entry point — where does the user discover and start plans?**
   Dedicated `/plans` page? Inside the Bible reader? From the Journey page?

### The new chat should:
1. Paste this PROJECT.md
2. Claude reads it fully and acknowledges the phase state
3. Claude asks the 5 questions above (or any additional ones) and waits for answers
4. Only after answers are confirmed does Claude propose DB schema + file plan
5. Only after schema + file plan are confirmed does Claude write any code

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

---

## Prompt for New Chat

Paste this at the start of the new conversation, then attach this PROJECT.md file:

---

> You are helping me continue building **Kairos** — a Biblical AI life companion app built with Next.js, Supabase, and Groq.
>
> I have attached PROJECT.md which contains the full project state, all architecture decisions, completed phases, and the exact continuation plan. Please read it fully before responding.
>
> We are moving into **Phase 7I — Reading Plans + Guided Study**.
>
> **Before writing a single line of code**, your first task is to discuss and align on the approach. The PROJECT.md lists 5 questions under "Phase 7I — Questions the new chat must answer". Ask those questions first, listen to my answers, propose a DB schema and file plan, wait for my confirmation, and only then begin writing code.
>
> Rules that always apply:
> - Never use CSS token values not in the valid spacing scale (1,2,3,4,5,6,8,10,16,24)
> - Never use `--space-7`, `--space-9` or any undefined token
> - Never assume file contents — always ask me to paste a file before modifying it
> - All buttons and touch targets minimum 44px height
> - No guessing — confirm before acting
> - Commits happen at the end of each phase