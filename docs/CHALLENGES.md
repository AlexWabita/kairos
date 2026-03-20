# Engineering Challenges

> A catalogue of significant technical problems encountered during Kairos development, with root cause analysis and solutions. This document exists for three reasons: to be honest about the difficulty of the work, to serve as a reference for future development, and to demonstrate how engineering decisions are reasoned through under real constraints.

---

## 1. Authentication Infinite Redirect Loop

**Phase:** 7J  
**Severity:** Critical — blocked all auth-dependent pages  
**Time to resolve:** ~3 hours

### Symptom
Authenticated users were being redirected to `/login` in an infinite loop. The auth state appeared to resolve correctly on the server but the client would immediately re-check and find no session.

### Root Cause
`@supabase/ssr` distinguishes between `createClient` (used in server contexts) and `createBrowserClient` (used in client components). The `lib/supabase/client.js` file was using `createClient` in a client component context. This caused the browser-side Supabase instance to not properly read or write the session cookie, producing a state where:
- Server middleware: session found → allow
- Client component: no session → redirect to login
- Repeat infinitely

### Solution
Three coordinated changes:

1. **`lib/supabase/client.js`** — migrated to `createBrowserClient` from `@supabase/ssr`
2. **`useAuthState.js`** — new reactive hook using `supabase.auth.onAuthStateChange()` instead of one-shot `getUser()`. This means auth state updates propagate instantly without page refresh
3. **`middleware.js`** — added `returnTo` parameter so users redirected to login land back at their intended destination post-auth

```js
// Before (broken)
import { createClient } from "@supabase/supabase-js"
export const supabase = createClient(url, anonKey)

// After (correct)
import { createBrowserClient } from "@supabase/ssr"
export const supabase = createBrowserClient(url, anonKey)
```

### Lesson
`@supabase/ssr` requires context-aware client creation. The browser client and server client are fundamentally different objects — the browser client manages cookies via the browser's cookie API, the server client reads from request headers. Using the wrong one in either context produces silent failures that are extremely difficult to debug.

---

## 2. Profile ID vs Auth UUID Confusion

**Phase:** 7H  
**Severity:** Critical — silently failed all Bible save operations  
**Time to resolve:** ~1 hour

### Symptom
Saving notes from the Bible reader produced no error but the entries never appeared in the Journey. The API returned 200 but nothing was written to the database.

### Root Cause
The Bible page was passing `user.id` (the Supabase auth UUID from `auth.users`) directly to the `/api/journey/save` route. The route expected `users.id` — the internal profile ID from the separate `users` table. The foreign key constraint on `journey_entries.user_id` references `users.id`, not `auth.users.id`. The insert silently failed the FK check.

### Solution
Established a project-wide pattern: **all client components resolve `users.id` via a profile fetch, never pass the auth UUID to API routes.**

```js
// In every component that needs user identity:
const { data: { user: authUser } } = await supabase.auth.getUser()
const { data: profile } = await supabase
  .from("users")
  .select("id")
  .eq("auth_id", authUser.id)
  .maybeSingle()
// profile.id is now the correct ID to pass to all API routes
```

Additionally, all API routes now perform their own server-side profile resolution and ignore any client-sent user ID for security:

```js
// In every protected API route:
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase
  .from("users").select("id").eq("auth_id", user.id).maybeSingle()
// Use profile.id — never trust a client-sent userId
```

### Lesson
Two-table identity (auth + profile) is a sound architecture but requires discipline. The moment you have both `auth.users.id` and `users.id` in the same codebase, you need a rule. Establish the rule early and enforce it everywhere.

---

## 3. RAG Embedding Provider Switch Mid-Development

**Phase:** 5 → 6  
**Severity:** Blocking — development halted in Kenya  
**Time to resolve:** 2 days (research + migration)

### Symptom
Gemini embedding API calls were rejected with billing errors despite a valid API key. The Gemini embedding API required Google Cloud billing to be enabled, which was restricted in certain regions.

### Root Cause
Google Cloud billing has regional restrictions. From Kenya, activating billing for the Gemini API required payment methods that weren't accepted or a business account that didn't apply to an indie developer.

### Solution
Switched to **Jina AI** for embeddings:
- Free tier: 1M tokens/month
- No regional restrictions
- API is clean and well-documented
- Embedding dimension: 768 (matched the planned pgvector schema — no migration required)
- Quality: comparable for semantic similarity search on theological text

```js
// Jina AI embedding call
const response = await fetch("https://api.jina.ai/v1/embeddings", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.JINA_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "jina-embeddings-v2-base-en",
    input: [text]
  })
})
```

