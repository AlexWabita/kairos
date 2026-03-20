"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter }  from "next/navigation"
import { supabase }   from "@/lib/supabase/client"
import ConfirmModal   from "@/components/shared/ConfirmModal"

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const css = `
  @keyframes fadeIn    { from{opacity:0}                          to{opacity:1}              }
  @keyframes slideUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sheetUp   { from{transform:translateY(100%)}          to{transform:translateY(0)}            }
  @keyframes spin      { to{transform:rotate(360deg)}                                        }

  /* ── Layout ── */
  .js-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: calc(100vh - 64px);
  }

  /* ── Sidebar ── */
  .js-sidebar {
    position: sticky;
    top: 64px;
    height: calc(100vh - 64px);
    overflow-y: auto;
    overflow-x: hidden;
    border-right: 1px solid rgba(255,255,255,0.06);
    padding: 28px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    scrollbar-width: none;
    background: rgba(8,10,18,0.6);
    backdrop-filter: blur(12px);
  }
  .js-sidebar::-webkit-scrollbar { display: none; }

  /* ── Main ── */
  .js-main { padding: 32px 32px 80px; min-width: 0; }

  /* ── Grid ── */
  .js-grid { display: flex; flex-direction: column; gap: 2px; }

  /* ── Sidebar filter btn ── */
  .js-filter-btn {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: 9px 12px; border: none; border-radius: 8px;
    background: transparent; cursor: pointer; transition: background 0.15s ease;
    text-align: left; min-height: 38px;
  }
  .js-filter-btn:hover  { background: rgba(255,255,255,0.05); }
  .js-filter-btn.active { background: rgba(255,255,255,0.08); }


  /* ── Entry card ── */
  .js-entry {
    position: relative; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  .js-entry:hover       { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); }
  .js-entry.pinned      { border-color: rgba(240,192,96,0.25); }
  .js-entry.pinned:hover{ border-color: rgba(240,192,96,0.45); }

  /* ── Action menu ── */
  .js-menu {
    position: absolute; top: calc(100% + 4px); right: 0; z-index: 9999;
    min-width: 168px; background: #16181f;
    border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
    padding: 4px; box-shadow: 0 16px 40px rgba(0,0,0,0.5);
    animation: slideUp 0.12s ease forwards;
  }
  .js-menu-item {
    display: flex; align-items: center; gap: 10px; width: 100%;
    padding: 8px 12px; border: none; border-radius: 7px; background: transparent;
    font-family: var(--font-body); font-size: 0.82rem; cursor: pointer;
    text-align: left; transition: background 0.1s ease; min-height: 36px;
  }
  .js-menu-item:hover { background: rgba(255,255,255,0.06); }

  /* ── Search ── */
  .js-search {
    width: 100%; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
    padding: 0 44px; color: var(--color-divine);
    font-family: var(--font-body); font-size: 0.9rem;
    outline: none; height: 46px; box-sizing: border-box;
    transition: border-color 0.2s ease;
  }
  .js-search::placeholder { color: rgba(255,255,255,0.2); }
  .js-search:focus { border-color: rgba(255,255,255,0.18); }

  /* ── Divider ── */
  .js-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 8px 0; }

  /* ── Section label ── */
  .js-section-label {
    font-family: var(--font-display); font-size: 0.5rem;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(255,255,255,0.25); padding: 6px 12px 4px;
  }

  /* ════════════════════════════════════════════════
     MOBILE — bottom sheet pattern
     Hidden on desktop, shown on ≤ 860px
  ════════════════════════════════════════════════ */
  .js-mobile-header { display: none; }
  .js-mobile-toolbar{ display: none; }
  .js-mobile-only   { display: none; }   /* generic mobile-only block element */
  .js-desktop-sorts { display: flex; }

  /* Bottom sheet overlay */
  .js-sheet-overlay {
    display: none;
    position: fixed; inset: 0; z-index: 800;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }
  .js-sheet-overlay.open { display: block; }

  /* Bottom sheet panel */
  .js-sheet {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 801;
    background: #0f1117;
    border-top: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px 20px 0 0;
    padding: 0 0 max(env(safe-area-inset-bottom), 16px);
    max-height: 82vh;
    overflow-y: auto;
    animation: sheetUp 0.28s cubic-bezier(0.32,0.72,0,1) forwards;
  }
  .js-sheet::-webkit-scrollbar { display: none; }

  /* Sheet handle */
  .js-sheet-handle {
    width: 36px; height: 4px; border-radius: 2px;
    background: rgba(255,255,255,0.15);
    margin: 12px auto 20px; display: block;
  }

  /* Sheet pill option */
  .js-sheet-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 100px; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.08);
    background: transparent;
    font-family: var(--font-body); font-size: 0.8rem;
    white-space: nowrap; transition: all 0.15s ease;
    min-height: 38px;
    color: rgba(255,255,255,0.5);
  }
  .js-sheet-pill.active {
    border-color: rgba(240,192,96,0.4);
    background: rgba(240,192,96,0.08);
    color: var(--color-gold-warm);
  }

  /* Active filter chips bar */
  .js-active-chips {
    display: none;
    gap: 6px;
    overflow-x: auto;
    padding: 0 0 2px;
    scrollbar-width: none;
    margin-bottom: 10px;
  }
  .js-active-chips::-webkit-scrollbar { display: none; }

  @media (max-width: 860px) {
    .js-layout           { grid-template-columns: 1fr; }
    .js-sidebar          { display: none; }
    .js-main             { padding: 20px 16px 100px; }
    .js-mobile-header    { display: flex; }
    .js-mobile-toolbar   { display: flex; }
    .js-mobile-only      { display: block; }
    .js-desktop-sorts    { display: none !important; }
    .js-active-chips     { display: flex; }
  }

  @media (max-width: 480px) {
    .js-main { padding: 16px 12px 100px; }
  }

  /* ── Mobile bottom nav ── */
  .js-mobile-bottom-nav {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 58px;
    background: rgba(8,10,18,0.96);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(255,255,255,0.07);
    z-index: 100;
    align-items: center;
    justify-content: space-around;
    padding-bottom: env(safe-area-inset-bottom);
  }
  @media (max-width: 860px) {
    .js-mobile-bottom-nav { display: flex; }
    /* Extra bottom padding so last entry isn't hidden behind nav */
    .js-main { padding-bottom: calc(100px + env(safe-area-inset-bottom)) !important; }
  }
`

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const TYPES = {
  reflection: { label: "Reflection", color: "#a5b4fc", dot: "#6366f1" },
  prayer:     { label: "Prayer",     color: "#7ec8f0", dot: "#4090d0" },
  milestone:  { label: "Milestone",  color: "#7dcf8a", dot: "#40a870" },
  question:   { label: "Question",   color: "#f0c060", dot: "#d4a830" },
  scripture:  { label: "Scripture",  color: "#d4a040", dot: "#b8861e" },
}

