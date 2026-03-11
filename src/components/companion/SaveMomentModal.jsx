"use client"

import { useState, useEffect, useRef } from "react"

/* ── Filler openers that make bad titles ─────────────────── */
// If the AI response starts with one of these, we skip to the
// next sentence to find something more substantive.
const FILLER_PATTERNS = [
  /^(that('s| is) (a )?(really |truly |such a )?(beautiful|meaningful|powerful|deep|great|good|important|honest|real|hard|difficult|brave|courageous|vulnerable|profound))/i,
  /^(i (hear|see|understand|can sense|can feel|feel|notice|appreciate|recognise|recognize) (you|that|how|what|the))/i,
  /^(what you('re| are) (sharing|describing|expressing|feeling|going through|carrying))/i,
  /^(thank you for (sharing|being|trusting|opening))/i,
  /^(it (sounds|seems|feels|appears) (like|as though|as if))/i,
  /^(you('re| are) not alone)/i,
  /^(first(,| of all)?)/i,
  /^(let('s| us) (take a moment|sit with|start|begin|explore|look at))/i,
]

/* ── Extract a meaningful title from AI response content ─── */
export function suggestTitle(content) {
  if (!content) return ""

  // Split into sentences
  const sentences = content
    .replace(/\[scripture\].*?\[\/scripture\]/gs, "") // strip scripture blocks
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)

  // Find the first sentence that is not a filler opener
  const substantive = sentences.find(
    (s) => !FILLER_PATTERNS.some((pattern) => pattern.test(s))
  )

  const raw = substantive || sentences[0] || content

  // Clean up: remove markdown artifacts, trim, cap at 72 chars
  const clean = raw
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()

  return clean.length > 72 ? clean.substring(0, 69) + "…" : clean
}

/* ── Entry type options ──────────────────────────────────── */
const ENTRY_TYPES = [
  {
    value:       "reflection",
    label:       "Reflection",
    description: "A thought or insight that landed",
    icon:        "✦",
  },
  {
    value:       "prayer",
    label:       "Prayer",
    description: "Something to bring before God",
    icon:        "🕊",
  },
  {
    value:       "milestone",
    label:       "Milestone",
    description: "A moment of breakthrough or change",
    icon:        "◈",
  },
  {
    value:       "question",
    label:       "Question",
    description: "Something still open, worth holding",
    icon:        "?",
  },
  {
    value:       "scripture",
    label:       "Scripture",
    description: "A verse or passage that spoke to you",
    icon:        "✦",
  },
]

/* ── Modal ───────────────────────────────────────────────── */
export default function SaveMomentModal({
  isOpen,
  content,
  scriptureRef,
  onConfirm,   // ({ title, entry_type }) => void
  onCancel,
  saving,
}) {
  const [title,     setTitle]     = useState("")
  const [entryType, setEntryType] = useState("reflection")
  const inputRef = useRef(null)

  // Pre-fill title and auto-detect type whenever modal opens
  useEffect(() => {
    if (!isOpen) return
    setTitle(suggestTitle(content))
    setEntryType(detectType(content, scriptureRef))
    // Focus the title input after transition
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [isOpen, content, scriptureRef])

  if (!isOpen) return null

  const handleConfirm = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onConfirm({ title: trimmed, entry_type: entryType })
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleConfirm()
    }
    if (e.key === "Escape") onCancel()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Save this moment"
      style={{
        position:       "fixed",
        inset:          0,
        background:     "rgba(6,9,18,0.88)",
        backdropFilter: "blur(8px)",
        zIndex:         "var(--z-modal)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "var(--space-5)",
      }}
    >
      <div style={{
        background:   "linear-gradient(135deg, rgba(20,29,53,0.98) 0%, rgba(13,20,40,0.98) 100%)",
        border:       "1px solid rgba(240,192,96,0.25)",
        borderRadius: "var(--radius-xl)",
        padding:      "var(--space-8) var(--space-6)",
        maxWidth:     "500px",
        width:        "100%",
        boxShadow:    "var(--shadow-deep)",
        animation:    "fadeUp 0.2s var(--ease-divine) forwards",
        maxHeight:    "90vh",
        overflowY:    "auto",
      }}>

        {/* Header */}
        <p style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.6rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color:         "var(--color-gold-warm)",
          marginBottom:  "var(--space-3)",
          marginTop:     0,
        }}>
          Save to journey
        </p>
        <h2 style={{
          fontFamily:   "var(--font-heading)",
          fontSize:     "clamp(1.1rem, 3vw, 1.4rem)",
          fontWeight:   300,
          color:        "var(--color-divine)",
          lineHeight:   1.4,
          marginBottom: "var(--space-7)",
          marginTop:    0,
        }}>
          Name this moment
        </h2>

        {/* Title input */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <label style={{
            fontFamily:    "var(--font-body)",
            fontSize:      "0.68rem",
            letterSpacing: "0.08em",
            color:         "var(--color-muted)",
            display:       "block",
            marginBottom:  "var(--space-2)",
          }}>
            TITLE
          </label>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={100}
            placeholder="Give this moment a name…"
            style={{
              width:        "100%",
              background:   "rgba(6,9,18,0.6)",
              border:       "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding:      "var(--space-3) var(--space-4)",
              color:        "var(--color-divine)",
              fontFamily:   "var(--font-body)",
              fontSize:     "0.92rem",
              outline:      "none",
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
          <p style={{
            fontFamily:  "var(--font-body)",
            fontSize:    "0.65rem",
            color:       "var(--color-faint)",
            marginTop:   "var(--space-1)",
            textAlign:   "right",
          }}>
            {title.length}/100
          </p>
        </div>

        {/* Entry type selector */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <label style={{
            fontFamily:    "var(--font-body)",
            fontSize:      "0.68rem",
            letterSpacing: "0.08em",
            color:         "var(--color-muted)",
            display:       "block",
            marginBottom:  "var(--space-3)",
          }}>
            TYPE
          </label>
          <div style={{
            display:  "flex",
            flexWrap: "wrap",
            gap:      "var(--space-2)",
          }}>
            {ENTRY_TYPES.map(({ value, label, description }) => {
              const isActive = entryType === value
              return (
                <button
                  key={value}
                  onClick={() => setEntryType(value)}
                  title={description}
                  style={{
                    padding:      "var(--space-2) var(--space-4)",
                    background:   isActive
                      ? "rgba(240,192,96,0.12)"
                      : "rgba(13,20,40,0.6)",
                    border:       `1px solid ${isActive
                      ? "var(--color-gold-warm)"
                      : "var(--color-border)"}`,
                    borderRadius: "var(--radius-full)",
                    color:        isActive
                      ? "var(--color-gold-warm)"
                      : "var(--color-soft)",
                    fontFamily:   "var(--font-body)",
                    fontSize:     "0.78rem",
                    cursor:       "pointer",
                    transition:   "all 0.15s ease",
                    minHeight:    "36px",
                    whiteSpace:   "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "var(--color-border-hover)"
                      e.currentTarget.style.color       = "var(--color-divine)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "var(--color-border)"
                      e.currentTarget.style.color       = "var(--color-soft)"
                    }
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
          {/* Description of selected type */}
          <p style={{
            fontFamily:  "var(--font-body)",
            fontSize:    "0.7rem",
            color:       "var(--color-faint)",
            marginTop:   "var(--space-2)",
            fontStyle:   "italic",
            minHeight:   "1.2em",
          }}>
            {ENTRY_TYPES.find((t) => t.value === entryType)?.description}
          </p>
        </div>

        {/* Scripture ref preview (if present) */}
        {scriptureRef && (
          <p style={{
            fontFamily:    "var(--font-body)",
            fontSize:      "0.72rem",
            color:         "var(--color-gold-warm)",
            letterSpacing: "0.06em",
            marginBottom:  "var(--space-5)",
            opacity:       0.8,
          }}>
            {scriptureRef}
          </p>
        )}

        <div style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-2)" }}>
          <button
            onClick={onCancel}
            disabled={saving}
            style={{
              flex:         1,
              padding:      "var(--space-4)",
              background:   "none",
              border:       "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              color:        "var(--color-muted)",
              fontFamily:   "var(--font-body)",
              fontSize:     "0.85rem",
              cursor:       saving ? "not-allowed" : "pointer",
              opacity:      saving ? 0.5 : 1,
              transition:   "all 0.2s ease",
              minHeight:    "52px",
            }}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.borderColor = "var(--color-border-hover)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || !title.trim()}
            style={{
              flex:          2,
              padding:       "var(--space-4)",
              background:    saving || !title.trim()
                ? "var(--color-surface)"
                : "var(--gradient-gold)",
              border:        "none",
              borderRadius:  "var(--radius-lg)",
              color:         saving || !title.trim()
                ? "var(--color-muted)"
                : "#060912",
              fontFamily:    "var(--font-display)",
              fontSize:      "0.68rem",
              letterSpacing: "0.15em",
              cursor:        saving || !title.trim() ? "not-allowed" : "pointer",
              transition:    "all 0.2s ease",
              minHeight:     "52px",
              boxShadow:     !saving && title.trim() ? "var(--shadow-gold-sm)" : "none",
            }}
          >
            {saving ? "Saving…" : "SAVE MOMENT"}
          </button>
        </div>

      </div>
    </div>
  )
}

/* ── Auto-detect entry type from content ─────────────────── */
function detectType(content, scriptureRef) {
  if (scriptureRef) return "scripture"

  const lower = (content || "").toLowerCase()

  const prayerSignals = [
    "lord,", "father,", "god,", "jesus,", "holy spirit",
    "i pray", "help me", "forgive me", "thank you lord",
    "amen", "in jesus", "heavenly father",
  ]
  const milestoneSignals = [
    "breakthrough", "turning point", "finally", "i decided",
    "i forgave", "i let go", "i accepted", "i committed",
    "from today", "starting today", "i will", "i choose",
  ]
  const questionSignals = [
    "why does", "why do", "why is", "why am",
    "how can", "how do", "what is", "what does",
    "i wonder", "i don't understand", "i still don't",
    "is it possible", "does god",
  ]
  const scriptureSignals = [
    "verse", "psalm", "proverbs", "scripture", "the word",
    "bible says", "it is written", "according to",
  ]

  if (prayerSignals.some((s)     => lower.includes(s))) return "prayer"
  if (milestoneSignals.some((s)  => lower.includes(s))) return "milestone"
  if (scriptureSignals.some((s)  => lower.includes(s))) return "scripture"
  if (questionSignals.some((s)   => lower.includes(s))) return "question"

  return "reflection"
}