"use client"

import { useState, useEffect } from "react"
import { useSettings }         from "@/context/SettingsContext"
import {
  ACCENT_COLORS,
  FONT_FAMILIES,
  BIBLE_TRANSLATIONS,
} from "@/lib/settings"

/* ── Shared card wrapper (mirrors account page pattern) ──── */
function Card({ children }) {
  return (
    <div style={{
      background:   "linear-gradient(135deg, rgba(20,29,53,0.8) 0%, rgba(13,20,40,0.8) 100%)",
      border:       "1px solid var(--color-border)",
      borderLeft:   "2px solid rgba(240,192,96,0.2)",
      borderRadius: "var(--radius-xl)",
      padding:      "var(--space-6)",
      boxShadow:    "var(--shadow-card)",
    }}>
      {children}
    </div>
  )
}

/* ── Section heading ─────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p style={{
      fontFamily:    "var(--font-display)",
      fontSize:      "0.6rem",
      letterSpacing: "0.25em",
      textTransform: "uppercase",
      color:         "var(--color-gold-warm)",
      marginBottom:  "var(--space-5)",
    }}>
      {children}
    </p>
  )
}

/* ── Sub-label within a section ─────────────────────────── */
function FieldLabel({ children }) {
  return (
    <p style={{
      fontFamily:    "var(--font-body)",
      fontSize:      "0.7rem",
      letterSpacing: "0.08em",
      color:         "var(--color-muted)",
      marginBottom:  "var(--space-3)",
    }}>
      {children}
    </p>
  )
}

/* ── Divider between fields inside a card ────────────────── */
function Divider() {
  return (
    <div style={{
      borderTop:    "1px solid var(--color-border)",
      margin:       "var(--space-5) 0",
    }} />
  )
}

