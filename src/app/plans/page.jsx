"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

// ── Category colours ──────────────────────────────────────────
const CATEGORY_STYLES = {
  "Faith Basics":       { bg: "rgba(99,102,241,0.12)",  color: "#a5b4fc" },
  "Mental Health":      { bg: "rgba(64,144,208,0.12)",  color: "#7ec8f0" },
  "Identity":           { bg: "rgba(240,192,96,0.12)",  color: "#f0c060" },
  "Scripture":          { bg: "rgba(220,180,120,0.12)", color: "#d4a040" },
  "Spiritual Discipline":{ bg: "rgba(64,168,112,0.12)", color: "#7dcf8a" },
  "Emotional Health":   { bg: "rgba(240,100,100,0.12)", color: "#f09090" },
  "Life Direction":     { bg: "rgba(160,120,220,0.12)", color: "#c090f0" },
}

function CategoryBadge({ category }) {
  const s = CATEGORY_STYLES[category] || { bg: "rgba(255,255,255,0.08)", color: "var(--color-soft)" }
  return (
    <span style={{
      background:    s.bg,
      color:         s.color,
      fontFamily:    "var(--font-display)",
      fontSize:      "0.52rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      padding:       "2px 8px",
      borderRadius:  "var(--radius-full)",
      whiteSpace:    "nowrap",
    }}>
      {category}
    </span>
  )
}

// ── Duration label ────────────────────────────────────────────
function durationLabel(days) {
  if (days === 365) return "1 year"
  if (days === 1)   return "1 day"
  if (days < 8)     return `${days} days`
  if (days < 31)    return `${days} days`
  return `${days} days`
}

// ── Progress bar ──────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = Math.min(100, Math.round(((current - 1) / total) * 100))
  return (
    <div style={{
      height:       "3px",
      background:   "rgba(255,255,255,0.06)",
      borderRadius: "var(--radius-full)",
      overflow:     "hidden",
      marginTop:    "var(--space-3)",
    }}>
      <div style={{
        height:     "100%",
        width:      `${pct}%`,
        background: "var(--gradient-gold)",
        borderRadius: "var(--radius-full)",
        transition: "width 0.4s ease",
      }} />
    </div>
  )
}

