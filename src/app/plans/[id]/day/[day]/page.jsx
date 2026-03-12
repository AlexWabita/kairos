"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

// ── Scripture pill ────────────────────────────────────────────
function ScripturePill({ ref: scriptureRef, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        height:        "36px",
        padding:       "0 var(--space-4)",
        borderRadius:  "var(--radius-full)",
        border:        "1px solid rgba(240,192,96,0.3)",
        background:    "rgba(240,192,96,0.06)",
        color:         "var(--color-gold-warm)",
        fontFamily:    "var(--font-body)",
        fontSize:      "0.78rem",
        fontWeight:    500,
        cursor:        "pointer",
        letterSpacing: "0.03em",
        transition:    "all 0.15s ease",
        whiteSpace:    "nowrap",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background   = "rgba(240,192,96,0.12)"
        e.currentTarget.style.borderColor  = "rgba(240,192,96,0.5)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background   = "rgba(240,192,96,0.06)"
        e.currentTarget.style.borderColor  = "rgba(240,192,96,0.3)"
      }}
    >
      {scriptureRef}
    </button>
  )
}

// ── Section label ─────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p style={{
      fontFamily:    "var(--font-display)",
      fontSize:      "0.58rem",
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color:         "var(--color-muted)",
      margin:        0,
    }}>
      {children}
    </p>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function DayPage() {
  const router  = useRouter()
  const params  = useParams()
  const planId  = params.id
  const dayNum  = parseInt(params.day, 10)

  const [plan,        setPlan]        = useState(null)
  const [day,         setDay]         = useState(null)
  const [enrollment,  setEnrollment]  = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [profileId,   setProfileId]   = useState(null)
  const [userPlanId,  setUserPlanId]  = useState(null)

  const [completing,     setCompleting]     = useState(false)
  const [completed,      setCompleted]      = useState(false)
  const [noteSaved,      setNoteSaved]      = useState(false)

  // personalNotes = what the user writes in "My notes for today"
  // This is distinct from kairosReflection (the AI response from /journey)
  const [personalNotes,    setPersonalNotes]    = useState("")
  const [notesOpen,        setNotesOpen]        = useState(false)

  // ── Load ───────────────────────────────────────────────────
  const loadDay = useCallback(async (uid) => {
    const url = uid
      ? `/api/plans/${planId}?userId=${uid}`
      : `/api/plans/${planId}`
    const res  = await fetch(url)
    const data = await res.json()

    if (!data.success) {
      router.replace("/plans")
      return
    }

    setPlan(data.plan)
    setEnrollment(data.enrollment || null)

    if (data.enrollment) {
      setUserPlanId(data.enrollment.id)
    }

    const foundDay = (data.days || []).find(d => d.day_number === dayNum)
    if (!foundDay) {
      router.replace(`/plans/${planId}`)
      return
    }

    setDay(foundDay)
    setCompleted(foundDay.completed || false)
    setPageLoading(false)
  }, [planId, dayNum, router])

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
        }
      }

      await loadDay(uid)
    }

    init()
  }, [loadDay])

  // ── Complete day ───────────────────────────────────────────
  const handleComplete = async () => {
    if (!userPlanId || !profileId || completing || completed) return
    setCompleting(true)

    try {
      const res = await fetch("/api/plans/progress", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          userId:           profileId,
          userPlanId,
          action:           "complete",
          dayNumber:        dayNum,
          kairosReflection: null,                              // AI reflection comes from /journey, not here
          personalNotes:    personalNotes.trim() || null,      // Option B — saved to journey_entries
          planTitle:        plan?.title || null,
          dayTitle:         day?.title  || null,
          scriptureRefs:    day?.scripture_refs?.join(", ") || null,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setCompleted(true)
        if (data.noteSavedToJourney) setNoteSaved(true)

        if (data.planCompleted) {
          setTimeout(() => router.push(`/plans/${planId}`), 1800)
        }
      }
    } catch (err) {
      console.error("[Day] Complete failed:", err.message)
    } finally {
      setCompleting(false)
    }
  }

  // ── Ask Kairos ─────────────────────────────────────────────
  const handleAskKairos = () => {
    if (!day) return
    const ctx = `I am on Day ${dayNum} of the "${plan?.title}" reading plan.\n\nToday's scripture: ${day.scripture_refs?.join(", ")}\n\nDevotional:\n${day.devotional_text}\n\nToday's reflection prompt: ${day.reflection_prompt || ""}`
    try { sessionStorage.setItem("kairos_verse_context", ctx) } catch (_) {}
    router.push("/journey")
  }

  // ── Open scripture in Bible reader ─────────────────────────
  const openInBible = (ref) => {
    router.push("/bible")
  }

  // ── Navigation between days ────────────────────────────────
  const hasPrev      = dayNum > 1
  const hasNext      = plan && dayNum < plan.duration_days
  const isCurrentDay = enrollment && enrollment.current_day === dayNum
  const isPastDay    = enrollment && dayNum < enrollment.current_day

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
          Preparing today's reading…
        </p>
      </div>
    )
  }

  if (!day || !plan) return null

  return (
    <div style={{
      minHeight:  "100vh",
      background: "var(--gradient-hero)",
      padding:    "var(--space-10) var(--space-5) var(--space-16)",
    }}>
      <div style={{
        maxWidth:      "640px",
        margin:        "0 auto",
        display:       "flex",
        flexDirection: "column",
        gap:           "var(--space-8)",
      }}>

        {/* ── Back link ───────────────────────────────────────── */}
        <a
          href={`/plans/${planId}`}
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
          {plan.title}
        </a>

        {/* ── Day header ──────────────────────────────────────── */}
        <div>
          <p style={{
            fontFamily:    "var(--font-display)",
            fontSize:      "0.6rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color:         "var(--color-gold-warm)",
            marginBottom:  "var(--space-2)",
          }}>
            Day {dayNum} of {plan.duration_days}
          </p>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize:   "clamp(1.4rem, 4vw, 2.1rem)",
            fontWeight: 300,
            color:      "var(--color-divine)",
            lineHeight: 1.3,
            margin:     0,
          }}>
            {day.title}
          </h1>

          {completed && (
            <div style={{
              display:       "inline-flex",
              alignItems:    "center",
              gap:           "var(--space-2)",
              marginTop:     "var(--space-3)",
              color:         "#7dcf8a",
              fontFamily:    "var(--font-body)",
              fontSize:      "0.72rem",
              letterSpacing: "0.04em",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Completed
              {noteSaved && (
                <span style={{ color: "var(--color-gold-warm)", marginLeft: "var(--space-2)" }}>
                  · Notes saved to Journey
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Scripture references ─────────────────────────────── */}
        {day.scripture_refs?.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <SectionLabel>Today's Scripture</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
              {day.scripture_refs.map((ref, i) => (
                <ScripturePill
                  key={i}
                  ref={ref}
                  onClick={() => openInBible(ref)}
                />
              ))}
            </div>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize:   "0.7rem",
              color:      "var(--color-muted)",
              margin:     0,
              fontStyle:  "italic",
            }}>
              Tap a reference to open it in the Bible reader.
            </p>
          </div>
        )}

        {/* ── Devotional text ──────────────────────────────────── */}
        <div style={{
          background:    "linear-gradient(135deg, rgba(20,29,53,0.7) 0%, rgba(13,20,40,0.7) 100%)",
          border:        "1px solid var(--color-border)",
          borderLeft:    "2px solid var(--color-gold-warm)",
          borderRadius:  "var(--radius-xl)",
          padding:       "var(--space-6)",
          display:       "flex",
          flexDirection: "column",
          gap:           "var(--space-5)",
        }}>
          <SectionLabel>Devotional</SectionLabel>
          <div>
            {day.devotional_text.split("\n\n").map((para, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize:   "var(--text-body-lg)",
                  fontWeight: 300,
                  color:      "var(--color-divine)",
                  lineHeight: "var(--leading-relaxed)",
                  margin:     i === 0 ? 0 : "var(--space-4) 0 0",
                  whiteSpace: "pre-wrap",
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* ── Reflection prompt ────────────────────────────────── */}
        {day.reflection_prompt && (
          <div style={{
            background:    "rgba(99,102,241,0.06)",
            border:        "1px solid rgba(99,102,241,0.2)",
            borderRadius:  "var(--radius-xl)",
            padding:       "var(--space-5)",
            display:       "flex",
            flexDirection: "column",
            gap:           "var(--space-3)",
          }}>
            <SectionLabel>Reflection</SectionLabel>
            <p style={{
              fontFamily: "var(--font-heading)",
              fontSize:   "1rem",
              fontWeight: 300,
              color:      "var(--color-divine)",
              lineHeight: 1.65,
              margin:     0,
              fontStyle:  "italic",
            }}>
              {day.reflection_prompt}
            </p>
          </div>
        )}

        {/* ── Prayer prompt ────────────────────────────────────── */}
        {day.prayer_prompt && (
          <div style={{
            background:    "rgba(240,192,96,0.04)",
            border:        "1px solid rgba(240,192,96,0.15)",
            borderRadius:  "var(--radius-xl)",
            padding:       "var(--space-5)",
            display:       "flex",
            flexDirection: "column",
            gap:           "var(--space-3)",
          }}>
            <SectionLabel>Prayer</SectionLabel>
            <p style={{
              fontFamily: "var(--font-heading)",
              fontSize:   "1rem",
              fontWeight: 300,
              color:      "var(--color-divine)",
              lineHeight: 1.75,
              margin:     0,
              fontStyle:  "italic",
              opacity:    0.9,
            }}>
              {day.prayer_prompt}
            </p>
          </div>
        )}

        {/* ── Ask Kairos ───────────────────────────────────────── */}
        <div style={{
          background:    "rgba(13,20,40,0.6)",
          border:        "1px solid var(--color-border)",
          borderRadius:  "var(--radius-xl)",
          padding:       "var(--space-5)",
          display:       "flex",
          flexDirection: "column",
          gap:           "var(--space-3)",
        }}>
          <SectionLabel>Go deeper</SectionLabel>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize:   "0.82rem",
            color:      "var(--color-soft)",
            lineHeight: 1.6,
            margin:     0,
          }}>
            Bring today's reading to Kairos for a guided reflection — your companion will
            receive the full context of this day's devotional.
          </p>
          <button
            onClick={handleAskKairos}
            style={{
              height:        "48px",
              padding:       "0 var(--space-5)",
              borderRadius:  "var(--radius-full)",
              border:        "none",
              background:    "var(--gradient-gold)",
              color:         "#060912",
              fontFamily:    "var(--font-display)",
              fontSize:      "0.68rem",
              letterSpacing: "0.15em",
              fontWeight:    700,
              cursor:        "pointer",
              boxShadow:     "var(--shadow-gold-sm)",
              display:       "inline-flex",
              alignItems:    "center",
              gap:           "var(--space-2)",
              alignSelf:     "flex-start",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            REFLECT WITH KAIROS
          </button>
        </div>

        {/* ── Personal notes ───────────────────────────────────── */}
        {profileId && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <button
              onClick={() => setNotesOpen(v => !v)}
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                width:          "100%",
                background:     "none",
                border:         "none",
                cursor:         "pointer",
                padding:        0,
                minHeight:      "44px",
              }}
            >
              <SectionLabel>My notes for today</SectionLabel>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-muted)" strokeWidth="2"
                style={{
                  transform:  notesOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  flexShrink: 0,
                }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {notesOpen && (
              <>
                <textarea
                  value={personalNotes}
                  onChange={e => setPersonalNotes(e.target.value)}
                  placeholder="Write your reflection, observations, or what God is speaking to you through this…"
                  rows={5}
                  style={{
                    width:        "100%",
                    background:   "rgba(13,20,40,0.8)",
                    border:       "1px solid var(--color-border)",
                    borderRadius: "var(--radius-xl)",
                    padding:      "var(--space-4)",
                    color:        "var(--color-divine)",
                    fontFamily:   "var(--font-heading)",
                    fontSize:     "0.9rem",
                    fontWeight:   300,
                    lineHeight:   1.7,
                    resize:       "none",
                    outline:      "none",
                    boxSizing:    "border-box",
                    transition:   "border-color 0.15s ease",
                    animation:    "fadeUp 0.2s ease forwards",
                  }}
                  onFocus={e => { e.target.style.borderColor = "var(--color-gold-warm)" }}
                  onBlur={e  => { e.target.style.borderColor = "var(--color-border)"    }}
                />
                {personalNotes.trim().length > 0 && !completed && (
                  <p style={{
                    fontFamily:  "var(--font-body)",
                    fontSize:    "0.7rem",
                    color:       "var(--color-muted)",
                    margin:      0,
                    fontStyle:   "italic",
                  }}>
                    Your notes will be saved to your Journey when you complete the day.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Complete day CTA ─────────────────────────────────── */}
        {profileId && !completed && (isCurrentDay || isPastDay) && (
          <div style={{
            position:       "sticky",
            bottom:         "var(--space-6)",
            display:        "flex",
            justifyContent: "center",
            paddingTop:     "var(--space-4)",
          }}>
            <button
              onClick={handleComplete}
              disabled={completing}
              style={{
                height:        "56px",
                padding:       "0 var(--space-10)",
                borderRadius:  "var(--radius-full)",
                border:        "none",
                background:    "var(--gradient-gold)",
                color:         "#060912",
                fontFamily:    "var(--font-display)",
                fontSize:      "0.72rem",
                letterSpacing: "0.18em",
                fontWeight:    700,
                cursor:        completing ? "not-allowed" : "pointer",
                boxShadow:     "var(--shadow-gold)",
                opacity:       completing ? 0.7 : 1,
                transition:    "opacity 0.15s ease",
              }}
            >
              {completing ? "SAVING…" : "COMPLETE DAY " + dayNum}
            </button>
          </div>
        )}

        {/* Completed — next day nudge */}
        {completed && hasNext && (
          <div style={{
            textAlign:     "center",
            paddingTop:    "var(--space-4)",
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           "var(--space-4)",
          }}>
            <p style={{
              fontFamily: "var(--font-heading)",
              fontSize:   "0.9rem",
              fontWeight: 300,
              color:      "var(--color-soft)",
              fontStyle:  "italic",
              margin:     0,
            }}>
              Well done. Return tomorrow for day {dayNum + 1}.
            </p>
            <button
              onClick={() => router.push(`/plans/${planId}`)}
              style={{
                height:        "44px",
                padding:       "0 var(--space-6)",
                borderRadius:  "var(--radius-full)",
                border:        "1px solid var(--color-border)",
                background:    "transparent",
                color:         "var(--color-soft)",
                fontFamily:    "var(--font-display)",
                fontSize:      "0.65rem",
                letterSpacing: "0.12em",
                cursor:        "pointer",
              }}
            >
              BACK TO PLAN
            </button>
          </div>
        )}

        {/* Plan complete message */}
        {completed && !hasNext && (
          <div style={{
            textAlign:     "center",
            paddingTop:    "var(--space-4)",
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           "var(--space-4)",
          }}>
            <p style={{
              fontFamily: "var(--font-heading)",
              fontSize:   "1.1rem",
              fontWeight: 300,
              color:      "var(--color-divine)",
              lineHeight: 1.6,
              margin:     0,
            }}>
              You have completed this plan.
            </p>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize:   "0.82rem",
              color:      "var(--color-muted)",
              lineHeight: 1.65,
              margin:     0,
            }}>
              Every step was an act of faithfulness. Well done.
            </p>
            <a
              href="/plans"
              style={{
                height:        "48px",
                padding:       "0 var(--space-7)",
                borderRadius:  "var(--radius-full)",
                border:        "none",
                background:    "var(--gradient-gold)",
                color:         "#060912",
                fontFamily:    "var(--font-display)",
                fontSize:      "0.68rem",
                letterSpacing: "0.15em",
                fontWeight:    700,
                cursor:        "pointer",
                boxShadow:     "var(--shadow-gold-sm)",
                display:       "inline-flex",
                alignItems:    "center",
                textDecoration:"none",
              }}
            >
              EXPLORE MORE PLANS
            </a>
          </div>
        )}

        {/* ── Prev / Next nav ──────────────────────────────────── */}
        <nav style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          paddingTop:     "var(--space-4)",
          borderTop:      "1px solid var(--color-border)",
          gap:            "var(--space-4)",
        }}>
          <button
            onClick={() => router.push(`/plans/${planId}/day/${dayNum - 1}`)}
            disabled={!hasPrev}
            style={{
              height:       "44px",
              padding:      "0 var(--space-4)",
              borderRadius: "var(--radius-md)",
              border:       "1px solid var(--color-border)",
              background:   "transparent",
              color:        "var(--color-soft)",
              fontFamily:   "var(--font-body)",
              fontSize:     "0.82rem",
              cursor:       hasPrev ? "pointer" : "not-allowed",
              opacity:      hasPrev ? 1 : 0.3,
              display:      "flex",
              alignItems:   "center",
              gap:          "var(--space-2)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            Day {dayNum - 1}
          </button>

          <button
            onClick={() => router.push(`/plans/${planId}/day/${dayNum + 1}`)}
            disabled={!hasNext || (!completed && !isPastDay)}
            style={{
              height:       "44px",
              padding:      "0 var(--space-4)",
              borderRadius: "var(--radius-md)",
              border:       "1px solid var(--color-border)",
              background:   "transparent",
              color:        "var(--color-soft)",
              fontFamily:   "var(--font-body)",
              fontSize:     "0.82rem",
              cursor:       hasNext && (completed || isPastDay) ? "pointer" : "not-allowed",
              opacity:      hasNext && (completed || isPastDay) ? 1 : 0.3,
              display:      "flex",
              alignItems:   "center",
              gap:          "var(--space-2)",
            }}
          >
            Day {dayNum + 1}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </nav>

      </div>
    </div>
  )
}