/* ── Theme toggle — 3 segmented options ─────────────────── */
function ThemeToggle({ value, onChange }) {
  const options = [
    { key: "dark",   label: "Dark"   },
    { key: "system", label: "System" },
    { key: "light",  label: "Light", soon: true },
  ]

  return (
    <div style={{
      display:       "flex",
      gap:           "var(--space-2)",
      flexWrap:      "wrap",
    }}>
      {options.map(({ key, label, soon }) => {
        const isActive = value === key
        return (
          <button
            key={key}
            onClick={() => !soon && onChange(key)}
            disabled={soon}
            title={soon ? "Coming soon" : undefined}
            style={{
              position:      "relative",
              padding:       "var(--space-2) var(--space-5)",
              background:    isActive
                ? "rgba(240,192,96,0.1)"
                : "rgba(13,20,40,0.6)",
              border:        `1px solid ${isActive ? "var(--color-gold-warm)" : "var(--color-border)"}`,
              borderRadius:  "var(--radius-full)",
              color:         isActive
                ? "var(--color-gold-warm)"
                : soon ? "var(--color-faint)" : "var(--color-soft)",
              fontFamily:    "var(--font-body)",
              fontSize:      "0.82rem",
              cursor:        soon ? "not-allowed" : "pointer",
              transition:    "all 0.2s ease",
              minHeight:     "44px",
              minWidth:      "80px",
              opacity:       soon ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isActive && !soon)
                e.currentTarget.style.borderColor = "var(--color-border-hover)"
            }}
            onMouseLeave={(e) => {
              if (!isActive)
                e.currentTarget.style.borderColor = "var(--color-border)"
            }}
          >
            {label}
            {soon && (
              <span style={{
                position:      "absolute",
                top:           "-8px",
                right:         "-4px",
                background:    "rgba(240,192,96,0.15)",
                border:        "1px solid rgba(240,192,96,0.3)",
                borderRadius:  "var(--radius-full)",
                padding:       "1px 6px",
                fontSize:      "0.52rem",
                letterSpacing: "0.08em",
                color:         "var(--color-gold-warm)",
                fontFamily:    "var(--font-display)",
                whiteSpace:    "nowrap",
              }}>
                SOON
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ── Accent colour swatches ──────────────────────────────── */
function AccentPicker({ value, onChange }) {
  return (
    <div style={{
      display:  "flex",
      flexWrap: "wrap",
      gap:      "var(--space-4)",
    }}>
      {Object.entries(ACCENT_COLORS).map(([key, { hex, label }]) => {
        const isActive = value === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            title={label}
            aria-label={label}
            style={{
              display:       "flex",
              flexDirection: "column",
              alignItems:    "center",
              gap:           "var(--space-2)",
              background:    "none",
              border:        "none",
              cursor:        "pointer",
              padding:       "var(--space-2)",
              borderRadius:  "var(--radius-md)",
              transition:    "transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            {/* Colour circle */}
            <div style={{
              width:      "36px",
              height:     "36px",
              borderRadius: "50%",
              background: hex,
              border:     isActive
                ? `3px solid var(--color-gold-warm)`
                : "3px solid transparent",
              outline:    isActive
                ? "2px solid rgba(240,192,96,0.4)"
                : "2px solid transparent",
              outlineOffset: "2px",
              boxShadow:  isActive
                ? `0 0 14px ${hex}60`
                : `0 2px 8px ${hex}40`,
              transition: "all 0.2s ease",
              position:   "relative",
            }}>
              {/* Check mark on active */}
              {isActive && (
                <svg
                  style={{
                    position:  "absolute",
                    inset:     0,
                    margin:    "auto",
                    width:     "14px",
                    height:    "14px",
                  }}
                  viewBox="0 0 24 24" fill="none"
                  stroke="#ffffff" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>
            {/* Label */}
            <span style={{
              fontFamily:    "var(--font-body)",
              fontSize:      "0.62rem",
              letterSpacing: "0.04em",
              color:         isActive
                ? "var(--color-gold-warm)"
                : "var(--color-muted)",
              transition:    "color 0.2s ease",
              whiteSpace:    "nowrap",
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ── Font pairing cards ───────────────────────────────────── */
function FontPicker({ value, onChange }) {
  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      gap:           "var(--space-3)",
    }}>
      {Object.entries(FONT_FAMILIES).map(([key, { label, description, heading, body, sample }]) => {
        const isActive = value === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              background:   isActive
                ? "rgba(240,192,96,0.07)"
                : "rgba(13,20,40,0.5)",
              border:       `1px solid ${isActive
                ? "var(--color-gold-warm)"
                : "var(--color-border)"}`,
              borderRadius: "var(--radius-lg)",
              padding:      "var(--space-4) var(--space-5)",
              cursor:       "pointer",
              textAlign:    "left",
              transition:   "all 0.2s ease",
              display:      "flex",
              flexDirection: "column",
              gap:          "var(--space-2)",
              minHeight:    "44px",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "var(--color-border-hover)"
                e.currentTarget.style.background  = "rgba(13,20,40,0.7)"
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "var(--color-border)"
                e.currentTarget.style.background  = "rgba(13,20,40,0.5)"
              }
            }}
          >
            {/* Pairing name + description row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "0.62rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color:         isActive
                  ? "var(--color-gold-warm)"
                  : "var(--color-soft)",
              }}>
                {label}
              </span>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize:   "0.68rem",
                color:      "var(--color-faint)",
              }}>
                {description}
              </span>
            </div>

            {/* Sample text rendered in this pairing's own fonts */}
            <p style={{
              fontFamily: heading,
              fontStyle:  "italic",
              fontWeight: 300,
              fontSize:   "0.95rem",
              color:      isActive
                ? "var(--color-divine)"
                : "var(--color-muted)",
              margin:     0,
              lineHeight: 1.5,
            }}>
              &ldquo;{sample}&rdquo;
            </p>
            <p style={{
              fontFamily: body,
              fontSize:   "0.75rem",
              color:      "var(--color-faint)",
              margin:     0,
            }}>
              Body text example — {label}
            </p>
          </button>
        )
      })}
    </div>
  )
}

/* ── Bible translation select ─────────────────────────────── */
function TranslationSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background:    "rgba(13,20,40,0.8)",
        border:        "1px solid var(--color-border)",
        borderRadius:  "var(--radius-lg)",
        padding:       "var(--space-3) var(--space-4)",
        color:         "var(--color-divine)",
        fontFamily:    "var(--font-body)",
        fontSize:      "0.85rem",
        cursor:        "pointer",
        outline:       "none",
        width:         "100%",
        maxWidth:      "340px",
        minHeight:     "44px",
        transition:    "border-color 0.2s ease",
      }}
      onFocus={(e)  => { e.target.style.borderColor = "var(--color-gold-warm)" }}
      onBlur={(e)   => { e.target.style.borderColor = "var(--color-border)"    }}
    >
      {BIBLE_TRANSLATIONS.map(({ value: v, label }) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  )
}

/* ── Language option buttons ─────────────────────────────── */
function LanguagePicker({ value, onChange }) {
  const languages = [
    { key: "en", label: "English",   soon: false },
    { key: "sw", label: "Swahili",   soon: true  },
  ]

  return (
    <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
      {languages.map(({ key, label, soon }) => {
        const isActive = value === key
        return (
          <button
            key={key}
            onClick={() => !soon && onChange(key)}
            disabled={soon}
            title={soon ? "Coming soon" : undefined}
            style={{
              position:     "relative",
              padding:      "var(--space-2) var(--space-5)",
              background:   isActive
                ? "rgba(240,192,96,0.1)"
                : "rgba(13,20,40,0.6)",
              border:       `1px solid ${isActive
                ? "var(--color-gold-warm)"
                : "var(--color-border)"}`,
              borderRadius: "var(--radius-full)",
              color:        isActive
                ? "var(--color-gold-warm)"
                : soon ? "var(--color-faint)" : "var(--color-soft)",
              fontFamily:   "var(--font-body)",
              fontSize:     "0.82rem",
              cursor:       soon ? "not-allowed" : "pointer",
              transition:   "all 0.2s ease",
              minHeight:    "44px",
              opacity:      soon ? 0.5 : 1,
            }}
          >
            {label}
            {soon && (
              <span style={{
                position:      "absolute",
                top:           "-8px",
                right:         "-4px",
                background:    "rgba(240,192,96,0.15)",
                border:        "1px solid rgba(240,192,96,0.3)",
                borderRadius:  "var(--radius-full)",
                padding:       "1px 6px",
                fontSize:      "0.52rem",
                letterSpacing: "0.08em",
                color:         "var(--color-gold-warm)",
                fontFamily:    "var(--font-display)",
                whiteSpace:    "nowrap",
              }}>
                SOON
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ── Main Settings Page ──────────────────────────────────── */
export default function SettingsPage() {
  const { settings, updateSetting } = useSettings()
  const [mounted, setMounted]       = useState(false)

  // Prevent hydration mismatch — only render settings UI client-side
  useEffect(() => setMounted(true), [])

  if (!mounted) {
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
          Loading your preferences…
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
        maxWidth:      "620px",
        margin:        "0 auto",
        display:       "flex",
        flexDirection: "column",
        gap:           "var(--space-5)",
      }}>

        {/* ── Page header ─────────────────────────────── */}
        <div style={{ marginBottom: "var(--space-4)" }}>
          <p style={{
            fontFamily:    "var(--font-display)",
            fontSize:      "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color:         "var(--color-gold-warm)",
            marginBottom:  "var(--space-3)",
          }}>
            Preferences
          </p>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize:   "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 300,
            color:      "var(--color-divine)",
            lineHeight: 1.3,
          }}>
            Settings
          </h1>
          <p style={{
            fontFamily:  "var(--font-body)",
            fontSize:    "0.85rem",
            color:       "var(--color-muted)",
            marginTop:   "var(--space-2)",
            lineHeight:  "var(--leading-relaxed)",
          }}>
            Changes apply instantly — no save button needed.
          </p>
        </div>

        {/* ── Appearance ──────────────────────────────── */}
        <Card>
          <SectionLabel>Appearance</SectionLabel>

          <FieldLabel>Theme</FieldLabel>
          <ThemeToggle
            value={settings.theme}
            onChange={(v) => updateSetting("theme", v)}
          />

          <Divider />

          <FieldLabel>Accent colour</FieldLabel>
          <AccentPicker
            value={settings.accentColor}
            onChange={(v) => updateSetting("accentColor", v)}
          />

          <Divider />

          <FieldLabel>Font pairing</FieldLabel>
          <FontPicker
            value={settings.fontFamily}
            onChange={(v) => updateSetting("fontFamily", v)}
          />
        </Card>

        {/* ── Bible ───────────────────────────────────── */}
        <Card>
          <SectionLabel>Bible</SectionLabel>
          <FieldLabel>Default translation</FieldLabel>
          <TranslationSelect
            value={settings.bibleTranslation}
            onChange={(v) => updateSetting("bibleTranslation", v)}
          />
          <p style={{
            fontFamily:  "var(--font-body)",
            fontSize:    "0.72rem",
            color:       "var(--color-faint)",
            marginTop:   "var(--space-3)",
            lineHeight:  "var(--leading-relaxed)",
          }}>
            Applies to the companion and the upcoming Bible reader.
            You can still change the translation per session in the companion header.
          </p>
        </Card>

        {/* ── Language ────────────────────────────────── */}
        <Card>
          <SectionLabel>Language</SectionLabel>
          <FieldLabel>Interface language</FieldLabel>
          <LanguagePicker
            value={settings.language}
            onChange={(v) => updateSetting("language", v)}
          />
        </Card>

        {/* ── Account navigation ──────────────────────── */}
        <Card>
          <SectionLabel>Account</SectionLabel>
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <a
              href="/account"
              style={{
                background:     "none",
                border:         "1px solid var(--color-border)",
                borderRadius:   "var(--radius-lg)",
                padding:        "var(--space-3) var(--space-5)",
                color:          "var(--color-soft)",
                fontFamily:     "var(--font-display)",
                fontSize:       "0.65rem",
                letterSpacing:  "0.15em",
                textDecoration: "none",
                display:        "inline-block",
                transition:     "all 0.2s ease",
                minHeight:      "44px",
                display:        "flex",
                alignItems:     "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-gold-warm)"
                e.currentTarget.style.color       = "var(--color-gold-warm)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)"
                e.currentTarget.style.color       = "var(--color-soft)"
              }}
            >
              YOUR ACCOUNT
            </a>

            <a
              href="/journey"
              style={{
                background:     "none",
                border:         "1px solid var(--color-border)",
                borderRadius:   "var(--radius-lg)",
                padding:        "var(--space-3) var(--space-5)",
                color:          "var(--color-muted)",
                fontFamily:     "var(--font-display)",
                fontSize:       "0.65rem",
                letterSpacing:  "0.15em",
                textDecoration: "none",
                display:        "inline-block",
                transition:     "all 0.2s ease",
                minHeight:      "44px",
                display:        "flex",
                alignItems:     "center",
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
              OPEN COMPANION
            </a>
          </div>
        </Card>

        {/* ── Bottom quote ────────────────────────────── */}
        <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
          <p style={{
            fontFamily: "var(--font-heading)",
            fontStyle:  "italic",
            fontSize:   "0.85rem",
            color:      "var(--color-faint)",
          }}>
            &ldquo;He has made everything beautiful in its time.&rdquo; — Eccl 3:11
          </p>
        </div>

      </div>
    </div>
  )
}