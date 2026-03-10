"use client"

import { useState, useEffect } from "react"
import { useRouter }           from "next/navigation"
import { supabase }            from "@/lib/supabase/client"

/* ── Pin icon ────────────────────────────────────────────── */
function PinIcon({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24"
      fill={filled ? "var(--color-gold-warm)" : "none"}
      stroke="var(--color-gold-warm)" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
}

/* ── Single entry card ───────────────────────────────────── */
function EntryCard({ entry, onPin, onDelete, onRename }) {
  const [expanded,    setExpanded]    = useState(false)
  const [editing,     setEditing]     = useState(false)
  const [titleInput,  setTitleInput]  = useState(entry.title || "Untitled moment")
  const [deleting,    setDeleting]    = useState(false)
  const [pinning,     setPinning]     = useState(false)

  const handleRenameSubmit = () => {
    const trimmed = titleInput.trim()
    if (!trimmed) return
    onRename(entry.id, trimmed)
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter")  handleRenameSubmit()
    if (e.key === "Escape") {
      setTitleInput(entry.title || "Untitled moment")
      setEditing(false)
    }
  }

  const handlePin = async () => {
    setPinning(true)
    await onPin(entry.id, !entry.is_pinned)
    setPinning(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(entry.id)
  }

  const formattedDate = new Date(entry.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  })

  return (
    <div style={{
      background:   "linear-gradient(135deg, rgba(20,29,53,0.8) 0%, rgba(13,20,40,0.8) 100%)",
      border:       `1px solid ${entry.is_pinned ? "rgba(240,192,96,0.4)" : "var(--color-border)"}`,
      borderLeft:   `2px solid ${entry.is_pinned ? "var(--color-gold-warm)" : "rgba(240,192,96,0.2)"}`,
      borderRadius: "var(--radius-xl)",
      padding:      "var(--space-5)",
      boxShadow:    "var(--shadow-card)",
      opacity:      deleting ? 0.4 : 1,
      transition:   "all 0.3s ease",
    }}>

      {/* ── Card header ──────────────────────────────────── */}
      <div style={{
        display:        "flex",
        alignItems:     "flex-start",
        justifyContent: "space-between",
        gap:            "var(--space-3)",
        marginBottom:   entry.scripture_ref || expanded ? "var(--space-3)" : 0,
      }}>
        <div style={{ flex: 1 }}>
          {editing ? (
            <input
              autoFocus
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              style={{
                width:        "100%",
                background:   "rgba(6,9,18,0.6)",
                border:       "1px solid var(--color-gold-warm)",
                borderRadius: "var(--radius-md)",
                padding:      "var(--space-1) var(--space-3)",
                color:        "var(--color-divine)",
                fontFamily:   "var(--font-heading)",
                fontSize:     "0.95rem",
                fontWeight:   300,
                outline:      "none",
              }}
            />
          ) : (
            <p
              onClick={() => setExpanded(e => !e)}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize:   "0.95rem",
                fontWeight: 300,
                color:      "var(--color-divine)",
                cursor:     "pointer",
                lineHeight: 1.4,
                margin:     0,
              }}
            >
              {entry.title || "Untitled moment"}
            </p>
          )}

          <p style={{
            fontFamily:   "var(--font-body)",
            fontSize:     "0.65rem",
            color:        "var(--color-muted)",
            marginTop:    "var(--space-1)",
            letterSpacing: "0.05em",
          }}>
            {formattedDate}
          </p>
        </div>

        {/* ── Action buttons ────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexShrink: 0 }}>
          {/* Pin */}
          <button
            onClick={handlePin}
            disabled={pinning}
            title={entry.is_pinned ? "Unpin" : "Pin"}
            style={{
              background: "none",
              border:     "none",
              padding:    "2px",
              cursor:     pinning ? "wait" : "pointer",
              opacity:    entry.is_pinned ? 1 : 0.4,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = entry.is_pinned ? "1" : "0.4"}
          >
            <PinIcon filled={entry.is_pinned} />
          </button>

          {/* Rename */}
          <button
            onClick={() => setEditing(true)}
            title="Rename"
            style={{
              background: "none",
              border:     "none",
              padding:    "2px",
              cursor:     "pointer",
              opacity:    0.4,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-muted)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
            style={{
              background: "none",
              border:     "none",
              padding:    "2px",
              cursor:     deleting ? "wait" : "pointer",
              opacity:    0.4,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="#f08080" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(e => !e)}
            title={expanded ? "Collapse" : "Read"}
            style={{
              background: "none",
              border:     "none",
              padding:    "2px",
              cursor:     "pointer",
              opacity:    0.4,
              transition: "all 0.2s ease",
              transform:  expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-muted)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Scripture ref ─────────────────────────────────── */}
      {entry.scripture_ref && (
        <p style={{
          fontFamily:    "var(--font-body)",
          fontSize:      "0.7rem",
          color:         "var(--color-gold-warm)",
          letterSpacing: "0.08em",
          marginBottom:  expanded ? "var(--space-4)" : 0,
          opacity:       0.8,
        }}>
          {entry.scripture_ref}
        </p>
      )}

      {/* ── Expanded content ──────────────────────────────── */}
      {expanded && (
        <div style={{
          borderTop:   "1px solid var(--color-border)",
          paddingTop:  "var(--space-4)",
          animation:   "fadeUp 0.3s ease forwards",
        }}>
          <p style={{
            fontFamily: "var(--font-heading)",
            fontSize:   "var(--text-body-lg)",
            fontWeight: 300,
            color:      "var(--color-divine)",
            lineHeight: "var(--leading-relaxed)",
            whiteSpace: "pre-wrap",
            margin:     0,
          }}>
            {entry.content}
          </p>
        </div>
      )}
    </div>
  )
}

/* ── Main Saved Page ─────────────────────────────────────── */
export default function SavedPage() {
  const router = useRouter()

  const [entries,     setEntries]     = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [profileId,   setProfileId]   = useState(null)

  // ── Load user + entries ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || user.is_anonymous) {
        router.replace("/login")
        return
      }

      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle()

      if (!profile) {
        router.replace("/login")
        return
      }

      setProfileId(profile.id)

      const { data: rows } = await supabase
        .from("journey_entries")
        .select("*")
        .eq("user_id", profile.id)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })

      setEntries(rows || [])
      setPageLoading(false)
    }

    load()
  }, [router])

  // ── Pin / unpin ─────────────────────────────────────────
  const handlePin = async (id, newValue) => {
    const { error } = await supabase
      .from("journey_entries")
      .update({ is_pinned: newValue })
      .eq("id", id)
      .eq("user_id", profileId)

    if (!error) {
      setEntries(prev =>
        [...prev.map(e => e.id === id ? { ...e, is_pinned: newValue } : e)]
          .sort((a, b) => {
            if (b.is_pinned !== a.is_pinned) return b.is_pinned - a.is_pinned
            return new Date(b.created_at) - new Date(a.created_at)
          })
      )
    }
  }

  // ── Delete entry ────────────────────────────────────────
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("journey_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", profileId)

    if (!error) {
      setEntries(prev => prev.filter(e => e.id !== id))
    }
  }

  // ── Rename title ────────────────────────────────────────
  const handleRename = async (id, newTitle) => {
    const { error } = await supabase
      .from("journey_entries")
      .update({ title: newTitle })
      .eq("id", id)
      .eq("user_id", profileId)

    if (!error) {
      setEntries(prev => prev.map(e => e.id === id ? { ...e, title: newTitle } : e))
    }
  }

  // ── Loading ─────────────────────────────────────────────
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
          Gathering your moments…
        </p>
      </div>
    )
  }

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
        gap:           "var(--space-5)",
      }}>

        {/* ── Header ───────────────────────────────────── */}
        <div style={{ marginBottom: "var(--space-2)" }}>
          <a
            href="/account"
            style={{
              fontFamily:     "var(--font-body)",
              fontSize:       "0.7rem",
              color:          "var(--color-muted)",
              textDecoration: "none",
              letterSpacing:  "0.05em",
              display:        "inline-flex",
              alignItems:     "center",
              gap:            "var(--space-2)",
              marginBottom:   "var(--space-5)",
              transition:     "color 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--color-gold-warm)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--color-muted)"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to account
          </a>

          <p style={{
            fontFamily:    "var(--font-display)",
            fontSize:      "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color:         "var(--color-gold-warm)",
            marginBottom:  "var(--space-3)",
          }}>
            Your journey
          </p>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize:   "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 300,
            color:      "var(--color-divine)",
            lineHeight: 1.3,
          }}>
            Saved moments
          </h1>
          {entries.length > 0 && (
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize:   "0.8rem",
              color:      "var(--color-muted)",
              marginTop:  "var(--space-2)",
            }}>
              {entries.length} moment{entries.length !== 1 ? "s" : ""} — click a title to read, star to pin
            </p>
          )}
        </div>

        {/* ── Empty state ───────────────────────────────── */}
        {entries.length === 0 && (
          <div style={{
            textAlign:  "center",
            paddingTop: "var(--space-16)",
          }}>
            <p style={{
              fontFamily:   "var(--font-heading)",
              fontSize:     "1.1rem",
              fontWeight:   300,
              color:        "var(--color-soft)",
              lineHeight:   1.6,
              marginBottom: "var(--space-6)",
            }}>
              Nothing saved yet.
            </p>
            <p style={{
              fontFamily:   "var(--font-body)",
              fontSize:     "0.85rem",
              color:        "var(--color-muted)",
              marginBottom: "var(--space-8)",
            }}>
              When a moment in your conversation touches something real, save it here.
            </p>
            <a
              href="/journey"
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
              OPEN COMPANION
            </a>
          </div>
        )}

        {/* ── Entry list ────────────────────────────────── */}
        {entries.map(entry => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onPin={handlePin}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        ))}

      </div>
    </div>
  )
}