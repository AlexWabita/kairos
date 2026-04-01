"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { useSettings } from "@/context/SettingsContext"
import { BIBLE_BOOKS } from "@/lib/bible/client"
import { supabase }     from "@/lib/supabase/client"
import SaveMomentModal  from "@/components/companion/SaveMomentModal"

/* ─────────────────────────────────────────────────────────────
   CONSTANTS  (all preserved from original)
───────────────────────────────────────────────────────────── */
const OT_BOOKS     = BIBLE_BOOKS.filter(b => b.testament === "OT")
const NT_BOOKS     = BIBLE_BOOKS.filter(b => b.testament === "NT")
const TRANSLATIONS = ["WEB", "KJV", "ASV", "BBE"]
const STORAGE_KEY  = "kairos_bible_pos"



function savePosition(bookId, chapter, translation) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ bookId, chapter, translation })) } catch (_) {}
}
function loadPosition() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null } catch (_) { return null }
}
function formatVerseRange(book, chapter, verseSet) {
  if (!book || verseSet.size === 0) return ""
  const sorted = [...verseSet].sort((a, b) => a - b)
  const first = sorted[0], last = sorted[sorted.length - 1]
  if (sorted.length === 1) return `${book.name} ${chapter}:${first}`
  const isContiguous = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1)
  return isContiguous ? `${book.name} ${chapter}:${first}–${last}` : `${book.name} ${chapter}:${sorted.join(", ")}`
}

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const css = `
  @keyframes br-fade  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes br-slide { from{transform:translateX(-100%)} to{transform:translateX(0)} }
  @keyframes br-spin  { to{transform:rotate(360deg)} }
  @keyframes br-bar   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

  /* ── 3-panel shell ── */
  .br-shell {
    display: grid;
    grid-template-columns: 220px 260px 1fr;
    height: 100vh;
    overflow: hidden;
    background: var(--color-void);
  }

  /* ── App nav sidebar ── */
  .br-appnav {
    display: flex; flex-direction: column;
    height: 100vh; overflow-y: auto; overflow-x: hidden;
    background: rgba(8,10,18,0.98);
    border-right: 1px solid rgba(255,255,255,0.06);
    padding: 24px 14px;
    scrollbar-width: none;
  }
  .br-appnav::-webkit-scrollbar { display: none; }

  /* ── Book panel ── */
  .br-bookpanel {
    display: flex; flex-direction: column;
    height: 100vh;
    background: rgba(10,12,20,0.95);
    border-right: 1px solid rgba(255,255,255,0.06);
    overflow: hidden;
  }

  /* ── Reading column ── */
  .br-reader {
    display: flex; flex-direction: column;
    height: 100vh; overflow: hidden;
    min-width: 0;
  }

  /* ── Top bar ── */
  .br-topbar {
    display: flex; align-items: center; justify-content: space-between;
    height: 52px; padding: 0 28px; flex-shrink: 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    background: rgba(8,10,18,0.7);
    backdrop-filter: blur(12px);
    gap: 12px;
  }

  /* ── Nav link ── */
  .br-nav-link {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 8px;
    text-decoration: none; border: none;
    background: transparent; width: 100%;
    cursor: pointer; transition: background 0.15s ease;
    min-height: 40px; text-align: left;
    font-family: var(--font-body); font-size: 0.82rem;
  }
  .br-nav-link:hover  { background: rgba(255,255,255,0.05); }
  .br-nav-link.active { background: rgba(255,255,255,0.08); }

  /* ── Book list item ── */
  .br-book-item {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: 9px 16px;
    border: none; background: transparent;
    cursor: pointer; text-align: left;
    transition: background 0.12s ease; min-height: 40px;
  }
  .br-book-item:hover { background: rgba(255,255,255,0.04); }
  .br-book-item.active { background: rgba(240,192,96,0.07); }

  /* ── Chapter grid button ── */
  .br-ch-btn {
    display: flex; align-items: center; justify-content: center;
    height: 40px; border-radius: 9px;
    border: 1px solid rgba(255,255,255,0.07);
    background: transparent; cursor: pointer;
    font-family: var(--font-body); font-size: 0.85rem;
    color: rgba(255,255,255,0.45);
    transition: all 0.12s ease;
  }
  .br-ch-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.14); }
  .br-ch-btn.active { background: var(--gradient-gold); color: #060912; border-color: transparent; font-weight: 600; }

  /* ── Verse ── */
  .br-verse {
    display: flex; gap: 14px; align-items: flex-start;
    padding: 7px 0; border-radius: 6px;
    cursor: pointer; transition: background 0.12s ease;
    margin: 0 -8px; padding: 6px 8px;
  }
  .br-verse:hover { background: rgba(255,255,255,0.03); }
  .br-verse.selected { background: rgba(240,192,96,0.07); }
  .br-verse.highlighted { background: rgba(240,192,96,0.12); }

  /* ── Action bar (selected verses) ── */
  /* ── Action bar — desktop: flex child at bottom of reader column ── */
  .br-action-bar {
    flex-shrink: 0;
    padding: 12px 20px;
    background: rgba(10,12,22,0.98);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; gap: 10px;
    animation: br-bar 0.25s ease forwards;
    overflow-x: auto; scrollbar-width: none;
  }
  .br-action-bar::-webkit-scrollbar { display: none; }

  /* ── Action bar — mobile: position: fixed, sits exactly above our nav bar.
     Our nav bar is:  position: fixed; bottom: 0; height: 58px;
                      padding-bottom: env(safe-area-inset-bottom)
     So its visual top edge is at: 58px + env(safe-area-inset-bottom) from the viewport bottom.
     We anchor the action bar to that same value, so it always rides on top of
     our nav — which is itself already riding on top of the browser's own chrome. ── */
  @media (max-width: 720px) {
    .br-action-bar {
      position: fixed;
      left: 0;
      right: 0;
      bottom: calc(58px + env(safe-area-inset-bottom, 0px));
      z-index: 95;
      border-radius: 14px 14px 0 0;
      border-left: none;
      border-right: none;
      padding: 12px 16px;
      box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
      /* Ensure it is never taller than needed */
      flex-wrap: nowrap;
    }
  }

  /* ── Mobile ── */
  .br-mobile-nav { display: none; }
  .br-mobile-bar { display: none; }
  .br-mobile-overlay { display: none; }

  @media (max-width: 1000px) {
    .br-shell { grid-template-columns: 220px 1fr; }
    .br-bookpanel { display: none; }
  }
  @media (max-width: 720px) {
    .br-shell { grid-template-columns: 1fr; }
    .br-appnav { display: none; }
    .br-mobile-nav { display: flex; }
    .br-mobile-bar { display: flex; }
    .br-topbar { padding: 0 16px; }
    /* Scroll content bottom padding accounts for:
       - Our fixed mobile nav bar         = 58px
       - The fixed action bar (when shown) = ~58px
       - Browser safe area                = env(safe-area-inset-bottom)
       Using the larger of the two states so content is never hidden. */
    .br-scroll { padding-bottom: calc(120px + env(safe-area-inset-bottom, 0px)); }
  }

  /* Reading content */
  .br-verse-text {
    font-family: var(--font-heading);
    font-weight: 300;
    line-height: 1.9;
    color: rgba(255,255,255,0.82);
    margin: 0;
    user-select: none;
  }
  .br-verse-num {
    font-family: var(--font-display);
    font-size: 0.52rem; letter-spacing: 0.1em;
    color: rgba(255,255,255,0.2);
    margin-top: 7px;
    flex-shrink: 0; min-width: 22px;
    user-select: none;
  }

  /* Scrollbars */
  .br-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.07) transparent; overflow-y: auto; }
  .br-scroll::-webkit-scrollbar { width: 4px; }
  .br-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }

  /* Settings popover */
  .br-settings-panel {
    position: absolute; top: 56px; right: 12px; z-index: 200;
    background: #13161f;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; padding: 20px;
    width: 260px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    animation: br-fade 0.15s ease;
  }
`

