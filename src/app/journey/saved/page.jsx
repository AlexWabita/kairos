"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter }  from "next/navigation"
import { supabase }   from "@/lib/supabase/client"
import ConfirmModal   from "@/components/shared/ConfirmModal"

/* ── Icons ───────────────────────────────────────────────── */
function IconPin({ active }) {
  // Thumbtack / pin shape — distinct from favourite star
  return (
    <svg width="14" height="14" viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill={active ? "var(--color-void)" : "none"}/>
    </svg>
  )
}

function IconHeart({ active }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

function IconChevron({ up }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: up ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function IconMore() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5"  cy="12" r="2"/>
      <circle cx="12" cy="12" r="2"/>
      <circle cx="19" cy="12" r="2"/>
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  )
}

/* ── Entry type badge ────────────────────────────────────── */
const TYPE_STYLES = {
  reflection: { bg: "rgba(99,102,241,0.12)",  color: "#a5b4fc", label: "Reflection" },
  prayer:     { bg: "rgba(64,144,208,0.12)",  color: "#7ec8f0", label: "Prayer"     },
  milestone:  { bg: "rgba(64,168,112,0.12)",  color: "#7dcf8a", label: "Milestone"  },
  question:   { bg: "rgba(240,192,96,0.12)",  color: "#f0c060", label: "Question"   },
  scripture:  { bg: "rgba(220,180,120,0.12)", color: "#d4a040", label: "Scripture"  },
}

function TypeBadge({ type }) {
  const s = TYPE_STYLES[type] || TYPE_STYLES.reflection
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
      {s.label}
    </span>
  )
}

