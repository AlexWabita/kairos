# KAIROS — Project Handoff Document
> Last updated: Phase 7H in progress (Bible Reader)
> Continue from: **Step 1 — paste the 5 files below in order**

---

## Stack
- **Framework:** Next.js (App Router)
- **Auth + DB:** Supabase
- **Primary AI:** Groq
- **Bible API:** rest.api.bible (primary) + bible-api.com (fallback)
- **Styling:** Inline styles + CSS custom properties (tokens.css)

---

## Phase Map

```
Phase 7E ✅  Model chain overhaul, identity hardening
Phase 7F ✅  Settings page, theme system, accent colors, font pairings, ConfirmModal
Phase 7G ✅  Journey: search, sort, filter, pin vs favourite, delete confirm, SaveMomentModal
Phase 7H 🔄  In-App Bible Reader (IN PROGRESS — files not yet written)
Phase 7I     Reading Plans + Guided Study
Phase 8      Organisation Portal (deferred — 3 architecture questions unresolved)
Phase 9      Launch
```

---

## Completed This Session (7F + 7G)

### Phase 7F — Settings System

**SQL migration (already run):**
```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
```

**New files created:**
| File | Path |
|---|---|
| Settings utility | `src/lib/settings.js` |
| Settings context | `src/context/SettingsContext.jsx` |
| Confirm modal | `src/components/shared/ConfirmModal.jsx` |
| Settings page | `src/app/settings/page.jsx` |

**Modified files:**
| File | Changes |
|---|---|
| `src/styles/tokens.css` | Added `--color-accent-*` variables + `[data-theme="light"]` block |
| `src/app/layout.jsx` | Google Fonts, SettingsProvider, anti-FOUC script, `suppressHydrationWarning` on `<html>` |
| `src/components/shared/Navbar.jsx` | Settings link, sign-out ConfirmModal |
| `src/app/account/page.jsx` | ConfirmModal for delete + sign-out, Settings link |
| `src/components/companion/CompanionCore.jsx` | Alignment fix, translation wired to settings |

**Settings defaults:**
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

**Key fix — accent colour visibility:** `applySettings()` overrides `--color-gold-bright`, `--color-gold-warm`, `--color-gold-glow`, `--color-gold-subtle`, `--shadow-input` with accent hex values. Brand gradients never touched.

**Valid spacing tokens:** `--space-1, 2, 3, 4, 5, 6, 8, 10, 16, 24` — there is NO `--space-7`, `--space-9`, etc. Never use undefined tokens.

---

### Phase 7G — Journey / Saved Moments

**SQL migration (already run):**
```sql
ALTER TABLE public.journey_entries
ADD COLUMN IF NOT EXISTS is_favourite BOOLEAN DEFAULT false;
```

**Journey entries table columns (confirmed):**
`id, user_id, conversation_id, entry_type, context, is_pinned, is_favourite, created_at, title, scripture_ref`

**Files replaced/created:**
| File | Path |
|---|---|
| Saved moments page (full rewrite) | `src/app/journey/saved/page.jsx` |
| Save moment modal (new) | `src/components/companion/SaveMomentModal.jsx` |
| Companion core (updated) | `src/components/companion/CompanionCore.jsx` |
| Journey save route (updated) | `src/app/api/journey/save/route.js` |

**What was built:**
- Real-time search (title + content + scripture_ref)
- Sort: Newest / Oldest / Pinned first / A→Z / Favourites
- Filter: All / Reflection / Prayer / Milestone / Question / Scripture
- **Pin** (map marker) = keeps at top when sorted by Pinned, gold left border
- **Favourite** (heart) = personal mark, soft red left border, ♥ in meta row
- Delete requires ConfirmModal (danger variant) — no immediate deletion
- Overflow `⋯` menu replaces 4 inline icon buttons (44px touch targets)
- TypeBadge on every card showing entry type
- `SaveMomentModal` intercepts save before any API call:
  - Title field pre-filled via `suggestTitle()` (strips filler openers)
  - Entry type auto-detected via `detectType()` (prayer/milestone/question/scripture signals)
  - User edits both before confirming