/* ─────────────────────────────────────────────────────────────
   APP NAV ITEMS
───────────────────────────────────────────────────────────── */
const NAV = [
  { label: "Companion", href: "/journey",       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { label: "Saved",     href: "/journey/saved", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> },
  { label: "Bible",     href: "/bible",         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { label: "Plans",     href: "/plans",         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label: "Account",   href: "/account",       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: "Settings",  href: "/settings",      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
]

/* ─────────────────────────────────────────────────────────────
   APP NAV SIDEBAR
───────────────────────────────────────────────────────────── */
function AppNav({ pathname, userName, initials }) {
  return (
    <nav className="br-appnav">
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 28 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, rgba(240,192,96,0.28), rgba(200,140,40,0.28))", border: "1px solid rgba(240,192,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", letterSpacing: "0.22em", background: "var(--gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>KAIROS</span>
      </a>

      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", padding: "0 12px 6px", margin: 0 }}>Navigation</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <a key={item.href} href={item.href} className={`br-nav-link${active ? " active" : ""}`}
              style={{ color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)" }}>
              <span style={{ color: active ? "rgba(240,192,96,0.8)" : "rgba(255,255,255,0.25)", flexShrink: 0 }}>{item.icon}</span>
              {item.label}
              {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "rgba(240,192,96,0.7)", flexShrink: 0 }} />}
            </a>
          )
        })}
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14, marginTop: 12 }}>
        {userName ? (
          <a href="/account" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", padding: "8px 10px", borderRadius: 10, transition: "background 0.15s ease" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, rgba(240,192,96,0.2), rgba(200,140,40,0.2))", border: "1px solid rgba(240,192,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "0.52rem", color: "rgba(240,192,96,0.8)", flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{userName.split(" ")[0]}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(255,255,255,0.2)", margin: "1px 0 0" }}>View account →</p>
            </div>
          </a>
        ) : (
          <a href="/login" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, textDecoration: "none", background: "rgba(240,192,96,0.06)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(240,192,96,0.15)", transition: "all 0.15s ease" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(240,192,96,0.1)"; e.currentTarget.style.borderColor = "rgba(240,192,96,0.3)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(240,192,96,0.06)"; e.currentTarget.style.borderColor = "rgba(240,192,96,0.15)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "rgba(240,192,96,0.7)" }}>Sign in</span>
          </a>
        )}
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────────────────────────
   BOOK PANEL
