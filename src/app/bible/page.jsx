"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { BIBLE_BOOKS } from "@/lib/bible/client"
import { supabase } from "@/lib/supabase/client"
import SaveMomentModal from "@/components/companion/SaveMomentModal"

// ── Constants ─────────────────────────────────────────────────
const OT_BOOKS     = BIBLE_BOOKS.filter(b => b.testament === "OT")
const NT_BOOKS     = BIBLE_BOOKS.filter(b => b.testament === "NT")
const TRANSLATIONS = ["WEB", "KJV", "ASV", "BBE"]
const STORAGE_KEY  = "kairos_bible_pos"

const FONT_SIZES = {
  sm: "0.9375rem",
  md: "1.0625rem",
  lg: "1.25rem",
}

const LINE_SPACINGS = {
  tight:  1.65,
  normal: 1.85,
  loose:  2.1,
}

// ── Persistence ───────────────────────────────────────────────
function savePosition(bookId, chapter, translation) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ bookId, chapter, translation })) } catch (_) {}
}
function loadPosition() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null } catch (_) { return null }
}

// ── Format verse range for display + saving ───────────────────
// e.g. {Genesis 1:1–3} or {John 3:16, 18}
function formatVerseRange(book, chapter, verseSet) {
  if (!book || verseSet.size === 0) return ""
  const sorted = [...verseSet].sort((a, b) => a - b)
  const first  = sorted[0]
  const last   = sorted[sorted.length - 1]
  if (sorted.length === 1) return `${book.name} ${chapter}:${first}`
  const isContiguous = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1)
  return isContiguous
    ? `${book.name} ${chapter}:${first}–${last}`
    : `${book.name} ${chapter}:${sorted.join(", ")}`
}

