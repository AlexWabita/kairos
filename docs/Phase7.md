# KAIROS — Phase 7I: Reading Plans + Guided Study
## Full Feature Specification

> Note: Phase 7I was outlined at a high level in the Phase 7H session.
> This document expands it into a complete, buildable specification.
> The previous chat did not go into implementation detail on 7I —
> everything below is the agreed direction plus recommended additions
> to make Kairos a genuinely complete, high-quality product.

---

## The Core Idea

Reading Plans and Guided Study transforms Kairos from a reactive companion
(you come with a question, it responds) into a proactive discipleship tool
(it walks alongside you through structured scripture engagement over time).

A user who finishes a 30-day plan has had 30 meaningful encounters with
scripture, each one logged to their journey, each one available to revisit.
That is the metric that matters — not sessions opened, but moments that landed.

---

## Feature 1 — Reading Plans

### What a Reading Plan Is
A reading plan is a curated sequence of Bible passages assigned to calendar
days, with an optional theme and Kairos reflection prompt for each day.
The user enrolls once. Each day, their plan shows the assigned passage,
a prompt, and a place to respond. Progress is tracked. Streaks are shown.

### Plan Types to Build

#### 1A. Curated Plans (Kairos-authored, built-in)
Hardcoded in the codebase — no DB reads needed for plan structure.
Only enrollment and progress are stored in the DB.

Suggested starter library (8 plans minimum at launch):

| Plan | Length | Theme |
|---|---|---|
| Who Is Jesus? | 7 days | The gospels — identity of Christ for seekers |
| When You Are Anxious | 5 days | Psalms + Philippians + Matthew |
| Foundations of Faith | 14 days | Core doctrines, one per day |
| Walking Through Grief | 10 days | Lament psalms + comfort passages |
| The Lord's Prayer | 7 days | One line per day, deep dive |
| Proverbs for Daily Life | 31 days | One chapter per day |
| New Testament in 90 Days | 90 days | Full NT reading |
| Psalms of Ascent | 15 days | Psalms 120–134, pilgrimage theme |

Each plan entry has:
```js
{
  planId:     "who-is-jesus",
  title:      "Who Is Jesus?",
  subtitle:   "A 7-day journey through the Gospels",
  days:       7,
  category:   "seekers",       // seekers | grief | growth | devotional | deep-study
  difficulty: "accessible",    // accessible | moderate | immersive
  days: [
    {
      day:       1,
      reference: "John 1:1-18",
      title:     "In the Beginning Was the Word",
      prompt:    "What does it mean to you that Jesus existed before creation?",
    },
    ...
  ]
}
```

#### 1B. Thematic Plans (AI-generated on demand)
User describes a season or need: "I just went through a divorce" or
"I want to understand grace better." Kairos generates a custom 7–21 day
plan using the AI API, saves it to the DB, and the user follows it like
any other plan. The plan is saved permanently to their account.

This is a differentiator — no other Bible app does this well.

#### 1C. Church/Community Plans (Phase 8 tie-in)
Organisation admins can create and assign plans to members.
All members see the same daily passage. Responses are private but
completion is visible to the admin. Deferred to Phase 8.

---

### Database Tables Needed

```sql
-- Plans table (for AI-generated custom plans only —
-- curated plans are hardcoded, not stored here)
CREATE TABLE reading_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  plan_type    TEXT DEFAULT 'custom',   -- 'curated' | 'custom'
  plan_key     TEXT,                    -- e.g. 'who-is-jesus' for curated
  days_data    JSONB NOT NULL,          -- [{day, reference, title, prompt}]
  total_days   INTEGER NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollment + progress tracking
CREATE TABLE plan_enrollments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id      UUID REFERENCES reading_plans(id) ON DELETE CASCADE,
  plan_key     TEXT,                    -- for curated plans (no reading_plans row)
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  current_day  INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ,
  last_read_at TIMESTAMPTZ,
  streak_days  INTEGER DEFAULT 0,
  is_active    BOOLEAN DEFAULT true,
  UNIQUE(user_id, plan_key)             -- one enrollment per curated plan
);

-- Daily responses (tied to journey_entries for consistency)
CREATE TABLE plan_day_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id   UUID REFERENCES plan_enrollments(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  day_number      INTEGER NOT NULL,
  reference       TEXT NOT NULL,
  response_text   TEXT,
  journey_entry_id UUID REFERENCES journey_entries(id),  -- optional link
  completed_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id, day_number)
);
```

---

### UI Pages

#### `/bible/plans` — Plan Library
- Grid of available plans (curated)
- Each card: title, length, category badge, difficulty, short description
- Filter bar: All / Seekers / Grief / Growth / Devotional / Deep Study
- "Generate a custom plan" CTA — opens the AI plan generator
- Active enrollments shown in a separate "Your Plans" section at top

#### `/bible/plans/[planId]` — Plan Detail
- Full description, day-by-day overview (collapsed, expandable)
- "Start Plan" button — creates enrollment record
- If already enrolled: shows current day and "Continue" button
- Completed plans show a completion badge and offer to restart

