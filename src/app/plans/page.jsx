"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter }    from "next/navigation"
import { usePathname }  from "next/navigation"
import { useAuthState } from "@/hooks/useAuthState"

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const css = `
  @keyframes pl-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pl-spin  { to{transform:rotate(360deg)} }

  .pl-layout {
    display: grid;
    grid-template-columns: 220px 1fr;
    min-height: 100vh;
  }

  .pl-sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: rgba(8,10,18,0.98);
    border-right: 1px solid rgba(255,255,255,0.06);
    padding: 24px 16px;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .pl-sidebar::-webkit-scrollbar { display: none; }

  .pl-main {
    min-width: 0;
    padding: 40px 40px 80px;
  }

  .pl-nav-link {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 8px;
    text-decoration: none; cursor: pointer;
    border: none; background: transparent; width: 100%;
    transition: background 0.15s ease;
    min-height: 40px; text-align: left;
    font-family: var(--font-body); font-size: 0.82rem;
  }
  .pl-nav-link:hover { background: rgba(255,255,255,0.05); }
  .pl-nav-link.active { background: rgba(255,255,255,0.08); }

  .pl-card {
    position: relative;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 22px;
    display: flex; flex-direction: column; gap: 12px;
    transition: border-color 0.2s ease, background 0.2s ease;
    animation: pl-fade 0.4s ease both;
  }
  .pl-card:hover {
    border-color: rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.035);
  }
  .pl-card.enrolled {
    border-color: rgba(240,192,96,0.25);
    border-left: 2px solid rgba(240,192,96,0.6);
  }
  .pl-card.enrolled:hover { border-color: rgba(240,192,96,0.4); }
  .pl-card.completed {
    border-left: 2px solid rgba(100,200,120,0.6);
  }

  .pl-select {
    height: 40px;
    padding: 0 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    color: rgba(255,255,255,0.55);
    font-family: var(--font-body); font-size: 0.8rem;
    cursor: pointer; outline: none;
    transition: border-color 0.2s ease;
    min-width: 160px;
  }
  .pl-select:focus { border-color: rgba(240,192,96,0.4); }
  .pl-select option { background: #0f1117; }

  /* Mobile */
  .pl-mobile-nav { display: none; }

  @media (max-width: 768px) {
    .pl-layout { grid-template-columns: 1fr; }
    .pl-sidebar { display: none; }
    .pl-main    { padding: 24px 16px 80px; }
    .pl-mobile-nav { display: flex; }
  }

  @media (max-width: 480px) {
    .pl-main { padding: 16px 12px 80px; }
  }
`

