"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

// ── Helpers ───────────────────────────────────────────────────
function durationLabel(days) {
  if (days === 365) return "1 year · 365 days"
  return `${days} day${days !== 1 ? "s" : ""}`
}

function ProgressBar({ current, total }) {
  const pct = Math.min(100, Math.round(((current - 1) / total) * 100))
  return (
    <div style={{
      height:       "4px",
      background:   "rgba(255,255,255,0.06)",
      borderRadius: "var(--radius-full)",
      overflow:     "hidden",
    }}>
      <div style={{
        height:       "100%",
        width:        `${pct}%`,
        background:   "var(--gradient-gold)",
        borderRadius: "var(--radius-full)",
        transition:   "width 0.5s ease",
      }} />
    </div>
  )
}

// ── Day row ───────────────────────────────────────────────────
function DayRow({ day, isCurrent, isCompleted, isLocked, onClick }) {
  return (
    <button
      onClick={isLocked ? undefined : onClick}
      style={{
        width:        "100%",
        minHeight:    "64px",
        padding:      "var(--space-3) var(--space-5)",
        background:   isCurrent
          ? "linear-gradient(135deg, rgba(240,192,96,0.1) 0%, rgba(240,192,96,0.04) 100%)"
          : "linear-gradient(135deg, rgba(20,29,53,0.7) 0%, rgba(13,20,40,0.7) 100%)",
        border:       `1px solid ${isCurrent
          ? "rgba(240,192,96,0.4)"
          : isCompleted
            ? "rgba(64,168,112,0.2)"
            : "var(--color-border)"}`,
        borderLeft:   `2px solid ${isCurrent
          ? "var(--color-gold-warm)"
          : isCompleted
            ? "rgba(64,168,112,0.6)"
            : "rgba(255,255,255,0.06)"}`,
        borderRadius: "var(--radius-xl)",
        display:      "flex",
        alignItems:   "center",
        gap:          "var(--space-4)",
        cursor:       isLocked ? "default" : "pointer",
        textAlign:    "left",
        transition:   "border-color 0.15s ease, background 0.15s ease",
        opacity:      isLocked ? 0.35 : 1,
      }}
    >
      {/* Day number / status icon */}
      <div style={{
        width:          "40px",
        height:         "40px",
        borderRadius:   "50%",
        border:         `1.5px solid ${isCompleted
          ? "rgba(64,168,112,0.6)"
          : isCurrent
            ? "var(--color-gold-warm)"
            : "var(--color-border)"}`,
        background:     isCompleted
          ? "rgba(64,168,112,0.1)"
          : isCurrent
            ? "rgba(240,192,96,0.08)"
            : "transparent",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     0,
      }}>
        {isCompleted ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(64,168,112,0.9)" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        ) : (
          <span style={{
            fontFamily:    "var(--font-body)",
            fontSize:      "0.72rem",
            fontWeight:    700,
            color:         isCurrent ? "var(--color-gold-warm)" : "var(--color-muted)",
            letterSpacing: "0.02em",
          }}>
            {day.day_number}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily:   "var(--font-heading)",
          fontSize:     "0.88rem",
          fontWeight:   300,
          color:        isCurrent ? "var(--color-divine)" : "var(--color-soft)",
          margin:       0,
          whiteSpace:   "nowrap",
          overflow:     "hidden",
          textOverflow: "ellipsis",
          lineHeight:   1.4,
        }}>
          {day.title}
        </p>
        {day.scripture_refs?.length > 0 && (
          <p style={{
            fontFamily:    "var(--font-body)",
            fontSize:      "0.65rem",
            color:         "var(--color-gold-warm)",
            margin:        "var(--space-1) 0 0",
            letterSpacing: "0.05em",
            opacity:       0.8,
            whiteSpace:    "nowrap",
            overflow:      "hidden",
            textOverflow:  "ellipsis",
          }}>
            {day.scripture_refs.join(" · ")}
          </p>
        )}
      </div>

      {/* Chevron for accessible days */}
      {!isLocked && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={isCurrent ? "var(--color-gold-warm)" : "var(--color-muted)"}
          strokeWidth="2" style={{ flexShrink: 0 }}>
          <path d="M9 18l6-6-6-6"/>
        </svg>
      )}
    </button>
  )
}