#### `/bible/plans/[planId]/day/[day]` — Daily Reading View
- Today's passage loaded from Bible reader (same chapter fetch API)
- Kairos reflection prompt shown below passage
- Text area: "Write your response…" — optional, can skip
- "Ask Kairos" button — opens companion with the passage + prompt as context
- "Mark Complete" button — advances `current_day`, updates streak
- Option to save response directly to Journey (creates `journey_entries` row)
- Prev/Next day navigation (can read ahead but cannot mark future days complete)

---

### Streak Logic
- Streak increments when the user completes a day within 24 hours of the previous
- If user misses a day, streak resets to 0 (with a grace notification on next visit)
- Streak is displayed on plan cards and the account page
- Best streak is stored separately and never resets

---

## Feature 2 — Guided Study

### What Guided Study Is
A deeper, unstructured alternative to reading plans. The user picks a topic,
a book of the Bible, a character, or a theological question. Kairos builds
a multi-session study with questions, cross-references, and a structured
note-taking space. Unlike reading plans (daily passages), guided study is
self-paced and designed for depth over breadth.

### Study Types

#### 2A. Book Study
User selects a Bible book. Kairos generates:
- Overview: authorship, historical context, major themes, structure
- Chapter-by-chapter study questions (one set per chapter)
- Key verse highlights with commentary prompts
- Cross-reference suggestions

Session model: one chapter = one study session. Progress tracked chapter by chapter.

#### 2B. Topical Study
User enters a topic: "forgiveness", "suffering", "the Holy Spirit", "money".
Kairos pulls relevant verses across the whole Bible, groups them thematically,
and builds a 3–5 session study with discussion questions and reflection prompts.

#### 2C. Character Study
User picks a Bible character: "David", "Ruth", "Paul", "Mary Magdalene".
Kairos traces their story across scripture, identifies key moments and
lessons, and structures a study around their arc.

#### 2D. Word/Concept Study
For users who want to go deeper: pick a word ("shalom", "covenant",
"grace", "ekklesia"). Kairos traces the word's usage, original language
meaning (Hebrew/Greek with transliteration — not deep academia, just accessible),
and key passages where it appears.

---

### Database Tables Needed

```sql
CREATE TABLE guided_studies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  study_type   TEXT NOT NULL,    -- 'book' | 'topical' | 'character' | 'word'
  title        TEXT NOT NULL,
  subject      TEXT NOT NULL,    -- "Romans", "forgiveness", "David", "shalom"
  study_data   JSONB NOT NULL,   -- AI-generated structure
  total_sessions INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ
);

CREATE TABLE study_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id     UUID REFERENCES guided_studies(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  title        TEXT,
  notes        TEXT,             -- user's freeform notes
  completed_at TIMESTAMPTZ,
  journey_entry_id UUID REFERENCES journey_entries(id),
  UNIQUE(study_id, session_number)
);
```

---

### UI Pages

#### `/bible/study` — Study Library
- User's active studies with last-accessed date
- "Start New Study" — opens study type selector
- Study type selector: Book / Topic / Character / Word
- Each type opens a search/select UI (book picker or text input)
- "Generate Study" — calls AI API, shows loading state, redirects to study

#### `/bible/study/[studyId]` — Study Overview
- Title, type badge, subject
- Session list with completion status
- Progress bar (completed sessions / total)
- "Continue Study" → most recent incomplete session

#### `/bible/study/[studyId]/session/[n]` — Study Session
- Session title and context
- Passage(s) for this session (rendered inline, same as Bible reader)
- AI-generated study questions (3–5 per session)
- Notes area (autosaved to `study_sessions.notes`)
- "Ask Kairos" — opens companion with full session context
- "Save to Journey" — saves key insight as a journey entry
- "Mark Session Complete" — advances progress

---

## Feature 3 — Verse of the Day

Simple but high-value. A daily verse, curated or algorithmically selected,
shown on the dashboard / home page and in a dedicated widget.

### How it works
- A static JSON file of 365 hand-picked verses (one per day of year)
- Selected by `dayOfYear % 365` — no API call, no DB read
- Shown on `/journey` (companion home) above the prompt area
- User can tap to open the verse in the Bible Reader
- User can tap to send it to Kairos as a conversation starter
- User can save it directly to Journey as a "scripture" type entry

### Data shape
```js
// src/lib/bible/verseOfTheDay.js
export const VERSES_OF_THE_DAY = [
  { reference: "Jeremiah 29:11", text: "For I know the plans I have for you..." },
  { reference: "Philippians 4:13", text: "I can do all things through Christ..." },
  // ... 363 more
]

export function getVerseOfTheDay() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  )
  return VERSES_OF_THE_DAY[dayOfYear % VERSES_OF_THE_DAY.length]
}
```

---

## Feature 4 — Highlights + Annotations