/* ─────────────────────────────────────────────────────────────
   NAV ITEMS
───────────────────────────────────────────────────────────── */
const NAV = [
  { label: "Companion", href: "/journey",        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { label: "Saved",     href: "/journey/saved",  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> },
  { label: "Bible",     href: "/bible",          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { label: "Plans",     href: "/plans",          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label: "Account",   href: "/account",        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: "Settings",  href: "/settings",       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
]

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
}

function CategoryBadge({ category }) {
  const s = CAT[category] || { dot: "#aaa", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 100,
      background: s.bg, border: `1px solid ${s.border}`,
      fontFamily: "var(--font-display)", fontSize: "0.48rem",
      letterSpacing: "0.12em", textTransform: "uppercase",
      color: s.dot, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {category}
    </span>
  )
}

function durationLabel(days) {
  if (days === 1)   return "1 day"
  if (days === 365) return "1 year"
  if (days >= 30)   return `${Math.round(days/30)} month${Math.round(days/30) > 1 ? "s" : ""}`
  return `${days} days`
}

/* ─────────────────────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────────────────────── */
function ProgressBar({ current, total }) {
  const pct = Math.min(100, Math.round(((current - 1) / total) * 100))
  return (
    <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "var(--gradient-gold)", borderRadius: 2, transition: "width 0.5s ease" }} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PLAN CARD
───────────────────────────────────────────────────────────── */
function PlanCard({ plan, onStart, isAuthenticated, enrolling, index }) {
  const enrolled   = !!plan.enrollment
  const completed  = plan.enrollment?.status === "completed"
  const currentDay = plan.enrollment?.current_day || 1
  const cat        = CAT[plan.category]

  return (
    <div
      className={`pl-card${enrolled && !completed ? " enrolled" : ""}${completed ? " completed" : ""}`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Enrolled accent glow */}
      {enrolled && !completed && (
        <div aria-hidden="true" style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, rgba(240,192,96,0.4), transparent)",
          borderRadius: "14px 14px 0 0",
        }} />
      )}

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <CategoryBadge category={plan.category} />
        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>
          {durationLabel(plan.duration_days)}
        </span>
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily: "var(--font-heading)", fontSize: "1rem",
        fontWeight: 300, color: "rgba(255,255,255,0.88)",
        lineHeight: 1.4, margin: 0,
      }}>
        {plan.title}
      </h2>

      {/* Description */}
      <p style={{
        fontFamily: "var(--font-body)", fontSize: "0.82rem",
        color: "rgba(255,255,255,0.35)", lineHeight: 1.7, margin: 0,
      }}>
        {plan.description}
      </p>

      {/* Progress */}
      {enrolled && !completed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <ProgressBar current={currentDay} total={plan.duration_days} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
            Day {currentDay} of {plan.duration_days}
          </p>
        </div>
      )}

      {/* Completed badge */}
      {completed && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(100,200,120,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(100,200,120,0.7)" }}>
            Completed
          </span>
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: 4 }}>
        {enrolled && !completed ? (
          <button
            onClick={() => onStart(plan.id, true)}
            style={{
              height: 40, padding: "0 20px", borderRadius: 100,
              border: "none", background: "var(--gradient-gold)",
              color: "#060912", fontFamily: "var(--font-display)",
              fontSize: "0.6rem", letterSpacing: "0.14em",
              cursor: "pointer", boxShadow: "var(--shadow-gold-sm)",
            }}
          >
            CONTINUE
          </button>
        ) : !completed ? (
          <button
            onClick={() => onStart(plan.id, false)}
            disabled={enrolling === plan.id}
            style={{
              height: 40, padding: "0 20px", borderRadius: 100,
              border: isAuthenticated ? "none" : "1px solid rgba(255,255,255,0.1)",
              background: isAuthenticated ? "var(--gradient-gold)" : "transparent",
              color: isAuthenticated ? "#060912" : "rgba(255,255,255,0.4)",
              fontFamily: "var(--font-display)", fontSize: "0.6rem",
              letterSpacing: "0.14em", cursor: enrolling === plan.id ? "not-allowed" : "pointer",
              opacity: enrolling === plan.id ? 0.6 : 1,
              boxShadow: isAuthenticated ? "var(--shadow-gold-sm)" : "none",
              transition: "opacity 0.15s ease",
            }}
          >
            {enrolling === plan.id ? "STARTING…" : isAuthenticated ? "START PLAN" : "SIGN IN TO START"}
          </button>
        ) : (
          <button
            onClick={() => onStart(plan.id, true)}
            style={{
              height: 40, padding: "0 20px", borderRadius: 100,
              border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
              color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)",
              fontSize: "0.6rem", letterSpacing: "0.14em", cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)" }}
          >
            VIEW PLAN
          </button>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────── */
function Sidebar({ pathname, userName, initials }) {
  return (
    <nav className="pl-sidebar">
      {/* Logo */}
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 28 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, rgba(240,192,96,0.3), rgba(200,140,40,0.3))", border: "1px solid rgba(240,192,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", letterSpacing: "0.22em", background: "var(--gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          KAIROS
        </span>
      </a>

      {/* Nav section label */}
      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", padding: "0 12px 6px", marginBottom: 2 }}>Navigation</p>

      {/* Nav links */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <a
              key={item.href}
              href={item.href}
              className={`pl-nav-link${active ? " active" : ""}`}
              style={{ color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)" }}
            >
              <span style={{ color: active ? "rgba(240,192,96,0.8)" : "rgba(255,255,255,0.25)", flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
              {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "rgba(240,192,96,0.7)", flexShrink: 0 }} />}
            </a>
          )
        })}
      </div>

      {/* User */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16, marginTop: 16 }}>
        {userName ? (
          <a href="/account" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", padding: "8px 10px", borderRadius: 10, transition: "background 0.15s ease" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, rgba(240,192,96,0.2), rgba(200,140,40,0.2))", border: "1px solid rgba(240,192,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "0.52rem", color: "rgba(240,192,96,0.8)", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{userName.split(" ")[0]}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(255,255,255,0.2)", margin: "1px 0 0" }}>View account →</p>
            </div>
          </a>
        ) : (
          <a href="/login" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, textDecoration: "none", background: "rgba(240,192,96,0.06)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(240,192,96,0.15)", transition: "all 0.15s ease" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(240,192,96,0.1)"; e.currentTarget.style.borderColor = "rgba(240,192,96,0.3)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(240,192,96,0.06)"; e.currentTarget.style.borderColor = "rgba(240,192,96,0.15)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "rgba(240,192,96,0.7)" }}>Sign in</span>
          </a>
        )}
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────────────────────────
   MOBILE BOTTOM NAV