// ── Sidebar nav link ──────────────────────────────────────────
function SidebarLink({ href, label, icon, active }) {
  return (
    <a
      href={href}
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:            "var(--space-3)",
        padding:        "10px var(--space-4)",
        borderRadius:   "var(--radius-lg)",
        background:     active ? "rgba(240,192,96,0.08)" : "transparent",
        textDecoration: "none",
        transition:     "background 0.15s ease",
        minHeight:      "44px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <span style={{ color: active ? "var(--color-gold-warm)" : "var(--color-muted)", display: "flex" }}>
          {icon}
        </span>
        <span style={{
          fontFamily:    "var(--font-body)",
          fontSize:      "0.82rem",
          color:         active ? "var(--color-divine)" : "var(--color-muted)",
          letterSpacing: "0.01em",
        }}>
          {label}
        </span>
      </div>
      {active && (
        <div style={{
          width:        "5px",
          height:       "5px",
          borderRadius: "50%",
          background:   "var(--color-gold-warm)",
          flexShrink:   0,
        }} />
      )}
    </a>
  )
}

// ── Icons ─────────────────────────────────────────────────────
const icons = {
  companion: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  bible: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  plans: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  journey: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
}

// ── Main page ─────────────────────────────────────────────────
export default function PlanDetailPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params.id

  const [plan,        setPlan]        = useState(null)
  const [days,        setDays]        = useState([])
  const [enrollment,  setEnrollment]  = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [isAuth,      setIsAuth]      = useState(false)
  const [enrolling,   setEnrolling]   = useState(false)
  const [catchingUp,  setCatchingUp]  = useState(false)
  const [showAllDays, setShowAllDays] = useState(false)
  const [user,        setUser]        = useState(null)

  // ── Load ───────────────────────────────────────────────────
  const loadPlan = useCallback(async () => {
    const res  = await fetch(`/api/plans/${planId}`)
    const data = await res.json()

    if (!data.success) {
      router.replace("/plans")
      return
    }

    setPlan(data.plan)
    setDays(data.days || [])
    setEnrollment(data.enrollment || null)
    setPageLoading(false)
  }, [planId, router])

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser && !authUser.is_anonymous) {
        setIsAuth(true)
        setUser(authUser)
      }

      await loadPlan()
    }

    init()
  }, [loadPlan])

  // ── Enroll ─────────────────────────────────────────────────
  const handleEnroll = async () => {
    if (!isAuth) {
      router.push("/login")
      return
    }

    setEnrolling(true)
    try {
      const res = await fetch("/api/plans", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.success) {
        await loadPlan()
      }
    } catch (err) {
      console.error("[Plan Detail] Enroll failed:", err.message)
    } finally {
      setEnrolling(false)
    }
  }

  // ── Catch up ───────────────────────────────────────────────
  const handleCatchUp = async () => {
    if (!enrollment) return
    setCatchingUp(true)
    try {
      const res = await fetch("/api/plans/progress", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          userPlanId: enrollment.id,
          action:     "catch_up",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setEnrollment(prev => ({ ...prev, current_day: data.newCurrentDay }))
      }
    } catch (err) {
      console.error("[Plan Detail] Catch up failed:", err.message)
    } finally {
      setCatchingUp(false)
    }
  }

  // ── Navigate to today's day ────────────────────────────────
  const goToDay = (dayNumber) => {
    router.push(`/plans/${planId}/day/${dayNumber}`)
  }

  // ── Loading ────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div style={{
        minHeight:      "100vh",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        background:     "var(--color-void)",
      }}>
        <p style={{
          fontFamily: "var(--font-heading)",
          fontStyle:  "italic",
          color:      "var(--color-gold-warm)",
          fontSize:   "1rem",
        }}>
          Opening this plan…
        </p>
      </div>
    )
  }

  if (!plan) return null

  const currentDay    = enrollment?.current_day || 1
  const isCompleted   = enrollment?.status === "completed"
  const totalComplete = days.filter(d => d.completed).length
  const isBehind      = enrollment && !isCompleted && currentDay > 1 &&
                        totalComplete < currentDay - 1

  const visibleDays = showAllDays ? days : days.slice(0, Math.max(7, currentDay + 1))

  const navLinks = [
    { href: "/journey",       label: "Companion",   icon: icons.companion },
    { href: "/bible",         label: "Bible",        icon: icons.bible     },
    { href: "/plans",         label: "Plans",        icon: icons.plans     },
    { href: "/journey/saved", label: "Journey",      icon: icons.journey   },
    { href: "/settings",      label: "Settings",     icon: icons.settings  },
  ]

  const css = `
    .pd-layout {
      display: flex;
      min-height: 100vh;
      background: var(--color-void);
    }

    /* ── Sidebar ── */
    .pd-sidebar {
      width: 220px;
      flex-shrink: 0;
      background: rgba(255,255,255,0.015);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 10;
    }
    .pd-sidebar-logo {
      padding: var(--space-5) var(--space-5) var(--space-4);
      border-bottom: 1px solid var(--color-border);
    }
    .pd-sidebar-nav {
      flex: 1;
      padding: var(--space-4) var(--space-3);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .pd-sidebar-user {
      padding: var(--space-4) var(--space-4);
      border-top: 1px solid var(--color-border);
    }

    /* ── Main ── */
    .pd-main {
      flex: 1;
      min-width: 0;
      padding: var(--space-8) var(--space-6);
      overflow-y: auto;
    }
    .pd-content {
      max-width: 680px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    /* ── Mobile bottom nav ── */
    .pd-mobile-nav {
      display: none;
    }

    @media (max-width: 768px) {
      .pd-sidebar { display: none; }
      .pd-main {
        padding: var(--space-5) var(--space-4);
        padding-bottom: calc(58px + env(safe-area-inset-bottom) + var(--space-4));
      }
      .pd-mobile-nav {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 58px;
        background: rgba(6,9,18,0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid var(--color-border);
        z-index: 100;
        align-items: center;
        justify-content: space-around;
        padding-bottom: env(safe-area-inset-bottom);
      }
      .pd-mobile-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        min-height: 44px;
        justify-content: center;
        text-decoration: none;
        cursor: pointer;
        background: none;
        border: none;
      }
      .pd-mobile-nav-label {
        font-family: var(--font-body);
        font-size: 0.6rem;
        letter-spacing: 0.04em;
      }
    }
  `

  return (
    <>
      <style>{css}</style>
      <div className="pd-layout">

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="pd-sidebar">
          {/* Logo */}
          <div className="pd-sidebar-logo">
            <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <img
                src="/images/logo-mark.png"
                alt="Kairos"
                style={{ width: "28px", height: "28px", mixBlendMode: "screen" }}
              />
              <span style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "0.85rem",
                letterSpacing: "0.18em",
                color:         "var(--color-divine)",
              }}>
                KAIROS
              </span>
            </a>
          </div>

          {/* Nav links */}
          <nav className="pd-sidebar-nav">
            {navLinks.map(link => (
              <SidebarLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                active={link.href === "/plans"}
              />
            ))}
          </nav>

          {/* User chip */}
          <div className="pd-sidebar-user">
            {isAuth && user ? (
              <a
                href="/account"
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            "var(--space-3)",
                  textDecoration: "none",
                  padding:        "var(--space-2)",
                  borderRadius:   "var(--radius-lg)",
                  transition:     "background 0.15s ease",
                  minHeight:      "44px",
                }}
              >
                <div style={{
                  width:          "30px",
                  height:         "30px",
                  borderRadius:   "50%",
                  background:     "var(--gradient-gold)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  flexShrink:     0,
                }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", color: "#060912", fontWeight: 700 }}>
                    {(user.email?.[0] || "K").toUpperCase()}
                  </span>
                </div>
                <span style={{
                  fontFamily:   "var(--font-body)",
                  fontSize:     "0.75rem",
                  color:        "var(--color-muted)",
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:   "nowrap",
                  flex:         1,
                  minWidth:     0,
                }}>
                  {user.email}
                </span>
              </a>
            ) : (
              <a
                href="/login"
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            "var(--space-2)",
                  textDecoration: "none",
                  padding:        "var(--space-2)",
                  minHeight:      "44px",
                }}
              >
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-muted)" }}>
                  Sign in
                </span>
              </a>
            )}
          </div>
        </aside>

        {/* ── Main content ────────────────────────────────────── */}
        <main className="pd-main">
          <div className="pd-content">

            {/* ── Back link ─────────────────────────────────── */}
            <a
              href="/plans"
              style={{
                fontFamily:     "var(--font-body)",
                fontSize:       "0.7rem",
                color:          "var(--color-muted)",
                textDecoration: "none",
                letterSpacing:  "0.05em",
                display:        "inline-flex",
                alignItems:     "center",
                gap:            "var(--space-2)",
                minHeight:      "44px",
                transition:     "color 0.2s ease",
                width:          "fit-content",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-gold-warm)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-muted)")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              All plans
            </a>

            {/* ── Plan header ───────────────────────────────── */}
            <div style={{
              background:    "linear-gradient(135deg, rgba(20,29,53,0.9) 0%, rgba(13,20,40,0.9) 100%)",
              border:        "1px solid var(--color-border)",
              borderRadius:  "var(--radius-xl)",
              padding:       "var(--space-6)",
              display:       "flex",
              flexDirection: "column",
              gap:           "var(--space-4)",
            }}>
              <div style={{
                display:        "flex",
                alignItems:     "flex-start",
                justifyContent: "space-between",
                gap:            "var(--space-3)",
              }}>
                <div>
                  <p style={{
                    fontFamily:    "var(--font-display)",
                    fontSize:      "0.6rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color:         "var(--color-gold-warm)",
                    marginBottom:  "var(--space-2)",
                  }}>
                    {plan.category} · {durationLabel(plan.duration_days)}
                  </p>
                  <h1 style={{
                    fontFamily: "var(--font-heading)",
                    fontSize:   "clamp(1.3rem, 3.5vw, 2rem)",
                    fontWeight: 300,
                    color:      "var(--color-divine)",
                    lineHeight: 1.3,
                    margin:     0,
                  }}>
                    {plan.title}
                  </h1>
                </div>
              </div>

              <p style={{
                fontFamily: "var(--font-body)",
                fontSize:   "0.85rem",
                color:      "var(--color-soft)",
                lineHeight: 1.7,
                margin:     0,
              }}>
                {plan.description}
              </p>

              {/* Progress */}
              {enrollment && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  <ProgressBar current={currentDay} total={plan.duration_days} />
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize:   "0.7rem",
                    color:      "var(--color-muted)",
                    margin:     0,
                  }}>
                    {isCompleted
                      ? "Plan complete ✓"
                      : `Day ${currentDay} of ${plan.duration_days} · ${totalComplete} completed`}
                  </p>
                </div>
              )}

              {/* CTAs */}
              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                {!enrollment ? (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || !isAuth}
                    style={{
                      height:        "48px",
                      padding:       "0 var(--space-6)",
                      borderRadius:  "var(--radius-full)",
                      border:        "none",
                      background:    isAuth ? "var(--gradient-gold)" : "rgba(255,255,255,0.06)",
                      color:         isAuth ? "#060912" : "var(--color-muted)",
                      fontFamily:    "var(--font-display)",
                      fontSize:      "0.7rem",
                      letterSpacing: "0.15em",
                      fontWeight:    700,
                      cursor:        isAuth && !enrolling ? "pointer" : "not-allowed",
                      boxShadow:     isAuth ? "var(--shadow-gold-sm)" : "none",
                      opacity:       enrolling ? 0.6 : 1,
                    }}
                  >
                    {enrolling ? "STARTING…" : isAuth ? "START THIS PLAN" : "SIGN IN TO START"}
                  </button>
                ) : !isCompleted ? (
                  <>
                    <button
                      onClick={() => goToDay(currentDay)}
                      style={{
                        height:        "48px",
                        padding:       "0 var(--space-6)",
                        borderRadius:  "var(--radius-full)",
                        border:        "none",
                        background:    "var(--gradient-gold)",
                        color:         "#060912",
                        fontFamily:    "var(--font-display)",
                        fontSize:      "0.7rem",
                        letterSpacing: "0.15em",
                        fontWeight:    700,
                        cursor:        "pointer",
                        boxShadow:     "var(--shadow-gold-sm)",
                      }}
                    >
                      DAY {currentDay}
                    </button>

                    {isBehind && (
                      <button
                        onClick={handleCatchUp}
                        disabled={catchingUp}
                        style={{
                          height:        "48px",
                          padding:       "0 var(--space-5)",
                          borderRadius:  "var(--radius-full)",
                          border:        "1px solid var(--color-border)",
                          background:    "transparent",
                          color:         "var(--color-soft)",
                          fontFamily:    "var(--font-display)",
                          fontSize:      "0.65rem",
                          letterSpacing: "0.12em",
                          cursor:        catchingUp ? "not-allowed" : "pointer",
                          opacity:       catchingUp ? 0.6 : 1,
                        }}
                      >
                        {catchingUp ? "CATCHING UP…" : "CATCH ME UP"}
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{
                    height:        "48px",
                    padding:       "0 var(--space-5)",
                    borderRadius:  "var(--radius-full)",
                    border:        "1px solid rgba(64,168,112,0.4)",
                    display:       "flex",
                    alignItems:    "center",
                    color:         "#7dcf8a",
                    fontFamily:    "var(--font-display)",
                    fontSize:      "0.65rem",
                    letterSpacing: "0.12em",
                    gap:           "var(--space-2)",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    PLAN COMPLETE
                  </div>
                )}
              </div>

              {/* Catch up explanation */}
              {isBehind && (
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize:   "0.72rem",
                  color:      "var(--color-muted)",
                  margin:     0,
                  fontStyle:  "italic",
                  lineHeight: 1.6,
                }}>
                  Catch Me Up moves today forward to your next unread day — without marking skipped days complete.
                  Your progress stays honest.
                </p>
              )}
            </div>

            {/* ── Day list ──────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <p style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color:         "var(--color-muted)",
                margin:        0,
              }}>
                All days
              </p>

              {visibleDays.map(day => {
                const isCurrent = enrollment && day.day_number === currentDay && !isCompleted
                const isLocked  = enrollment && !isCompleted && day.day_number > currentDay
                return (
                  <DayRow
                    key={day.day_number}
                    day={day}
                    isCurrent={isCurrent}
                    isCompleted={day.completed}
                    isLocked={isLocked && !day.completed}
                    onClick={() => goToDay(day.day_number)}
                  />
                )
              })}

              {!showAllDays && days.length > visibleDays.length && (
                <button
                  onClick={() => setShowAllDays(true)}
                  style={{
                    width:        "100%",
                    height:       "44px",
                    background:   "none",
                    border:       "1px solid var(--color-border)",
                    borderRadius: "var(--radius-xl)",
                    color:        "var(--color-muted)",
                    fontFamily:   "var(--font-body)",
                    fontSize:     "0.78rem",
                    cursor:       "pointer",
                    transition:   "all 0.15s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--color-gold-warm)"
                    e.currentTarget.style.color       = "var(--color-gold-warm)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--color-border)"
                    e.currentTarget.style.color       = "var(--color-muted)"
                  }}
                >
                  Show all {days.length} days
                </button>
              )}
            </div>

          </div>
        </main>

        {/* ── Mobile bottom nav ───────────────────────────────── */}
        <nav className="pd-mobile-nav">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="pd-mobile-nav-item"
              style={{ color: link.href === "/plans" ? "var(--color-gold-warm)" : "var(--color-muted)" }}
            >
              {link.icon}
              <span
                className="pd-mobile-nav-label"
                style={{ color: link.href === "/plans" ? "var(--color-gold-warm)" : "var(--color-muted)" }}
              >
                {link.label}
              </span>
            </a>
          ))}
        </nav>

      </div>
    </>
  )
}