- Route now accepts `entry_type` from client, validates server-side

**Save flow:**
1. User clicks "Save this moment"
2. Modal opens — title pre-filled, type auto-detected
3. User edits title and/or type
4. User clicks SAVE MOMENT → API fires → modal closes → star confirmation

---

## Phase 7H — Bible Reader (IN PROGRESS)

### What was decided before session ended

**No API calls needed for navigation** — 66 books and chapter counts are hardcoded static data in the client. Zero plan limitation risk.

**Chapter fetching strategy:**
- Primary: `bible-api.com` — returns clean `verses: [{verse, text}]` array
- Fallback: `rest.api.bible` passage endpoint — returns text blob, parsed into verses

**"Ask Kairos about this" button** — writes verse context to `sessionStorage`, navigates to `/journey`. CompanionCore checks on mount and pre-fills input.

**Translation support:** WEB, KJV, ASV, BBE (same 4 as companion)

### 5 files to write FIRST in the new chat (in this order)

> **IMPORTANT FOR NEW CLAUDE:** Do not write any of these from memory. Ask the user to confirm or share the existing files first where noted. Start writing immediately — the plan below is complete.

---

#### File 1 — `src/lib/bible/client.js` (REPLACE existing)

The updated client was partially written in the previous session. It adds:
- `BIBLE_BOOKS` array export — 66 books with `{id, name, chapters, testament}`
- `BIBLE_API_COM_NAMES` map — book IDs to bible-api.com URL names
- `fetchChapter(bookId, chapter, translation)` export — returns `{reference, verses: [{number, text}], translation, source}`
- `parseVerseText()` helper — parses rest.api.bible text blob into verse array
- All existing `fetchVerse`, `searchBible`, `getAvailableTranslations` preserved unchanged

**Before writing:** Ask user to paste the current `src/lib/bible/client.js` to confirm the base — it was shared in the previous session but confirm nothing changed.

---

#### File 2 — `src/app/api/bible/chapter/route.js` (NEW)

```
GET /api/bible/chapter?book=JHN&chapter=3&translation=WEB
```

Returns:
```json
{
  "success": true,
  "reference": "John 3",
  "verses": [{"number": 1, "text": "..."}],
  "translation": "WEB",
  "source": "bible-api.com"
}
```

Calls `fetchChapter()` from the updated client. Validates `book` against `BIBLE_BOOKS`. Returns 400 if invalid, 500 on fetch failure.

---

#### File 3 — `src/app/bible/page.jsx` (NEW)

**Layout:** Two-panel on desktop (sidebar + reading pane), single panel on mobile with a slide-in sheet for book/chapter selection.

**Sidebar / Book selector:**
- Two tabs: OLD TESTAMENT / NEW TESTAMENT
- Scrollable list of books, grouped by testament
- Click book → shows chapter grid (1…N)
- Click chapter → loads it in reading pane
- Remembers last position in `localStorage` (`kairos_bible_pos`)

**Reading pane:**
- Header: Book name + Chapter number, translation picker
- Each verse rendered as: verse number (gold, small) + verse text
- Tapping/clicking a verse highlights it and shows two action buttons:
  - **Copy** — copies `"verse text — Book Chapter:Verse (TRANSLATION)"` to clipboard
  - **Ask Kairos** — writes context to `sessionStorage` key `kairos_verse_context`, navigates to `/journey`
- Prev / Next chapter navigation buttons at bottom
- Loading state: "Opening the Word…" in heading italic style

**State:**
```js
selectedBook    // BIBLE_BOOKS entry
selectedChapter // number
chapterData     // { reference, verses, translation, source } | null
loading         // boolean
error           // string | null
highlightedVerse // number | null
translation     // "WEB" | "KJV" | "ASV" | "BBE"
activeTab       // "OT" | "NT"
```

