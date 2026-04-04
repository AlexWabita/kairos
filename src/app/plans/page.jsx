"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter }   from "next/navigation"
import { usePathname } from "next/navigation"
import { useAuthState } from "@/hooks/useAuthState"

/* ─────────────────────────────────────────────────────────────
   SLUG HELPER
   Derives a slug from a plan title if plan.slug is missing.
   Matches the SQL transform in migration 009:
     lowercase → "& "→ "and-" → spaces → hyphens → strip non-alphanum-hyphen
   This is a safety net only — after migration 009 runs,
   plan.slug will always be present from the API.
───────────────────────────────────────────────────────────── */
function deriveSlug(title = "") {
  return title
    .toLowerCase()
    .replace(/&\s*/g, "and-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

function getPlanSlug(plan) {
  return plan.slug || deriveSlug(plan.title)
}

/* ─────────────────────────────────────────────────────────────
   SITUATION CHIPS
   slugs are Sets for O(1) lookup. Each value matches the slug
   column in reading_plans (backfilled by migration 009).
───────────────────────────────────────────────────────────── */
const SITUATIONS = [
  {
    id:    "anxious",
    label: "I'm anxious or overwhelmed",
    emoji: "🌊",
    slugs: new Set(["overcoming-anxiety", "when-god-feels-distant", "healing-and-forgiveness"]),
  },
  {
    id:    "lost",
    label: "I feel lost or purposeless",
    emoji: "🧭",
    slugs: new Set(["walking-in-purpose", "identity-in-christ", "new-believer-foundation"]),
  },
  {
    id:    "struggling",
    label: "I'm stuck in a pattern",
    emoji: "🔗",
    slugs: new Set(["breaking-free", "accountability-that-works"]),
  },
  {
    id:    "grieving",
    label: "I'm grieving something",
    emoji: "🕊️",
    slugs: new Set(["grief", "healing-and-forgiveness", "when-god-feels-distant"]),
  },
  {
    id:    "doubting",
    label: "My faith feels thin",
    emoji: "🌑",
    slugs: new Set(["when-god-feels-distant", "30-days-in-the-psalms", "new-believer-foundation"]),
  },
  {
    id:    "discipline",
    label: "I want to grow and be consistent",
    emoji: "🌱",
    slugs: new Set(["accountability-that-works", "prayer-and-fasting", "bible-in-365-days", "30-days-in-the-psalms"]),
  },
  {
    id:    "identity",
    label: "I don't know who I am",
    emoji: "🪞",
    slugs: new Set(["identity-in-christ", "walking-in-purpose", "new-believer-foundation"]),
  },
  {
    id:    "scripture",
    label: "I want to go deeper in Scripture",
    emoji: "📖",
    slugs: new Set(["bible-in-365-days", "30-days-in-the-psalms", "prayer-and-fasting"]),
  },
]

/* ─────────────────────────────────────────────────────────────
   SITUATION HOOKS — italic "For when…" line on each card
───────────────────────────────────────────────────────────── */
const PLAN_HOOKS = {
  "new-believer-foundation":   "For when you want to return to the beginning.",
  "overcoming-anxiety":        "For when the mind won't quiet down.",
  "identity-in-christ":        "For when you need to remember who you are.",
  "30-days-in-the-psalms":     "For when you need the most honest book in the Bible.",
  "prayer-and-fasting":        "For when you want to hear what you've been too busy to hear.",
  "healing-and-forgiveness":   "For when the wound still shows.",
  "walking-in-purpose":        "For when the question \"why am I here?\" won't leave you alone.",
  "bible-in-365-days":         "For when you want to read the whole story, one day at a time.",
  "breaking-free":             "For when you can't break a pattern on your own.",
  "when-god-feels-distant":    "For when prayer feels like talking into an empty room.",
  "accountability-that-works": "For when discipline keeps collapsing into shame.",
  "grief":                     "For when you need someone to walk with you in the loss.",
}

/* ─────────────────────────────────────────────────────────────
   CATEGORY COLOURS
───────────────────────────────────────────────────────────── */
const CAT = {
  "Faith Basics":         { dot: "#a5b4fc", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)"  },
  "Mental Health":        { dot: "#7ec8f0", bg: "rgba(64,144,208,0.1)",  border: "rgba(64,144,208,0.25)"  },
  "Identity":             { dot: "#f0c060", bg: "rgba(240,192,96,0.1)",  border: "rgba(240,192,96,0.25)"  },
  "Scripture":            { dot: "#d4a040", bg: "rgba(212,160,64,0.1)",  border: "rgba(212,160,64,0.25)"  },
  "Spiritual Discipline": { dot: "#7dcf8a", bg: "rgba(64,168,112,0.1)",  border: "rgba(64,168,112,0.25)"  },
  "Emotional Health":     { dot: "#f09090", bg: "rgba(240,100,100,0.1)", border: "rgba(240,100,100,0.25)" },
  "Life Direction":       { dot: "#c090f0", bg: "rgba(160,120,220,0.1)", border: "rgba(160,120,220,0.25)" },
  "Recovery":             { dot: "#f0a060", bg: "rgba(240,140,80,0.1)",  border: "rgba(240,140,80,0.25)"  },
  "Formation":            { dot: "#80c8c0", bg: "rgba(80,180,170,0.1)",  border: "rgba(80,180,170,0.25)"  },
  "Spiritual Life":       { dot: "#b0a0d8", bg: "rgba(140,120,200,0.1)", border: "rgba(140,120,200,0.25)" },
}

/* ─────────────────────────────────────────────────────────────
   NAV
───────────────────────────────────────────────────────────── */
const NAV = [
  { label: "Companion", href: "/journey",       Icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { label: "Saved",     href: "/journey/saved", Icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> },
  { label: "Bible",     href: "/bible",         Icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { label: "Plans",     href: "/plans",         Icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label: "Account",   href: "/account",       Icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: "Settings",  href: "/settings",      Icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
]

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function durationLabel(days) {
  if (days === 1)   return "1 day"
  if (days === 365) return "1 year"
  if (days >= 30)   return `${Math.round(days / 30)} month${Math.round(days / 30) > 1 ? "s" : ""}`
  return `${days} days`
}
function minutesLabel(days) {
  if (days <= 7)  return "~10 min/day"
  if (days <= 14) return "~12 min/day"
  if (days <= 30) return "~10 min/day"
  return "~8 min/day"
}
function progressPct(current, total) {
  return Math.min(100, Math.round(((current - 1) / total) * 100))
}

/* ─────────────────────────────────────────────────────────────
   CSS
───────────────────────────────────────────────────────────── */
const css = `
  @keyframes pl-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pl-pop  { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes pl-chip { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }

  .pl-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  /* ── Rail ── */
  .pl-rail {
    width: 64px;
    height: calc(100vh - 24px);
    margin: 12px 0 12px 12px;
    border-radius: 16px;
    background: rgba(12,14,24,0.92);
    border: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
    display: flex; flex-direction: column; align-items: center;
    padding: 14px 0; z-index: 30; flex-shrink: 0;
  }
  .pl-rail-btn {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: transparent; border: none;
    color: rgba(255,255,255,0.3); cursor: pointer;
    transition: all 0.15s ease; text-decoration: none;
    position: relative; margin-bottom: 2px;
  }
  .pl-rail-btn:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.7); }
  .pl-rail-btn.active { background: rgba(240,192,96,0.12); color: rgba(240,192,96,0.9); }
  .pl-tip {
    position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
    background: rgba(12,14,24,0.96); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; padding: 5px 10px; white-space: nowrap;
    font-family: var(--font-body); font-size: 0.72rem; color: rgba(255,255,255,0.7);
    opacity: 0; pointer-events: none; transition: opacity 0.15s ease;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4); z-index: 100;
  }
  .pl-rail-btn:hover .pl-tip { opacity: 1; }

  /* ── Main scroll ── */
  .pl-main {
    flex: 1; overflow-y: auto; min-width: 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.06) transparent;
  }
  .pl-main::-webkit-scrollbar { width: 4px; }
  .pl-main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
  .pl-content { max-width: 900px; margin: 0 auto; padding: 44px 40px 100px; }

  /* ── Situation chips ── */
  .pl-chip {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 16px; border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.02);
    font-family: var(--font-body); font-size: 0.82rem;
    color: rgba(255,255,255,0.45); cursor: pointer;
    transition: all 0.18s ease; white-space: nowrap;
    animation: pl-chip 0.3s ease both;
  }
  .pl-chip:hover {
    border-color: rgba(240,192,96,0.3);
    background: rgba(240,192,96,0.06);
    color: rgba(255,255,255,0.8);
  }
  .pl-chip.active {
    border-color: rgba(240,192,96,0.55);
    background: rgba(240,192,96,0.1);
    color: rgba(255,255,255,0.92);
    box-shadow: 0 0 0 1px rgba(240,192,96,0.15);
  }

  /* ── Plan cards ── */
  .pl-card {
    position: relative;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 24px;
    display: flex; flex-direction: column;
    height: 100%; box-sizing: border-box;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.18s ease;
    animation: pl-fade 0.4s ease both;
  }
  .pl-card:hover {
    border-color: rgba(255,255,255,0.13);
    background: rgba(255,255,255,0.035);
    transform: translateY(-1px);
  }
  .pl-card.enrolled {
    border-color: rgba(240,192,96,0.2);
    border-left: 2px solid rgba(240,192,96,0.55);
  }
  .pl-card.enrolled:hover { border-color: rgba(240,192,96,0.35); }
  .pl-card.completed { border-left: 2px solid rgba(100,200,120,0.5); }

  /* ── Filter select ── */
  .pl-select {
    height: 38px; padding: 0 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
    color: rgba(255,255,255,0.5);
    font-family: var(--font-body); font-size: 0.8rem;
    cursor: pointer; outline: none;
    transition: border-color 0.2s ease; min-width: 150px;
  }
  .pl-select:focus { border-color: rgba(240,192,96,0.4); }
  .pl-select option { background: #0f1117; }

  /* ── Mobile ── */
  .pl-mobile-nav { display: none; }

  @media (max-width: 768px) {
    .pl-rail       { display: none; }
    .pl-layout     { display: block; height: 100vh; overflow: hidden; }
    .pl-main       { height: 100vh; overflow-y: auto; }
    .pl-content    { padding: 24px 16px 100px; }
    .pl-mobile-nav { display: flex; }
  }
  @media (max-width: 480px) {
    .pl-content { padding: 16px 12px 100px; }
  }
`

/* ─────────────────────────────────────────────────────────────
   RAIL
───────────────────────────────────────────────────────────── */
function Rail({ currentPath }) {
  return (
    <div className="pl-rail">
      <a href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, rgba(240,192,96,0.15), rgba(200,140,40,0.15))", border: "1px solid rgba(240,192,96,0.25)", marginBottom: 16, textDecoration: "none" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </a>
      <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.06)", margin: "0 0 8px" }} />
      {NAV.map(item => {
        const active = currentPath === item.href
        return (
          <a key={item.href} href={item.href} className={`pl-rail-btn${active ? " active" : ""}`}>
            <item.Icon />
            <span className="pl-tip">{item.label}</span>
          </a>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MOBILE BOTTOM NAV
───────────────────────────────────────────────────────────── */
function MobileNav({ currentPath }) {
  return (
    <nav className="pl-mobile-nav" style={{ position: "fixed", bottom: 12, left: 12, right: 12, height: 58, zIndex: 100, background: "rgba(10,12,22,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "space-around" }}>
      {NAV.slice(0, 5).map(item => {
        const active = currentPath === item.href
        return (
          <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", color: active ? "rgba(240,192,96,0.9)" : "rgba(255,255,255,0.3)", minWidth: 44, minHeight: 44, justifyContent: "center", transition: "color 0.15s ease" }}>
            <item.Icon />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.08em" }}>{item.label}</span>
          </a>
        )
      })}
    </nav>
  )
}

/* ─────────────────────────────────────────────────────────────
   CATEGORY BADGE
───────────────────────────────────────────────────────────── */
function CategoryBadge({ category }) {
  const s = CAT[category] || { dot: "#aaa", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 100, background: s.bg, border: `1px solid ${s.border}`, fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.12em", textTransform: "uppercase", color: s.dot, whiteSpace: "nowrap" }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {category}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────────────────────── */
function ProgressBar({ current, total }) {
  return (
    <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${progressPct(current, total)}%`, background: "var(--gradient-gold)", borderRadius: 2, transition: "width 0.5s ease" }} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PLAN CARD
───────────────────────────────────────────────────────────── */
function PlanCard({ plan, onStart, isAuthenticated, enrolling, index }) {
  const slug      = getPlanSlug(plan)
  const enrolled  = plan.enrollment?.status === "active"
  const completed = plan.enrollment?.status === "completed"
  const curDay    = plan.enrollment?.current_day || 1
  const hook      = PLAN_HOOKS[slug] || null

  const cardClass = ["pl-card", enrolled ? "enrolled" : "", completed ? "completed" : ""].filter(Boolean).join(" ")

  return (
    <div className={cardClass} style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}>
      {/* Enrolled stripe */}
      {enrolled && (
        <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, rgba(240,192,96,0.5), transparent)", borderRadius: "16px 16px 0 0" }} />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
        <CategoryBadge category={plan.category} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {completed && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.14em", color: "rgba(100,200,120,0.7)" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(100,200,120,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              DONE
            </span>
          )}
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(255,255,255,0.2)" }}>
            {durationLabel(plan.duration_days)}
          </span>
        </div>
      </div>

      {/* Hook */}
      {hook && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.74rem", color: "rgba(240,192,96,0.5)", lineHeight: 1.5, margin: "0 0 8px", fontStyle: "italic" }}>
          {hook}
        </p>
      )}

      {/* Title */}
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", fontWeight: 300, color: "rgba(255,255,255,0.9)", lineHeight: 1.35, margin: "0 0 10px" }}>
        {plan.title}
      </h2>

      {/* Description */}
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.7, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {plan.description}
      </p>

      {/* Commitment */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)" }}>{durationLabel(plan.duration_days)}</span>
        <span style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)" }}>{minutesLabel(plan.duration_days)}</span>
      </div>

      {/* Progress */}
      {enrolled && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(255,255,255,0.28)" }}>Day {curDay} of {plan.duration_days}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(240,192,96,0.55)" }}>{progressPct(curDay, plan.duration_days)}%</span>
          </div>
          <ProgressBar current={curDay} total={plan.duration_days} />
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: "auto", paddingTop: 4 }}>
        {enrolled ? (
          <button onClick={() => onStart(plan.id, true)} style={{ height: 40, padding: "0 22px", borderRadius: 100, border: "none", background: "var(--gradient-gold)", color: "#060912", fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.14em", cursor: "pointer", boxShadow: "var(--shadow-gold-sm)" }}>
            CONTINUE
          </button>
        ) : !completed ? (
          <button
            onClick={() => onStart(plan.id, false)}
            disabled={enrolling === plan.id}
            style={{ height: 40, padding: "0 22px", borderRadius: 100, border: isAuthenticated ? "none" : "1px solid rgba(255,255,255,0.1)", background: isAuthenticated ? "var(--gradient-gold)" : "transparent", color: isAuthenticated ? "#060912" : "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.14em", cursor: enrolling === plan.id ? "not-allowed" : "pointer", opacity: enrolling === plan.id ? 0.6 : 1, boxShadow: isAuthenticated ? "var(--shadow-gold-sm)" : "none", transition: "opacity 0.15s ease" }}
          >
            {enrolling === plan.id ? "STARTING…" : isAuthenticated ? "BEGIN PLAN" : "SIGN IN TO START"}
          </button>
        ) : (
          <button
            onClick={() => onStart(plan.id, true)}
            style={{ height: 40, padding: "0 22px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.14em", cursor: "pointer", transition: "all 0.15s ease" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)" }}
          >
            VIEW AGAIN
          </button>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ borderRadius: 16, padding: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ height: 18, width: "42%", background: "rgba(255,255,255,0.04)", borderRadius: 100 }} />
            <div style={{ height: 14, width: "18%", background: "rgba(255,255,255,0.03)", borderRadius: 100 }} />
          </div>
          <div style={{ height: 13, width: "55%", background: "rgba(255,255,255,0.03)", borderRadius: 6 }} />
          <div style={{ height: 22, width: "82%", background: "rgba(255,255,255,0.04)", borderRadius: 6 }} />
          <div style={{ height: 12, width: "95%", background: "rgba(255,255,255,0.03)", borderRadius: 4 }} />
          <div style={{ height: 12, width: "70%", background: "rgba(255,255,255,0.03)", borderRadius: 4 }} />
          <div style={{ height: 40, width: 110, background: "rgba(255,255,255,0.04)", borderRadius: 100, marginTop: 8 }} />
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PLAN GRID — shared layout used in both situation and filter mode
───────────────────────────────────────────────────────────── */
function PlanGrid({ plans, onStart, isAuthenticated, enrolling, dimmed = false, offset = 0 }) {
  if (plans.length === 0) return null
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
      gap: 16,
      opacity: dimmed ? 0.38 : 1,
      filter: dimmed ? "saturate(0.4)" : "none",
      transition: "opacity 0.25s ease, filter 0.25s ease",
    }}>
      {plans.map((plan, i) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onStart={onStart}
          isAuthenticated={isAuthenticated}
          enrolling={enrolling}
          index={offset + i}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function PlansPage() {
  const router   = useRouter()
  const pathname = usePathname()
  const { isAuth, loading: authLoading, user } = useAuthState()

  const [plans,       setPlans]       = useState([])
  const [plansLoaded, setPlansLoaded] = useState(false)
  const [enrolling,   setEnrolling]   = useState(null)
  const [filterCat,   setFilterCat]   = useState("all")
  const [filterState, setFilterState] = useState("all")
  const [activeSit,   setActiveSit]   = useState(null)

  const gridRef = useRef(null)
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || null

  // ── Load plans ──
  useEffect(() => {
    if (authLoading) return
    fetch("/api/plans")
      .then(r => r.json())
      .then(d => { if (d.success) setPlans(d.plans || []) })
      .catch(() => {})
      .finally(() => setPlansLoaded(true))
  }, [authLoading])

  // ── Enroll / navigate ──
  const handleStart = async (planId, alreadyEnrolled) => {
    if (!isAuth) { router.push(`/login?returnTo=/plans`); return }
    if (alreadyEnrolled) { router.push(`/plans/${planId}`); return }
    setEnrolling(planId)
    try {
      const res  = await fetch("/api/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId }) })
      const data = await res.json()
      if (data.success) router.push(`/plans/${planId}`)
    } catch (err) { console.error("[Plans] Enroll failed:", err.message) }
    finally { setEnrolling(null) }
  }

  // ── Chip click: toggle situation, clear other filters, scroll ──
  const handleChipClick = (sitId) => {
    const deselecting = activeSit === sitId
    setActiveSit(deselecting ? null : sitId)
    if (!deselecting) {
      setFilterCat("all")
      setFilterState("all")
      setTimeout(() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
    }
  }

  // ── Active situation's slug Set ──
  const activeSlugs = useMemo(() => {
    if (!activeSit) return null
    return SITUATIONS.find(s => s.id === activeSit)?.slugs ?? null
  }, [activeSit])

  // ── Sort helper: enrolled first, then curated ──
  const sortPlans = (arr) => [...arr].sort((a, b) => {
    const aE = a.enrollment?.status === "active" ? 0 : 1
    const bE = b.enrollment?.status === "active" ? 0 : 1
    if (aE !== bE) return aE - bE
    if (a.is_curated !== b.is_curated) return b.is_curated ? 1 : -1
    return a.title.localeCompare(b.title)
  })

  // ── Derived lists ──
  const { matchPlans, otherPlans, flatList } = useMemo(() => {
    if (activeSlugs) {
      // SITUATION MODE — split by slug match using getPlanSlug() for safety
      const match = plans.filter(p => activeSlugs.has(getPlanSlug(p)))
      const other = plans.filter(p => !activeSlugs.has(getPlanSlug(p)))
      return { matchPlans: sortPlans(match), otherPlans: sortPlans(other), flatList: null }
    }
    // FILTER MODE
    let list = [...plans]
    if (filterCat   !== "all") list = list.filter(p => p.category === filterCat)
    if (filterState === "active")    list = list.filter(p => p.enrollment?.status === "active")
    if (filterState === "completed") list = list.filter(p => p.enrollment?.status === "completed")
    return { matchPlans: null, otherPlans: null, flatList: sortPlans(list) }
  }, [plans, activeSlugs, filterCat, filterState])

  const categories        = useMemo(() => [...new Set(plans.map(p => p.category).filter(Boolean))].sort(), [plans])
  const activeEnrollments = plans.filter(p => p.enrollment?.status === "active")
  const hasActiveFilters  = filterCat !== "all" || filterState !== "all"

  return (
    <>
      <style>{css}</style>

      <div style={{ background: "var(--color-void)", minHeight: "100vh" }}>
        <div aria-hidden="true" style={{ position: "fixed", top: "15%", right: "-5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(240,192,96,0.04) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

        <div className="pl-layout" style={{ position: "relative", zIndex: 1 }}>
          <Rail currentPath={pathname} />

          <main className="pl-main">
            <div className="pl-content">

              {/* ── Header ── */}
              <div style={{ marginBottom: 40 }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(240,192,96,0.6)", marginBottom: 14 }}>
                  Reading Journeys
                </p>
                <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 300, color: "rgba(255,255,255,0.9)", lineHeight: 1.2, margin: "0 0 12px" }}>
                  {isAuth && userName ? `What are you carrying, ${userName.split(" ")[0]}?` : "Where are you right now?"}
                </h1>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
                  Choose how you're feeling and we'll show you where to begin.
                </p>
              </div>

              {/* ── Continue reading ── */}
              {isAuth && activeEnrollments.length > 0 && (
                <div style={{ background: "rgba(240,192,96,0.04)", border: "1px solid rgba(240,192,96,0.14)", borderLeft: "2px solid rgba(240,192,96,0.5)", borderRadius: 14, padding: "18px 22px", marginBottom: 36, animation: "pl-pop 0.4s ease" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,192,96,0.6)", marginBottom: 14 }}>
                    Continue your journey
                  </p>
                  {activeEnrollments.map(plan => (
                    <a key={plan.id} href={`/plans/${plan.id}`} style={{ display: "flex", alignItems: "center", gap: 16, textDecoration: "none", marginBottom: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "rgba(255,255,255,0.75)", margin: "0 0 7px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {plan.title}
                        </p>
                        <ProgressBar current={plan.enrollment.current_day} total={plan.duration_days} />
                      </div>
                      <div style={{ flexShrink: 0, textAlign: "right" }}>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "rgba(240,192,96,0.6)", margin: 0 }}>
                          {progressPct(plan.enrollment.current_day, plan.duration_days)}%
                        </p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "rgba(255,255,255,0.18)", margin: "2px 0 0" }}>
                          Day {plan.enrollment.current_day}/{plan.duration_days}
                        </p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </a>
                  ))}
                </div>
              )}

              {/* ── SITUATION CHIPS ── */}
              <div style={{ marginBottom: 36 }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>
                  I am…
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SITUATIONS.map((sit, i) => (
                    <button
                      key={sit.id}
                      className={`pl-chip${activeSit === sit.id ? " active" : ""}`}
                      onClick={() => handleChipClick(sit.id)}
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <span style={{ fontSize: "0.88rem", lineHeight: 1 }}>{sit.emoji}</span>
                      {sit.label}
                    </button>
                  ))}
                </div>
                {activeSit && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", color: "rgba(255,255,255,0.22)", margin: 0 }}>
                      <strong style={{ color: "rgba(240,192,96,0.65)", fontWeight: 400 }}>{matchPlans?.length || 0}</strong> plan{(matchPlans?.length || 0) !== 1 ? "s" : ""} for this season.
                    </p>
                    <button
                      onClick={() => setActiveSit(null)}
                      style={{ background: "none", border: "none", color: "rgba(240,192,96,0.55)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.76rem", padding: 0, transition: "color 0.15s ease" }}
                      onMouseEnter={e => e.currentTarget.style.color = "rgba(240,192,96,0.9)"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(240,192,96,0.55)"}
                    >
                      Show all →
                    </button>
                  </div>
                )}
              </div>

              {/* ── Grid scroll anchor ── */}
              <div ref={gridRef} style={{ scrollMarginTop: 20 }} />

              {/* ── Filter bar (standard mode only) ── */}
              {!activeSit && plansLoaded && plans.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
                  <select className="pl-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="all">All categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {isAuth && (
                    <select className="pl-select" value={filterState} onChange={e => setFilterState(e.target.value)}>
                      <option value="all">All plans</option>
                      <option value="active">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  )}
                  {hasActiveFilters && (
                    <button
                      onClick={() => { setFilterCat("all"); setFilterState("all") }}
                      style={{ height: 38, padding: "0 14px", borderRadius: 10, background: "transparent", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)", fontSize: "0.78rem", cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)" }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)" }}
                    >
                      Clear
                    </button>
                  )}
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "rgba(255,255,255,0.16)", marginLeft: "auto" }}>
                    {flatList?.length || 0} plan{(flatList?.length || 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* ── Loading ── */}
              {(authLoading || !plansLoaded) && <LoadingSkeleton />}

              {/* ── SITUATION MODE ── */}
              {plansLoaded && !authLoading && activeSlugs && (
                <>
                  <PlanGrid plans={matchPlans} onStart={handleStart} isAuthenticated={isAuth} enrolling={enrolling} dimmed={false} offset={0} />

                  {otherPlans.length > 0 && (
                    <div style={{ marginTop: 28 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)", whiteSpace: "nowrap" }}>
                          Other plans
                        </span>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                      </div>
                      <PlanGrid plans={otherPlans} onStart={handleStart} isAuthenticated={isAuth} enrolling={enrolling} dimmed={true} offset={matchPlans.length} />
                    </div>
                  )}
                </>
              )}

              {/* ── STANDARD FILTER MODE ── */}
              {plansLoaded && !authLoading && !activeSlugs && (
                <>
                  {flatList.length === 0 && plans.length > 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <p style={{ fontFamily: "var(--font-heading)", fontWeight: 300, fontSize: "1rem", color: "rgba(255,255,255,0.3)", marginBottom: 18 }}>
                        No plans match your filters.
                      </p>
                      <button onClick={() => { setFilterCat("all"); setFilterState("all") }} style={{ height: 40, padding: "0 20px", borderRadius: 100, background: "transparent", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)", fontSize: "0.78rem", cursor: "pointer" }}>
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <PlanGrid plans={flatList} onStart={handleStart} isAuthenticated={isAuth} enrolling={enrolling} dimmed={false} offset={0} />
                  )}
                </>
              )}

              {/* ── Sign-in prompt ── */}
              {!isAuth && plansLoaded && (
                <div style={{ textAlign: "center", marginTop: 48, padding: "28px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "rgba(255,255,255,0.3)", marginBottom: 18, lineHeight: 1.7 }}>
                    Sign in to start a plan and track your progress across sessions.
                  </p>
                  <a href="/login?returnTo=/plans" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 28px", borderRadius: 100, background: "var(--gradient-gold)", color: "#060912", fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.14em", textDecoration: "none", boxShadow: "var(--shadow-gold-sm)" }}>
                    SIGN IN TO BEGIN
                  </a>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>

      <MobileNav currentPath={pathname} />
    </>
  )
}