───────────────────────────────────────────────────────────── */
function MobileNav({ pathname }) {
  return (
    <div className="pl-mobile-nav" style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      height: 58, zIndex: 100,
      background: "rgba(8,10,18,0.96)",
      backdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      alignItems: "center", justifyContent: "space-around",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {NAV.slice(0, 5).map(item => {
        const active = pathname === item.href
        return (
          <a key={item.href} href={item.href} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            textDecoration: "none",
            color: active ? "rgba(240,192,96,0.9)" : "rgba(255,255,255,0.3)",
            transition: "color 0.15s ease", padding: "4px 10px",
            minWidth: 44, minHeight: 44, justifyContent: "center",
          }}>
            {item.icon}
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.45rem", letterSpacing: "0.08em" }}>{item.label}</span>
          </a>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 2 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          borderRadius: 14, padding: 22,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          display: "flex", flexDirection: "column", gap: 12,
          animationDelay: `${i * 0.06}s`,
        }}>
          <div style={{ height: 20, width: "50%", background: "rgba(255,255,255,0.04)", borderRadius: 100 }} />
          <div style={{ height: 16, width: "80%", background: "rgba(255,255,255,0.04)", borderRadius: 8 }} />
          <div style={{ height: 12, width: "95%", background: "rgba(255,255,255,0.03)", borderRadius: 8 }} />
          <div style={{ height: 12, width: "70%", background: "rgba(255,255,255,0.03)", borderRadius: 8 }} />
          <div style={{ height: 40, width: 120, background: "rgba(255,255,255,0.04)", borderRadius: 100, marginTop: 4 }} />
        </div>
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

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || null
  const initials = userName ? userName.trim().split(" ").slice(0,2).map(p => p[0]).join("").toUpperCase() : "K"

  useEffect(() => {
    if (authLoading) return
    const load = async () => {
      const res  = await fetch("/api/plans")
      const data = await res.json()
      if (data.success) setPlans(data.plans || [])
      setPlansLoaded(true)
    }
    load()
  }, [authLoading])

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

  const categories = useMemo(() => [...new Set(plans.map(p => p.category).filter(Boolean))].sort(), [plans])

  const displayed = useMemo(() => {
    let list = [...plans]
    if (filterCat   !== "all")        list = list.filter(p => p.category === filterCat)
    if (filterState === "active")     list = list.filter(p => p.enrollment?.status === "active")
    if (filterState === "completed")  list = list.filter(p => p.enrollment?.status === "completed")
    list.sort((a, b) => {
      const aE = !!a.enrollment, bE = !!b.enrollment
      if (aE !== bE) return bE ? 1 : -1
      if (a.is_curated !== b.is_curated) return b.is_curated ? 1 : -1
      return a.title.localeCompare(b.title)
    })
    return list
  }, [plans, filterCat, filterState])

  const activeEnrollments = plans.filter(p => p.enrollment?.status === "active")

  return (
    <>
      <style>{css}</style>

      <div style={{ background: "var(--color-void)", minHeight: "100vh" }}>
        {/* Ambient glow */}
        <div aria-hidden="true" style={{ position: "fixed", top: "20%", right: "-5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(240,192,96,0.04) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div aria-hidden="true" style={{ position: "fixed", bottom: "10%", left: "-4%", width: 300, height: 300, background: "radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

        <div className="pl-layout" style={{ position: "relative", zIndex: 1 }}>

          {/* ── SIDEBAR ── */}
          <Sidebar pathname={pathname} userName={userName} initials={initials} />

          {/* ── MAIN ── */}
          <main className="pl-main">

            {/* Page header */}
            <div style={{ marginBottom: 36 }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(240,192,96,0.7)", marginBottom: 14 }}>
                Reading Plans
              </p>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 300, color: "rgba(255,255,255,0.88)", lineHeight: 1.25, margin: "0 0 12px" }}>
                Walk with purpose,
                <br />
                <em style={{ color: "var(--color-gold-warm)" }}>one day at a time.</em>
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "rgba(255,255,255,0.32)", lineHeight: 1.7, maxWidth: 520 }}>
                {isAuth
                  ? activeEnrollments.length > 0
                    ? `You have ${activeEnrollments.length} active plan${activeEnrollments.length > 1 ? "s" : ""}. Keep going — every day matters.`
                    : "Choose a plan to begin a structured journey through scripture."
                  : "Sign in to start a plan and track your progress across sessions."}
              </p>
            </div>

            {/* Active plans quick-access */}
            {isAuth && activeEnrollments.length > 0 && (
              <div style={{
                background: "rgba(240,192,96,0.04)",
                border: "1px solid rgba(240,192,96,0.15)",
                borderLeft: "2px solid rgba(240,192,96,0.5)",
                borderRadius: 14, padding: "18px 20px",
                marginBottom: 28, animation: "pl-fade 0.5s ease",
              }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,192,96,0.6)", marginBottom: 14 }}>
                  Continue reading
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {activeEnrollments.map(plan => (
                    <a key={plan.id} href={`/plans/${plan.id}`} style={{
                      display: "flex", alignItems: "center", gap: 16,
                      textDecoration: "none", padding: "8px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "rgba(255,255,255,0.75)", margin: "0 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {plan.title}
                        </p>
                        <ProgressBar current={plan.enrollment.current_day} total={plan.duration_days} />
                      </div>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap", flexShrink: 0 }}>
                        Day {plan.enrollment.current_day}/{plan.duration_days}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            {!authLoading && plansLoaded && plans.length > 0 && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
                <select
                  className="pl-select"
                  value={filterCat}
                  onChange={e => setFilterCat(e.target.value)}
                >
                  <option value="all">All categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                {isAuth && (
                  <select
                    className="pl-select"
                    value={filterState}
                    onChange={e => setFilterState(e.target.value)}
                  >
                    <option value="all">All plans</option>
                    <option value="active">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                )}
                {(filterCat !== "all" || filterState !== "all") && (
                  <button
                    onClick={() => { setFilterCat("all"); setFilterState("all") }}
                    style={{
                      height: 40, padding: "0 14px", borderRadius: 10,
                      background: "transparent",
                      borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.35)",
                      fontFamily: "var(--font-body)", fontSize: "0.78rem",
                      cursor: "pointer", transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)" }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)" }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Loading state */}
            {(authLoading || !plansLoaded) && <LoadingSkeleton />}

            {/* Empty results */}
            {plansLoaded && !authLoading && displayed.length === 0 && plans.length > 0 && (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <p style={{ fontFamily: "var(--font-heading)", fontWeight: 300, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>No plans match your filters.</p>
                <button onClick={() => { setFilterCat("all"); setFilterState("all") }} style={{
                  height: 40, padding: "0 20px", borderRadius: 100,
                  background: "transparent", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)", fontSize: "0.78rem", cursor: "pointer",
                }}>
                  Clear filters
                </button>
              </div>
            )}

            {/* Plans grid */}
            {plansLoaded && !authLoading && displayed.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
                gap: 2,
              }}>
                {displayed.map((plan, i) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onStart={handleStart}
                    isAuthenticated={isAuth}
                    enrolling={enrolling}
                    index={i}
                  />
                ))}
              </div>
            )}

            {/* Sign-in prompt */}
            {!isAuth && plansLoaded && (
              <div style={{
                textAlign: "center", marginTop: 40,
                padding: "28px 20px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
              }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "rgba(255,255,255,0.3)", marginBottom: 18, lineHeight: 1.7 }}>
                  Sign in to start a plan and track your progress.
                </p>
                <a href="/login?returnTo=/plans" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 24px", borderRadius: 100,
                  background: "var(--gradient-gold)",
                  color: "#060912", fontFamily: "var(--font-display)",
                  fontSize: "0.62rem", letterSpacing: "0.14em",
                  textDecoration: "none", boxShadow: "var(--shadow-gold-sm)",
                }}>
                  SIGN IN TO BEGIN
                </a>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav pathname={pathname} />
    </>
  )
}