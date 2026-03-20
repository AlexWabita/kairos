"use client"

import { useEffect } from "react"
import { useSettings } from "@/context/SettingsContext"

/* ── Light theme CSS variable overrides ── */
const LIGHT_CSS = `
  :root, [data-theme="light"] {
    --color-void:          #f0ede6;
    --color-deep:          #e8e4dc;
    --color-surface:       #ffffff;
    --color-elevated:      #f7f5f0;
    --color-border:        rgba(0,0,0,0.09);
    --color-border-subtle: rgba(0,0,0,0.06);

    --color-divine:        #1a1826;
    --color-soft:          #2e2c3a;
    --color-muted:         #5a5870;
    --color-faint:         #8a889a;

    --color-gold-warm:     #b8860a;
    --color-gold-deep:     #a07608;
    --color-gold-subtle:   rgba(184,134,10,0.1);

    --gradient-hero:       linear-gradient(160deg, #f0ede6 0%, #e4e0d8 100%);
    --gradient-text:       linear-gradient(135deg, #b8860a 0%, #d4a830 100%);
    --gradient-gold:       linear-gradient(135deg, #c8980e 0%, #e0b820 100%);
    --gradient-glow:       radial-gradient(ellipse at center, rgba(184,134,10,0.08) 0%, transparent 70%);

    --shadow-card:         0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    --shadow-gold-sm:      0 2px 12px rgba(184,134,10,0.25);
    --shadow-gold-md:      0 4px 24px rgba(184,134,10,0.3);
    --shadow-deep:         0 8px 32px rgba(0,0,0,0.1);

    color-scheme: light;
  }

  /* ── Select options ── */
  [data-theme="light"] select option {
    background: #f0ede6;
    color: #1a1826;
  }

  /* ── Scrollbar ── */
  [data-theme="light"] ::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.12);
  }

  /* ════════════════════════════════════════════════
     LANDING PAGE — hardcoded rgba(255,255,255,x)
     overrides. These components use inline styles
     so we target their CSS class names instead.
  ════════════════════════════════════════════════ */

  /* ── FAQ section ── */
  [data-theme="light"] #faq {
    background: #e8e4dc !important;
  }
  [data-theme="light"] #faq button span {
    color: var(--color-soft) !important;
  }
  [data-theme="light"] #faq button[aria-expanded="true"] span {
    color: var(--color-divine) !important;
  }
  [data-theme="light"] #faq .faq-answer p {
    color: var(--color-muted) !important;
  }
  /* FAQ sticky header text */
  [data-theme="light"] .faq-header h2 {
    color: var(--color-divine) !important;
  }
  [data-theme="light"] .faq-header p {
    color: var(--color-muted) !important;
  }

  /* ── App page sidebar + surfaces that use hardcoded dark values ── */
  [data-theme="light"] aside {
    background: rgba(0,0,0,0.02) !important;
    border-right-color: var(--color-border) !important;
  }

  /* ── Companion chat bubbles ── */
  [data-theme="light"] .companion-bubble-user {
    background: rgba(0,0,0,0.05) !important;
    border-color: rgba(0,0,0,0.08) !important;
    color: var(--color-divine) !important;
  }
  [data-theme="light"] .companion-bubble-ai {
    background: rgba(0,0,0,0.03) !important;
    border-color: rgba(0,0,0,0.06) !important;
    color: var(--color-divine) !important;
  }

  /* ── Card surfaces that use hardcoded rgba(20,29,53) etc. ── */
  [data-theme="light"] .kairos-card {
    background: #ffffff !important;
    border-color: rgba(0,0,0,0.08) !important;
  }

  /* ── Mobile nav bar ── */
  [data-theme="light"] .pd-mobile-nav,
  [data-theme="light"] .dp-mobile-nav,
  [data-theme="light"] .js-mobile-nav {
    background: rgba(240,237,230,0.95) !important;
    border-top-color: rgba(0,0,0,0.08) !important;
  }

  /* ── Homepage nav overlay (mobile menu) ── */
  [data-theme="light"] .hn-mobile-menu {
    background: rgba(240,237,230,0.98) !important;
  }
  [data-theme="light"] .hn-mobile-menu a,
  [data-theme="light"] .hn-mobile-menu button {
    color: var(--color-soft) !important;
    border-color: rgba(0,0,0,0.07) !important;
  }

  /* ── Textarea / input in light mode ── */
  [data-theme="light"] textarea,
  [data-theme="light"] input[type="text"],
  [data-theme="light"] input[type="email"],
  [data-theme="light"] select {
    background: #ffffff !important;
    color: var(--color-divine) !important;
    border-color: rgba(0,0,0,0.12) !important;
  }
  [data-theme="light"] textarea::placeholder,
  [data-theme="light"] input::placeholder {
    color: var(--color-faint) !important;
  }
`

/* ── Dark theme (restores defaults) ── */
const DARK_CSS = `
  :root, [data-theme="dark"] {
    --color-void:          #060912;
    --color-deep:          #0a0d18;
    --color-surface:       rgba(13,20,40,0.8);
    --color-elevated:      rgba(20,29,53,0.8);
    --color-border:        rgba(255,255,255,0.08);
    --color-border-subtle: rgba(255,255,255,0.05);

    --color-divine:        rgba(255,255,255,0.92);
    --color-soft:          rgba(255,255,255,0.72);
    --color-muted:         rgba(255,255,255,0.42);
    --color-faint:         rgba(255,255,255,0.22);

    --color-gold-warm:     #f0c060;
    --color-gold-deep:     #d4a040;
    --color-gold-subtle:   rgba(240,192,96,0.08);

    --gradient-hero:       linear-gradient(160deg, #060912 0%, #0d1428 100%);
    --gradient-text:       linear-gradient(135deg, #f0c060 0%, #d4a040 100%);
    --gradient-gold:       linear-gradient(135deg, #f0c060 0%, #d4903a 100%);
    --gradient-glow:       radial-gradient(ellipse at center, rgba(240,192,96,0.06) 0%, transparent 70%);

    --shadow-card:         0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2);
    --shadow-gold-sm:      0 2px 12px rgba(240,192,96,0.2);
    --shadow-gold-md:      0 4px 24px rgba(240,192,96,0.25);
    --shadow-deep:         0 8px 48px rgba(0,0,0,0.6);

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
  gold: "",
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

    /* ── 1. Resolve theme ── */
    const resolvedTheme = settings.theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : (settings.theme || "dark")

    root.setAttribute("data-theme", resolvedTheme)

    /* ── 2. Inject CSS ── */
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

  /* ── React to OS preference when theme = "system" ── */
  useEffect(() => {
    if (settings.theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    const handler = (e) => {
      document.documentElement.setAttribute("data-theme", e.matches ? "light" : "dark")
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [settings.theme])

  return null
}