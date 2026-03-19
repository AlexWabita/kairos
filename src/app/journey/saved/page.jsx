"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter }  from "next/navigation"
import { supabase }   from "@/lib/supabase/client"
import Navbar         from "@/components/shared/Navbar"
import ConfirmModal   from "@/components/shared/ConfirmModal"

/* ══════════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════════ */
const IconPin = ({ active }) => (
  <svg width="13" height="13" viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
    <circle cx="12" cy="9" r="2.5" fill={active ? "var(--color-void)" : "none"}/>
  </svg>
)

const IconHeart = ({ active }) => (
  <svg width="13" height="13" viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

const IconChevron = ({ up }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: up ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const IconMore = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5"  cy="12" r="1.8"/>
    <circle cx="12" cy="12" r="1.8"/>
    <circle cx="19" cy="12" r="1.8"/>
  </svg>
)

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
)

const IconCompass = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
)

/* ══════════════════════════════════════════════════════════════
   ENTRY TYPE CONFIG
══════════════════════════════════════════════════════════════ */
const TYPES = {
  reflection: { label: "Reflection", color: "#a5b4fc", bg: "rgba(99,102,241,0.1)",  dot: "#6366f1" },
  prayer:     { label: "Prayer",     color: "#7ec8f0", bg: "rgba(64,144,208,0.1)",  dot: "#4090d0" },
  milestone:  { label: "Milestone",  color: "#7dcf8a", bg: "rgba(64,168,112,0.1)", dot: "#40a870" },
  question:   { label: "Question",   color: "#f0c060", bg: "rgba(240,192,96,0.1)",  dot: "#f0c060" },
  scripture:  { label: "Scripture",  color: "#d4a040", bg: "rgba(212,160,64,0.1)",  dot: "#d4a040" },
}

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest"     },
  { value: "oldest",     label: "Oldest"     },
  { value: "pinned",     label: "Pinned"     },
  { value: "favourites", label: "Favourites" },
  { value: "az",         label: "A → Z"      },
]

