"use client"

import { useEffect } from "react"
import { useSettings } from "@/context/SettingsContext"

/*
  ThemeApplier — place this inside the root layout, inside the SettingsProvider.
  It watches settings.theme and does two things:
    1. Sets data-theme on <html> so CSS [data-theme="light"] selectors fire
    2. Injects a <style id="kairos-theme"> tag with CSS variable overrides
       so every page in the app responds to the theme instantly.

  Usage in src/app/layout.jsx:
    <SettingsProvider>
      <ThemeApplier />
      {children}
    </SettingsProvider>
*/

/* ── Light theme CSS variable overrides ── */
const LIGHT_CSS = `
  :root, [data-theme="light"] {
    --color-void:         #f0ede6;
    --color-deep:         #e8e4dc;
    --color-surface:      #ffffff;
    --color-elevated:     #f7f5f0;
    --color-border:       rgba(0,0,0,0.09);
    --color-border-subtle:rgba(0,0,0,0.06);

    --color-divine:       #1a1826;
    --color-soft:         #2e2c3a;
    --color-muted:        #5a5870;
    --color-faint:        #8a889a;

    --color-gold-warm:    #b8860a;
    --color-gold-deep:    #a07608;
    --color-gold-subtle:  rgba(184,134,10,0.1);

    --gradient-hero:      linear-gradient(160deg, #f0ede6 0%, #e4e0d8 100%);
    --gradient-text:      linear-gradient(135deg, #b8860a 0%, #d4a830 100%);
    --gradient-gold:      linear-gradient(135deg, #c8980e 0%, #e0b820 100%);
    --gradient-glow:      radial-gradient(ellipse at center, rgba(184,134,10,0.08) 0%, transparent 70%);

    --shadow-card:        0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    --shadow-gold-sm:     0 2px 12px rgba(184,134,10,0.25);
    --shadow-gold-md:     0 4px 24px rgba(184,134,10,0.3);
    --shadow-deep:        0 8px 32px rgba(0,0,0,0.1);

    color-scheme: light;
  }

  /* Ensure select option backgrounds work in light mode */
  [data-theme="light"] select option { background: #f0ede6; color: #1a1826; }

  /* Scrollbar in light mode */
  [data-theme="light"] ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); }
`

/* ── Dark theme (restores defaults) ── */
const DARK_CSS = `
  :root, [data-theme="dark"] {
    --color-void:         #060912;
    --color-deep:         #0a0d18;
    --color-surface:      rgba(13,20,40,0.8);
    --color-elevated:     rgba(20,29,53,0.8);
    --color-border:       rgba(255,255,255,0.08);
    --color-border-subtle:rgba(255,255,255,0.05);

    --color-divine:       rgba(255,255,255,0.92);
    --color-soft:         rgba(255,255,255,0.72);
    --color-muted:        rgba(255,255,255,0.42);
    --color-faint:        rgba(255,255,255,0.22);

    --color-gold-warm:    #f0c060;
    --color-gold-deep:    #d4a040;
    --color-gold-subtle:  rgba(240,192,96,0.08);

    --gradient-hero:      linear-gradient(160deg, #060912 0%, #0d1428 100%);
    --gradient-text:      linear-gradient(135deg, #f0c060 0%, #d4a040 100%);
    --gradient-gold:      linear-gradient(135deg, #f0c060 0%, #d4903a 100%);
    --gradient-glow:      radial-gradient(ellipse at center, rgba(240,192,96,0.06) 0%, transparent 70%);

    --shadow-card:        0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2);
    --shadow-gold-sm:     0 2px 12px rgba(240,192,96,0.2);
    --shadow-gold-md:     0 4px 24px rgba(240,192,96,0.25);
    --shadow-deep:        0 8px 48px rgba(0,0,0,0.6);

    color-scheme: dark;
  }
`