// ── Plan card ─────────────────────────────────────────────────
function PlanCard({ plan, onStart, isAuthenticated, enrolling }) {
  const enrolled   = !!plan.enrollment
  const completed  = plan.enrollment?.status === "completed"
  const currentDay = plan.enrollment?.current_day || 1

  return (
    <div
      style={{
        background:   "linear-gradient(135deg, rgba(20,29,53,0.85) 0%, rgba(13,20,40,0.85) 100%)",
        border:       `1px solid ${enrolled ? "rgba(240,192,96,0.35)" : "var(--color-border)"}`,
        borderLeft:   `2px solid ${completed
          ? "rgba(64,168,112,0.7)"
          : enrolled
            ? "var(--color-gold-warm)"
            : "rgba(240,192,96,0.2)"}`,
        borderRadius: "var(--radius-xl)",
        padding:      "var(--space-5)",
        boxShadow:    "var(--shadow-card)",
        display:      "flex",
        flexDirection:"column",
        gap:          "var(--space-3)",
        transition:   "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Top row: category + duration */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <CategoryBadge category={plan.category} />
        <span style={{
          fontFamily:    "var(--font-body)",
          fontSize:      "0.68rem",
          color:         "var(--color-muted)",
          letterSpacing: "0.04em",
          whiteSpace:    "nowrap",
        }}>
          {durationLabel(plan.duration_days)}
        </span>
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily: "var(--font-heading)",
        fontSize:   "1.05rem",
        fontWeight: 300,
        color:      "var(--color-divine)",
        lineHeight: 1.35,
        margin:     0,
      }}>
        {plan.title}
      </h2>

      {/* Description */}
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize:   "0.82rem",
        color:      "var(--color-soft)",
        lineHeight: 1.65,
        margin:     0,
        opacity:    0.85,
      }}>
        {plan.description}
      </p>

      {/* Progress bar — only if enrolled and not completed */}
      {enrolled && !completed && (
        <>
          <ProgressBar current={currentDay} total={plan.duration_days} />
          <p style={{
            fontFamily:    "var(--font-body)",
            fontSize:      "0.68rem",
            color:         "var(--color-muted)",
            margin:        0,
            letterSpacing: "0.03em",
          }}>
            Day {currentDay} of {plan.duration_days}
          </p>
        </>
      )}

      {/* Completed badge */}
      {completed && (
        <p style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.55rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color:         "#7dcf8a",
          margin:        0,
        }}>
          ✓ Completed
        </p>
      )}

      {/* CTA */}
      <div style={{ marginTop: "var(--space-1)", display: "flex", gap: "var(--space-3)" }}>
        {enrolled && !completed ? (
          <button
            onClick={() => onStart(plan.id, true)}
            style={{
              height:        "44px",
              padding:       "0 var(--space-5)",
              borderRadius:  "var(--radius-full)",
              border:        "none",
              background:    "var(--gradient-gold)",
              color:         "#060912",
              fontFamily:    "var(--font-display)",
              fontSize:      "0.65rem",
              letterSpacing: "0.15em",
              fontWeight:    700,
              cursor:        "pointer",
              boxShadow:     "var(--shadow-gold-sm)",
              transition:    "opacity 0.15s ease",
            }}
          >
            CONTINUE
          </button>
        ) : !completed ? (
          <button
            onClick={() => isAuthenticated ? onStart(plan.id, false) : null}
            disabled={enrolling === plan.id}
            title={!isAuthenticated ? "Sign in to start a plan" : ""}
            style={{
              height:        "44px",
              padding:       "0 var(--space-5)",
              borderRadius:  "var(--radius-full)",
              border:        isAuthenticated ? "none" : "1px solid var(--color-border)",
              background:    isAuthenticated ? "var(--gradient-gold)" : "transparent",
              color:         isAuthenticated ? "#060912" : "var(--color-muted)",
              fontFamily:    "var(--font-display)",
              fontSize:      "0.65rem",
              letterSpacing: "0.15em",
              fontWeight:    700,
              cursor:        isAuthenticated && enrolling !== plan.id ? "pointer" : "not-allowed",
              boxShadow:     isAuthenticated ? "var(--shadow-gold-sm)" : "none",
              opacity:       enrolling === plan.id ? 0.6 : 1,
              transition:    "opacity 0.15s ease",
            }}
          >
            {enrolling === plan.id
              ? "STARTING…"
              : isAuthenticated
                ? "START PLAN"
                : "SIGN IN TO START"}
          </button>
        ) : (
          <button
            onClick={() => onStart(plan.id, true)}
            style={{
              height:        "44px",
              padding:       "0 var(--space-5)",
              borderRadius:  "var(--radius-full)",
              border:        "1px solid var(--color-border)",
              background:    "transparent",
              color:         "var(--color-muted)",
              fontFamily:    "var(--font-display)",
              fontSize:      "0.65rem",
              letterSpacing: "0.15em",
              cursor:        "pointer",
            }}
          >
            VIEW PLAN
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function PlansPage() {
  const router = useRouter()

  const [plans,       setPlans]       = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [profileId,   setProfileId]   = useState(null)
  const [isAuth,      setIsAuth]      = useState(false)
  const [enrolling,   setEnrolling]   = useState(null) // plan id being enrolled
  const [filterCat,   setFilterCat]   = useState("all")
  const [filterState, setFilterState] = useState("all") // all | active | completed

  // ── Auth + load plans ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      let uid = null

      const { data: { user } } = await supabase.auth.getUser()
      if (user && !user.is_anonymous) {
        const { data: profile } = await supabase
          .from("users")
          .select("id")
          .eq("auth_id", user.id)
          .maybeSingle()

        if (profile) {
          uid = profile.id
          setProfileId(profile.id)
          setIsAuth(true)
        }
      }

      const url = uid ? `/api/plans?userId=${uid}` : "/api/plans"
      const res = await fetch(url)
      const data = await res.json()

      if (data.success) setPlans(data.plans || [])
      setPageLoading(false)
    }

    load()
  }, [])

  // ── Enroll or navigate ─────────────────────────────────────
  const handleStart = async (planId, alreadyEnrolled) => {
    if (alreadyEnrolled) {
      router.push(`/plans/${planId}`)
      return
    }

    setEnrolling(planId)
    try {
      const res = await fetch("/api/plans", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId: profileId, planId }),
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/plans/${planId}`)
      }
    } catch (err) {
      console.error("[Plans] Enroll failed:", err.message)
    } finally {
      setEnrolling(null)
    }
  }

  // ── Filtered list ──────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = [...new Set(plans.map(p => p.category).filter(Boolean))]
    return cats.sort()
  }, [plans])

  const displayed = useMemo(() => {
    let list = [...plans]

    if (filterCat !== "all") {
      list = list.filter(p => p.category === filterCat)
    }

    if (filterState === "active") {
      list = list.filter(p => p.enrollment && p.enrollment.status === "active")
    } else if (filterState === "completed") {
      list = list.filter(p => p.enrollment?.status === "completed")
    }

    // Sort: enrolled first, then curated, then by title
    list.sort((a, b) => {
      const aEnrolled = !!a.enrollment
      const bEnrolled = !!b.enrollment
      if (aEnrolled !== bEnrolled) return bEnrolled ? 1 : -1
      if (a.is_curated !== b.is_curated) return b.is_curated ? 1 : -1
      return a.title.localeCompare(b.title)
    })

    return list
  }, [plans, filterCat, filterState])

  // ── Loading ────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div style={{
        minHeight:      "100vh",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        background:     "var(--gradient-hero)",
      }}>
        <p style={{
          fontFamily: "var(--font-heading)",
          fontStyle:  "italic",
          color:      "var(--color-gold-warm)",
          fontSize:   "1rem",
        }}>
          Preparing your plans…
        </p>
      </div>
    )
  }

  const enrolled = plans.filter(p => p.enrollment && p.enrollment.status === "active")

  return (
    <div style={{
      minHeight:  "100vh",
      background: "var(--gradient-hero)",
      padding:    "var(--space-10) var(--space-5)",
    }}>
      <div style={{
        maxWidth:      "720px",
        margin:        "0 auto",
        display:       "flex",
        flexDirection: "column",
        gap:           "var(--space-6)",
      }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: "var(--space-2)" }}>
          <p style={{
            fontFamily:    "var(--font-display)",
            fontSize:      "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color:         "var(--color-gold-warm)",
            marginBottom:  "var(--space-3)",
          }}>
            Reading Plans
          </p>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize:   "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 300,
            color:      "var(--color-divine)",
            lineHeight: 1.3,
            margin:     0,
          }}>
            Walk with purpose,<br />one day at a time.
          </h1>
          <p style={{
            fontFamily:  "var(--font-body)",
            fontSize:    "0.88rem",
            color:       "var(--color-muted)",
            marginTop:   "var(--space-3)",
            lineHeight:  1.65,
          }}>
            {isAuth
              ? enrolled.length > 0
                ? `You have ${enrolled.length} active plan${enrolled.length > 1 ? "s" : ""}.`
                : "Choose a plan to begin a structured journey through Scripture."
              : "Sign in to start a plan and track your progress."}
          </p>
        </div>

        {/* ── Active plans quick-access ───────────────────────── */}
        {isAuth && enrolled.length > 0 && (
          <div style={{
            background:   "rgba(240,192,96,0.06)",
            border:       "1px solid rgba(240,192,96,0.2)",
            borderRadius: "var(--radius-xl)",
            padding:      "var(--space-4) var(--space-5)",
          }}>
            <p style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color:         "var(--color-gold-warm)",
              marginBottom:  "var(--space-3)",
            }}>
              Continue reading
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {enrolled.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => router.push(`/plans/${plan.id}`)}
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                    gap:            "var(--space-4)",
                    background:     "none",
                    border:         "none",
                    borderRadius:   "var(--radius-lg)",
                    padding:        "var(--space-2) 0",
                    cursor:         "pointer",
                    textAlign:      "left",
                    minHeight:      "44px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily:   "var(--font-heading)",
                      fontSize:     "0.9rem",
                      fontWeight:   300,
                      color:        "var(--color-divine)",
                      margin:       0,
                      whiteSpace:   "nowrap",
                      overflow:     "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {plan.title}
                    </p>
                    <ProgressBar current={plan.enrollment.current_day} total={plan.duration_days} />
                  </div>
                  <span style={{
                    fontFamily:    "var(--font-body)",
                    fontSize:      "0.68rem",
                    color:         "var(--color-muted)",
                    whiteSpace:    "nowrap",
                    flexShrink:    0,
                  }}>
                    Day {plan.enrollment.current_day} / {plan.duration_days}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="var(--color-gold-warm)" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Filters ────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          {/* Category filter */}
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            style={{
              height:       "44px",
              padding:      "0 var(--space-4)",
              background:   "rgba(13,20,40,0.8)",
              border:       "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              color:        "var(--color-soft)",
              fontFamily:   "var(--font-body)",
              fontSize:     "0.78rem",
              cursor:       "pointer",
              outline:      "none",
              flex:         "1 1 160px",
            }}
            onFocus={e  => { e.target.style.borderColor = "var(--color-gold-warm)" }}
            onBlur={e   => { e.target.style.borderColor = "var(--color-border)"    }}
          >
            <option value="all">All categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* State filter — only if authenticated */}
          {isAuth && (
            <select
              value={filterState}
              onChange={e => setFilterState(e.target.value)}
              style={{
                height:       "44px",
                padding:      "0 var(--space-4)",
                background:   "rgba(13,20,40,0.8)",
                border:       "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                color:        "var(--color-soft)",
                fontFamily:   "var(--font-body)",
                fontSize:     "0.78rem",
                cursor:       "pointer",
                outline:      "none",
                flex:         "1 1 140px",
              }}
              onFocus={e  => { e.target.style.borderColor = "var(--color-gold-warm)" }}
              onBlur={e   => { e.target.style.borderColor = "var(--color-border)"    }}
            >
              <option value="all">All plans</option>
              <option value="active">In progress</option>
              <option value="completed">Completed</option>
            </select>
          )}
        </div>

        {/* ── Plan cards ─────────────────────────────────────── */}
        {displayed.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: "var(--space-10)" }}>
            <p style={{
              fontFamily: "var(--font-heading)",
              fontSize:   "1rem",
              fontWeight: 300,
              color:      "var(--color-soft)",
            }}>
              No plans match your filters.
            </p>
            <button
              onClick={() => { setFilterCat("all"); setFilterState("all") }}
              style={{
                marginTop:     "var(--space-4)",
                background:    "none",
                border:        "1px solid var(--color-border)",
                borderRadius:  "var(--radius-full)",
                padding:       "var(--space-2) var(--space-5)",
                color:         "var(--color-muted)",
                fontFamily:    "var(--font-body)",
                fontSize:      "0.78rem",
                cursor:        "pointer",
                minHeight:     "44px",
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
            gap:                 "var(--space-5)",
          }}>
            {displayed.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onStart={handleStart}
                isAuthenticated={isAuth}
                enrolling={enrolling}
              />
            ))}
          </div>
        )}

        {/* ── Sign-in nudge ───────────────────────────────────── */}
        {!isAuth && (
          <div style={{
            textAlign:    "center",
            padding:      "var(--space-8) 0 var(--space-4)",
            borderTop:    "1px solid var(--color-border)",
          }}>
            <p style={{
              fontFamily:   "var(--font-body)",
              fontSize:     "0.82rem",
              color:        "var(--color-muted)",
              marginBottom: "var(--space-4)",
            }}>
              Sign in to start plans and track your progress.
            </p>
            <a
              href="/login"
              style={{
                background:     "var(--gradient-gold)",
                border:         "none",
                borderRadius:   "var(--radius-full)",
                padding:        "var(--space-3) var(--space-7)",
                color:          "#060912",
                fontFamily:     "var(--font-display)",
                fontSize:       "0.7rem",
                letterSpacing:  "0.15em",
                textDecoration: "none",
                display:        "inline-block",
                boxShadow:      "var(--shadow-gold-sm)",
              }}
            >
              SIGN IN
            </a>
          </div>
        )}
      </div>
    </div>
  )
}