/* ── Overflow action menu (mobile + desktop) ─────────────── */
function ActionMenu({ entry, onPin, onFavourite, onRename, onDeleteRequest, isOpen, onToggle }) {
  const menuRef = useRef(null)

  // Close on outside click
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
      label:   entry.is_pinned ? "Unpin"     : "Pin to top",
      icon:    <IconPin active={entry.is_pinned} />,
      color:   "var(--color-gold-warm)",
      onClick: () => { onPin(entry.id, !entry.is_pinned); onToggle() },
    },
    {
      label:   entry.is_favourite ? "Unfavourite" : "Add to favourites",
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
      {/* Trigger button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        aria-label="More actions"
        style={{
          width:          "44px",
          height:         "44px",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          background:     isOpen ? "rgba(240,192,96,0.08)" : "none",
          border:         `1px solid ${isOpen ? "var(--color-border-hover)" : "transparent"}`,
          borderRadius:   "var(--radius-md)",
          color:          "var(--color-muted)",
          cursor:         "pointer",
          transition:     "all 0.15s ease",
          flexShrink:     0,
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.color = "var(--color-soft)"
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.color = "var(--color-muted)"
        }}
      >
        <IconMore />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div style={{
          position:     "absolute",
          top:          "calc(100% + 6px)",
          right:        0,
          zIndex:       50,
          background:   "linear-gradient(135deg, rgba(20,29,53,0.98) 0%, rgba(13,20,40,0.98) 100%)",
          border:       "1px solid var(--color-border-hover)",
          borderRadius: "var(--radius-lg)",
          padding:      "var(--space-2)",
          minWidth:     "180px",
          boxShadow:    "var(--shadow-deep)",
          animation:    "fadeUp 0.15s ease forwards",
        }}>
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={(e) => { e.stopPropagation(); action.onClick() }}
              style={{
                width:       "100%",
                display:     "flex",
                alignItems:  "center",
                gap:         "var(--space-3)",
                padding:     "var(--space-3) var(--space-4)",
                background:  "none",
                border:      "none",
                borderRadius: "var(--radius-md)",
                color:       action.color,
                fontFamily:  "var(--font-body)",
                fontSize:    "0.82rem",
                cursor:      "pointer",
                textAlign:   "left",
                transition:  "background 0.15s ease",
                minHeight:   "44px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none" }}
            >
              <span style={{ opacity: 0.85, flexShrink: 0 }}>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Single entry card ───────────────────────────────────── */
function EntryCard({ entry, onPin, onFavourite, onDeleteRequest, onRename }) {
  const [expanded,   setExpanded]   = useState(false)
  const [editing,    setEditing]    = useState(false)
  const [titleInput, setTitleInput] = useState(entry.title || "Untitled moment")
  const [menuOpen,   setMenuOpen]   = useState(false)

  const handleRenameSubmit = () => {
    const trimmed = titleInput.trim()
    if (trimmed && trimmed !== entry.title) {
      onRename(entry.id, trimmed)
    }
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter")  handleRenameSubmit()
    if (e.key === "Escape") {
      setTitleInput(entry.title || "Untitled moment")
      setEditing(false)
    }
  }

  const formattedDate = new Date(entry.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  })

  return (
    <div style={{
      background:   "linear-gradient(135deg, rgba(20,29,53,0.8) 0%, rgba(13,20,40,0.8) 100%)",
      border:       `1px solid ${entry.is_pinned ? "rgba(240,192,96,0.4)" : "var(--color-border)"}`,
      borderLeft:   `2px solid ${entry.is_pinned
        ? "var(--color-gold-warm)"
        : entry.is_favourite
          ? "rgba(240,100,100,0.5)"
          : "rgba(240,192,96,0.2)"}`,
      borderRadius: "var(--radius-xl)",
      padding:      "var(--space-4) var(--space-5)",
      boxShadow:    "var(--shadow-card)",
      transition:   "all 0.3s ease",
      position:     "relative",
    }}>

      {/* ── Card header row ────────────────────────────── */}
      <div style={{
        display:        "flex",
        alignItems:     "flex-start",
        justifyContent: "space-between",
        gap:            "var(--space-3)",
      }}>

        {/* Left: title + meta */}
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
                fontSize:     "0.95rem",
                fontWeight:   300,
                outline:      "none",
              }}
            />
          ) : (
            <p style={{
              fontFamily:   "var(--font-heading)",
              fontSize:     "0.95rem",
              fontWeight:   300,
              color:        "var(--color-divine)",
              lineHeight:   1.4,
              margin:       0,
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}>
              {entry.title || "Untitled moment"}
            </p>
          )}

          {/* Meta row: date + badges */}
          <div style={{
            display:    "flex",
            alignItems: "center",
            flexWrap:   "wrap",
            gap:        "var(--space-2)",
            marginTop:  "var(--space-1)",
          }}>
            <span style={{
              fontFamily:    "var(--font-body)",
              fontSize:      "0.65rem",
              color:         "var(--color-muted)",
              letterSpacing: "0.04em",
              whiteSpace:    "nowrap",
            }}>
              {formattedDate}
            </span>
            <TypeBadge type={entry.entry_type} />
            {entry.is_pinned && (
              <span style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "0.5rem",
                letterSpacing: "0.1em",
                color:         "var(--color-gold-warm)",
                textTransform: "uppercase",
              }}>
                Pinned
              </span>
            )}
            {entry.is_favourite && (
              <span style={{ color: "#f08080", fontSize: "0.7rem" }}>♥</span>
            )}
          </div>

          {/* Scripture ref */}
          {entry.scripture_ref && (
            <p style={{
              fontFamily:    "var(--font-body)",
              fontSize:      "0.68rem",
              color:         "var(--color-gold-warm)",
              letterSpacing: "0.06em",
              marginTop:     "var(--space-2)",
              opacity:       0.85,
            }}>
              {entry.scripture_ref}
            </p>
          )}
        </div>

        {/* Right: expand chevron + overflow menu */}
        <div style={{
          display:    "flex",
          alignItems: "center",
          gap:        "var(--space-1)",
          flexShrink: 0,
          marginTop:  "-4px",
        }}>
          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse" : "Read full moment"}
            style={{
              width:          "44px",
              height:         "44px",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              background:     "none",
              border:         "1px solid transparent",
              borderRadius:   "var(--radius-md)",
              color:          "var(--color-muted)",
              cursor:         "pointer",
              transition:     "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-soft)" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-muted)" }}
          >
            <IconChevron up={expanded} />
          </button>

          {/* ⋯ overflow menu */}
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

      {/* ── Expanded content ──────────────────────────────── */}
      {expanded && (
        <div style={{
          borderTop:   "1px solid var(--color-border)",
          marginTop:   "var(--space-4)",
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

/* ── Sort / Filter controls ──────────────────────────────── */
function ControlBar({ search, onSearch, sortKey, onSort, filterType, onFilterType }) {
  const SORT_OPTIONS = [
    { value: "newest",    label: "Newest first"   },
    { value: "oldest",    label: "Oldest first"   },
    { value: "pinned",    label: "Pinned first"   },
    { value: "az",        label: "A → Z"          },
    { value: "favourites",label: "Favourites"     },
  ]

  const FILTER_OPTIONS = [
    { value: "all",        label: "All types"   },
    { value: "reflection", label: "Reflections" },
    { value: "prayer",     label: "Prayers"     },
    { value: "milestone",  label: "Milestones"  },
    { value: "question",   label: "Questions"   },
    { value: "scripture",  label: "Scripture"   },
  ]

  const selectStyle = {
    background:    "rgba(13,20,40,0.8)",
    border:        "1px solid var(--color-border)",
    borderRadius:  "var(--radius-lg)",
    padding:       "0 var(--space-4)",
    color:         "var(--color-soft)",
    fontFamily:    "var(--font-body)",
    fontSize:      "0.78rem",
    cursor:        "pointer",
    outline:       "none",
    height:        "44px",
    transition:    "border-color 0.2s ease",
    flexShrink:    0,
  }

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      gap:           "var(--space-3)",
    }}>
      {/* Search */}
      <div style={{ position: "relative" }}>
        <span style={{
          position:   "absolute",
          left:       "var(--space-4)",
          top:        "50%",
          transform:  "translateY(-50%)",
          color:      "var(--color-muted)",
          pointerEvents: "none",
          display:    "flex",
          alignItems: "center",
        }}>
          <IconSearch />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search your moments…"
          style={{
            width:        "100%",
            background:   "rgba(13,20,40,0.8)",
            border:       "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding:      "0 var(--space-5) 0 calc(var(--space-4) + 24px)",
            color:        "var(--color-divine)",
            fontFamily:   "var(--font-body)",
            fontSize:     "0.85rem",
            outline:      "none",
            height:       "48px",
            transition:   "border-color 0.2s ease, box-shadow 0.2s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-gold-warm)"
            e.target.style.boxShadow   = "0 0 0 3px rgba(240,192,96,0.1)"
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border)"
            e.target.style.boxShadow   = "none"
          }}
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            style={{
              position:       "absolute",
              right:          "var(--space-3)",
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
              fontSize:       "1rem",
              lineHeight:     1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-soft)" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-muted)" }}
          >
            ×
          </button>
        )}
      </div>

      {/* Sort + Filter row */}
      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <select
          value={sortKey}
          onChange={(e) => onSort(e.target.value)}
          style={{ ...selectStyle, flex: "1 1 140px" }}
          onFocus={(e)  => { e.target.style.borderColor = "var(--color-gold-warm)" }}
          onBlur={(e)   => { e.target.style.borderColor = "var(--color-border)"    }}
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => onFilterType(e.target.value)}
          style={{ ...selectStyle, flex: "1 1 140px" }}
          onFocus={(e)  => { e.target.style.borderColor = "var(--color-gold-warm)" }}
          onBlur={(e)   => { e.target.style.borderColor = "var(--color-border)"    }}
        >
          {FILTER_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

/* ── Main Saved Page ─────────────────────────────────────── */
export default function SavedPage() {
  const router = useRouter()

  const [entries,     setEntries]     = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [profileId,   setProfileId]   = useState(null)

  // Controls
  const [search,      setSearch]      = useState("")
  const [sortKey,     setSortKey]     = useState("newest")
  const [filterType,  setFilterType]  = useState("all")

  // Delete confirm
  const [deleteTarget,  setDeleteTarget]  = useState(null)  // entry id
  const [deleteLoading, setDeleteLoading] = useState(false)

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
        .order("created_at", { ascending: false })

      setEntries(rows || [])
      setPageLoading(false)
    }

    load()
  }, [router])

  // ── Derived list — search + sort + filter in memory ────
  const displayedEntries = useMemo(() => {
    let list = [...entries]

    // Filter by type
    if (filterType !== "all") {
      list = list.filter((e) => e.entry_type === filterType)
    }

    // Filter by search (title + content)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          (e.title    || "").toLowerCase().includes(q) ||
          (e.content  || "").toLowerCase().includes(q) ||
          (e.scripture_ref || "").toLowerCase().includes(q)
      )
    }

    // Sort
    switch (sortKey) {
      case "oldest":
        list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case "pinned":
        list.sort((a, b) => {
          if (b.is_pinned !== a.is_pinned) return (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0)
          return new Date(b.created_at) - new Date(a.created_at)
        })
        break
      case "az":
        list.sort((a, b) =>
          (a.title || "Untitled").localeCompare(b.title || "Untitled")
        )
        break
      case "favourites":
        list.sort((a, b) => {
          if (b.is_favourite !== a.is_favourite)
            return (b.is_favourite ? 1 : 0) - (a.is_favourite ? 1 : 0)
          return new Date(b.created_at) - new Date(a.created_at)
        })
        break
      case "newest":
      default:
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
    }

    return list
  }, [entries, search, sortKey, filterType])

  // ── Pin / unpin ─────────────────────────────────────────
  const handlePin = async (id, newValue) => {
    const { error } = await supabase
      .from("journey_entries")
      .update({ is_pinned: newValue })
      .eq("id", id)
      .eq("user_id", profileId)

    if (!error) {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_pinned: newValue } : e))
      )
    }
  }

  // ── Favourite / unfavourite ─────────────────────────────
  const handleFavourite = async (id, newValue) => {
    const { error } = await supabase
      .from("journey_entries")
      .update({ is_favourite: newValue })
      .eq("id", id)
      .eq("user_id", profileId)

    if (!error) {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_favourite: newValue } : e))
      )
    }
  }

  // ── Delete (called after confirm) ──────────────────────
  const executeDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)

    const { error } = await supabase
      .from("journey_entries")
      .delete()
      .eq("id", deleteTarget)
      .eq("user_id", profileId)

    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget))
    }

    setDeleteLoading(false)
    setDeleteTarget(null)
  }

  // ── Rename title ────────────────────────────────────────
  const handleRename = async (id, newTitle) => {
    const { error } = await supabase
      .from("journey_entries")
      .update({ title: newTitle })
      .eq("id", id)
      .eq("user_id", profileId)

    if (!error) {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, title: newTitle } : e))
      )
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

  const showNoResults = displayedEntries.length === 0 && entries.length > 0
  const showEmpty     = entries.length === 0

  return (
    <>
      {/* ── Delete confirmation ─────────────────────────── */}
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
                minHeight:      "44px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-gold-warm)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
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
                {entries.length} moment{entries.length !== 1 ? "s" : ""}
                {displayedEntries.length !== entries.length
                  ? ` · ${displayedEntries.length} shown`
                  : ""}
              </p>
            )}
          </div>

          {/* ── Search / Sort / Filter controls ──────────── */}
          {entries.length > 0 && (
            <ControlBar
              search={search}
              onSearch={setSearch}
              sortKey={sortKey}
              onSort={setSortKey}
              filterType={filterType}
              onFilterType={setFilterType}
            />
          )}

          {/* ── Empty state — no moments saved yet ────────── */}
          {showEmpty && (
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

          {/* ── No results from search / filter ──────────── */}
          {showNoResults && (
            <div style={{
              textAlign:  "center",
              paddingTop: "var(--space-10)",
            }}>
              <p style={{
                fontFamily:   "var(--font-heading)",
                fontSize:     "1rem",
                fontWeight:   300,
                color:        "var(--color-soft)",
                marginBottom: "var(--space-3)",
              }}>
                No moments match your search.
              </p>
              <button
                onClick={() => { setSearch(""); setFilterType("all") }}
                style={{
                  background:    "none",
                  border:        "1px solid var(--color-border)",
                  borderRadius:  "var(--radius-full)",
                  padding:       "var(--space-2) var(--space-5)",
                  color:         "var(--color-muted)",
                  fontFamily:    "var(--font-body)",
                  fontSize:      "0.78rem",
                  cursor:        "pointer",
                  transition:    "all 0.2s ease",
                  minHeight:     "44px",
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

          {/* ── Entry list ────────────────────────────────── */}
          {displayedEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onPin={handlePin}
              onFavourite={handleFavourite}
              onDeleteRequest={(id) => setDeleteTarget(id)}
              onRename={handleRename}
            />
          ))}

        </div>
      </div>
    </>
  )
}