/* ══════════════════════════════════════════════════════════════
   TYPE BADGE
══════════════════════════════════════════════════════════════ */
function TypeBadge({ type }) {
  const t = TYPES[type] || TYPES.reflection
  return (
    <span style={{
      display:       "inline-flex",
      alignItems:    "center",
      gap:           "5px",
      background:    t.bg,
      color:         t.color,
      fontFamily:    "var(--font-display)",
      fontSize:      "0.5rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      padding:       "3px 8px",
      borderRadius:  "var(--radius-full)",
      whiteSpace:    "nowrap",
      border:        `1px solid ${t.color}22`,
    }}>
      <span style={{
        width: "5px", height: "5px",
        borderRadius: "50%",
        background: t.dot,
        flexShrink: 0,
      }} />
      {t.label}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   ACTION MENU
══════════════════════════════════════════════════════════════ */
function ActionMenu({ entry, onPin, onFavourite, onRename, onDeleteRequest, isOpen, onToggle }) {
  const menuRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onToggle()
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [isOpen, onToggle])

  const actions = [
    {
      label:   entry.is_pinned ? "Unpin" : "Pin to top",
      icon:    <IconPin active={entry.is_pinned} />,
      color:   "var(--color-gold-warm)",
      onClick: () => { onPin(entry.id, !entry.is_pinned); onToggle() },
    },
    {
      label:   entry.is_favourite ? "Unfavourite" : "Favourite",
      icon:    <IconHeart active={entry.is_favourite} />,
      color:   entry.is_favourite ? "#f08080" : "var(--color-soft)",
      onClick: () => { onFavourite(entry.id, !entry.is_favourite); onToggle() },
    },
    {
      label:   "Rename",
      icon:    <IconEdit />,
      color:   "var(--color-soft)",
      onClick: () => { onRename(); onToggle() },
    },
    {
      label:   "Delete",
      icon:    <IconTrash />,
      color:   "#f08080",
      onClick: () => { onDeleteRequest(entry.id); onToggle() },
    },
  ]

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        aria-label="More actions"
        style={{
          width:          "32px",
          height:         "32px",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          background:     isOpen ? "rgba(240,192,96,0.08)" : "transparent",
          border:         `1px solid ${isOpen ? "var(--color-border-hover)" : "transparent"}`,
          borderRadius:   "var(--radius-md)",
          color:          "var(--color-faint)",
          cursor:         "pointer",
          transition:     "all 0.15s ease",
          flexShrink:     0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-muted)"; e.currentTarget.style.borderColor = "var(--color-border)" }}
        onMouseLeave={(e) => { if (!isOpen) { e.currentTarget.style.color = "var(--color-faint)"; e.currentTarget.style.borderColor = "transparent" } }}
      >
        <IconMore />
      </button>

      {isOpen && (
        <div style={{
          position:     "absolute",
          top:          "calc(100% + 6px)",
          right:        0,
          zIndex:       100,
          background:   "var(--color-elevated)",
          border:       "1px solid var(--color-border-hover)",
          borderRadius: "var(--radius-lg)",
          padding:      "var(--space-2)",
          minWidth:     "172px",
          boxShadow:    "var(--shadow-deep)",
          animation:    "fadeUp 0.15s ease forwards",
        }}>
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={(e) => { e.stopPropagation(); action.onClick() }}
              style={{
                width:        "100%",
                display:      "flex",
                alignItems:   "center",
                gap:          "var(--space-3)",
                padding:      "var(--space-2) var(--space-3)",
                background:   "none",
                border:       "none",
                borderRadius: "var(--radius-md)",
                color:        action.color,
                fontFamily:   "var(--font-body)",
                fontSize:     "0.8rem",
                cursor:       "pointer",
                textAlign:    "left",
                transition:   "background 0.12s ease",
                minHeight:    "36px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none" }}
            >
              <span style={{ opacity: 0.8, flexShrink: 0 }}>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   ENTRY CARD
══════════════════════════════════════════════════════════════ */
function EntryCard({ entry, onPin, onFavourite, onDeleteRequest, onRename, index }) {
  const [expanded,   setExpanded]   = useState(false)
  const [editing,    setEditing]    = useState(false)
  const [titleInput, setTitleInput] = useState(entry.title || "Untitled moment")
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [hovered,    setHovered]    = useState(false)

  const t = TYPES[entry.entry_type] || TYPES.reflection

  const handleRenameSubmit = () => {
    const trimmed = titleInput.trim()
    if (trimmed && trimmed !== entry.title) onRename(entry.id, trimmed)
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter")  handleRenameSubmit()
    if (e.key === "Escape") { setTitleInput(entry.title || "Untitled moment"); setEditing(false) }
  }

  const formattedDate = new Date(entry.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   hovered
          ? "linear-gradient(135deg, rgba(28,40,69,0.9) 0%, rgba(20,29,53,0.9) 100%)"
          : "linear-gradient(135deg, rgba(20,29,53,0.7) 0%, rgba(13,20,40,0.7) 100%)",
        border:       `1px solid ${entry.is_pinned
          ? "rgba(240,192,96,0.35)"
          : hovered
            ? "var(--color-border-hover)"
            : "var(--color-border)"}`,
        borderRadius: "var(--radius-xl)",
        overflow:     "hidden",
        transition:   "all 0.25s var(--ease-sacred)",
        boxShadow:    hovered ? "var(--shadow-gold-sm)" : "none",
        opacity:      1,
        animation:    `fadeUp 0.5s var(--ease-divine) ${index * 0.04}s both`,
        position:     "relative",
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position:   "absolute",
        left:       0,
        top:        0,
        bottom:     0,
        width:      "3px",
        background: entry.is_pinned
          ? "var(--gradient-gold)"
          : entry.is_favourite
            ? "linear-gradient(180deg, #f08080, #c06060)"
            : `linear-gradient(180deg, ${t.dot}88, ${t.dot}22)`,
        transition: "background 0.25s ease",
      }} />

      <div style={{ padding: "var(--space-5) var(--space-5) var(--space-5) var(--space-6)" }}>
        {/* ── Header row ── */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)", justifyContent: "space-between" }}>

          {/* Left — title + meta */}
          <div
            style={{ flex: 1, cursor: "pointer", minWidth: 0 }}
            onClick={() => !editing && setExpanded((v) => !v)}
          >
            {editing ? (
              <input
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width:        "100%",
                  background:   "rgba(6,9,18,0.6)",
                  border:       "1px solid var(--color-gold-warm)",
                  borderRadius: "var(--radius-md)",
                  padding:      "var(--space-1) var(--space-3)",
                  color:        "var(--color-divine)",
                  fontFamily:   "var(--font-heading)",
                  fontSize:     "1rem",
                  fontWeight:   300,
                  outline:      "none",
                }}
              />
            ) : (
              <h3 style={{
                fontFamily:   "var(--font-heading)",
                fontSize:     "1rem",
                fontWeight:   400,
                color:        "var(--color-divine)",
                lineHeight:   1.4,
                margin:       0,
                overflow:     "hidden",
                textOverflow: "ellipsis",
                whiteSpace:   "nowrap",
              }}>
                {entry.title || "Untitled moment"}
              </h3>
            )}

            {/* Meta row */}
            <div style={{
              display:    "flex",
              alignItems: "center",
              flexWrap:   "wrap",
              gap:        "var(--space-2)",
              marginTop:  "var(--space-2)",
            }}>
              <TypeBadge type={entry.entry_type} />

              {entry.is_pinned && (
                <span style={{
                  display:       "inline-flex",
                  alignItems:    "center",
                  gap:           "4px",
                  fontFamily:    "var(--font-display)",
                  fontSize:      "0.48rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color:         "var(--color-gold-warm)",
                  background:    "rgba(240,192,96,0.08)",
                  padding:       "2px 7px",
                  borderRadius:  "var(--radius-full)",
                  border:        "1px solid rgba(240,192,96,0.2)",
                }}>
                  ⊙ Pinned
                </span>
              )}

              {entry.is_favourite && (
                <span style={{
                  color:      "#f08080",
                  fontSize:   "0.68rem",
                  lineHeight: 1,
                }}>♥</span>
              )}

              {/* Scripture ref */}
              {entry.scripture_ref && (
                <span style={{
                  fontFamily:    "var(--font-body)",
                  fontSize:      "0.68rem",
                  color:         "var(--color-gold-deep)",
                  letterSpacing: "0.04em",
                  fontStyle:     "italic",
                }}>
                  {entry.scripture_ref}
                </span>
              )}
            </div>
          </div>

          {/* Right — date + controls */}
          <div style={{
            display:       "flex",
            flexDirection: "column",
            alignItems:    "flex-end",
            gap:           "var(--space-2)",
            flexShrink:    0,
          }}>
            <span style={{
              fontFamily:    "var(--font-body)",
              fontSize:      "0.65rem",
              color:         "var(--color-faint)",
              letterSpacing: "0.04em",
              whiteSpace:    "nowrap",
            }}>
              {formattedDate}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
              {/* Expand */}
              <button
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? "Collapse" : "Read entry"}
                style={{
                  width:          "30px",
                  height:         "30px",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  background:     expanded ? "rgba(240,192,96,0.08)" : "transparent",
                  border:         "1px solid transparent",
                  borderRadius:   "var(--radius-md)",
                  color:          expanded ? "var(--color-gold-warm)" : "var(--color-faint)",
                  cursor:         "pointer",
                  transition:     "all 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-muted)"; e.currentTarget.style.borderColor = "var(--color-border)" }}
                onMouseLeave={(e) => { e.currentTarget.style.color = expanded ? "var(--color-gold-warm)" : "var(--color-faint)"; e.currentTarget.style.borderColor = "transparent" }}
              >
                <IconChevron up={expanded} />
              </button>

              <ActionMenu
                entry={entry}
                onPin={onPin}
                onFavourite={onFavourite}
                onRename={() => setEditing(true)}
                onDeleteRequest={onDeleteRequest}
                isOpen={menuOpen}
                onToggle={() => setMenuOpen((v) => !v)}
              />
            </div>
          </div>
        </div>

        {/* ── Expanded content ── */}
        {expanded && (
          <div style={{
            borderTop:  "1px solid var(--color-border)",
            marginTop:  "var(--space-4)",
            paddingTop: "var(--space-4)",
            animation:  "fadeUp 0.3s var(--ease-divine) forwards",
          }}>
            <p style={{
              fontFamily: "var(--font-heading)",
              fontSize:   "0.95rem",
              fontWeight: 300,
              color:      "var(--color-soft)",
              lineHeight: "var(--leading-relaxed)",
              whiteSpace: "pre-wrap",
              margin:     0,
            }}>
              {entry.content}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════════ */
function Sidebar({ entries, filterType, onFilterType }) {
  const totalPinned    = entries.filter((e) => e.is_pinned).length
  const totalFavourite = entries.filter((e) => e.is_favourite).length

  const typeCounts = useMemo(() => {
    const counts = {}
    entries.forEach((e) => {
      counts[e.entry_type] = (counts[e.entry_type] || 0) + 1
    })
    return counts
  }, [entries])

  const maxCount = Math.max(...Object.values(typeCounts), 1)

  return (
    <aside style={{
      width:         "260px",
      flexShrink:    0,
      position:      "sticky",
      top:           "88px",
      height:        "fit-content",
      display:       "flex",
      flexDirection: "column",
      gap:           "var(--space-5)",
    }}>
      {/* Brand accent */}
      <div>
        <p style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.58rem",
          letterSpacing: "0.3em",
          color:         "var(--color-gold-deep)",
          textTransform: "uppercase",
          marginBottom:  "var(--space-2)",
        }}>
          Kairos
        </p>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize:   "clamp(1.4rem, 2vw, 1.8rem)",
          fontWeight: 300,
          color:      "var(--color-divine)",
          lineHeight: 1.3,
          margin:     0,
        }}>
          Your
          <br />
          <em style={{ color: "var(--color-gold-warm)" }}>Journey</em>
        </h1>
        {entries.length > 0 && (
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize:   "0.75rem",
            color:      "var(--color-faint)",
            marginTop:  "var(--space-2)",
          }}>
            {entries.length} saved moment{entries.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Stats row */}
      {entries.length > 0 && (
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          {[
            { label: "Pinned",     value: totalPinned,    color: "var(--color-gold-warm)" },
            { label: "Favourites", value: totalFavourite, color: "#f08080"                },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex:          1,
                background:    "rgba(13,20,40,0.6)",
                border:        "1px solid var(--color-border)",
                borderRadius:  "var(--radius-lg)",
                padding:       "var(--space-3) var(--space-4)",
                textAlign:     "center",
              }}
            >
              <p style={{
                fontFamily: "var(--font-heading)",
                fontSize:   "1.5rem",
                fontWeight: 300,
                color:      stat.color,
                lineHeight: 1,
                margin:     0,
              }}>
                {stat.value}
              </p>
              <p style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "0.48rem",
                letterSpacing: "0.12em",
                color:         "var(--color-faint)",
                textTransform: "uppercase",
                marginTop:     "var(--space-1)",
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      {entries.length > 0 && (
        <div style={{ height: "1px", background: "var(--color-border)" }} />
      )}

      {/* Type filter */}
      {entries.length > 0 && (
        <div>
          <p style={{
            fontFamily:    "var(--font-display)",
            fontSize:      "0.52rem",
            letterSpacing: "0.2em",
            color:         "var(--color-muted)",
            textTransform: "uppercase",
            marginBottom:  "var(--space-3)",
          }}>
            Filter by type
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {/* All */}
            <button
              onClick={() => onFilterType("all")}
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                width:          "100%",
                background:     filterType === "all" ? "rgba(240,192,96,0.08)" : "transparent",
                border:         `1px solid ${filterType === "all" ? "rgba(240,192,96,0.25)" : "transparent"}`,
                borderRadius:   "var(--radius-md)",
                padding:        "var(--space-2) var(--space-3)",
                cursor:         "pointer",
                transition:     "all 0.15s ease",
                minHeight:      "36px",
              }}
              onMouseEnter={(e) => { if (filterType !== "all") e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
              onMouseLeave={(e) => { if (filterType !== "all") e.currentTarget.style.background = "transparent" }}
            >
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize:   "0.8rem",
                color:      filterType === "all" ? "var(--color-gold-warm)" : "var(--color-muted)",
                transition: "color 0.15s ease",
              }}>
                All moments
              </span>
              <span style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "0.58rem",
                color:         filterType === "all" ? "var(--color-gold-warm)" : "var(--color-faint)",
                letterSpacing: "0.05em",
              }}>
                {entries.length}
              </span>
            </button>

            {/* Per type */}
            {Object.entries(TYPES).map(([key, t]) => {
              const count  = typeCounts[key] || 0
              if (!count) return null
              const active = filterType === key
              const pct    = Math.round((count / maxCount) * 100)

              return (
                <button
                  key={key}
                  onClick={() => onFilterType(key)}
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                    width:          "100%",
                    background:     active ? `${t.dot}12` : "transparent",
                    border:         `1px solid ${active ? `${t.dot}33` : "transparent"}`,
                    borderRadius:   "var(--radius-md)",
                    padding:        "var(--space-2) var(--space-3)",
                    cursor:         "pointer",
                    transition:     "all 0.15s ease",
                    minHeight:      "36px",
                    position:       "relative",
                    overflow:       "hidden",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent" }}
                >
                  {/* Progress bar bg */}
                  <div style={{
                    position:     "absolute",
                    left:         0,
                    top:          0,
                    bottom:       0,
                    width:        `${pct}%`,
                    background:   `${t.dot}08`,
                    borderRadius: "var(--radius-md)",
                    transition:   "width 0.4s var(--ease-divine)",
                  }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", position: "relative" }}>
                    <span style={{
                      width: "6px", height: "6px",
                      borderRadius: "50%",
                      background: t.dot,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: "var(--font-body)",
                      fontSize:   "0.8rem",
                      color:      active ? t.color : "var(--color-muted)",
                      transition: "color 0.15s ease",
                    }}>
                      {t.label}
                    </span>
                  </div>
                  <span style={{
                    fontFamily:    "var(--font-display)",
                    fontSize:      "0.58rem",
                    color:         active ? t.color : "var(--color-faint)",
                    letterSpacing: "0.05em",
                    position:      "relative",
                  }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--color-border)" }} />

      {/* Quick links */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {[
          { label: "Open Companion",  href: "/journey",  color: "var(--color-gold-warm)" },
          { label: "Bible Reader",    href: "/bible"     },
          { label: "Reading Plans",   href: "/plans"     },
          { label: "Account",         href: "/account"   },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{
              fontFamily:     "var(--font-body)",
              fontSize:       "0.78rem",
              color:          link.color || "var(--color-faint)",
              textDecoration: "none",
              padding:        "var(--space-2) 0",
              display:        "block",
              transition:     "color 0.15s ease",
              borderBottom:   "1px solid transparent",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = link.color || "var(--color-muted)" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = link.color || "var(--color-faint)" }}
          >
            {link.label} →
          </a>
        ))}
      </div>
    </aside>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function SavedPage() {
  const router = useRouter()

  const [entries,     setEntries]     = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [profileId,   setProfileId]   = useState(null)
  const [mounted,     setMounted]     = useState(false)

  const [search,      setSearch]      = useState("")
  const [sortKey,     setSortKey]     = useState("newest")
  const [filterType,  setFilterType]  = useState("all")
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  /* ── Load ── */
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.is_anonymous) { router.replace("/login"); return }

      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle()

      if (!profile) { router.replace("/login"); return }
      setProfileId(profile.id)

      const { data: rows } = await supabase
        .from("journey_entries")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })

      setEntries(rows || [])
      setPageLoading(false)
    }
    load()
  }, [router])

  /* ── Derived list ── */
  const displayedEntries = useMemo(() => {
    let list = [...entries]
    if (filterType !== "all") list = list.filter((e) => e.entry_type === filterType)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          (e.title         || "").toLowerCase().includes(q) ||
          (e.content       || "").toLowerCase().includes(q) ||
          (e.scripture_ref || "").toLowerCase().includes(q)
      )
    }
    switch (sortKey) {
      case "oldest":
        list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break
      case "pinned":
        list.sort((a, b) => {
          if (b.is_pinned !== a.is_pinned) return (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0)
          return new Date(b.created_at) - new Date(a.created_at)
        }); break
      case "az":
        list.sort((a, b) => (a.title || "Untitled").localeCompare(b.title || "Untitled")); break
      case "favourites":
        list.sort((a, b) => {
          if (b.is_favourite !== a.is_favourite) return (b.is_favourite ? 1 : 0) - (a.is_favourite ? 1 : 0)
          return new Date(b.created_at) - new Date(a.created_at)
        }); break
      default:
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    return list
  }, [entries, search, sortKey, filterType])

  /* ── Handlers ── */
  const handlePin = async (id, val) => {
    const { error } = await supabase.from("journey_entries").update({ is_pinned: val }).eq("id", id).eq("user_id", profileId)
    if (!error) setEntries((p) => p.map((e) => e.id === id ? { ...e, is_pinned: val } : e))
  }

  const handleFavourite = async (id, val) => {
    const { error } = await supabase.from("journey_entries").update({ is_favourite: val }).eq("id", id).eq("user_id", profileId)
    if (!error) setEntries((p) => p.map((e) => e.id === id ? { ...e, is_favourite: val } : e))
  }

  const executeDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const { error } = await supabase.from("journey_entries").delete().eq("id", deleteTarget).eq("user_id", profileId)
    if (!error) setEntries((p) => p.filter((e) => e.id !== deleteTarget))
    setDeleteLoading(false)
    setDeleteTarget(null)
  }

  const handleRename = async (id, newTitle) => {
    const { error } = await supabase.from("journey_entries").update({ title: newTitle }).eq("id", id).eq("user_id", profileId)
    if (!error) setEntries((p) => p.map((e) => e.id === id ? { ...e, title: newTitle } : e))
  }

  /* ── Loading state ── */
  if (pageLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-void)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width:  "40px",
            height: "40px",
            border: "1px solid rgba(240,192,96,0.3)",
            borderTop: "1px solid var(--color-gold-warm)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto var(--space-4)",
          }} />
          <p style={{
            fontFamily: "var(--font-heading)",
            fontStyle:  "italic",
            color:      "var(--color-gold-warm)",
            fontSize:   "0.95rem",
          }}>
            Gathering your moments…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const showEmpty     = entries.length === 0
  const showNoResults = displayedEntries.length === 0 && entries.length > 0

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes spin { to { transform: rotate(360deg) } }

        .journey-layout {
          display: flex;
          gap: var(--space-8);
          align-items: flex-start;
        }
        .journey-main {
          flex: 1;
          min-width: 0;
        }
        .journey-sidebar {
          display: block;
        }

        /* Scroll behaviour */
        html { scroll-behavior: smooth; }

        /* Placeholder color */
        .journey-search::placeholder { color: var(--color-faint); }

        @media (max-width: 900px) {
          .journey-sidebar { display: none !important; }
          .journey-layout  { flex-direction: column; }
        }
      `}</style>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete this moment?"
        message="This saved moment will be permanently removed from your journey."
        detail="This cannot be undone."
        confirmLabel="DELETE"
        variant="danger"
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Page background */}
      <div style={{
        minHeight:   "100vh",
        background:  "var(--color-void)",
        position:    "relative",
        overflow:    "hidden",
      }}>
        {/* Ambient background glow */}
        <div aria-hidden="true" style={{
          position:      "fixed",
          top:           "20%",
          right:         "-10%",
          width:         "500px",
          height:        "500px",
          background:    "radial-gradient(circle, rgba(240,192,96,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div aria-hidden="true" style={{
          position:      "fixed",
          bottom:        "10%",
          left:          "-5%",
          width:         "400px",
          height:        "400px",
          background:    "radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <Navbar />

        <div style={{
          maxWidth:    "1100px",
          margin:      "0 auto",
          padding:     "calc(68px + var(--space-10)) var(--space-5) var(--space-16)",
        }}>
          <div className="journey-layout">

            {/* ── Sidebar ── */}
            <div className="journey-sidebar">
              <Sidebar
                entries={entries}
                filterType={filterType}
                onFilterType={setFilterType}
              />
            </div>

            {/* ── Main Content ── */}
            <div className="journey-main">

              {/* Search bar */}
              {entries.length > 0 && (
                <div style={{
                  marginBottom: "var(--space-5)",
                  animation:    "fadeUp 0.5s var(--ease-divine) 0.1s both",
                }}>
                  <div style={{ position: "relative" }}>
                    <span style={{
                      position:      "absolute",
                      left:          "var(--space-4)",
                      top:           "50%",
                      transform:     "translateY(-50%)",
                      color:         "var(--color-faint)",
                      pointerEvents: "none",
                      display:       "flex",
                      alignItems:    "center",
                    }}>
                      <IconSearch />
                    </span>
                    <input
                      className="journey-search"
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search your moments…"
                      style={{
                        width:        "100%",
                        background:   "rgba(13,20,40,0.6)",
                        border:       "1px solid var(--color-border)",
                        borderRadius: "var(--radius-xl)",
                        padding:      "0 var(--space-5) 0 calc(var(--space-4) + 26px)",
                        color:        "var(--color-divine)",
                        fontFamily:   "var(--font-body)",
                        fontSize:     "0.9rem",
                        outline:      "none",
                        height:       "52px",
                        boxSizing:    "border-box",
                        transition:   "border-color 0.2s ease, box-shadow 0.2s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(240,192,96,0.4)"
                        e.target.style.boxShadow   = "0 0 0 3px rgba(240,192,96,0.06)"
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--color-border)"
                        e.target.style.boxShadow   = "none"
                      }}
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        style={{
                          position:       "absolute",
                          right:          "var(--space-4)",
                          top:            "50%",
                          transform:      "translateY(-50%)",
                          background:     "none",
                          border:         "none",
                          color:          "var(--color-muted)",
                          cursor:         "pointer",
                          display:        "flex",
                          alignItems:     "center",
                          justifyContent: "center",
                          width:          "28px",
                          height:         "28px",
                          borderRadius:   "50%",
                          fontSize:       "1.1rem",
                          lineHeight:     1,
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Sort tabs */}
              {entries.length > 0 && (
                <div style={{
                  display:      "flex",
                  gap:          "var(--space-2)",
                  marginBottom: "var(--space-5)",
                  flexWrap:     "wrap",
                  animation:    "fadeUp 0.5s var(--ease-divine) 0.15s both",
                }}>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortKey(opt.value)}
                      style={{
                        background:   sortKey === opt.value
                          ? "rgba(240,192,96,0.1)"
                          : "rgba(13,20,40,0.5)",
                        border:       `1px solid ${sortKey === opt.value ? "rgba(240,192,96,0.3)" : "var(--color-border)"}`,
                        borderRadius: "var(--radius-full)",
                        padding:      "var(--space-2) var(--space-4)",
                        color:        sortKey === opt.value ? "var(--color-gold-warm)" : "var(--color-muted)",
                        fontFamily:   "var(--font-body)",
                        fontSize:     "0.75rem",
                        cursor:       "pointer",
                        transition:   "all 0.2s ease",
                        minHeight:    "34px",
                        whiteSpace:   "nowrap",
                      }}
                      onMouseEnter={(e) => { if (sortKey !== opt.value) e.currentTarget.style.borderColor = "var(--color-border-hover)" }}
                      onMouseLeave={(e) => { if (sortKey !== opt.value) e.currentTarget.style.borderColor = "var(--color-border)" }}
                    >
                      {opt.label}
                    </button>
                  ))}

                  {/* Result count */}
                  {displayedEntries.length !== entries.length && (
                    <span style={{
                      marginLeft:    "auto",
                      fontFamily:    "var(--font-body)",
                      fontSize:      "0.72rem",
                      color:         "var(--color-faint)",
                      display:       "flex",
                      alignItems:    "center",
                      paddingRight:  "var(--space-2)",
                    }}>
                      {displayedEntries.length} of {entries.length}
                    </span>
                  )}
                </div>
              )}

              {/* ── Empty state ── */}
              {showEmpty && (
                <div style={{
                  textAlign:  "center",
                  paddingTop: "var(--space-16)",
                  animation:  "fadeUp 0.6s var(--ease-divine) 0.2s both",
                }}>
                  <div style={{
                    width:          "64px",
                    height:         "64px",
                    borderRadius:   "50%",
                    background:     "rgba(240,192,96,0.06)",
                    border:         "1px solid rgba(240,192,96,0.15)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    margin:         "0 auto var(--space-5)",
                    color:          "var(--color-gold-deep)",
                  }}>
                    <IconCompass />
                  </div>
                  <h2 style={{
                    fontFamily:   "var(--font-heading)",
                    fontSize:     "1.3rem",
                    fontWeight:   300,
                    color:        "var(--color-soft)",
                    marginBottom: "var(--space-3)",
                  }}>
                    Your journey begins with a single moment.
                  </h2>
                  <p style={{
                    fontFamily:   "var(--font-body)",
                    fontSize:     "0.85rem",
                    color:        "var(--color-muted)",
                    maxWidth:     "360px",
                    margin:       "0 auto var(--space-8)",
                    lineHeight:   1.7,
                  }}>
                    When something in your conversation touches something real,
                    save it here. This is your personal record.
                  </p>
                  <a
                    href="/journey"
                    className="kairos-btn-primary"
                    style={{ textDecoration: "none", fontSize: "0.85rem" }}
                  >
                    Open Companion
                  </a>
                </div>
              )}

              {/* ── No search results ── */}
              {showNoResults && (
                <div style={{
                  textAlign:  "center",
                  paddingTop: "var(--space-10)",
                  animation:  "fadeUp 0.4s var(--ease-divine) both",
                }}>
                  <p style={{
                    fontFamily:   "var(--font-heading)",
                    fontSize:     "1rem",
                    fontWeight:   300,
                    color:        "var(--color-soft)",
                    marginBottom: "var(--space-4)",
                  }}>
                    No moments match your search.
                  </p>
                  <button
                    onClick={() => { setSearch(""); setFilterType("all") }}
                    style={{
                      background:   "none",
                      border:       "1px solid var(--color-border)",
                      borderRadius: "var(--radius-full)",
                      padding:      "var(--space-2) var(--space-5)",
                      color:        "var(--color-muted)",
                      fontFamily:   "var(--font-body)",
                      fontSize:     "0.78rem",
                      cursor:       "pointer",
                      transition:   "all 0.2s ease",
                      minHeight:    "40px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-gold-warm)"
                      e.currentTarget.style.color       = "var(--color-gold-warm)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)"
                      e.currentTarget.style.color       = "var(--color-muted)"
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {/* ── Entry list ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {displayedEntries.map((entry, i) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    index={i}
                    onPin={handlePin}
                    onFavourite={handleFavourite}
                    onDeleteRequest={(id) => setDeleteTarget(id)}
                    onRename={handleRename}
                  />
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}