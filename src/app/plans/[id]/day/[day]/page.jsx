"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { BIBLE_BOOKS } from "@/lib/bible/client"

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
        e.currentTarget.style.background  = "rgba(240,192,96,0.12)"
        e.currentTarget.style.borderColor = "rgba(240,192,96,0.5)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background  = "rgba(240,192,96,0.06)"
        e.currentTarget.style.borderColor = "rgba(240,192,96,0.3)"
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
export default function DayPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params.id
  const dayNum = parseInt(params.day, 10)

  const [plan,        setPlan]        = useState(null)
  const [day,         setDay]         = useState(null)
  const [enrollment,  setEnrollment]  = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [userPlanId,  setUserPlanId]  = useState(null)
  const [authUser,    setAuthUser]    = useState(null)

  const [completing,    setCompleting]    = useState(false)
  const [completed,     setCompleted]     = useState(false)
  const [noteSaved,     setNoteSaved]     = useState(false)
  const [personalNotes, setPersonalNotes] = useState("")
  const [notesOpen,     setNotesOpen]     = useState(false)

  // ── Load ───────────────────────────────────────────────────
  const loadDay = useCallback(async () => {
    const res  = await fetch(`/api/plans/${planId}`)
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
      const { data: { user } } = await supabase.auth.getUser()

      if (user && !user.is_anonymous) {
        setAuthUser(user)
      }

      await loadDay()
    }

    init()
  }, [loadDay])

  // ── Complete day ───────────────────────────────────────────
  const handleComplete = async () => {
    if (!userPlanId || !authUser || completing || completed) return
    setCompleting(true)

    try {
      const res = await fetch("/api/plans/progress", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          userPlanId,
          action:           "complete",
          dayNumber:        dayNum,
          kairosReflection: null,
          personalNotes:    personalNotes.trim() || null,
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

// ── Parse verse reference e.g. "John 3:16" → {bookId: "JHN", chapter: 3, verse: 16}
// ── Open scripture in Bible reader ─────────────────────────
  const parseAndOpenInBible = (refStr) => {
    // Normalize: trim, replace "1st/2nd/3rd" → "1/2/3"
    const normalized = refStr.replace(/(\d+)(st|nd|rd|th)/gi, "$1").trim()
    
    // Handle "John 8:36" → bookName="John", chapter=8, verse=36
    // Also handles "John 3", "John 3:16-18"
    const match = normalized.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/i)
    if (!match) {
      router.push("/bible")
      return
    }
    
    const [, bookName, chapterStr, verseStartStr, verseEndStr] = match
    const chapter = parseInt(chapterStr, 10)
    
    // Find book - exact or partial match, handle common abbreviations
    const bookNameClean = bookName.trim().toLowerCase()
    const book = BIBLE_BOOKS.find(b => {
      const bookLower = b.name.toLowerCase()
      return bookLower === bookNameClean || 
             bookLower.startsWith(bookNameClean) || 
             bookNameClean.startsWith(bookLower)
    })
    
    if (!book) {
      console.warn(`Book not found for "${bookName}"`)
      router.push("/bible")
      return
    }
    
    console.log(`Navigating to: /bible?book=${book.id}&chapter=${chapter}&verse=${verseStartStr}`)
    
    // Build search params - ?book=JHN&chapter=8&verse=36
    const params = new URLSearchParams({ 
      book: book.id, 
      chapter: chapter.toString() 
    })
    if (verseStartStr) {
      params.append("verse", verseStartStr)
    }
    
    router.push(`/bible?${params.toString()}`)
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
        background:     "var(--color-void)",
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

  const navLinks = [
    { href: "/journey",       label: "Companion", icon: icons.companion },
    { href: "/bible",         label: "Bible",     icon: icons.bible     },
    { href: "/plans",         label: "Plans",     icon: icons.plans     },
    { href: "/journey/saved", label: "Journey",   icon: icons.journey   },
    { href: "/settings",      label: "Settings",  icon: icons.settings  },
  ]

  const css = `
    .dp-layout {
      display: flex;
      min-height: 100vh;
      background: var(--color-void);
    }

    /* ── Sidebar ── */
    .dp-sidebar {
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
    .dp-sidebar-logo {
      padding: var(--space-5) var(--space-5) var(--space-4);
      border-bottom: 1px solid var(--color-border);
    }
    .dp-sidebar-nav {
      flex: 1;
      padding: var(--space-4) var(--space-3);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .dp-sidebar-user {
      padding: var(--space-4);
      border-top: 1px solid var(--color-border);
    }

    /* ── Main ── */
    .dp-main {
      flex: 1;
      min-width: 0;
      padding: var(--space-8) var(--space-6) var(--space-16);
      overflow-y: auto;
    }
    .dp-content {
      max-width: 640px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }

    /* ── Complete CTA — sticky above mobile nav ── */
    .dp-complete-wrap {
      position: sticky;
      bottom: var(--space-6);
      display: flex;
      justify-content: center;
      padding-top: var(--space-4);
    }

    /* ── Mobile bottom nav ── */
    .dp-mobile-nav {
      display: none;
    }

    @media (max-width: 768px) {
      .dp-sidebar { display: none; }
      .dp-main {
        padding: var(--space-5) var(--space-4);
        padding-bottom: calc(58px + env(safe-area-inset-bottom) + var(--space-16));
      }
      .dp-complete-wrap {
        bottom: calc(58px + env(safe-area-inset-bottom) + var(--space-4));
      }
      .dp-mobile-nav {
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
      .dp-mobile-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        min-height: 44px;
        justify-content: center;
        text-decoration: none;
        background: none;
        border: none;
        cursor: pointer;
      }
      .dp-mobile-nav-label {
        font-family: var(--font-body);
        font-size: 0.6rem;
        letter-spacing: 0.04em;
      }
    }
  `

  return (
    <>
      <style>{css}</style>
      <div className="dp-layout">

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="dp-sidebar">
          <div className="dp-sidebar-logo">
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

          <nav className="dp-sidebar-nav">
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

          <div className="dp-sidebar-user">
            {authUser ? (
              <a
                href="/account"
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            "var(--space-3)",
                  textDecoration: "none",
                  padding:        "var(--space-2)",
                  borderRadius:   "var(--radius-lg)",
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
                    {(authUser.email?.[0] || "K").toUpperCase()}
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
                  {authUser.email}
                </span>
              </a>
            ) : (
              <a
                href="/login"
                style={{
                  display:        "flex",
                  alignItems:     "center",
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
        <main className="dp-main">
          <div className="dp-content">

            {/* ── Back link ─────────────────────────────────── */}
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
              {plan.title}
            </a>

            {/* ── Day header ────────────────────────────────── */}
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

            {/* ── Scripture references ──────────────────────── */}
            {day.scripture_refs?.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <SectionLabel>Today's Scripture</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                  {day.scripture_refs.map((ref, i) => (
                    <ScripturePill
                      key={i}
                      ref={ref}
                      onClick={() => parseAndOpenInBible(ref)}
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

            {/* ── Devotional text ───────────────────────────── */}
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

            {/* ── Reflection prompt ─────────────────────────── */}
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

            {/* ── Prayer prompt ─────────────────────────────── */}
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

            {/* ── Ask Kairos ────────────────────────────────── */}
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

            {/* ── Personal notes ────────────────────────────── */}
            {authUser && (
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
                        fontFamily: "var(--font-body)",
                        fontSize:   "0.7rem",
                        color:      "var(--color-muted)",
                        margin:     0,
                        fontStyle:  "italic",
                      }}>
                        Your notes will be saved to your Journey when you complete the day.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Complete day CTA ──────────────────────────── */}
            {authUser && !completed && (isCurrentDay || isPastDay) && (
              <div className="dp-complete-wrap">
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
                    height:         "48px",
                    padding:        "0 var(--space-6)",
                    borderRadius:   "var(--radius-full)",
                    border:         "none",
                    background:     "var(--gradient-gold)",
                    color:          "#060912",
                    fontFamily:     "var(--font-display)",
                    fontSize:       "0.68rem",
                    letterSpacing:  "0.15em",
                    fontWeight:     700,
                    cursor:         "pointer",
                    boxShadow:      "var(--shadow-gold-sm)",
                    display:        "inline-flex",
                    alignItems:     "center",
                    textDecoration: "none",
                  }}
                >
                  EXPLORE MORE PLANS
                </a>
              </div>
            )}

            {/* ── Prev / Next nav ───────────────────────────── */}
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
        </main>

        {/* ── Mobile bottom nav ───────────────────────────────── */}
        <nav className="dp-mobile-nav">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="dp-mobile-nav-item"
              style={{ color: link.href === "/plans" ? "var(--color-gold-warm)" : "var(--color-muted)" }}
            >
              {link.icon}
              <span
                className="dp-mobile-nav-label"
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