The pgvector column was already typed `vector(768)` — no schema change needed. Only `lib/rag/embeddings.js` changed.

### Lesson
For a solo developer building from a region with less-than-ideal access to certain cloud providers, always validate regional API availability before committing to a provider. Have a fallback in mind before you need it.

---

## 4. Bible Action Bar Obscured by Browser Chrome on Mobile

**Phase:** 7H  
**Severity:** High — key feature invisible on most phones  
**Time to resolve:** ~2 hours

### Symptom
On iOS Safari and Android Chrome, the Bible reader's action bar (highlight, save, copy, ask Kairos) was positioned at the bottom of the screen but hidden behind the browser's own UI (address bar + bottom controls). On notched iPhones, it was additionally hidden behind the home indicator.

### Root Cause
The action bar used `position: fixed; bottom: 58px` — accounting for the app's own mobile nav bar but not for the browser's native UI chrome or device safe areas. iOS Safari and Android Chrome each have variable-height bottom bars that the standard CSS viewport doesn't account for.

### Solution
CSS environment variables for device safe areas:

```css
/* Fixed action bar on mobile */
.bible-action-bar {
  position: fixed;
  bottom: calc(58px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
}

/* Main content padding so last verse isn't hidden */
.bible-scroll {
  padding-bottom: calc(120px + env(safe-area-inset-bottom));
}
```

`env(safe-area-inset-bottom)` returns:
- `0px` on non-notched devices and desktop
- `34px` on iPhone X+ (home indicator area)
- Variable value on Android notched devices

The `58px` accounts for our app's own fixed nav bar. The two values are summed.

### Lesson
`env(safe-area-inset-*)` is the correct solution for any fixed element near screen edges on mobile. It should be applied proactively to every fixed bottom element, not reactively after users report it.

---

## 5. Light Theme Invisible Text (Hardcoded Colors)

**Phase:** Post-launch  
**Severity:** High — light theme unusable  
**Time to resolve:** ~1.5 hours

### Symptom
Switching to light theme in Settings made the app background light, but most text remained invisible (white text on white/light background).

### Root Cause
Landing page components were built during the dark-theme-first phase using hardcoded `rgba(255,255,255,x)` values in inline styles. CSS variable overrides from `ThemeApplier.jsx` correctly updated the background colors but couldn't reach the hardcoded text colors — inline styles have higher specificity than `[data-theme="light"]` stylesheet rules.

The app pages were mostly fine because they used `var(--color-divine)` etc. The landing page components were the problem: FAQ accordions, testimonial cards, FAQ header text — all hardcoded white.

### Solution
Two-part fix:

**In components:** Replace hardcoded `rgba(255,255,255,x)` colors with CSS class names:
```jsx
// Before
<p style={{ color: "rgba(255,255,255,0.55)" }}>{quote}</p>

// After
<p className="t-quote">{quote}</p>
```

**In component `<style>` blocks:** Add `[data-theme="light"]` overrides:
```css
/* Default (dark) */
.t-quote { color: rgba(255,255,255,0.55); }

/* Light override */
[data-theme="light"] .t-quote { color: var(--color-soft); }
```

**In `ThemeApplier.jsx`:** Added global surface overrides for elements that couldn't be class-targeted (mobile nav bars, sidebar backgrounds, input fields).

### Lesson
Hardcoded color values in inline styles are immune to both CSS variable overrides and `[data-theme]` selectors. A design system should be enforced from the start — use CSS variables for every color, not just the ones you expect to theme.

---

## 6. FAQ Contact Link Overlapping First Question (Mobile)

**Phase:** Post-launch  
**Severity:** Medium — visual defect on mobile  
**Time to resolve:** 30 minutes

### Symptom
On mobile viewports, the "Contact us →" link in the FAQ section overlapped the text of the first accordion question, making both unreadable.

### Root Cause
The FAQ left column (containing the section label, heading, and contact link) had `position: sticky; top: 88px` — a desktop design to keep the header visible while scrolling through long accordions. On mobile, the layout collapses to a single column via `grid-template-columns: 1fr`. With sticky positioning still active on mobile, the header column stuck at `top: 88px` and overlapped the accordion content below it.

### Solution
```css
/* Desktop: sticky positioning works in 2-column layout */
.faq-header {
  position: sticky;
  top: 88px;
}

/* Mobile: single column — sticky causes overlap, disable it */
@media (max-width: 820px) {
  .faq-layout {
    grid-template-columns: 1fr !important;
    gap: 40px !important;
  }
  .faq-header {
    position: static !important;
    top: auto !important;
  }
}
```