───────────────────────────────────────────────────────────── */
function BookPanel({ activeTab, onTabChange, selectedBook, selectedChapter, showChapters, setShowChapters, onBookSelect, onChapterSelect, inDrawer = false }) {
  const books = activeTab === "OT" ? OT_BOOKS : NT_BOOKS

  return (
    <div className={inDrawer ? "" : "br-bookpanel"} style={inDrawer ? { display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" } : {}}>
      {/* OT / NT tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        {[["OT", "Old"], ["NT", "New"]].map(([tab, label]) => (
          <button key={tab} onClick={() => { onTabChange(tab); setShowChapters(false) }} style={{
            flex: 1, height: 48, border: "none",
            background: "transparent", cursor: "pointer",
            fontFamily: "var(--font-display)", fontSize: "0.55rem",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: activeTab === tab ? "rgba(240,192,96,0.9)" : "rgba(255,255,255,0.25)",
            borderBottom: `2px solid ${activeTab === tab ? "rgba(240,192,96,0.7)" : "transparent"}`,
            transition: "all 0.15s ease",
          }}>
            {label} Testament
          </button>
        ))}
      </div>

      {/* Back to books */}
      {showChapters && selectedBook && (
        <button onClick={() => setShowChapters(false)} style={{
          display: "flex", alignItems: "center", gap: 10,
          width: "100%", padding: "12px 16px", height: 46,
          border: "none", background: "rgba(240,192,96,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          cursor: "pointer", textAlign: "left", flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "rgba(240,192,96,0.85)", fontWeight: 500 }}>{selectedBook.name}</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>{selectedBook.chapters} ch.</span>
        </button>
      )}

      {/* Books list */}
      {!showChapters && (
        <div className="br-scroll" style={{ flex: 1 }}>
          <div style={{ padding: "6px 0" }}>
            {books.map(book => {
              const active = selectedBook?.id === book.id
              return (
                <button key={book.id} onClick={() => onBookSelect(book)}
                  className={`br-book-item${active ? " active" : ""}`}>
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: "0.88rem",
                    color: active ? "rgba(240,192,96,0.9)" : "rgba(255,255,255,0.6)",
                    fontWeight: active ? 500 : 400,
                  }}>{book.name}</span>
                  <span style={{
                    fontFamily: "var(--font-display)", fontSize: "0.48rem",
                    color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em",
                  }}>{book.chapters}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Chapters grid */}
      {showChapters && selectedBook && (
        <div className="br-scroll" style={{ flex: 1, padding: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))", gap: 6 }}>
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(ch => (
              <button key={ch} onClick={() => onChapterSelect(ch)}
                className={`br-ch-btn${selectedChapter === ch ? " active" : ""}`}>
                {ch}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SETTINGS POPOVER
───────────────────────────────────────────────────────────── */
function SettingsPopover({ fontSize, setFontSize, lineSpacing, setLineSpacing, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  return (
    <div ref={ref} className="br-settings-panel">
      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 18 }}>Display Settings</p>

      {/* Font size */}
      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 10 }}>Text size</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[["sm","Aa","Small"], ["md","Aa","Medium"], ["lg","Aa","Large"]].map(([key, label, desc]) => (
          <button key={key} onClick={() => setFontSize(key)} style={{
            flex: 1, height: 40, borderRadius: 10,
            borderWidth: 1, borderStyle: "solid",
            borderColor: fontSize === key ? "rgba(240,192,96,0.5)" : "rgba(255,255,255,0.08)",
            background: fontSize === key ? "rgba(240,192,96,0.08)" : "transparent",
            color: fontSize === key ? "rgba(240,192,96,0.9)" : "rgba(255,255,255,0.4)",
            fontFamily: "var(--font-body)", fontSize: FONT_SIZES[key],
            cursor: "pointer", transition: "all 0.15s ease",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{label}</button>
        ))}
      </div>

      {/* Line spacing */}
      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 10 }}>Line spacing</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {[["tight","Tight","Compact"], ["normal","Normal","Balanced"], ["loose","Spacious","Airy"]].map(([key, label, desc]) => (
          <button key={key} onClick={() => setLineSpacing(key)} style={{
            height: 40, padding: "0 14px", borderRadius: 9,
            borderWidth: 1, borderStyle: "solid",
            borderColor: lineSpacing === key ? "rgba(240,192,96,0.4)" : "rgba(255,255,255,0.07)",
            background: lineSpacing === key ? "rgba(240,192,96,0.07)" : "transparent",
            color: lineSpacing === key ? "rgba(240,192,96,0.9)" : "rgba(255,255,255,0.4)",
            fontFamily: "var(--font-body)", fontSize: "0.82rem",
            cursor: "pointer", transition: "all 0.15s ease",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span>{label}</span>
            <span style={{ fontSize: "0.7rem", color: lineSpacing === key ? "rgba(240,192,96,0.5)" : "rgba(255,255,255,0.2)" }}>{desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MOBILE BOTTOM NAV
───────────────────────────────────────────────────────────── */
function MobileBottomNav({ pathname }) {
  return (
    <div className="br-mobile-nav" style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      height: 58, zIndex: 100,
      background: "rgba(8,10,18,0.96)", backdropFilter: "blur(16px)",
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
   MOBILE BOOK DRAWER
───────────────────────────────────────────────────────────── */
function MobileDrawer({ open, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 300 }} />
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "min(300px, 85vw)", background: "#0d0f1a", borderRight: "1px solid rgba(255,255,255,0.08)", zIndex: 301, display: "flex", flexDirection: "column", animation: "br-slide 0.25s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: 0 }}>Books</p>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function BiblePage() {
  const pathname = usePathname()

  /* ── State (all preserved) ── */
  const [activeTab,       setActiveTab]       = useState("OT")
  const [selectedBook,    setSelectedBook]    = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [chapterData,     setChapterData]     = useState(null)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState(null)
  const [showChapters,    setShowChapters]    = useState(false)
  const [drawerOpen,      setDrawerOpen]      = useState(false)

  const [selectedVerses,    setSelectedVerses]    = useState(new Set())
  const [highlightedVerses, setHighlightedVerses] = useState(new Set())
  const [copied,            setCopied]            = useState(false)

  const [noteDrawerOpen, setNoteDrawerOpen] = useState(false)
  const [noteText,       setNoteText]       = useState("")
  const [saveModalOpen,  setSaveModalOpen]  = useState(false)
  const [savingNote,     setSavingNote]     = useState(false)

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName,        setUserName]        = useState(null)

  const scrollRef = useRef(null)

  const initials = userName ? userName.trim().split(" ").slice(0,2).map(p => p[0]).join("").toUpperCase() : "K"

  /* ── Auth ── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && !user.is_anonymous) {
        setIsAuthenticated(true)
        setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || null)
      }
    })
  }, [])

  /* ── Restore position ── */
  useEffect(() => {
    const pos = loadPosition()
    let book = null
    if (pos) {
      book = BIBLE_BOOKS.find(b => b.id === pos.bookId)
      if (book) {
        setSelectedBook(book); setSelectedChapter(pos.chapter || 1)
  // updateSetting("bibleTranslation", pos.translation || "WEB")
        setActiveTab(book.testament)
        setShowChapters(true); return
      }
    }
    book = BIBLE_BOOKS.find(b => b.id === "JHN")
    setSelectedBook(book); setSelectedChapter(1); setActiveTab("NT"); setShowChapters(true)
  }, [])

  const { settings, updateSetting } = useSettings()

  const translation = settings.bibleTranslation || "WEB"

  /* ── Fetch chapter ── */
  useEffect(() => {
    if (!selectedBook) return
    loadChapter(selectedBook, selectedChapter, translation)
  }, [selectedBook, selectedChapter, translation, updateSetting]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadChapter(book, chapter, trans) {
    setLoading(true); setError(null); clearSelection()
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    try {
      const res  = await fetch(`/api/bible/chapter?book=${book.id}&chapter=${chapter}&translation=${trans}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Failed to load chapter")
      setChapterData(data); savePosition(book.id, chapter, trans)
    } catch (err) { setError(err.message); setChapterData(null) }
    finally { setLoading(false) }
  }

  /* ── Chapter nav ── */
  function goToPrev() {
    if (!selectedBook) return
    if (selectedChapter > 1) { setSelectedChapter(c => c - 1) }
    else {
      const idx = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id)
      if (idx > 0) { const prev = BIBLE_BOOKS[idx - 1]; setSelectedBook(prev); setSelectedChapter(prev.chapters); setActiveTab(prev.testament) }
    }
  }
  function goToNext() {
    if (!selectedBook) return
    if (selectedChapter < selectedBook.chapters) { setSelectedChapter(c => c + 1) }
    else {
      const idx = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id)
      if (idx < BIBLE_BOOKS.length - 1) { const next = BIBLE_BOOKS[idx + 1]; setSelectedBook(next); setSelectedChapter(1); setActiveTab(next.testament) }
    }
  }

  const atVeryStart = selectedBook?.id === "GEN" && selectedChapter === 1
  const atVeryEnd   = selectedBook?.id === "REV"  && selectedChapter === 22

  /* ── Book / chapter select ── */
  function handleBookSelect(book) { setSelectedBook(book); setSelectedChapter(1); setShowChapters(true) }
  function handleChapterSelect(ch) { setSelectedChapter(ch); setDrawerOpen(false) }

  /* ── Verse selection ── */
  function clearSelection() { setSelectedVerses(new Set()); setCopied(false) }

  function toggleVerse(num) {
    setSelectedVerses(prev => {
      const next = new Set(prev)
      next.has(num) ? next.delete(num) : next.add(num)
      return next
    })
  }

  function copySelectedVerses() {
    if (!chapterData || selectedVerses.size === 0) return
    const sorted = [...selectedVerses].sort((a, b) => a - b)
    const text = sorted.map(num => {
      const v = chapterData.verses.find(v => v.verse === num)
      return v ? `[${num}] ${v.text}` : ""
    }).filter(Boolean).join("\n")
    const ref = formatVerseRange(selectedBook, selectedChapter, selectedVerses)
    navigator.clipboard.writeText(`${text}\n\n— ${ref} (${translation})`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  function highlightSelected() {
    setHighlightedVerses(prev => {
      const next = new Set(prev)
      selectedVerses.forEach(v => (next.has(v) ? next.delete(v) : next.add(v)))
      return next
    })
    clearSelection()
  }

  function openNoteForSelection() {
    const ref = formatVerseRange(selectedBook, selectedChapter, selectedVerses)
    const sorted = [...selectedVerses].sort((a, b) => a - b)
    const snippet = sorted.map(num => {
      const v = chapterData?.verses.find(v => v.verse === num)
      return v ? `[${num}] ${v.text}` : ""
    }).filter(Boolean).join(" ")
    setNoteText(`${snippet}\n\n— ${ref} (${translation})\n\nReflection:\n`)
    setNoteDrawerOpen(true)
    clearSelection()
  }

  function sendToCompanion() {
    const ref = formatVerseRange(selectedBook, selectedChapter, selectedVerses)
    const sorted = [...selectedVerses].sort((a, b) => a - b)
    const snippet = sorted.map(num => {
      const v = chapterData?.verses.find(v => v.verse === num)
      return v ? v.text : ""
    }).filter(Boolean).join(" ")
    const prompt = `I'd like to reflect on ${ref}: "${snippet}" — what does this mean for my life today?`
    try { sessionStorage.setItem("kairos_verse_context", prompt) } catch (_) {}
    window.location.href = "/journey"
  }

  async function handleSaveNote({ title, entry_type }) {
    setSavingNote(true)
    const ref = formatVerseRange(selectedBook, selectedChapter, new Set())
    try {
      await fetch("/api/journey/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteText, title, entry_type, scripture_ref: ref }),
      })
    } catch (err) { console.error("[Bible] Save note failed:", err.message) }
    finally { setSavingNote(false); setSaveModalOpen(false); setNoteDrawerOpen(false); setNoteText("") }
  }

  const verseRef = selectedVerses.size > 0 ? formatVerseRange(selectedBook, selectedChapter, selectedVerses) : ""

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */
  return (
    <>
      <style>{css}</style>

      <SaveMomentModal
        isOpen={saveModalOpen}
        content={noteText}
        scriptureRef={formatVerseRange(selectedBook, selectedChapter, new Set())}
        onConfirm={handleSaveNote}
        onCancel={() => setSaveModalOpen(false)}
        saving={savingNote}
      />

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <BookPanel
          inDrawer
          activeTab={activeTab} onTabChange={setActiveTab}
          selectedBook={selectedBook} selectedChapter={selectedChapter}
          showChapters={showChapters} setShowChapters={setShowChapters}
          onBookSelect={handleBookSelect} onChapterSelect={handleChapterSelect}
        />
      </MobileDrawer>

      <div className="br-shell">

        {/* ── App nav sidebar ── */}
        <AppNav pathname={pathname} userName={userName} initials={initials} />

        {/* ── Book panel (desktop) ── */}
        <BookPanel
          activeTab={activeTab} onTabChange={setActiveTab}
          selectedBook={selectedBook} selectedChapter={selectedChapter}
          showChapters={showChapters} setShowChapters={setShowChapters}
          onBookSelect={handleBookSelect} onChapterSelect={handleChapterSelect}
        />

        {/* ── Reading column ── */}
        <div className="br-reader">

          {/* Top bar */}
          <div className="br-topbar">
            {/* Mobile: hamburger for drawer */}
            <button className="br-mobile-bar" onClick={() => setDrawerOpen(true)} style={{
              width: 36, height: 36, borderRadius: 9,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.5)",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </button>

            {/* Book + chapter label */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {selectedBook && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", fontWeight: 300, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {selectedBook.name}
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)" }}>
                    CH. {selectedChapter}
                  </span>
                </div>
              )}
            </div>

            {/* Right controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {/* Translation selector */}
              <select value={translation} onChange={e => updateSetting("bibleTranslation", e.target.value)} style={{
                height: 32, padding: "0 10px",
                background: "rgba(255,255,255,0.04)",
                borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.08)",
                borderRadius: 8, color: "rgba(255,255,255,0.45)",
                fontFamily: "var(--font-body)", fontSize: "0.72rem",
                cursor: "pointer", outline: "none",
              }}
                onFocus={e => e.target.style.borderColor = "rgba(240,192,96,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}  
              >
                {TRANSLATIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Chapter navigation */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 28px", flexShrink: 0,
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}> 
            <button onClick={goToPrev} disabled={atVeryStart} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 8,
              background: "transparent", border: "none",
              color: atVeryStart ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.35)",
              fontFamily: "var(--font-body)", fontSize: "0.75rem",
              cursor: atVeryStart ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
              onMouseEnter={e => { if (!atVeryStart) e.currentTarget.style.color = "rgba(255,255,255,0.7)" }}
              onMouseLeave={e => { e.currentTarget.style.color = atVeryStart ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.35)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              Previous
            </button>

            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
              {selectedBook?.name} · Chapter {selectedChapter}
            </span>

            <button onClick={goToNext} disabled={atVeryEnd} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 8,
              background: "transparent", border: "none",
              color: atVeryEnd ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.35)",
              fontFamily: "var(--font-body)", fontSize: "0.75rem",
              cursor: atVeryEnd ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
              onMouseEnter={e => { if (!atVeryEnd) e.currentTarget.style.color = "rgba(255,255,255,0.7)" }}
              onMouseLeave={e => { e.currentTarget.style.color = atVeryEnd ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.35)" }}
            >
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          {/* ── Verses ── */}
          <div ref={scrollRef} className="br-scroll" style={{ flex: 1, position: "relative" }}>
            <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 28px 48px" }}>

              {/* Loading */}
              {loading && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 16 }}>
                  <div style={{ width: 28, height: 28, border: "1px solid rgba(240,192,96,0.2)", borderTop: "1px solid rgba(240,192,96,0.7)", borderRadius: "50%", animation: "br-spin 0.8s linear infinite" }} />
                  <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", color: "rgba(240,192,96,0.5)", fontSize: "0.88rem" }}>
                    {selectedBook?.name} {selectedChapter}…
                  </p>
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div style={{ textAlign: "center", paddingTop: 80 }}>
                  <p style={{ fontFamily: "var(--font-body)", color: "rgba(240,100,100,0.7)", marginBottom: 16 }}>{error}</p>
                  <button onClick={() => loadChapter(selectedBook, selectedChapter, translation)} style={{ padding: "8px 20px", borderRadius: 100, background: "transparent", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", fontSize: "0.8rem", cursor: "pointer" }}>
                    Try again
                  </button>
                </div>
              )}

              {/* Chapter heading */}
              {chapterData && !loading && (
                <div style={{ marginBottom: 32 }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 8 }}>
                    {selectedBook?.name}
                  </p>
                  <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300, color: "rgba(255,255,255,0.88)", lineHeight: 1.25, margin: 0 }}>
                    Chapter {selectedChapter}
                  </h1>
                  <div style={{ width: 40, height: 1, background: "var(--gradient-gold)", marginTop: 14, opacity: 0.5 }} />
                </div>
              )}

              {/* Verses */}
              {chapterData && !loading && chapterData.verses?.map((verse, i) => {
                const num = verse.verse ?? (i + 1)
                const isSelected    = selectedVerses.has(num)
                const isHighlighted = highlightedVerses.has(num)

                return (
                  <div
                    key={`v-${num}-${selectedChapter}`}
                    className={`br-verse${isSelected ? " selected" : ""}${isHighlighted && !isSelected ? " highlighted" : ""}`}
                    onClick={() => toggleVerse(num)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") toggleVerse(num) }}
                    aria-pressed={isSelected}
                  >
                    {/* Verse number */}
                    <span className="br-verse-num">{num}</span>
                    {/* Verse text */}
                    <p className="br-verse-text" style={{
                      fontSize: "var(--font-size-base)",
                      lineHeight: "var(--line-height-reading)",
                    }}>
                      {verse.text}
                    </p>
                  </div>
                )
              })}

              {/* End of chapter hint */}
              {chapterData && !loading && !atVeryEnd && (
                <div style={{ textAlign: "center", paddingTop: 40 }}>
                  <button onClick={goToNext} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "9px 20px", borderRadius: 100,
                    background: "rgba(255,255,255,0.03)",
                    borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)",
                    fontSize: "0.78rem", cursor: "pointer", transition: "all 0.15s ease",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(240,192,96,0.25)"; e.currentTarget.style.color = "rgba(240,192,96,0.6)" }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)" }}
                  >
                    Continue to chapter {selectedChapter + 1}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}

            </div>

          </div>{/* end br-scroll */}

          {/* ── Action bar — sibling of scroll, stays pinned at bottom of reader column ── */}
          {selectedVerses.size > 0 && (
            <div className="br-action-bar">
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.14em", color: "rgba(240,192,96,0.7)", whiteSpace: "nowrap", marginRight: 4, flexShrink: 0 }}>
                {verseRef}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                <button onClick={copySelectedVerses} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: copied ? "rgba(100,200,100,0.08)" : "rgba(255,255,255,0.05)", borderWidth: 1, borderStyle: "solid", borderColor: copied ? "rgba(100,200,100,0.3)" : "rgba(255,255,255,0.1)", color: copied ? "rgba(100,200,100,0.85)" : "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.15s ease", minHeight: 34, whiteSpace: "nowrap" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button onClick={highlightSelected} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.15s ease", minHeight: 34, whiteSpace: "nowrap" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(240,192,96,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Highlight
                </button>
                {isAuthenticated && (
                  <button onClick={openNoteForSelection} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.15s ease", minHeight: 34, whiteSpace: "nowrap" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(240,192,96,0.3)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    Add note
                  </button>
                )}
                <button onClick={sendToCompanion} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, background: "var(--gradient-gold)", border: "none", color: "#060912", fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.12em", cursor: "pointer", boxShadow: "var(--shadow-gold-sm)", minHeight: 34, whiteSpace: "nowrap" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  ASK KAIROS
                </button>
              </div>
              <button onClick={clearSelection} aria-label="Clear selection" style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          )}

          {/* ── Note drawer ── */}
          {noteDrawerOpen && (
            <>
              <div onClick={() => setNoteDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }} />
              <div style={{
                position: "fixed", right: 0, top: 0, bottom: 0, width: "min(400px, 90vw)",
                background: "#0f1117", border: "left 1px solid rgba(255,255,255,0.08)",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                zIndex: 201, display: "flex", flexDirection: "column",
                animation: "br-slide 0.25s ease",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: 0 }}>Reflection Note</p>
                  <button onClick={() => setNoteDrawerOpen(false)} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    padding: "20px", color: "rgba(255,255,255,0.75)",
                    fontFamily: "var(--font-heading)", fontSize: "0.9rem",
                    fontWeight: 300, lineHeight: 1.8, resize: "none",
                  }}
                  placeholder="Write your reflection…"
                />
                <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 10 }}>
                  <button onClick={() => setNoteDrawerOpen(false)} style={{ flex: 1, height: 40, borderRadius: 10, background: "transparent", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", fontSize: "0.82rem", cursor: "pointer" }}>Cancel</button>
                  <button onClick={() => { setSaveModalOpen(true) }} style={{ flex: 2, height: 40, borderRadius: 10, background: noteText.trim() ? "var(--gradient-gold)" : "rgba(255,255,255,0.06)", border: "none", color: noteText.trim() ? "#060912" : "rgba(255,255,255,0.2)", fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.12em", cursor: noteText.trim() ? "pointer" : "not-allowed", boxShadow: noteText.trim() ? "var(--shadow-gold-sm)" : "none" }}>SAVE TO JOURNEY</button>
                </div>
              </div>
            </>
          )}

        </div>{/* end br-reader */}
      </div>{/* end br-shell */}

      {/* Mobile bottom nav */}
      <MobileBottomNav pathname={pathname} />
    </>
  )
}