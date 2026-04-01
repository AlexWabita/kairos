/**
 * KAIROS — Settings Utility
 *
 * Single source of truth for user preferences.
 * - Anonymous users: localStorage only
 * - Authenticated users: localStorage (cache) + Supabase users.settings (sync)
 *
 * applySettings() writes CSS variables directly onto :root so every
 * component that uses var(--font-body), var(--color-accent), etc.
 * updates automatically — no re-render needed.
 */

import { supabase } from "@/lib/supabase/client"

/* ── Defaults ────────────────────────────────────────────── */
export const DEFAULT_SETTINGS = {
  theme:            "dark",
  accentColor:      "gold",
  fontFamily:       "default",
  fontSize:         "md",
  lineSpacing:      "normal",
  readingFont:      "default",
  bibleTranslation: "WEB",
  language:         "en",
}

/* ── Accent palette ──────────────────────────────────────── */
export const ACCENT_COLORS = {
  covenant:     { hex: "#6366F1", label: "Covenant",      description: "Faithful, grounded"    },
  stillwaters:  { hex: "#0EA5E9", label: "Still Waters",  description: "Calm, open"            },
  crimsongrace: { hex: "#E11D48", label: "Crimson Grace", description: "Passion, sacrifice"    },
  olivebranch:  { hex: "#65A30D", label: "Olive Branch",  description: "Growth, peace"         },
  dawn:         { hex: "#F59E0B", label: "Dawn",          description: "Hope, new beginnings"  },
  dusk:         { hex: "#7C3AED", label: "Dusk",          description: "Depth, royalty"        },
  selah:        { hex: "#64748B", label: "Selah",         description: "Timeless, understated" },
  gold:         { hex: "#f0c060", label: "Golden Hour",   description: "Warm, sacred"          },
}

/* ── Font pairings ───────────────────────────────────────── */
export const FONT_FAMILIES = {
  "default": {
    label:       "Kairos Default",
    description: "Reverent & readable",
    heading:     '"Cormorant Garamond", serif',
    body:        '"Nunito", sans-serif',
    sample:      "He has made everything beautiful in its time.",
  },
  serif: {
    label:       "Serif Classic",
    description: "Timeless scripture feel",
    heading:     '"Georgia", "Times New Roman", serif',
    body:        '"Georgia", "Times New Roman", serif',
    sample:      "He has made everything beautiful in its time.",
  },
  mono: {
    label:       "Monospace Modern",
    description: "Precise & structured",
    heading:     '"JetBrains Mono", monospace',
    body:        '"JetBrains Mono", monospace',
    sample:      "He has made everything beautiful in its time.",
  },
  scholar: {
    label:       "The Scholar",
    description: "Authoritative, like a commentary",
    heading:     '"Playfair Display", serif',
    body:        '"Lato", sans-serif',
    sample:      "He has made everything beautiful in its time.",
  },
  pilgrim: {
    label:       "The Pilgrim",
    description: "Reverent, warm — ancient made accessible",
    heading:     '"Cormorant Garamond", serif',
    body:        '"Source Sans 3", sans-serif',
    sample:      "He has made everything beautiful in its time.",
  },
}

/* ── Bible translations ──────────────────────────────────── */
export const BIBLE_TRANSLATIONS = [
  { value: "WEB", label: "WEB — World English Bible"    },
  { value: "KJV", label: "KJV — King James Version"     },
  { value: "ASV", label: "ASV — American Standard"      },
  { value: "BBE", label: "BBE — Bible in Basic English" },
]

/* ── Load from localStorage ──────────────────────────────── */
export function loadSettings() {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS }
  try {
    const stored = localStorage.getItem("kairos_settings")
    if (!stored) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

/* ── Save — localStorage always + Supabase if authenticated ─ */
export async function saveSettings(settings, userId = null) {
  if (typeof window === "undefined") return

  localStorage.setItem("kairos_settings", JSON.stringify(settings))

  if (userId) {
    try {
      await supabase
        .from("users")
        .update({ settings })
        .eq("id", userId)
    } catch (err) {
      console.warn("[Kairos] Settings DB sync failed:", err.message)
    }
  }
}

/* ── Sync from DB on login (cross-device consistency) ───── */
export async function syncSettingsFromDB(userId) {
  if (!userId) return null
  try {
    const { data } = await supabase
      .from("users")
      .select("settings")
      .eq("id", userId)
      .maybeSingle()

    if (data?.settings && Object.keys(data.settings).length > 0) {
      const merged = { ...DEFAULT_SETTINGS, ...data.settings }
      localStorage.setItem("kairos_settings", JSON.stringify(merged))
      return merged
    }
  } catch (err) {
    console.warn("[Kairos] Settings sync from DB failed:", err.message)
  }
  return null
}

/* ── Apply to DOM — called on every change ───────────────── */
export function applySettings(settings) {
  if (typeof document === "undefined") return

  const root = document.documentElement
  const s = { ...DEFAULT_SETTINGS, ...settings }

  // Theme
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const isDark = s.theme === "dark" || (s.theme === "system" && prefersDark)
  root.setAttribute("data-theme", isDark ? "dark" : "light")

  // Accent colour
  const accent = ACCENT_COLORS[s.accentColor] || ACCENT_COLORS.gold
  const rgb = hexToRgb(accent.hex)
  const dimmed = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`

  root.style.setProperty("--color-accent", accent.hex)
  root.style.setProperty("--color-accent-glow", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`)
  root.style.setProperty("--color-accent-subtle", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`)

  // Override interactive gold with accent
  root.style.setProperty("--color-gold-bright", accent.hex)
  root.style.setProperty("--color-gold-warm", dimmed)
  root.style.setProperty("--color-gold-glow", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`)
  root.style.setProperty("--color-gold-subtle", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`)
  root.style.setProperty("--shadow-input", `0 0 0 3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`)

  // Font pairing
  const fontKey = s.readingFont || s.fontFamily || "default"
  const font = FONT_FAMILIES[fontKey] || FONT_FAMILIES["default"]
  root.style.setProperty("--font-heading", font.heading)
  root.style.setProperty("--font-body", font.body)

  // Reading settings
  const sizes = { sm: "0.925rem", md: "1.0625rem", lg: "1.28rem" }
  const spacings = { tight: 1.65, normal: 1.9, loose: 2.2 }
  root.style.setProperty("--font-size-base", sizes[s.fontSize || "md"])
  root.style.setProperty("--font-size-bible", sizes[s.fontSize || "md"])
  root.style.setProperty("--line-height-reading", spacings[s.lineSpacing || "normal"])
}

/* ── Helpers ─────────────────────────────────────────────── */
function hexToRgb(hex) {
  const clean = hex.replace("#", "")
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}