// ═════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════
export default function BiblePage() {
  const router = useRouter()

  // ── Navigation ────────────────────────────────────────────
  const [activeTab,       setActiveTab]       = useState("OT")
  const [selectedBook,    setSelectedBook]    = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [chapterData,     setChapterData]     = useState(null)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState(null)
  const [showChapters,    setShowChapters]    = useState(false)
  const [sidebarOpen,     setSidebarOpen]     = useState(false)

  // ── Display settings ──────────────────────────────────────
  const [translation,  setTranslation]  = useState("WEB")
  const [fontSize,     setFontSize]     = useState("md")
  const [lineSpacing,  setLineSpacing]  = useState("normal")
  const [settingsOpen, setSettingsOpen] = useState(false)

  // ── Verse selection (multi, session-only) ─────────────────
  const [selectedVerses,    setSelectedVerses]    = useState(new Set())
  const [highlightedVerses, setHighlightedVerses] = useState(new Set()) // session-only
  const [copied,            setCopied]            = useState(false)

  // ── Note flow ─────────────────────────────────────────────
  const [noteDrawerOpen, setNoteDrawerOpen] = useState(false)
  const [noteText,       setNoteText]       = useState("")
  const [saveModalOpen,  setSaveModalOpen]  = useState(false)
  const [savingNote,     setSavingNote]     = useState(false)
  const [pendingNote,    setPendingNote]    = useState(null) // { content, scriptureRef }

  // ── Auth (lightweight — Bible page is public) ─────────────
  const [userId,          setUserId]          = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const scrollRef = useRef(null)
  const noteRef   = useRef(null)

  // ── Auth check ────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && !user.is_anonymous) {
        setUserId(user.id)
        setIsAuthenticated(true)
      }
    })
  }, [])

  // ── Restore last position on mount ────────────────────────
  useEffect(() => {
    const pos = loadPosition()
    let book  = null

    if (pos) {
      book = BIBLE_BOOKS.find(b => b.id === pos.bookId)
      if (book) {
        setSelectedBook(book)
        setSelectedChapter(pos.chapter || 1)
        setTranslation(pos.translation || "WEB")
        setActiveTab(book.testament)
        setShowChapters(true)
        return
      }
    }

    // Default: John 1
    book = BIBLE_BOOKS.find(b => b.id === "JHN")
    setSelectedBook(book)
    setSelectedChapter(1)
    setActiveTab("NT")
    setShowChapters(true)
  }, [])

  // ── Fetch chapter whenever book / chapter / translation changes
  useEffect(() => {
    if (!selectedBook) return
    loadChapter(selectedBook, selectedChapter, translation)
  }, [selectedBook, selectedChapter, translation]) // eslint-disable-line

  async function loadChapter(book, chapter, trans) {
    setLoading(true)
    setError(null)
    clearSelection()
    if (scrollRef.current) scrollRef.current.scrollTop = 0

    try {
      const res  = await fetch(`/api/bible/chapter?book=${book.id}&chapter=${chapter}&translation=${trans}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Failed to load chapter")
      setChapterData(data)
      savePosition(book.id, chapter, trans)
    } catch (err) {
      setError(err.message)
      setChapterData(null)
    } finally {
      setLoading(false)
    }
  }

  // ── Chapter navigation ────────────────────────────────────
  function goToPrev() {
    if (!selectedBook) return
    if (selectedChapter > 1) {
      setSelectedChapter(c => c - 1)
    } else {
      const idx = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id)
      if (idx > 0) {
        const prev = BIBLE_BOOKS[idx - 1]
        setSelectedBook(prev)
        setSelectedChapter(prev.chapters)
        setActiveTab(prev.testament)
      }
    }
  }

  function goToNext() {
    if (!selectedBook) return
    if (selectedChapter < selectedBook.chapters) {
      setSelectedChapter(c => c + 1)
    } else {
      const idx = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id)
      if (idx < BIBLE_BOOKS.length - 1) {
        const next = BIBLE_BOOKS[idx + 1]
        setSelectedBook(next)
        setSelectedChapter(1)
        setActiveTab(next.testament)
      }
    }
  }

  const atVeryStart = selectedBook?.id === "GEN" && selectedChapter === 1
  const atVeryEnd   = selectedBook?.id === "REV" && selectedChapter === 22

  // ── Sidebar ───────────────────────────────────────────────
  function handleBookSelect(book) {
    setSelectedBook(book)
    setSelectedChapter(1)
    setShowChapters(true)
  }

  function handleChapterSelect(ch) {
    setSelectedChapter(ch)
    setSidebarOpen(false)
  }

  // ── Verse selection ───────────────────────────────────────
  function toggleVerse(num) {
    if (noteDrawerOpen) setNoteDrawerOpen(false)
    setSelectedVerses(prev => {
      const next = new Set(prev)
      if (next.has(num)) next.delete(num)
      else next.add(num)
      return next
    })
  }

  function clearSelection() {
    setSelectedVerses(new Set())
    setNoteDrawerOpen(false)
    setNoteText("")
  }

  // ── Toolbar: Highlight ────────────────────────────────────
  // Toggles — if all selected are already highlighted, un-highlights them
  function handleHighlight() {
    const allAlreadyHighlighted = [...selectedVerses].every(v => highlightedVerses.has(v))
    setHighlightedVerses(prev => {
      const next = new Set(prev)
      if (allAlreadyHighlighted) {
        selectedVerses.forEach(v => next.delete(v))
      } else {
        selectedVerses.forEach(v => next.add(v))
      }
      return next
    })
    clearSelection()
  }

  // ── Toolbar: Copy ─────────────────────────────────────────
  async function handleCopyMulti() {
    if (!selectedBook || !chapterData) return
    const sorted = [...selectedVerses].sort((a, b) => a - b)
    const range  = formatVerseRange(selectedBook, selectedChapter, selectedVerses)
    const lines  = sorted.map(num => {
      const v = chapterData.verses.find(v => v.number === num)
      return v ? `[${num}] ${v.text}` : ""
    }).filter(Boolean)
    const text = `${lines.join(" ")}\n— ${range} (${translation})`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => { setCopied(false); clearSelection() }, 1800)
    } catch (_) {}
  }

  // ── Toolbar: Note ─────────────────────────────────────────
  function handleNoteOpen() {
    setNoteText("")
    setNoteDrawerOpen(true)
    setTimeout(() => noteRef.current?.focus(), 120)
  }

  function handleNoteCancel() {
    setNoteDrawerOpen(false)
    setNoteText("")
  }

  // Opens SaveMomentModal with note content pre-packaged
  function handleNoteSaveToJourney() {
    if (!noteText.trim()) return
    const scriptureRef = formatVerseRange(selectedBook, selectedChapter, selectedVerses)
    const sorted       = [...selectedVerses].sort((a, b) => a - b)
    const verseLines   = sorted.map(num => {
      const v = chapterData?.verses.find(v => v.number === num)
      return v ? `[${num}] ${v.text}` : ""
    }).filter(Boolean)

    // Content = user's note + verse text block (so Journey entry is self-contained)
    const content = `${noteText.trim()}\n\n${verseLines.join(" ")}\n— ${scriptureRef} (${translation})`
    setPendingNote({ content, scriptureRef })
    setNoteDrawerOpen(false)
    setSaveModalOpen(true)
  }

  async function handleSaveConfirm({ title, entry_type }) {
    if (!pendingNote) return
    setSavingNote(true)
    try {
      const res  = await fetch("/api/journey/save", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content:       pendingNote.content,
          title,
          entry_type,
          scripture_ref: pendingNote.scriptureRef,
          userId:        userId || null,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      clearSelection()
      setPendingNote(null)
    } catch (err) {
      console.error("[Kairos Bible] Note save failed:", err.message)
    } finally {
      setSavingNote(false)
      setSaveModalOpen(false)
    }
  }

  // ── Toolbar: Ask Kairos ───────────────────────────────────
  // Builds a rich multi-verse context block → sessionStorage → /journey
  function handleAskKairos() {
    if (!selectedBook || !chapterData) return
    const sorted = [...selectedVerses].sort((a, b) => a - b)
    const range  = formatVerseRange(selectedBook, selectedChapter, selectedVerses)
    const lines  = sorted.map(num => {
      const v = chapterData.verses.find(v => v.number === num)
      return v ? `${num}. ${v.text}` : ""
    }).filter(Boolean)
    const ctx = `I'd like to reflect on ${range} (${translation}):\n\n${lines.join("\n")}`
    try { sessionStorage.setItem("kairos_verse_context", ctx) } catch (_) {}
    router.push("/journey")
  }

  // ── Derived ───────────────────────────────────────────────
  const verseRange     = formatVerseRange(selectedBook, selectedChapter, selectedVerses)
  const selectionCount = selectedVerses.size
  const hasSelection   = selectionCount > 0
  const allHighlighted = hasSelection && [...selectedVerses].every(v => highlightedVerses.has(v))

  const sidebarProps = {
    activeTab,
    onTabChange:     (tab) => { setActiveTab(tab); setShowChapters(false) },
    books:           activeTab === "OT" ? OT_BOOKS : NT_BOOKS,
    selectedBook, selectedChapter,
    showChapters, setShowChapters,
    onBookSelect:    handleBookSelect,
    onChapterSelect: handleChapterSelect,
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{
      display:    "flex",
      height:     "100dvh",
      overflow:   "hidden",
      background: "var(--color-bg-primary)",
      color:      "var(--color-text-primary)",
      fontFamily: "var(--font-body)",
      position:   "relative",
    }}>

      {/* ── SaveMomentModal (note flow) ───────────────────── */}
      <SaveMomentModal
        isOpen={saveModalOpen}
        content={pendingNote?.content || ""}
        scriptureRef={pendingNote?.scriptureRef || null}
        onConfirm={handleSaveConfirm}
        onCancel={() => { setSaveModalOpen(false); setPendingNote(null) }}
        saving={savingNote}
      />

      {/* ── Settings panel backdrop ───────────────────────── */}
      {settingsOpen && (
        <div
          onClick={() => setSettingsOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 60 }}
        />
      )}

      {/* ── Settings panel ────────────────────────────────── */}
      <div style={{
        position:      "fixed",
        top: 0, right: 0, bottom: 0,
        width:         "280px",
        maxWidth:      "90vw",
        background:    "#0d1428",
        borderLeft:    "1px solid #2a3a5c",
        zIndex:        70,
        display:       "flex",
        flexDirection: "column",
        padding:       "var(--space-6)",
        gap:           "var(--space-6)",
        transform:     settingsOpen ? "translateX(0)" : "translateX(100%)",
        transition:    "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        overflowY:     "auto",
      }}>
        <SettingsPanel
          translation={translation}
          fontSize={fontSize}
          lineSpacing={lineSpacing}
          onTranslationChange={setTranslation}
          onFontSizeChange={setFontSize}
          onLineSpacingChange={setLineSpacing}
          onClose={() => setSettingsOpen(false)}
        />
      </div>

      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside className="bible-sidebar-desktop" style={{
        width:         "272px",
        minWidth:      "272px",
        borderRight:   "1px solid var(--color-border-subtle)",
        display:       "flex",
        flexDirection: "column",
        overflow:      "hidden",
        background:    "#060912",
      }}>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Mobile backdrop ───────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 40 }}
        />
      )}

      {/* ── Mobile sidebar ────────────────────────────────── */}
      <aside
        className="bible-sidebar-mobile"
        style={{
          position:      "fixed",
          top: 0, left: 0, bottom: 0,
          width:         "300px",
          maxWidth:      "88vw",
          background:    "#060912",
          zIndex:        50,
          display:       "flex",
          flexDirection: "column",
          overflow:      "hidden",
          transform:     sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition:    "transform 0.26s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRight:   "1px solid var(--color-border-subtle)",
        }}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Reading pane ──────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Header */}
        <header style={{
          padding:      "0 var(--space-4)",
          borderBottom: "1px solid var(--color-border-subtle)",
          display:      "flex",
          alignItems:   "center",
          gap:          "var(--space-3)",
          background:   "var(--color-bg-secondary)",
          minHeight:    "64px",
          flexShrink:   0,
        }}>

          {/* Mobile hamburger */}
          <button
            className="bible-mobile-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open book selector"
            style={{
              display:        "none",
              alignItems:     "center",
              justifyContent: "center",
              width:          "44px",
              height:         "44px",
              borderRadius:   "var(--radius-md)",
              border:         "1px solid var(--color-border-subtle)",
              background:     "transparent",
              color:          "var(--color-text-secondary)",
              cursor:         "pointer",
              flexShrink:     0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          {/* Chapter title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {selectedBook ? (
              <h1 style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "clamp(1rem, 2.5vw, 1.375rem)",
                fontWeight:    600,
                letterSpacing: "0.04em",
                color:         "var(--color-text-primary)",
                margin:        0,
                whiteSpace:    "nowrap",
                overflow:      "hidden",
                textOverflow:  "ellipsis",
              }}>
                {selectedBook.name}{" "}
                <span style={{ color: "var(--color-gold-bright)" }}>{selectedChapter}</span>
              </h1>
            ) : (
              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize:   "1.25rem",
                color:      "var(--color-text-muted)",
                fontStyle:  "italic",
                margin:     0,
              }}>
                Select a book to begin
              </h1>
            )}
          </div>

          {/* Translation picker */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <select
              value={translation}
              onChange={e => setTranslation(e.target.value)}
              style={{
                height:        "44px",
                padding:       "0 var(--space-6) 0 var(--space-3)",
                borderRadius:  "var(--radius-md)",
                border:        "1px solid var(--color-border-subtle)",
                background:    "var(--color-bg-tertiary)",
                color:         "var(--color-text-primary)",
                fontFamily:    "var(--font-body)",
                fontSize:      "0.8125rem",
                fontWeight:    600,
                cursor:        "pointer",
                appearance:    "none",
                letterSpacing: "0.04em",
              }}
            >
              {TRANSLATIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <svg
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5"
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>

          {/* Aa — Display settings */}
          <button
            onClick={() => setSettingsOpen(s => !s)}
            aria-label="Display settings"
            title="Display settings"
            style={{
              width:          "44px",
              height:         "44px",
              borderRadius:   "var(--radius-md)",
              border:         `1px solid ${settingsOpen ? "var(--color-gold-bright)" : "var(--color-border-subtle)"}`,
              background:     settingsOpen ? "rgba(240,192,96,0.08)" : "transparent",
              color:          settingsOpen ? "var(--color-gold-bright)" : "var(--color-text-secondary)",
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              flexShrink:     0,
              fontFamily:     "var(--font-display)",
              fontSize:       "0.9rem",
              fontWeight:     700,
              letterSpacing:  "0.02em",
              transition:     "all 0.15s ease",
            }}
          >
            Aa
          </button>
        </header>

        {/* Verses scroll area — bottom padding grows when toolbar is visible */}
        <div
          ref={scrollRef}
          style={{
            flex:       1,
            overflowY:  "auto",
            padding:    `var(--space-6) var(--space-6) ${hasSelection ? "148px" : "var(--space-6)"}`,
            transition: "padding-bottom 0.22s ease",
          }}
        >
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>

            {/* Tap hint — fades out once selection starts */}
            {!loading && !error && chapterData && (
              <p style={{
                fontSize:     "0.75rem",
                color:        "var(--color-text-muted)",
                fontStyle:    "italic",
                marginBottom: "var(--space-4)",
                opacity:      hasSelection ? 0 : 0.65,
                transition:   "opacity 0.2s ease",
                userSelect:   "none",
              }}>
                Tap any verse to select it — select multiple to highlight, copy, note, or ask Kairos
              </p>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "240px" }}>
                <p style={{
                  fontFamily:    "var(--font-display)",
                  fontStyle:     "italic",
                  fontSize:      "1.25rem",
                  color:         "var(--color-text-muted)",
                  letterSpacing: "0.04em",
                  margin:        0,
                }}>
                  Opening the Word…
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div style={{
                padding:      "var(--space-5)",
                borderRadius: "var(--radius-lg)",
                border:       "1px solid rgba(225,29,72,0.25)",
                background:   "rgba(225,29,72,0.06)",
              }}>
                <p style={{ margin: "0 0 var(--space-2) 0", fontWeight: 600, fontSize: "0.9rem", color: "#E11D48" }}>
                  Could not load chapter
                </p>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                  {error}
                </p>
              </div>
            )}

            {/* Verses */}
            {!loading && !error && chapterData && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {chapterData.verses.map(verse => {
                  const isSelected    = selectedVerses.has(verse.number)
                  const isHighlighted = highlightedVerses.has(verse.number)

                  // Visual state priority: selected > highlighted > default
                  let borderColor = "transparent"
                  let bgColor     = "transparent"
                  if (isSelected) {
                    borderColor = "var(--color-gold-bright)"
                    bgColor     = isHighlighted ? "rgba(240,192,96,0.12)" : "rgba(99,102,241,0.08)"
                  } else if (isHighlighted) {
                    borderColor = "rgba(240,192,96,0.45)"
                    bgColor     = "rgba(240,192,96,0.06)"
                  }

                  return (
                    <div
                      key={verse.number}
                      onClick={() => toggleVerse(verse.number)}
                      style={{
                        display:      "flex",
                        gap:          "var(--space-3)",
                        padding:      "var(--space-2) var(--space-3)",
                        borderRadius: "var(--radius-md)",
                        cursor:       "pointer",
                        borderLeft:   `2px solid ${borderColor}`,
                        background:   bgColor,
                        transition:   "background 0.14s ease, border-color 0.14s ease",
                        userSelect:   "none",
                        position:     "relative",
                        alignItems:   "flex-start",
                      }}
                    >
                      {/* Verse number */}
                      <span style={{
                        color:         "var(--color-gold-bright)",
                        fontSize:      "0.6875rem",
                        fontWeight:    700,
                        letterSpacing: "0.04em",
                        lineHeight:    `calc(${FONT_SIZES[fontSize]} * ${LINE_SPACINGS[lineSpacing]})`,
                        minWidth:      "20px",
                        flexShrink:    0,
                        opacity:       isHighlighted ? 1 : 0.65,
                        transition:    "opacity 0.14s ease",
                      }}>
                        {verse.number}
                      </span>

                      {/* Verse text */}
                      <p style={{
                        margin:      0,
                        fontSize:    FONT_SIZES[fontSize],
                        lineHeight:  LINE_SPACINGS[lineSpacing],
                        color:       "var(--color-text-primary)",
                        fontFamily:  "var(--font-body)",
                        flex:        1,
                        paddingRight: hasSelection ? "var(--space-8)" : 0,
                        transition:  "padding-right 0.2s ease",
                      }}>
                        {verse.text}
                      </p>

                      {/* Selection checkbox — visible when any selection is active */}
                      <div style={{
                        position:       "absolute",
                        top:            "50%",
                        right:          "var(--space-3)",
                        transform:      "translateY(-50%)",
                        width:          "20px",
                        height:         "20px",
                        borderRadius:   "50%",
                        border:         `1.5px solid ${isSelected ? "var(--color-gold-bright)" : "var(--color-border-subtle)"}`,
                        background:     isSelected ? "var(--color-gold-bright)" : "transparent",
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        flexShrink:     0,
                        opacity:        hasSelection ? 1 : 0,
                        transition:     "all 0.14s ease",
                        pointerEvents:  "none",
                      }}>
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg-primary)" strokeWidth="3.5">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Attribution */}
                <p style={{
                  marginTop: "var(--space-8)",
                  fontSize:  "0.75rem",
                  color:     "var(--color-text-muted)",
                  textAlign: "center",
                  fontStyle: "italic",
                }}>
                  {chapterData.translation} · {chapterData.source}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Prev / Next nav */}
        {selectedBook && (
          <nav style={{
            borderTop:      "1px solid var(--color-border-subtle)",
            padding:        "var(--space-3) var(--space-6)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            background:     "var(--color-bg-secondary)",
            flexShrink:     0,
            gap:            "var(--space-4)",
            minHeight:      "60px",
          }}>
            <button
              onClick={goToPrev}
              disabled={atVeryStart}
              style={{
                height:       "44px",
                padding:      "0 var(--space-4)",
                borderRadius: "var(--radius-md)",
                border:       "1px solid var(--color-border-subtle)",
                background:   "transparent",
                color:        "var(--color-text-secondary)",
                fontFamily:   "var(--font-body)",
                fontSize:     "0.875rem",
                fontWeight:   500,
                cursor:       atVeryStart ? "not-allowed" : "pointer",
                display:      "flex",
                alignItems:   "center",
                gap:          "var(--space-2)",
                opacity:      atVeryStart ? 0.35 : 1,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              Prev
            </button>

            <span style={{
              fontSize:           "0.8125rem",
              color:              "var(--color-text-muted)",
              textAlign:          "center",
              fontVariantNumeric: "tabular-nums",
            }}>
              {selectedBook.name} {selectedChapter} / {selectedBook.chapters}
            </span>

            <button
              onClick={goToNext}
              disabled={atVeryEnd}
              style={{
                height:       "44px",
                padding:      "0 var(--space-4)",
                borderRadius: "var(--radius-md)",
                border:       "1px solid var(--color-border-subtle)",
                background:   "transparent",
                color:        "var(--color-text-secondary)",
                fontFamily:   "var(--font-body)",
                fontSize:     "0.875rem",
                fontWeight:   500,
                cursor:       atVeryEnd ? "not-allowed" : "pointer",
                display:      "flex",
                alignItems:   "center",
                gap:          "var(--space-2)",
                opacity:      atVeryEnd ? 0.35 : 1,
              }}
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </nav>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════
          FLOATING LAYER — Note drawer + Toolbar
          Both anchored to bottom, toolbar below drawer
      ═══════════════════════════════════════════════════ */}

      {/* Note drawer — slides up above toolbar when open */}
      <div style={{
        position:      "fixed",
        bottom:        hasSelection && noteDrawerOpen ? "96px" : "-280px",
        left:          "50%",
        transform:     "translateX(-50%)",
        width:  "min(520px, calc(100vw - 2rem))",
        background:    "#0d1428",
        border:        "1px solid #2a3a5c",
        borderRadius:  "var(--radius-lg)",
        padding:       "var(--space-4)",
        zIndex:        90,
        transition:    "bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow:     "0 -8px 32px rgba(0,0,0,0.35)",
        display:       "flex",
        flexDirection: "column",
        gap:           "var(--space-3)",
      }}>
        <p style={{
          margin:        0,
          fontSize:      "0.75rem",
          color:         "var(--color-text-muted)",
          letterSpacing: "0.03em",
          fontStyle:     "italic",
        }}>
          Note for <strong style={{ color: "var(--color-gold-bright)", fontStyle: "normal" }}>{verseRange}</strong>
        </p>

        <textarea
          ref={noteRef}
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          placeholder="Write your reflection, observation, or prayer…"
          rows={3}
          style={{
            width:        "100%",
            background:   "var(--color-bg-tertiary)",
            border:       "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-md)",
            padding:      "var(--space-3)",
            color:        "var(--color-text-primary)",
            fontFamily:   "var(--font-body)",
            fontSize:     "0.9rem",
            lineHeight:   1.6,
            resize:       "none",
            outline:      "none",
            boxSizing:    "border-box",
            transition:   "border-color 0.15s ease",
          }}
          onFocus={e => { e.target.style.borderColor = "var(--color-gold-bright)" }}
          onBlur={e  => { e.target.style.borderColor = "var(--color-border-subtle)" }}
        />

        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <button
            onClick={handleNoteCancel}
            style={{
              height:       "44px",
              padding:      "0 var(--space-4)",
              borderRadius: "var(--radius-md)",
              border:       "1px solid var(--color-border-subtle)",
              background:   "transparent",
              color:        "var(--color-text-muted)",
              fontFamily:   "var(--font-body)",
              fontSize:     "0.8125rem",
              cursor:       "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleNoteSaveToJourney}
            disabled={!noteText.trim() || !isAuthenticated}
            title={!isAuthenticated ? "Sign in to save notes to your Journey" : ""}
            style={{
              height:       "44px",
              padding:      "0 var(--space-4)",
              borderRadius: "var(--radius-md)",
              border:       "none",
              background:   noteText.trim() && isAuthenticated
                ? "var(--color-gold-bright)"
                : "var(--color-bg-tertiary)",
              color: noteText.trim() && isAuthenticated
                ? "var(--color-bg-primary)"
                : "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
              fontSize:   "0.8125rem",
              fontWeight: 600,
              cursor:     noteText.trim() && isAuthenticated ? "pointer" : "not-allowed",
              transition: "all 0.15s ease",
            }}
          >
            {!isAuthenticated ? "Sign in to save" : "Save to Journey"}
          </button>
        </div>
      </div>

      {/* Floating selection toolbar */}
      <div style={{
        position:       "fixed",
        bottom:         hasSelection ? "var(--space-5)" : "-200px",
        left:           "50%",
        transform:      "translateX(-50%)",
        zIndex:         80,
        transition:     "bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1)      ",
        display:        "flex",
        alignItems:     "center",
        gap:            "var(--space-2)",
        background:     "#0d1428",
        border:         "1px solid #2a3a5c",
        borderRadius:   "var(--radius-lg)",
        padding:        "var(--space-2) var(--space-3)",
        boxShadow:      "0 4px 32px rgba(0,0,0,0.45)",
        whiteSpace:     "nowrap",
        width:          "min(520px, calc(100vw - 2rem))",
        flexWrap:       "wrap",
        justifyContent: "space-between",
      }}>

        {/* Count + clear */}
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          "var(--space-2)",
          paddingRight: "var(--space-3)",
          borderRight:  "1px solid #2a3a5c",
          flexShrink:   0,
        }}>
          <span style={{
            fontSize:      "0.75rem",
            color:         "var(--color-gold-bright)",
            fontWeight:    700,
            letterSpacing: "0.02em",
          }}>
            {selectionCount} {selectionCount === 1 ? "verse" : "verses"}
          </span>
          <button
            onClick={clearSelection}
            aria-label="Clear selection"
            style={{
              width:          "22px",
              height:         "22px",
              borderRadius:   "50%",
              border:         "none",
              background:     "var(--color-bg-tertiary)",
              color:          "var(--color-text-muted)",
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              padding:        0,
              flexShrink:     0,
            }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div style={{
            display:        "flex",
            alignItems:     "center",
            gap:            "var(--space-2)",
            flex:           "1",
        }}>
            {/* Highlight */}
            <ToolbarButton
              onClick={handleHighlight}
              active={allHighlighted}
              label={allHighlighted ? "Remove" : "Highlight"}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24"  fill="none" stroke="currentColor"     strokeWidth="2">
                  <rect x="3" y="5" width="18" height="11" rx="2"
                    fill={allHighlighted ? "rgba(240,192,96,0.5)" : "none"}/>
                  <path d="M3 20h18"/>
               </svg>
              }
            />

            {/* Copy */}
            <ToolbarButton
              onClick={handleCopyMulti}
              active={copied}
              label={copied ? "Copied!" : "Copy"}
              icon={
                copied
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              }
            />

            {/* Note */}
            <ToolbarButton
              onClick={noteDrawerOpen ? handleNoteCancel :  handleNoteOpen}
              active={noteDrawerOpen}
              label="Note"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              }
            />
        </div>

        {/* Ask Kairos — gold pill, always rightmost */}
        <button
          onClick={handleAskKairos}
          style={{
            height:        "44px",
            padding:       "0 var(--space-4)",
            borderRadius:  "var(--radius-full)",
            border:        "none",
            background:    "var(--color-gold-bright)",
            color:         "var(--color-bg-primary)",
            fontFamily:    "var(--font-body)",
            fontSize:      "0.8125rem",
            fontWeight:    700,
            cursor:        "pointer",
            display:       "flex",
            alignItems:    "center",
            gap:           "var(--space-2)",
            letterSpacing: "0.02em",
            flexShrink: 0,
            marginLeft: "auto",
            
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Ask Kairos
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bible-sidebar-desktop { display: none !important; }
          .bible-mobile-btn      { display: flex !important; }
        }
        @media (min-width: 769px) {
          .bible-sidebar-mobile  { display: none !important; }
          .bible-mobile-btn      { display: none !important; }
        }
        @media (max-width: 480px) {
          .bible-toolbar-actions span { display: none !important; }
        }
      `}</style>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// TOOLBAR BUTTON
// ═════════════════════════════════════════════════════════════
function ToolbarButton({ onClick, active, label, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        height:       "44px",
        padding:      "0 var(--space-3)",
        borderRadius: "var(--radius-md)",
        border:       `1px solid ${active ? "var(--color-gold-bright)" : "var(--color-border-subtle)"}`,
        background:   active ? "rgba(240,192,96,0.1)" : "transparent",
        color:        active ? "var(--color-gold-bright)" : "var(--color-text-secondary)",
        fontFamily:   "var(--font-body)",
        fontSize:     "0.8125rem",
        fontWeight:   500,
        cursor:       "pointer",
        display:      "flex",
        alignItems:   "center",
        gap:          "var(--space-2)",
        transition:   "all 0.14s ease",
        whiteSpace:   "nowrap",
      }}
    >
      {icon}
      {label}
    </button>
  )
}

// ═════════════════════════════════════════════════════════════
// SETTINGS PANEL
// ═════════════════════════════════════════════════════════════
function SettingsPanel({ translation, fontSize, lineSpacing, onTranslationChange, onFontSizeChange, onLineSpacingChange, onClose }) {
  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.875rem",
          fontWeight:    600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color:         "var(--color-text-primary)",
          margin:        0,
        }}>
          Display
        </h2>
        <button
          onClick={onClose}
          aria-label="Close display settings"
          style={{
            width:          "36px",
            height:         "36px",
            borderRadius:   "var(--radius-md)",
            border:         "1px solid var(--color-border-subtle)",
            background:     "transparent",
            color:          "var(--color-text-muted)",
            cursor:         "pointer",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Translation */}
      <SettingsSection label="Translation">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {[
            ["WEB", "World English Bible"],
            ["KJV", "King James Version"],
            ["ASV", "American Standard"],
            ["BBE", "Basic English"],
          ].map(([code, name]) => (
            <button
              key={code}
              onClick={() => onTranslationChange(code)}
              style={{
                height:       "44px",
                padding:      "0 var(--space-4)",
                borderRadius: "var(--radius-md)",
                border:       `1px solid ${translation === code ? "var(--color-gold-bright)" : "var(--color-border-subtle)"}`,
                background:   translation === code ? "rgba(240,192,96,0.08)" : "transparent",
                color:        translation === code ? "var(--color-gold-bright)" : "var(--color-text-secondary)",
                fontFamily:   "var(--font-body)",
                fontSize:     "0.875rem",
                fontWeight:   translation === code ? 600 : 400,
                cursor:       "pointer",
                textAlign:    "left",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "space-between",
                transition:   "all 0.14s ease",
              }}
            >
              <span style={{ fontWeight: 700, letterSpacing: "0.04em" }}>{code}</span>
              <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>{name}</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Text size */}
      <SettingsSection label="Text Size">
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {[
            ["sm", "A", "0.875rem", "Small"],
            ["md", "A", "1.0625rem", "Default"],
            ["lg", "A", "1.25rem", "Large"],
          ].map(([key, label, size, title]) => (
            <button
              key={key}
              onClick={() => onFontSizeChange(key)}
              title={title}
              style={{
                flex:           1,
                height:         "44px",
                borderRadius:   "var(--radius-md)",
                border:         `1px solid ${fontSize === key ? "var(--color-gold-bright)" : "var(--color-border-subtle)"}`,
                background:     fontSize === key ? "rgba(240,192,96,0.08)" : "transparent",
                color:          fontSize === key ? "var(--color-gold-bright)" : "var(--color-text-secondary)",
                fontFamily:     "var(--font-body)",
                fontSize:       size,
                fontWeight:     fontSize === key ? 700 : 400,
                cursor:         "pointer",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                transition:     "all 0.14s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Line spacing */}
      <SettingsSection label="Line Spacing">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {[
            ["tight",  "Tight",    "Compact"],
            ["normal", "Normal",   "Balanced"],
            ["loose",  "Spacious", "Airy"],
          ].map(([key, label, desc]) => (
            <button
              key={key}
              onClick={() => onLineSpacingChange(key)}
              style={{
                height:         "44px",
                padding:        "0 var(--space-4)",
                borderRadius:   "var(--radius-md)",
                border:         `1px solid ${lineSpacing === key ? "var(--color-gold-bright)" : "var(--color-border-subtle)"}`,
                background:     lineSpacing === key ? "rgba(240,192,96,0.08)" : "transparent",
                color:          lineSpacing === key ? "var(--color-gold-bright)" : "var(--color-text-secondary)",
                fontFamily:     "var(--font-body)",
                fontSize:       "0.875rem",
                fontWeight:     lineSpacing === key ? 600 : 400,
                cursor:         "pointer",
                textAlign:      "left",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                transition:     "all 0.14s ease",
              }}
            >
              <span>{label}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 400 }}>{desc}</span>
            </button>
          ))}
        </div>
      </SettingsSection>
    </>
  )
}

function SettingsSection({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <p style={{
        margin:        0,
        fontSize:      "0.6875rem",
        fontWeight:    700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color:         "var(--color-text-muted)",
      }}>
        {label}
      </p>
      {children}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// SIDEBAR CONTENT (unchanged from File 3)
// ═════════════════════════════════════════════════════════════
function SidebarContent({ activeTab, onTabChange, books, selectedBook, selectedChapter, showChapters, setShowChapters, onBookSelect, onChapterSelect }) {
  return (
    <>
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border-subtle)", flexShrink: 0 }}>
        {[["OT", "Old Testament"], ["NT", "New Testament"]].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              flex:          1,
              height:        "48px",
              border:        "none",
              background:    "transparent",
              color:         activeTab === tab ? "var(--color-gold-bright)" : "var(--color-text-muted)",
              fontFamily:    "var(--font-body)",
              fontSize:      "0.6875rem",
              fontWeight:    700,
              letterSpacing: "0.08em",
              cursor:        "pointer",
              borderBottom:  activeTab === tab ? "2px solid var(--color-gold-bright)" : "2px solid transparent",
              transition:    "color 0.14s ease, border-color 0.14s ease",
            }}
          >
            {label.toUpperCase()}
          </button>
        ))}
      </div>

      {showChapters && selectedBook && (
        <button
          onClick={() => setShowChapters(false)}
          style={{
            height:       "44px",
            padding:      "0 var(--space-4)",
            border:       "none",
            borderBottom: "1px solid var(--color-border-subtle)",
            background:   "rgba(99,102,241,0.05)",
            color:        "var(--color-gold-bright)",
            fontFamily:   "var(--font-body)",
            fontSize:     "0.875rem",
            fontWeight:   600,
            cursor:       "pointer",
            display:      "flex",
            alignItems:   "center",
            gap:          "var(--space-2)",
            flexShrink:   0,
            width:        "100%",
            textAlign:    "left",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          {selectedBook.name}
        </button>
      )}

      <div style={{ flex: 1, overflowY: "auto" }}>
        {!showChapters && (
          <ul style={{ listStyle: "none", margin: 0, padding: "var(--space-2) 0" }}>
            {books.map(book => {
              const isActive = selectedBook?.id === book.id
              return (
                <li key={book.id}>
                  <button
                    onClick={() => onBookSelect(book)}
                    style={{
                      width:          "100%",
                      minHeight:      "44px",
                      padding:        "0 var(--space-4)",
                      border:         "none",
                      borderLeft:     isActive ? "2px solid var(--color-gold-bright)" : "2px solid transparent",
                      background:     isActive ? "rgba(99,102,241,0.08)" : "transparent",
                      color:          isActive ? "var(--color-gold-bright)" : "var(--color-text-secondary)",
                      fontFamily:     "var(--font-body)",
                      fontSize:       "0.9rem",
                      fontWeight:     isActive ? 600 : 400,
                      cursor:         "pointer",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      textAlign:      "left",
                      transition:     "background 0.12s ease, color 0.12s ease, border-color 0.12s ease",
                    }}
                  >
                    <span>{book.name}</span>
                    <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", fontWeight: 400 }}>
                      {book.chapters}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {showChapters && selectedBook && (
          <div style={{
            padding:             "var(--space-4)",
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))",
            gap:                 "var(--space-2)",
          }}>
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(ch => {
              const isActive = selectedChapter === ch
              return (
                <button
                  key={ch}
                  onClick={() => onChapterSelect(ch)}
                  style={{
                    height:       "44px",
                    borderRadius: "var(--radius-md)",
                    border:       isActive ? "1px solid var(--color-gold-bright)" : "1px solid var(--color-border-subtle)",
                    background:   isActive ? "var(--color-gold-bright)" : "transparent",
                    color:        isActive ? "var(--color-bg-primary)" : "var(--color-text-secondary)",
                    fontFamily:   "var(--font-body)",
                    fontSize:     "0.875rem",
                    fontWeight:   isActive ? 700 : 400,
                    cursor:       "pointer",
                    transition:   "all 0.12s ease",
                  }}
                >
                  {ch}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}