const SORTS = [
  { value: "newest",     label: "Newest"     },
  { value: "oldest",     label: "Oldest"     },
  { value: "pinned",     label: "Pinned"     },
  { value: "favourites", label: "Favourites" },
  { value: "az",         label: "A → Z"      },
]

/* ─────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────── */
const Ico = {
  Search:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  Pin:     (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill={p.on?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  Heart:   (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill={p.on?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Edit:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Chevron: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform:p.up?"rotate(180deg)":"none",transition:"transform 0.2s ease"}}><polyline points="6 9 12 15 18 9"/></svg>,
  More:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>,
  Compass: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  X:       () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Filter:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Sort:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M7 12h10M11 18h2"/></svg>,
}

/* ─────────────────────────────────────────────────────────────
   TYPE BADGE
───────────────────────────────────────────────────────────── */
function TypeBadge({ type }) {
  const t = TYPES[type] || TYPES.reflection
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 100,
      background: `${t.dot}18`, border: `1px solid ${t.dot}30`,
      color: t.color, fontFamily: "var(--font-display)",
      fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: t.dot, flexShrink: 0 }} />
      {t.label}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   BOTTOM SHEET — mobile filter/sort
───────────────────────────────────────────────────────────── */
function BottomSheet({ isOpen, onClose, entries, filterType, setFilterType, sortKey, setSortKey }) {
  const sheetRef = useRef(null)

  // Close on overlay click
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  if (!isOpen) return null

  const typeCounts = {}
  entries.forEach(e => { typeCounts[e.entry_type] = (typeCounts[e.entry_type] || 0) + 1 })

  const activeFilterCount = (filterType !== "all" ? 1 : 0) + (sortKey !== "newest" ? 1 : 0)

  return (
    <>
      {/* Overlay */}
      <div
        className="js-sheet-overlay open"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div ref={sheetRef} className="js-sheet" role="dialog" aria-modal="true" aria-label="Filter and sort">
        <span className="js-sheet-handle" />

        <div style={{ padding: "0 20px" }}>

          {/* Sheet header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 300, color: "rgba(255,255,255,0.88)", margin: 0 }}>
              Filter &amp; Sort
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setFilterType("all"); setSortKey("newest") }}
                  style={{
                    padding: "5px 12px", borderRadius: 100,
                    background: "rgba(240,100,100,0.1)", border: "1px solid rgba(240,100,100,0.25)",
                    color: "#f08080", fontFamily: "var(--font-body)", fontSize: "0.72rem",
                    cursor: "pointer",
                  }}
                >
                  Reset all
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(255,255,255,0.07)", border: "none",
                  color: "rgba(255,255,255,0.5)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Ico.X />
              </button>
            </div>
          </div>

          {/* ── Filter by type ── */}
          <p style={{
            fontFamily: "var(--font-display)", fontSize: "0.5rem",
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)", marginBottom: 12,
          }}>
            Filter by type
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            <button
              className={`js-sheet-pill${filterType === "all" ? " active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              All moments
              <span style={{ opacity: 0.5, fontSize: "0.7rem" }}>{entries.length}</span>
            </button>
            {Object.entries(TYPES).map(([key, t]) => {
              const count = typeCounts[key] || 0
              if (!count) return null
              const active = filterType === key
              return (
                <button
                  key={key}
                  className={`js-sheet-pill${active ? " active" : ""}`}
                  onClick={() => setFilterType(key)}
                  style={{ borderColor: active ? `${t.dot}55` : undefined, color: active ? t.color : undefined, background: active ? `${t.dot}12` : undefined }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.dot, flexShrink: 0, boxShadow: active ? `0 0 6px ${t.dot}` : "none" }} />
                  {t.label}
                  <span style={{ opacity: 0.5, fontSize: "0.7rem" }}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 24 }} />

          {/* ── Sort by ── */}
          <p style={{
            fontFamily: "var(--font-display)", fontSize: "0.5rem",
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)", marginBottom: 12,
          }}>
            Sort by
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 8 }}>
            {SORTS.map(s => {
              const active = sortKey === s.value
              return (
                <button
                  key={s.value}
                  onClick={() => setSortKey(s.value)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "13px 14px", borderRadius: 10,
                    background: active ? "rgba(240,192,96,0.07)" : "transparent",
                    border: `1px solid ${active ? "rgba(240,192,96,0.25)" : "transparent"}`,
                    cursor: "pointer", transition: "all 0.15s ease", minHeight: 48,
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: "0.88rem",
                    color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.45)",
                  }}>
                    {s.label}
                  </span>
                  {active && (
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: "var(--color-gold-warm)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#060912" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Apply button */}
          <button
            onClick={onClose}
            style={{
              width: "100%", padding: "14px 0", marginTop: 12,
              background: "var(--gradient-gold)", border: "none", borderRadius: 12,
              color: "#060912", fontFamily: "var(--font-display)",
              fontSize: "0.65rem", letterSpacing: "0.15em",
              cursor: "pointer", boxShadow: "var(--shadow-gold-sm)",
            }}
          >
            SHOW RESULTS
          </button>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   ACTION MENU
───────────────────────────────────────────────────────────── */
function ActionMenu({ entry, onPin, onFavourite, onRename, onDeleteRequest, isOpen, onToggle }) {
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) onToggle() }
    document.addEventListener("mousedown", handler, true)
    document.addEventListener("touchstart", handler, true)
    return () => { document.removeEventListener("mousedown", handler, true); document.removeEventListener("touchstart", handler, true) }
  }, [isOpen, onToggle])

  const items = [
    { label: entry.is_pinned    ? "Unpin"       : "Pin to top",  icon: <Ico.Pin  on={entry.is_pinned}    />, color: "var(--color-gold-warm)", onClick: () => { onPin(entry.id, !entry.is_pinned); onToggle() } },
    { label: entry.is_favourite ? "Unfavourite" : "Favourite",   icon: <Ico.Heart on={entry.is_favourite}/>, color: entry.is_favourite ? "#f08080" : "rgba(255,255,255,0.65)", onClick: () => { onFavourite(entry.id, !entry.is_favourite); onToggle() } },
    { label: "Rename",  icon: <Ico.Edit  />, color: "rgba(255,255,255,0.65)", onClick: () => { onRename(); onToggle() } },
    { label: "Delete",  icon: <Ico.Trash />, color: "#f08080",                onClick: () => { onDeleteRequest(entry.id); onToggle() } },
  ]

  return (
    <div ref={wrapRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        aria-label="More actions"
        style={{
          width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
          background: isOpen ? "rgba(255,255,255,0.08)" : "transparent",
          border: `1px solid ${isOpen ? "rgba(255,255,255,0.12)" : "transparent"}`,
          borderRadius: 7, color: isOpen ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)",
          cursor: "pointer", transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)" }}
        onMouseLeave={(e) => { if (!isOpen) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.25)" } }}
      >
        <Ico.More />
      </button>

      {isOpen && (
        <div className="js-menu">
          {items.map(item => (
            <button key={item.label} className="js-menu-item" style={{ color: item.color }}
              onClick={(e) => { e.stopPropagation(); item.onClick() }}>
              <span style={{ opacity: 0.85, flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ENTRY CARD
───────────────────────────────────────────────────────────── */
function EntryCard({ entry, onPin, onFavourite, onDeleteRequest, onRename, index }) {
  const [expanded,   setExpanded]   = useState(false)
  const [editing,    setEditing]    = useState(false)
  const [titleInput, setTitleInput] = useState(entry.title || "Untitled moment")
  const [menuOpen,   setMenuOpen]   = useState(false)

  const t = TYPES[entry.entry_type] || TYPES.reflection

  const handleRenameSubmit = () => {
    const v = titleInput.trim()
    if (v && v !== entry.title) onRename(entry.id, v)
    setEditing(false)
  }

  const date = new Date(entry.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })

  return (
    <div
      className={`js-entry${entry.is_pinned ? " pinned" : ""}`}
      style={{ animation: `slideUp 0.35s ease ${index * 0.03}s both` }}
    >
      {entry.is_pinned && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "var(--gradient-gold)", borderRadius: "10px 0 0 10px" }} />
      )}

      <div style={{ padding: "16px 16px 16px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>

          {/* Type dot */}
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.dot, marginTop: 6, flexShrink: 0, boxShadow: `0 0 6px ${t.dot}66` }} />

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => !editing && setExpanded(v => !v)}>
            {editing ? (
              <input
                autoFocus value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(); if (e.key === "Escape") { setTitleInput(entry.title || "Untitled moment"); setEditing(false) } }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(240,192,96,0.5)", borderRadius: 7, padding: "4px 10px", color: "var(--color-divine)", fontFamily: "var(--font-heading)", fontSize: "0.95rem", fontWeight: 300, outline: "none" }}
              />
            ) : (
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", fontWeight: 400, color: "rgba(255,255,255,0.88)", lineHeight: 1.4, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {entry.title || "Untitled moment"}
              </h3>
            )}

            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              <TypeBadge type={entry.entry_type} />
              {entry.is_pinned    && <span style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-gold-warm)", background: "rgba(240,192,96,0.08)", padding: "2px 7px", borderRadius: 100, border: "1px solid rgba(240,192,96,0.2)" }}>Pinned</span>}
              {entry.is_favourite && <span style={{ color: "#f08080", fontSize: "0.65rem" }}>♥</span>}
              {entry.scripture_ref && <span style={{ fontFamily: "var(--font-body)", fontSize: "0.67rem", color: "var(--color-gold-deep)", fontStyle: "italic" }}>{entry.scripture_ref}</span>}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginTop: 2 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap", marginRight: 2 }}>{date}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(v => !v) }}
              style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: expanded ? "rgba(255,255,255,0.07)" : "transparent", border: "1px solid transparent", borderRadius: 7, color: expanded ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)", cursor: "pointer", transition: "all 0.15s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)" }}
              onMouseLeave={(e) => { if (!expanded) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.2)" } }}
            >
              <Ico.Chevron up={expanded} />
            </button>
            <ActionMenu entry={entry} onPin={onPin} onFavourite={onFavourite} onRename={() => setEditing(true)} onDeleteRequest={onDeleteRequest} isOpen={menuOpen} onToggle={() => setMenuOpen(v => !v)} />
          </div>
        </div>

        {expanded && (
          <div style={{ marginTop: 14, paddingTop: 14, paddingLeft: 20, borderTop: "1px solid rgba(255,255,255,0.06)", animation: "slideUp 0.2s ease forwards" }}>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.9rem", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, whiteSpace: "pre-wrap", margin: 0 }}>
              {entry.content}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR (desktop only)
───────────────────────────────────────────────────────────── */
function Sidebar({ entries, filterType, setFilterType, sortKey, setSortKey }) {
  const counts = useMemo(() => {
    const c = {}
    entries.forEach(e => { c[e.entry_type] = (c[e.entry_type] || 0) + 1 })
    return c
  }, [entries])

  return (
    <nav className="js-sidebar">
      <div style={{ padding: "0 12px 20px" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>Kairos</p>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.35rem", fontWeight: 300, color: "rgba(255,255,255,0.88)", lineHeight: 1.3, margin: 0 }}>
          Your <em style={{ color: "var(--color-gold-warm)", fontStyle: "normal" }}>Journey</em>
        </h1>
        {entries.length > 0 && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", marginTop: 4 }}>{entries.length} moment{entries.length !== 1 ? "s" : ""}</p>}
      </div>

      {entries.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: "0 4px 8px" }}>
            {[
              { label: "Pinned",     value: entries.filter(e => e.is_pinned).length,    color: "var(--color-gold-warm)" },
              { label: "Favourites", value: entries.filter(e => e.is_favourite).length, color: "#f08080" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 300, color: s.color, lineHeight: 1, margin: 0 }}>{s.value}</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginTop: 3 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="js-divider" />
        </>
      )}

      {entries.length > 0 && (
        <>
          <p className="js-section-label">Filter</p>
          <button className={`js-filter-btn${filterType === "all" ? " active" : ""}`} onClick={() => setFilterType("all")}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: filterType === "all" ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.4)" }}>All moments</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: filterType === "all" ? "var(--color-gold-warm)" : "rgba(255,255,255,0.2)" }}>{entries.length}</span>
          </button>
          {Object.entries(TYPES).map(([key, t]) => {
            const count = counts[key] || 0
            if (!count) return null
            const active = filterType === key
            return (
              <button key={key} className={`js-filter-btn${active ? " active" : ""}`} onClick={() => setFilterType(key)}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.dot, boxShadow: active ? `0 0 6px ${t.dot}` : "none", flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: active ? t.color : "rgba(255,255,255,0.4)" }}>{t.label}</span>
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: active ? t.color : "rgba(255,255,255,0.2)" }}>{count}</span>
              </button>
            )
          })}
          <div className="js-divider" />
        </>
      )}

      {entries.length > 0 && (
        <>
          <p className="js-section-label">Sort</p>
          {SORTS.map(s => (
            <button key={s.value} className={`js-filter-btn${sortKey === s.value ? " active" : ""}`} onClick={() => setSortKey(s.value)}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: sortKey === s.value ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.4)" }}>{s.label}</span>
              {sortKey === s.value && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-gold-warm)" }} />}
            </button>
          ))}
          <div className="js-divider" />
        </>
      )}

      {/* ── Nav links — same pattern as Companion/Bible/Plans sidebars ── */}
      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", padding: "0 12px 8px", margin: 0 }}>Navigation</p>
        {[
          { label: "Companion",  href: "/journey",       active: false },
          { label: "Saved",      href: "/journey/saved", active: true  },
          { label: "Bible",      href: "/bible",         active: false },
          { label: "Plans",      href: "/plans",         active: false },
          { label: "Account",    href: "/account",       active: false },
        ].map(link => (
          <a
            key={link.href}
            href={link.href}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 12px", borderRadius: 8,
              fontFamily: "var(--font-body)", fontSize: "0.8rem",
              color: link.active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.35)",
              background: link.active ? "rgba(255,255,255,0.07)" : "transparent",
              textDecoration: "none", transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { if (!link.active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)" } }}
            onMouseLeave={(e) => { if (!link.active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.35)" } }}
          >
            {link.label}
            {link.active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "var(--color-gold-warm)" }} />}
          </a>
        ))}
      </div>

    </nav>
  )
}

/* ─────────────────────────────────────────────────────────────
   MOBILE BOTTOM NAV
───────────────────────────────────────────────────────────── */
const MOBILE_NAV_ITEMS = [
  { label: "Companion", href: "/journey",       icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { label: "Saved",     href: "/journey/saved", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> },
  { label: "Bible",     href: "/bible",         icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { label: "Plans",     href: "/plans",         icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label: "Account",   href: "/account",       icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
]

function MobileBottomNav() {
  return (
    <nav className="js-mobile-bottom-nav" aria-label="Mobile navigation">
      {MOBILE_NAV_ITEMS.map(item => {
        const active = item.href === "/journey/saved"
        return (
          <a
            key={item.href}
            href={item.href}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3,
              textDecoration: "none",
              color: active ? "var(--color-gold-warm)" : "rgba(255,255,255,0.3)",
              minWidth: 44, minHeight: 44,
              justifyContent: "center",
              transition: "color 0.15s ease",
            }}
          >
            {item.icon}
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.45rem",
              letterSpacing: "0.08em",
            }}>
              {item.label}
            </span>
          </a>
        )
      })}
    </nav>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function SavedPage() {
  const router = useRouter()

  const [entries,       setEntries]       = useState([])
  const [pageLoading,   setPageLoading]   = useState(true)
  const [profileId,     setProfileId]     = useState(null)
  const [search,        setSearch]        = useState("")
  const [sortKey,       setSortKey]       = useState("newest")
  const [filterType,    setFilterType]    = useState("all")
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [sheetOpen,     setSheetOpen]     = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.is_anonymous) { router.replace("/login"); return }
      const { data: profile } = await supabase.from("users").select("id").eq("auth_id", user.id).maybeSingle()
      if (!profile) { router.replace("/login"); return }
      setProfileId(profile.id)
      const { data: rows } = await supabase.from("journey_entries").select("*").eq("user_id", profile.id).order("created_at", { ascending: false })
      setEntries(rows || [])
      setPageLoading(false)
    }
    load()
  }, [router])

  const displayed = useMemo(() => {
    let list = [...entries]
    if (filterType !== "all") list = list.filter(e => e.entry_type === filterType)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e => (e.title||"").toLowerCase().includes(q) || (e.content||"").toLowerCase().includes(q) || (e.scripture_ref||"").toLowerCase().includes(q))
    }
    switch (sortKey) {
      case "oldest":     list.sort((a,b) => new Date(a.created_at)-new Date(b.created_at)); break
      case "pinned":     list.sort((a,b) => (b.is_pinned?1:0)-(a.is_pinned?1:0) || new Date(b.created_at)-new Date(a.created_at)); break
      case "favourites": list.sort((a,b) => (b.is_favourite?1:0)-(a.is_favourite?1:0) || new Date(b.created_at)-new Date(a.created_at)); break
      case "az":         list.sort((a,b) => (a.title||"").localeCompare(b.title||"")); break
      default:           list.sort((a,b) => new Date(b.created_at)-new Date(a.created_at))
    }
    return list
  }, [entries, filterType, search, sortKey])

  const handlePin    = async (id, val) => { await supabase.from("journey_entries").update({ is_pinned: val }).eq("id", id).eq("user_id", profileId); setEntries(p => p.map(e => e.id===id ? {...e, is_pinned: val} : e)) }
  const handleFav    = async (id, val) => { await supabase.from("journey_entries").update({ is_favourite: val }).eq("id", id).eq("user_id", profileId); setEntries(p => p.map(e => e.id===id ? {...e, is_favourite: val} : e)) }
  const handleRename = async (id, title) => { await supabase.from("journey_entries").update({ title }).eq("id", id).eq("user_id", profileId); setEntries(p => p.map(e => e.id===id ? {...e, title} : e)) }
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    await supabase.from("journey_entries").delete().eq("id", deleteTarget).eq("user_id", profileId)
    setEntries(p => p.filter(e => e.id !== deleteTarget))
    setDeleteLoading(false)
    setDeleteTarget(null)
  }

  if (pageLoading) return (
    <div style={{ minHeight: "100vh", background: "var(--color-void)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "1px solid rgba(240,192,96,0.25)", borderTop: "1px solid var(--color-gold-warm)", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", color: "rgba(240,192,96,0.7)", fontSize: "0.9rem" }}>Gathering your moments…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // Active filter state for badge display
  const hasActiveFilter = filterType !== "all"
  const hasActiveSort   = sortKey !== "newest"
  const activeCount     = (hasActiveFilter ? 1 : 0) + (hasActiveSort ? 1 : 0)
  const activeTypeLabel = hasActiveFilter ? (TYPES[filterType]?.label || filterType) : null
  const activeSortLabel = hasActiveSort   ? (SORTS.find(s => s.value === sortKey)?.label) : null

  return (
    <>
      <style>{css}</style>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete this moment?"
        message="This saved moment will be permanently removed from your journey."
        detail="This cannot be undone."
        confirmLabel="DELETE"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Bottom sheet (mobile) */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        entries={entries}
        filterType={filterType}
        setFilterType={setFilterType}
        sortKey={sortKey}
        setSortKey={setSortKey}
      />

      <div style={{ minHeight: "100vh", background: "var(--color-void)" }}>
        <div aria-hidden="true" style={{ position: "fixed", top: "15%", right: "-8%", width: 480, height: 480, background: "radial-gradient(circle, rgba(240,192,96,0.035) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div aria-hidden="true" style={{ position: "fixed", bottom: "8%", left: "-4%", width: 360, height: 360, background: "radial-gradient(circle, rgba(99,102,241,0.025) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ paddingTop: 0, position: "relative", zIndex: 1 }}>
          <div className="js-layout">

            <Sidebar entries={entries} filterType={filterType} setFilterType={setFilterType} sortKey={sortKey} setSortKey={setSortKey} />

            <main className="js-main">

              {/* ── Mobile header ── */}
              <div className="js-mobile-header" style={{ alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 300, color: "rgba(255,255,255,0.88)", margin: 0, lineHeight: 1.2 }}>
                    Your <em style={{ color: "var(--color-gold-warm)", fontStyle: "normal" }}>Journey</em>
                  </h1>
                  {entries.length > 0 && (
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", margin: "2px 0 0" }}>
                      {entries.length} moment{entries.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <a href="/journey" style={{ flexShrink: 0, padding: "8px 16px", background: "rgba(240,192,96,0.1)", border: "1px solid rgba(240,192,96,0.25)", borderRadius: 100, color: "var(--color-gold-warm)", fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.12em", textDecoration: "none", whiteSpace: "nowrap" }}>
                  COMPANION →
                </a>
              </div>

              {/* ── Mobile search + toolbar ── */}
              {entries.length > 0 && (
                <>
                  {/* Search — mobile only (desktop has its own below) */}
                  <div className="js-mobile-only" style={{ position: "relative", marginBottom: 10 }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)", pointerEvents: "none", display: "flex" }}>
                      <Ico.Search />
                    </span>
                    <input className="js-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search moments…" />
                    {search && (
                      <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                        <Ico.X />
                      </button>
                    )}
                  </div>

                  {/* ── Mobile toolbar: single "Filter & Sort" button ──
                       One button opens the sheet for both. Active chips show
                       what's set so the user can see and clear each one. ── */}
                  <div className="js-mobile-toolbar" style={{ gap: 8, marginBottom: 12, alignItems: "center", overflowX: "auto", flexWrap: "nowrap", scrollbarWidth: "none" }}>

                    {/* Single button for both filter + sort */}
                    <button
                      onClick={() => setSheetOpen(true)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "9px 16px", borderRadius: 10,
                        background: activeCount > 0 ? "rgba(240,192,96,0.07)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${activeCount > 0 ? "rgba(240,192,96,0.28)" : "rgba(255,255,255,0.08)"}`,
                        color: activeCount > 0 ? "var(--color-gold-warm)" : "rgba(255,255,255,0.45)",
                        fontFamily: "var(--font-body)", fontSize: "0.8rem",
                        cursor: "pointer", minHeight: 40, flex: 1,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Ico.Filter />
                      <span>Filter &amp; Sort</span>
                      {activeCount > 0 && (
                        <span style={{
                          marginLeft: 2, minWidth: 18, height: 18, borderRadius: 100,
                          background: "var(--color-gold-warm)", color: "#060912",
                          fontFamily: "var(--font-display)", fontSize: "0.52rem",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          padding: "0 5px", flexShrink: 0, fontWeight: 700,
                        }}>
                          {activeCount}
                        </span>
                      )}
                    </button>

                    {/* Active chips — one per active setting so user can clear individually */}
                    {hasActiveFilter && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "6px 10px 6px 12px", borderRadius: 100,
                        background: "rgba(240,192,96,0.08)",
                        border: "1px solid rgba(240,192,96,0.28)",
                        color: "var(--color-gold-warm)",
                        fontFamily: "var(--font-body)", fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                      }}>
                        {activeTypeLabel}
                        <span
                          role="button" tabIndex={0} aria-label="Clear filter"
                          onClick={() => setFilterType("all")}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFilterType("all") }}
                          style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                        >
                          <Ico.X />
                        </span>
                      </span>
                    )}
                    {hasActiveSort && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "6px 10px 6px 12px", borderRadius: 100,
                        background: "rgba(240,192,96,0.08)",
                        border: "1px solid rgba(240,192,96,0.28)",
                        color: "var(--color-gold-warm)",
                        fontFamily: "var(--font-body)", fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                      }}>
                        {activeSortLabel}
                        <span
                          role="button" tabIndex={0} aria-label="Clear sort"
                          onClick={() => setSortKey("newest")}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSortKey("newest") }}
                          style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                        >
                          <Ico.X />
                        </span>
                      </span>
                    )}

                    {/* Result count — far right when filtered */}
                    {displayed.length !== entries.length && (
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap", flexShrink: 0, marginLeft: "auto" }}>
                        {displayed.length}/{entries.length}
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* Desktop: search bar only — filter/sort live in the sidebar */}
              <div className="js-desktop-sorts" style={{ flexDirection: "column", gap: 0, marginBottom: 20 }}>
                {entries.length > 0 && (
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)", pointerEvents: "none", display: "flex" }}>
                      <Ico.Search />
                    </span>
                    <input className="js-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search moments…" />
                    {search && (
                      <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                        <Ico.X />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Empty state */}
              {entries.length === 0 && (
                <div style={{ textAlign: "center", paddingTop: 80, animation: "slideUp 0.5s ease" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(240,192,96,0.05)", border: "1px solid rgba(240,192,96,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "rgba(240,192,96,0.5)" }}>
                    <Ico.Compass />
                  </div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", fontWeight: 300, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
                    Your journey begins with a single moment.
                  </h2>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.25)", maxWidth: 300, margin: "0 auto 32px", lineHeight: 1.7 }}>
                    When something resonates in your conversation, save it here.
                  </p>
                  <a href="/journey" style={{ display: "inline-block", padding: "10px 24px", background: "var(--gradient-gold)", borderRadius: 100, color: "#060912", fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.15em", textDecoration: "none", boxShadow: "var(--shadow-gold-sm)" }}>
                    OPEN COMPANION
                  </a>
                </div>
              )}

              {/* No results */}
              {entries.length > 0 && displayed.length === 0 && (
                <div style={{ textAlign: "center", paddingTop: 60 }}>
                  <p style={{ fontFamily: "var(--font-heading)", fontWeight: 300, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>No moments match.</p>
                  <button onClick={() => { setSearch(""); setFilterType("all") }} style={{ padding: "8px 20px", borderRadius: 100, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)", fontSize: "0.78rem", cursor: "pointer", transition: "all 0.15s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(240,192,96,0.4)"; e.currentTarget.style.color = "var(--color-gold-warm)" }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)" }}
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {/* Entry list */}
              <div className="js-grid">
                {displayed.map((entry, i) => (
                  <EntryCard key={entry.id} entry={entry} index={i} onPin={handlePin} onFavourite={handleFav} onDeleteRequest={id => setDeleteTarget(id)} onRename={handleRename} />
                ))}
              </div>

            </main>
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </>
  )
}