**No auth required** — Bible reader is fully public, no login gate.

---

#### File 4 — Update `src/components/companion/CompanionCore.jsx`

Add this block inside the `useEffect` that runs on mount (after `initKairosSession`):

```js
// Check for verse context from Bible reader
const verseCtx = sessionStorage.getItem("kairos_verse_context")
if (verseCtx) {
  sessionStorage.removeItem("kairos_verse_context")
  setInput(verseCtx)
  setStarted(true)
}
```

No other changes to CompanionCore. **Before writing:** Ask user to paste the current CompanionCore so the block is inserted in the right place — do not rewrite the whole file from memory.

---

#### File 5 — Add Bible Reader link to Navbar

Add a "Bible" nav link to `src/components/shared/Navbar.jsx` pointing to `/bible`. Position it between Journey and Settings in the nav order.

**Before writing:** Ask user to paste current `Navbar.jsx`.

---

## Key Architecture Decisions (standing)

| Decision | Reason |
|---|---|
| Light mode = Coming Soon | Components have hardcoded rgba values; full CSS variable migration is a separate pass |
| Accent overrides gold variables | All components reference gold vars — no rewrites needed |
| `--font-display` (Cinzel) never overridden | Brand identity fixed |
| Valid spacing tokens: 1,2,3,4,5,6,8,10,16,24 | No space-7 or space-9 — will resolve to zero |
| bible-api.com is chapter primary | Returns clean verse array; rest.api.bible returns blob |
| Book/chapter counts are hardcoded | 66 books never change; eliminates API plan risk |
| sessionStorage for verse→companion context | Ephemeral, no DB needed, cleared on read |
| Phase 8 (Org Portal) deferred | 3 architecture questions unresolved |

---

## Database — Current Table State

### `users`
Standard auth columns + `settings JSONB DEFAULT '{}'`

### `journey_entries`
`id, user_id, conversation_id, entry_type, context, is_pinned, is_favourite, created_at, title, scripture_ref`

**Valid entry_type values:** `reflection | prayer | milestone | question | scripture`

### `sessions`
`id, user_id, session_token, device_hint, created_at, expires_at`

---

## Bible API

**rest.api.bible** (primary for verse lookup + search)
- Env var: `SCRIPTURE_API_KEY`
- Starter plan (free) + 3 licensed Bibles: NLT, NIV, AMP
- Translation IDs: WEB `9879dbb7cfe39e4d-01`, KJV `de4e12af7f28f599-02`, ASV `685d1470fe4d5c3b-01`, BBE `40072c4a5ade2ef3-01`

**bible-api.com** (fallback for verses, primary for chapter fetch)
- No auth required
- Supports: web, kjv, asv, bbe
- Chapter URL pattern: `https://bible-api.com/{book-name}+{chapter}?translation={t}`
- Returns `{ reference, verses: [{book_id, book_name, chapter, verse, text}] }`

---

## Prompt for New Chat

Paste this at the start of the new conversation, then attach this PROJECT.md file:

---

> You are helping me continue building **Kairos** — a Biblical AI life companion app built with Next.js, Supabase, and Groq.
>
> I have attached PROJECT.md which contains the full project state, all decisions made, and the exact continuation plan. Please read it fully before responding.
>
> We are at **Phase 7H — Bible Reader**. The previous session ended mid-phase with 5 files partially planned but not yet written to code.
>
> Your first task is to write those 5 files in the order listed in the PROJECT.md under "5 files to write FIRST". Before writing each file, follow the instructions noted — some require me to paste existing files first so you do not rewrite them from memory.
>
> Rules that always apply:
> - Never use CSS token values that are not in the valid spacing scale (1,2,3,4,5,6,8,10,16,24)
> - Never use `--space-7`, `--space-9` or any undefined token
> - Never assume file contents — always ask me to paste a file before modifying it
> - All buttons and touch targets minimum 44px height
> - No localStorage or sessionStorage in artifacts
> - Commits happen at the end of each phase