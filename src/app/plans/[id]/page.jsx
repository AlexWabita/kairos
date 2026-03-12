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
          color:        isCurrent ? "var(--color-divine)" : isCompleted ? "var(--color-soft)" : "var(--color-soft)",
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

// ── Main page ─────────────────────────────────────────────────
export default function PlanDetailPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params.id

  const [plan,        setPlan]        = useState(null)
  const [days,        setDays]        = useState([])
  const [enrollment,  setEnrollment]  = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [profileId,   setProfileId]   = useState(null)
  const [isAuth,      setIsAuth]      = useState(false)
  const [enrolling,   setEnrolling]   = useState(false)
  const [catchingUp,  setCatchingUp]  = useState(false)
  const [showAllDays, setShowAllDays] = useState(false)

  // ── Load ───────────────────────────────────────────────────
  const loadPlan = useCallback(async (uid) => {
    const url = uid ? `/api/plans/${planId}?userId=${uid}` : `/api/plans/${planId}`
    const res  = await fetch(url)
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

      await loadPlan(uid)
    }

    init()
  }, [loadPlan])

  // ── Enroll ─────────────────────────────────────────────────
  const handleEnroll = async () => {
    if (!isAuth || !profileId) {
      router.push("/login")
      return
    }

    setEnrolling(true)
    try {
      const res = await fetch("/api/plans", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId: profileId, planId }),
      })
      const data = await res.json()
      if (data.success) {
        await loadPlan(profileId)
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
          userId:     profileId,
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
        background:     "var(--gradient-hero)",
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

  // Show first 7 days + current by default, rest behind "show all"
  const visibleDays = showAllDays ? days : days.slice(0, Math.max(7, currentDay + 1))

  return (
    <div style={{
      minHeight:  "100vh",
      background: "var(--gradient-hero)",
      padding:    "var(--space-10) var(--space-5)",
    }}>
      <div style={{
        maxWidth:      "680px",
        margin:        "0 auto",
        display:       "flex",
        flexDirection: "column",
        gap:           "var(--space-6)",
      }}>

        {/* ── Back link ───────────────────────────────────────── */}
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

        {/* ── Plan header ─────────────────────────────────────── */}
        <div style={{
          background:   "linear-gradient(135deg, rgba(20,29,53,0.9) 0%, rgba(13,20,40,0.9) 100%)",
          border:       "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding:      "var(--space-6)",
          display:      "flex",
          flexDirection:"column",
          gap:          "var(--space-4)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-3)" }}>
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

                {/* Catch up — only shown if behind */}
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
              fontFamily:  "var(--font-body)",
              fontSize:    "0.72rem",
              color:       "var(--color-muted)",
              margin:      0,
              fontStyle:   "italic",
              lineHeight:  1.6,
            }}>
              Catch Me Up moves today forward to your next unread day — without marking skipped days complete.
              Your progress stays honest.
            </p>
          )}
        </div>

        {/* ── Day list ────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <p style={{
            fontFamily:    "var(--font-display)",
            fontSize:      "0.6rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color:         "var(--color-muted)",
          }}>
            All days
          </p>

          {visibleDays.map(day => {
            const isCurrent  = enrollment && day.day_number === currentDay && !isCompleted
            const isLocked   = enrollment && !isCompleted && day.day_number > currentDay
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
    </div>
  )
}