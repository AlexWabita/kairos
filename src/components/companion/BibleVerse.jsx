"use client"

import { useState } from "react"

/**
 * KAIROS — BibleVerse Component
 *
 * Displays an exact verse fetched from the Bible API.
 * Used inside CompanionCore when the user requests a specific verse.
 *
 * Props:
 *   reference   — e.g. "John 3:16"
 *   text        — the verse text
 *   translation — e.g. "WEB"
 *   source      — which API served it (for debug, not shown to user)
 */
export default function BibleVerse({ reference, text, translation }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${text}" — ${reference} (${translation})`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      background:   "linear-gradient(135deg, rgba(20,29,53,0.95) 0%, rgba(13,20,40,0.95) 100%)",
      border:       "1px solid rgba(240,192,96,0.3)",
      borderLeft:   "3px solid var(--color-gold-warm)",
      borderRadius: "var(--radius-lg)",
      padding:      "var(--space-5) var(--space-6)",
      margin:       "var(--space-4) 0",
      position:     "relative",
    }}>
      {/* Translation badge */}
      <span style={{
        position:      "absolute",
        top:           "var(--space-3)",
        right:         "var(--space-3)",
        fontFamily:    "var(--font-body)",
        fontSize:      "0.6rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color:         "var(--color-muted)",
        background:    "rgba(240,192,96,0.08)",
        border:        "1px solid rgba(240,192,96,0.15)",
        borderRadius:  "var(--radius-full)",
        padding:       "2px 8px",
      }}>
        {translation}
      </span>

      {/* Verse text */}
      <p style={{
        fontFamily:  "var(--font-heading)",
        fontStyle:   "italic",
        fontSize:    "var(--text-body-lg)",
        fontWeight:  300,
        lineHeight:  "var(--leading-relaxed)",
        color:       "var(--color-divine)",
        margin:      "0 0 var(--space-4) 0",
        paddingRight: "var(--space-8)",
      }}>
        &ldquo;{text}&rdquo;
      </p>

      {/* Reference + copy button */}
      <div style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
      }}>
        <p style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.7rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color:         "var(--color-gold-warm)",
          margin:        0,
        }}>
          — {reference}
        </p>

        <button
          onClick={handleCopy}
          title="Copy verse"
          style={{
            background:   "transparent",
            border:       "1px solid rgba(240,192,96,0.2)",
            borderRadius: "var(--radius-full)",
            padding:      "4px 10px",
            color:        copied ? "var(--color-gold-warm)" : "var(--color-muted)",
            fontFamily:   "var(--font-body)",
            fontSize:     "0.65rem",
            letterSpacing: "0.05em",
            cursor:       "pointer",
            transition:   "all 0.2s ease",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  )
}