### Lesson
Sticky positioning in grid/flex layouts behaves differently depending on the layout structure. Always test sticky elements at all breakpoints, not just the one they were designed for.

---

## 7. Hamburger Menu Transparent Background

**Phase:** Post-launch  
**Severity:** Medium — navigation unusable on homepage hero  
**Time to resolve:** 30 minutes

### Symptom
On mobile, opening the hamburger menu on the homepage showed the overlay with partially transparent content — the hero background was visible through the menu overlay, making links hard to read. Additionally, the pill-shaped nav bar transform (which collapses to a smaller bar when scrolled) left corner gaps when the menu opened at the top of the page.

### Root Cause
Two issues:
1. The overlay `rgba(6,9,18,0.97)` opacity was slightly transparent — fine in most contexts, but the hero had a bright gradient that bled through
2. When the menu opened before the user had scrolled (so `showPill = false`), the nav bar was full-width and unrounded, but after opening, `menuOpen` triggered `showPill = true`, applying the pill transform and creating visual inconsistency

### Solution
Added `.hn-nav-open` class applied when menu is open on mobile, forcing full-width solid appearance:

```css
@media (max-width: 700px) {
  .hn-nav.hn-nav-open {
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    transform: none !important;
    width: 100% !important;
    max-width: none !important;
    border-radius: 0 !important;
    background: rgba(6,9,18,0.98) !important;
  }
}
```

The overlay opacity was also increased from `0.97` to `0.98`.

---

## 8. Next.js Build Failure — Blank Page Files

**Phase:** Pre-deployment  
**Severity:** Blocking — build failed  
**Time to resolve:** 5 minutes

### Symptom
`npm run build` failed with: `Error: The default export is not a React Component in "/explore/page"` (and subsequently `/profile/page`, `/resources/page`).

### Root Cause
The `(main)` route group contained page files that were empty — likely created as placeholders during early development and never populated. Next.js App Router requires every `page.jsx` file to export a default React component. An empty file exports nothing, which fails at prerender time.

### Solution
Deleted the three empty route folders entirely (`explore`, `profile`, `resources`). None were linked in the navigation. If they become needed in future phases, they can be recreated with real content.

### Lesson
Don't create `page.jsx` placeholder files in Next.js App Router. If a route isn't ready, the folder shouldn't exist. Use a `TODO` comment in `PROJECT.md` instead.

---

## 9. Vercel Build Failure — ESLint Peer Dependency Conflict

**Phase:** Deployment  
**Severity:** Blocking — Vercel build failed  
**Time to resolve:** 10 minutes

### Symptom
Local `npm run build` passed. Vercel build failed at `npm install` with ESLint peer dependency resolution errors.

### Root Cause
`eslint-config-next@16.1.6` requires `eslint@>=9.0.0`. The project had `eslint@8.57.1` installed. Locally, `npm install --legacy-peer-deps` was used to bypass this. Vercel ran a clean `npm install` without that flag, causing the conflict to surface.

### Solution
Added `.npmrc` to the project root:
```
legacy-peer-deps=true
```

This instructs npm to use legacy peer dependency resolution in all environments, including Vercel's CI environment, without requiring the flag to be passed manually.

### Lesson
Any `--flag` you pass locally during install should be codified in `.npmrc` so CI environments reproduce the same behavior. If it works locally only because of a flag, the project is not reproducibly buildable without that flag.

---

## 10. Auth Callback Dual-Flow Handling

**Phase:** 6  
**Severity:** High — password reset and magic links broken  
**Time to resolve:** ~2 hours

### Symptom
Email/password auth worked. Password reset links returned a 400 error when clicked. Magic links (used in some test flows) also failed.

### Root Cause
Supabase uses two different URL patterns for auth callbacks:
- **PKCE flow** (email/password, OAuth): callback URL contains `?code=xxx` — must be exchanged for a session via `exchangeCodeForSession()`
- **OTP/token_hash flow** (password reset, magic link): callback URL contains `?token_hash=xxx&type=recovery` — must be verified via `verifyOtp()`

The initial callback route only handled the PKCE flow.

### Solution
Single route that detects which flow is in use and handles both:

```js
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code       = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type       = searchParams.get("type")

  if (code) {
    // PKCE flow
    await supabase.auth.exchangeCodeForSession(code)
  } else if (token_hash && type) {
    // OTP/recovery flow
    await supabase.auth.verifyOtp({ token_hash, type })
  }

  // Redirect to destination
}
```

### Lesson
Supabase's auth callback documentation covers PKCE prominently but the OTP flow is a separate code path. Any application using both email/password and password reset must handle both in the same callback route.