When reading in the Bible reader, users can highlight verses and add
private annotations (margin notes). These persist to the DB and appear
every time the user returns to that passage.

### Database Table

```sql
CREATE TABLE verse_highlights (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id      TEXT NOT NULL,        -- "JHN"
  chapter      INTEGER NOT NULL,
  verse        INTEGER NOT NULL,
  color        TEXT DEFAULT 'gold',  -- 'gold' | 'blue' | 'green' | 'red'
  note         TEXT,                 -- optional annotation
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id, chapter, verse)
);
```

### UI behaviour
- Long-press (mobile) or hover (desktop) on a verse shows highlight options
- 4 colour swatches + an "Add note" text field
- Highlighted verses show a coloured left border or background tint
- Notes appear as a small indicator icon; tap to reveal
- All highlights browsable from Account page: "Your Highlights"

---

## Feature 5 — Search Across Your Journey + Scripture Together

The current Journey search only searches saved moments. This feature
unifies search across:
- Saved moments (existing)
- Verse highlights + annotations (new)
- Study session notes (new)
- Plan day responses (new)

One search box, four result types, clearly labelled. This makes the
user's entire Kairos history findable from one place.

Implementation: single Supabase query across multiple tables using
`UNION ALL`, filtered by `user_id`. No full-text search infrastructure
needed at this scale — `ILIKE '%query%'` on relevant text columns is
sufficient for a personal tool.

---

## Feature 6 — Progress Dashboard (Account Page Enhancement)

Add a dedicated section on the account page showing:
- Active reading plans with progress bars
- Active guided studies with last session
- Total journey entries (broken down by type)
- Current reading streak + best streak
- Total chapters read (approximated from plan completions)
- Verse highlights count

This is purely a display of existing DB data — no new tables needed.
One motivational metric shown prominently: **"You have had X encounters with scripture through Kairos."**

---

## Feature 7 — Notifications / Reminders (PWA)

When the user opts in, Kairos sends a daily push notification at a
user-chosen time: "Your reading for today is ready — [Plan Title], Day N."

Implementation:
- PWA manifest + service worker (Next.js supports this via `next-pwa`)
- Web Push API for notification delivery
- User sets preferred time in Settings page (new field in `users.settings`)
- Server-side cron (Supabase Edge Function or Vercel cron) sends pushes daily

This is optional at launch — mark as "Coming Soon" in Settings with a
toggle UI already in place so it doesn't feel absent.

---

## Implementation Order for Phase 7I

```
Step 1  Verse of the Day widget (1 file — verseOfTheDay.js + small UI addition)
Step 2  Reading Plans — curated library + /bible/plans page
Step 3  Reading Plans — enrollment + /bible/plans/[planId] detail page
Step 4  Reading Plans — daily reading view + progress tracking
Step 5  Plan DB migration (reading_plans, plan_enrollments, plan_day_responses)
Step 6  Guided Study — DB migration + AI generation route
Step 7  Guided Study — /bible/study pages (library + overview + session)
Step 8  Highlights + Annotations — DB migration + Bible reader update
Step 9  Unified Search (account page or dedicated /search route)
Step 10 Progress Dashboard (account page enhancement)
Step 11 Notifications — Settings UI only, backend marked Coming Soon
```

---

## What Makes This Product Complete vs Competitors

| Feature | YouVersion | Logos | Kairos |
|---|---|---|---|
| AI companion | ✗ | Partial | ✓ Full conversational |
| Custom AI reading plans | ✗ | ✗ | ✓ |
| Guided study with AI | ✗ | Partial (expensive) | ✓ |
| Journey / moment saving | ✗ | ✗ | ✓ |
| Verse highlights | ✓ | ✓ | ✓ (Phase 7I) |
| Reading streaks | ✓ | ✗ | ✓ (Phase 7I) |
| Accessible pricing | Free | $$$$ | Free / affordable |
| Designed for spiritual journey | Partial | Academic | ✓ Core purpose |
| Works for seekers (not just believers) | ✗ | ✗ | ✓ |

The gap Kairos fills: **YouVersion is a reading app. Logos is a scholar's tool.
Kairos is the first tool designed for the messy, honest, ongoing conversation
between a person and their faith.** Everything in Phase 7I deepens that —
it doesn't add features for the sake of features, it adds structure for
the people who want to go further.

---

## Notes for the Next Chat

- Do not start Phase 7I until Phase 7H (Bible Reader) is committed and tested
- Start with Step 1 (Verse of the Day) — it is small, high-value, and requires no DB changes
- The curated plan library content (365 VOTD entries, 8 plan day-by-day arrays) is
  significant data work — consider writing a separate content file (`src/lib/bible/plans.js`)
  with all plan data hardcoded, then the UI files reference it
- The AI plan generation route will need a well-crafted system prompt — draft it before
  writing the route so the output format is predictable and parseable
- Highlights require updating the Bible Reader (Phase 7H file) — confirm the 7H file
  content before modifying it