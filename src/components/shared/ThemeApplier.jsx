"use client"

import { useEffect } from "react"
import { useSettings } from "@/context/SettingsContext"

/* ── Light theme CSS variable overrides ── */
/* ── Light theme - Premium crisp navy-gold ── */
const LIGHT_CSS = `
  :root[data-theme="light"], [data-theme="light"] {
    --color-void:          #f8f9fa;
    --color-deep:          #e9ecef;
    --color-surface:       #ffffff;
    --color-elevated:      #f8f9fa;
    --color-border:        rgba(0,0,0,0.12);
    --color-border-subtle: rgba(0,0,0,0.08);

    --color-divine:        #0f172a; /* slate-900 */
    --color-soft:          #1e293b; /* slate-800 */
    --color-muted:         #475569; /* slate-600 */
    --color-faint:         #64748b; /* slate-500 */

    --color-gold-warm:     #d4af37; /* premium gold */
    --color-gold-deep:     #b8942f;
    --color-gold-subtle:   rgba(212,175,55,0.12);

    --gradient-hero:       linear-gradient(160deg, #f8f9fa 0%, #e9ecef 70%);
    --gradient-text:       linear-gradient(135deg, #d4af37 0%, #eab308 70%);
    --gradient-gold:       linear-gradient(135deg, #d4af37 0%, #eab308 50%, #ca8a04 100%);
    --gradient-glow:       radial-gradient(circle at 30% 30%, rgba(212,175,55,0.15) 0%, transparent 60%);

    --shadow-card:         0 1px 3px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.08);
    --shadow-gold-sm:      0 4px 16px rgba(212,175,55,0.25);
    --shadow-gold-md:      0 8px 32px rgba(212,175,55,0.3);
    --shadow-deep:         0 20px 60px rgba(0,0,0,0.15);

    color-scheme: light;
  }
  :root, [data-theme="light"] {
    --color-void:          #f8f9fa;
    --color-deep:          #f1f3f4;
    --color-surface:       #ffffff;
    --color-elevated:      #f8f9fa;
    --color-border:        rgba(0,0,0,0.12);
    --color-border-subtle: rgba(0,0,0,0.08);

    --color-divine:        #1a1a2e;
    --color-soft:          #2d2d44;
    --color-muted:         #5a5a7a;
    --color-faint:         #8a8aa8;

    --color-gold-warm:     #d4af37;
    --color-gold-deep:     #b8942f;
    --color-gold-subtle:   rgba(212,175,55,0.12);

    --gradient-hero:       linear-gradient(160deg, #f8f9fa 0%, #f1f3f4 100%);
    --gradient-text:       linear-gradient(135deg, #d4af37 0%, #e6b800 100%);
    --gradient-gold:       linear-gradient(135deg, #d4af37 0%, #e6b800 100%);
    --gradient-glow:       radial-gradient(ellipse at center, rgba(212,175,55,0.1) 0%, transparent 70%);

    --shadow-card:         0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
    --shadow-gold-sm:      0 2px 12px rgba(212,175,55,0.3);
    --shadow-gold-md:      0 4px 24px rgba(212,175,55,0.35);
    --shadow-deep:         0 8px 32px rgba(0,0,0,0.12);

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
/* ── Dark theme ── */
const DARK_CSS = `
  :root[data-theme="dark"], [data-theme="dark"] {
    --color-void:          #02040a;
    --color-deep:          #0a0f1e;
    --color-surface:       rgba(15,23,42,0.85);
    --color-elevated:      rgba(24,37,66,0.85);
    --color-border:        rgba(255,255,255,0.1);
    --color-border-subtle: rgba(255,255,255,0.06);

    --color-divine:        rgba(255,255,255,0.95);
    --color-soft:          rgba(255,255,255,0.8);
    --color-muted:         rgba(148,163,184,0.9);
    --color-faint:         rgba(148,163,184,0.6);

    --color-gold-warm:     #facc15;
    --color-gold-deep:     #eab308;
    --color-gold-subtle:   rgba(250,204,21,0.12);

    --gradient-hero:       linear-gradient(160deg, #02040a 0%, #0a0f1e 70%);
    --gradient-text:       linear-gradient(135deg, #facc15 0%, #eab308 70%);
    --gradient-gold:       linear-gradient(135deg, #facc15 0%, #eab308 50%, #ca8a04 100%);
    --gradient-glow:       radial-gradient(circle at 30% 30%, rgba(250,204,21,0.15) 0%, transparent 60%);

    --shadow-card:         0 4px 16px rgba(0,0,0,0.4), 0 0 1px rgba(250,204,21,0.2);
    --shadow-gold-sm:      0 8px 24px rgba(250,204,21,0.25);
    --shadow-gold-md:      0 16px 48px rgba(250,204,21,0.3);
    --shadow-deep:         0 32px 80px rgba(0,0,0,0.7);

    color-scheme: dark;
  }
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

/* ── Accent colour overrides (premium light/dark) ── */
const ACCENT_CSS = {
  gold: "",
  blue: `
    :root {
      --color-gold-warm:   #2563eb;
      --color-gold-deep:   #1d4ed8;
      --color-gold-subtle: rgba(37,99,235,0.12);
      --gradient-gold:     linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      --gradient-text:     linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      --shadow-gold-sm:    0 2px 12px rgba(37,99,235,0.3);
      --shadow-gold-md:    0 4px 24px rgba(37,99,235,0.35);
    }
  `,
  purple: `
    :root {
      --color-gold-warm:   #7c3aed;
      --color-gold-deep:   #6d28d9;
      --color-gold-subtle: rgba(124,58,237,0.12);
      --gradient-gold:     linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      --gradient-text:     linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      --shadow-gold-sm:    0 2px 12px rgba(124,58,237,0.3);
      --shadow-gold-md:    0 4px 24px rgba(124,58,237,0.35);
    }
  `,
  green: `
    :root {
      --color-gold-warm:   #059669;
      --color-gold-deep:   #047857;
      --color-gold-subtle: rgba(5,150,105,0.12);
      --gradient-gold:     linear-gradient(135deg, #059669 0%, #047857 100%);
      --gradient-text:     linear-gradient(135deg, #059669 0%, #047857 100%);
      --shadow-gold-sm:    0 2px 12px rgba(5,150,105,0.3);
      --shadow-gold-md:    0 4px 24px rgba(5,150,105,0.35);
    }
  `,
  rose: `
    :root {
      --color-gold-warm:   #e11d48;
      --color-gold-deep:   #be123c;
      --color-gold-subtle: rgba(225,29,72,0.12);
      --gradient-gold:     linear-gradient(135deg, #e11d48 0%, #be123c 100%);
      --gradient-text:     linear-gradient(135deg, #e11d48 0%, #be123c 100%);
      --shadow-gold-sm:    0 2px 12px rgba(225,29,72,0.3);
      --shadow-gold-md:    0 4px 24px rgba(225,29,72,0.35);
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