/* ── Font theme overrides ── */
const FONT_CSS = {
  default: "",
  serif: `
    :root {
      --font-heading: "Georgia", "Times New Roman", serif;
      --font-body:    "Georgia", "Times New Roman", serif;
    }
  `,
  mono: `
    :root {
      --font-heading: "JetBrains Mono", "Fira Code", "Courier New", monospace;
      --font-body:    "JetBrains Mono", "Fira Code", "Courier New", monospace;
    }
  `,
}

/* ── Accent colour overrides ── */
const ACCENT_CSS = {
  gold: "",   // default — no override needed
  blue: `
    :root {
      --color-gold-warm:   #60b4f0;
      --color-gold-deep:   #4090d0;
      --color-gold-subtle: rgba(96,180,240,0.08);
      --gradient-gold:     linear-gradient(135deg, #60b4f0 0%, #3a80d0 100%);
      --gradient-text:     linear-gradient(135deg, #60b4f0 0%, #4090d0 100%);
      --shadow-gold-sm:    0 2px 12px rgba(96,180,240,0.25);
      --shadow-gold-md:    0 4px 24px rgba(96,180,240,0.3);
    }
  `,
  purple: `
    :root {
      --color-gold-warm:   #c090f0;
      --color-gold-deep:   #a060d0;
      --color-gold-subtle: rgba(192,144,240,0.08);
      --gradient-gold:     linear-gradient(135deg, #c090f0 0%, #9050d0 100%);
      --gradient-text:     linear-gradient(135deg, #c090f0 0%, #a060d0 100%);
      --shadow-gold-sm:    0 2px 12px rgba(192,144,240,0.25);
      --shadow-gold-md:    0 4px 24px rgba(192,144,240,0.3);
    }
  `,
  green: `
    :root {
      --color-gold-warm:   #60d090;
      --color-gold-deep:   #40b070;
      --color-gold-subtle: rgba(96,208,144,0.08);
      --gradient-gold:     linear-gradient(135deg, #60d090 0%, #30a060 100%);
      --gradient-text:     linear-gradient(135deg, #60d090 0%, #40b070 100%);
      --shadow-gold-sm:    0 2px 12px rgba(96,208,144,0.25);
      --shadow-gold-md:    0 4px 24px rgba(96,208,144,0.3);
    }
  `,
  rose: `
    :root {
      --color-gold-warm:   #f090b0;
      --color-gold-deep:   #d06080;
      --color-gold-subtle: rgba(240,144,176,0.08);
      --gradient-gold:     linear-gradient(135deg, #f090b0 0%, #d05080 100%);
      --gradient-text:     linear-gradient(135deg, #f090b0 0%, #d06080 100%);
      --shadow-gold-sm:    0 2px 12px rgba(240,144,176,0.25);
      --shadow-gold-md:    0 4px 24px rgba(240,144,176,0.3);
    }
  `,
}

export default function ThemeApplier() {
  const { settings } = useSettings()

  useEffect(() => {
    const root = document.documentElement

    /* ── 1. Apply data-theme attribute ── */
    const resolvedTheme = settings.theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : (settings.theme || "dark")

    root.setAttribute("data-theme", resolvedTheme)

    /* ── 2. Inject CSS variable overrides ── */
    let tag = document.getElementById("kairos-theme")
    if (!tag) {
      tag = document.createElement("style")
      tag.id = "kairos-theme"
      document.head.appendChild(tag)
    }

    const themeCSS  = resolvedTheme === "light" ? LIGHT_CSS : DARK_CSS
    const fontCSS   = FONT_CSS[settings.readingFont  || "default"] || ""
    const accentCSS = ACCENT_CSS[settings.accentColor || "gold"]   || ""

    tag.textContent = themeCSS + fontCSS + accentCSS

  }, [settings.theme, settings.readingFont, settings.accentColor])

  /* Also react to system preference changes when theme = "system" */
  useEffect(() => {
    if (settings.theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    const handler = (e) => {
      document.documentElement.setAttribute("data-theme", e.matches ? "light" : "dark")
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [settings.theme])

  return null  // renders nothing
}