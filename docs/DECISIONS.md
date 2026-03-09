# KAIROS — Design Language Document
> Version: 1.0.0 | Phase 3 | Status: Complete

---

## DESIGN PHILOSOPHY

**The Concept: Sacred Light**

Kairos should feel like walking into an ancient cathedral at dusk —
deep, warm, alive, and set apart from the noise of the world.
Not religious-clipart Christianity. Not generic spiritual purple gradients.
Something genuinely sacred, modern, and unforgettable.

**The Three Pillars of Kairos Design:**
1. DEPTH — Every screen has layers. Nothing feels flat.
2. WARMTH — Gold light, amber tones, the feeling of candlelight on stone.
3. MOVEMENT — The product breathes. Light moves. Particles float. It is alive.

**What We Avoid:**
- White backgrounds with colorful buttons (generic SaaS)
- Purple gradients (overused "spiritual" look)
- Cross icons and dove clipart (cheap religious feel)
- Stock church photography
- Rigid, corporate layouts

---

## COLOR SYSTEM

### Primary Palette

```css
:root {
  /* === FOUNDATIONS === */
  --color-void:         #060912;   /* Deepest background — near black with blue soul */
  --color-deep:         #0d1428;   /* Primary background — midnight cathedral */
  --color-surface:      #141d35;   /* Cards, panels — slightly lifted */
  --color-elevated:     #1c2845;   /* Hover states, modals */
  --color-border:       #2a3a5c;   /* Subtle borders */

  /* === SACRED GOLD === */
  --color-gold-bright:  #f0c060;   /* Primary accent — divine light */
  --color-gold-warm:    #d4a040;   /* Secondary gold — aged and warm */
  --color-gold-deep:    #a07828;   /* Deep gold — shadows and depth */
  --color-gold-glow:    rgba(240, 192, 96, 0.15);  /* Glow halos */

  /* === LIGHT === */
  --color-light-divine: #fff8e8;   /* Purest text — warm white */
  --color-light-soft:   #c8d4f0;   /* Secondary text — moonlit */
  --color-light-muted:  #6878a8;   /* Tertiary text — distant light */

  /* === ACCENTS === */
  --color-ember:        #e06030;   /* Warning, urgency — burning coal */
  --color-peace:        #4090d0;   /* Info, calm — still water */
  --color-life:         #40a870;   /* Success, growth — living green */
  --color-crisis:       #c03040;   /* Crisis detection — urgent care */

  /* === GRADIENTS === */
  --gradient-hero:      linear-gradient(135deg, #060912 0%, #0d1428 50%, #1a1030 100%);
  --gradient-gold:      linear-gradient(135deg, #f0c060 0%, #d4a040 50%, #a07828 100%);
  --gradient-surface:   linear-gradient(180deg, #141d35 0%, #0d1428 100%);
  --gradient-glow:      radial-gradient(ellipse at center, rgba(240,192,96,0.2) 0%, transparent 70%);
}
```

### Color Usage Rules

| Element | Color |
|---|---|
| Page backgrounds | `--color-void` to `--color-deep` |
| Cards and panels | `--color-surface` |
| Primary text | `--color-light-divine` |
| Secondary text | `--color-light-soft` |
| Muted/placeholder | `--color-light-muted` |
| Primary buttons | `--gradient-gold` |
| Borders | `--color-border` |
| Focus rings | `--color-gold-bright` |
| Gold accents | `--color-gold-warm` |
| Glow effects | `--color-gold-glow` |

---

## TYPOGRAPHY

### Font Pairing

```css
/* Display Font — Cinzel */
/* Feels: Eternal, carved in stone, ancient authority, timeless */
/* Used for: Page titles, hero headings, Kairos logo */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&display=swap');

/* Heading Font — Cormorant Garamond */
/* Feels: Refined, literary, warm intelligence, depth */
/* Used for: Section headings, companion responses, important quotes */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

/* Body Font — Inter (but used sparingly for UI only) */
/* Actually use: Nunito — rounder, warmer, more approachable */
/* Used for: UI labels, navigation, buttons, small text */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600&display=swap');
```

### Type Scale

```css
:root {
  /* Display — Cinzel */
  --text-display-xl:  clamp(3rem, 8vw, 7rem);     /* Hero title "KAIROS" */
  --text-display-lg:  clamp(2rem, 5vw, 4rem);      /* Page heroes */
  --text-display-md:  clamp(1.5rem, 3vw, 2.5rem);  /* Section titles */

  /* Headings — Cormorant Garamond */
  --text-heading-lg:  clamp(1.5rem, 2.5vw, 2rem);
  --text-heading-md:  clamp(1.2rem, 2vw, 1.5rem);
  --text-heading-sm:  1.125rem;

  /* Body — Nunito */
  --text-body-lg:     1.125rem;
  --text-body-md:     1rem;
  --text-body-sm:     0.875rem;
  --text-caption:     0.75rem;

  /* Line Heights */
  --leading-tight:    1.2;
  --leading-normal:   1.6;
  --leading-relaxed:  1.8;   /* Used for companion responses — easier to read */

  /* Letter Spacing */
  --tracking-display: 0.15em;   /* Cinzel headings get wide spacing */
  --tracking-normal:  0.02em;
  --tracking-tight:   -0.02em;
}
```

### Typography Rules

- Cinzel is ONLY for the Kairos logo and hero display text — never body
- Companion responses always use Cormorant Garamond — it feels like wisdom
- UI elements always use Nunito — clean and friendly
- Scripture references use Cormorant Garamond italic — set apart visually
- Never use ALL CAPS for body text — only for small labels in Nunito

---

## SPACING & LAYOUT

```css
:root {
  /* Spacing Scale */
  --space-1:   0.25rem;   /*  4px */
  --space-2:   0.5rem;    /*  8px */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.5rem;    /* 24px */
  --space-6:   2rem;      /* 32px */
  --space-8:   3rem;      /* 48px */
  --space-10:  4rem;      /* 64px */
  --space-16:  6rem;      /* 96px */
  --space-24:  8rem;      /* 128px */

  /* Border Radius */
  --radius-sm:   0.375rem;
  --radius-md:   0.75rem;
  --radius-lg:   1.25rem;
  --radius-xl:   2rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-gold-sm:  0 0 20px rgba(240,192,96,0.1);
  --shadow-gold-md:  0 0 40px rgba(240,192,96,0.15);
  --shadow-gold-lg:  0 0 80px rgba(240,192,96,0.2);
  --shadow-deep:     0 20px 60px rgba(0,0,0,0.5);
  --shadow-card:     0 4px 24px rgba(0,0,0,0.4), 0 0 1px rgba(240,192,96,0.1);
}
```

### Layout Rules

- Max content width: 1200px centered
- Mobile-first — all layouts start at mobile, expand up
- Never center-align body text blocks — left-align for readability
- Generous padding — Kairos should never feel cramped
- Overlapping elements are encouraged — depth and layers

---

## ANIMATION SYSTEM

### Principles
1. **Purposeful** — Every animation has meaning. Nothing moves without reason.
2. **Unhurried** — Kairos is calm. Animations are gentle, not frantic.
3. **Sacred** — Movements should feel like light, breath, or water. Never mechanical.

### Timing Variables

```css
:root {
  --ease-sacred:    cubic-bezier(0.25, 0.46, 0.45, 0.94);  /* Gentle ease */
  --ease-divine:    cubic-bezier(0.16, 1, 0.3, 1);          /* Dramatic then settle */
  --ease-breathe:   cubic-bezier(0.45, 0.05, 0.55, 0.95);   /* In and out */

  --duration-instant:  100ms;
  --duration-fast:     200ms;
  --duration-normal:   400ms;
  --duration-slow:     700ms;
  --duration-breath:   3000ms;   /* For ambient breathing animations */
  --duration-float:    6000ms;   /* For floating particles */
}
```

### Core Animations

```css
/* Ambient glow breathing — used on hero and companion */
@keyframes breathe-glow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%       { opacity: 0.8; transform: scale(1.05); }
}

/* Particle float — used in hero background */
@keyframes particle-float {
  0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(-100vh) translateX(30px) rotate(360deg); opacity: 0; }
}

/* Companion response reveal — text appears word by word */
@keyframes word-reveal {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Gold light ray sweep */
@keyframes light-ray {
  0%   { transform: rotate(0deg) translateX(-50%); opacity: 0; }
  50%  { opacity: 0.3; }
  100% { transform: rotate(180deg) translateX(-50%); opacity: 0; }
}

/* Page entrance — staggered reveal */
@keyframes sacred-enter {
  from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
  to   { opacity: 1; transform: translateY(0); filter: blur(0); }
}

/* Gold shimmer on hover */
@keyframes gold-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
```

### 3D Elements Strategy

We use Three.js for hero backgrounds. Key 3D scenes:

**Scene 1 — Hero Background: "The Firmament"**
- Deep space of softly glowing particles
- Some particles are connected by thin gold lines (constellation effect)
- Slow rotation responding to mouse movement (parallax)
- Central light source — divine point of light — that pulses gently
- Built with Three.js, renders behind all content

**Scene 2 — Companion Interaction: "Sacred Space"**
- When the companion is active, background shifts
- Soft volumetric light rays appear from above
- Particles gather slightly toward the user's input
- Feels like the space is listening

**Scene 3 — Journey Map: "The Path"**
- User's journey entries appear as glowing nodes
- Connected by golden paths
- 3D perspective view, can be rotated gently
- Each node glows more intensely as more entries are added

### CSS 3D Effects (No library needed)

```css
/* Card depth effect */
.kairos-card {
  transform-style: preserve-3d;
  transition: transform var(--duration-normal) var(--ease-sacred);
}
.kairos-card:hover {
  transform: translateY(-4px) rotateX(2deg) rotateY(-1deg);
  box-shadow: var(--shadow-gold-md), var(--shadow-deep);
}

/* Companion response bubble depth */
.companion-response {
  transform: perspective(1000px) rotateX(0deg);
  transition: transform var(--duration-slow) var(--ease-divine);
}
```

---

## COMPONENT DESIGN LANGUAGE

### The Companion Interface (NOT a chat bubble)

The companion interaction is the heart of Kairos. It must not look like
a chat application. Instead:

- **Full-screen immersive** — when Kairos is speaking, the world fades
- **Single focused input** — one beautiful text field at the bottom, not a chat log
- **Companion response appears as flowing text** — word by word, like someone speaking
- **No speech bubbles** — text floats in the space, not boxed
- **Ambient background shifts** — the 3D scene responds to the conversation depth
- **Scripture references glow softly** — pulled out and displayed with gold styling

### Cards

```
Surface:      --color-surface background
Border:       1px solid --color-border with subtle gold glow on hover
Radius:       --radius-lg (1.25rem)
Shadow:       --shadow-card
Hover:        lifts with --shadow-gold-sm, border brightens
Inner glow:   subtle radial gradient from top-left corner
```

### Buttons

```
Primary:      --gradient-gold background, dark text, Nunito semibold
              Hover: brightens + shadow-gold-sm
              Active: slightly depresses (scale 0.98)

Secondary:    Transparent, --color-gold-warm border, --color-gold-warm text
              Hover: background fills with --color-gold-glow

Ghost:        No border, --color-light-muted text
              Hover: text becomes --color-light-divine

All buttons:  --radius-full (pill shaped), generous padding
```

### Form Inputs

```
Background:   --color-void
Border:       1px solid --color-border
Focus:        border becomes --color-gold-bright, gold glow appears outside
Text:         --color-light-divine
Placeholder:  --color-light-muted
Radius:       --radius-lg
```

### Scripture Display

```
Font:         Cormorant Garamond italic
Color:        --color-gold-warm
Size:         --text-heading-sm
Border-left:  2px solid --color-gold-warm with small left padding
Margin:       generous top and bottom
Background:   subtle --color-gold-glow
```

---

## ICONOGRAPHY

- Use **Lucide React** icons — clean, consistent line icons
- Icon weight should always feel light — not heavy filled icons
- Sacred symbols (cross, dove, etc.) are used VERY sparingly and only as
  decorative ambient elements — never as navigation icons
- Custom SVG elements for the Kairos logo and key brand moments
- Particle and light effects replace traditional decorative icons where possible

---

## STAINED GLASS ACCENT SYSTEM

One unique visual signature of Kairos — thin geometric patterns in the
background that subtly evoke stained glass without being literal.

- Used in page section dividers
- Generated with CSS clip-path and SVG patterns
- Colors: deep gold, amber, soft blue, the warmth of candlelight
- Always very subtle — background atmosphere, never foreground noise
- Animate very slowly (60+ second loops) — like light shifting through glass

---

## RESPONSIVE BREAKPOINTS

```css
/* Mobile first */
:root {
  --bp-sm:   480px;   /* Large phones */
  --bp-md:   768px;   /* Tablets */
  --bp-lg:   1024px;  /* Small desktop */
  --bp-xl:   1280px;  /* Desktop */
  --bp-2xl:  1536px;  /* Large desktop */
}

/* On mobile: 3D scenes are simplified or replaced with CSS equivalents */
/* Particles are reduced to 30% count on mobile for performance */
/* All animations respect prefers-reduced-motion */
```

---

## ACCESSIBILITY

```css
/* Always respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .particle-system { display: none; }
  .breathing-glow { animation: none; }
}

/* High contrast support */
@media (prefers-contrast: high) {
  --color-border: #6878a8;
  --color-gold-bright: #ffd700;
}

/* Focus visible — always gold ring */
:focus-visible {
  outline: 2px solid var(--color-gold-bright);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}
```

---

## FILES THIS MAPS TO

| Design Decision | File |
|---|---|
| CSS tokens (all variables) | `src/styles/tokens.css` |
| Typography imports + scale | `src/styles/typography.css` |
| All keyframe animations | `src/styles/animations.css` |
| Global styles | `src/app/globals.css` |
| Tailwind config | `tailwind.config.js` |
| Three.js hero scene | `src/components/companion/CompanionCore.jsx` |
| Card component | `src/components/ui/Card.jsx` |
| Button component | `src/components/ui/Button.jsx` |
| Input component | `src/components/ui/Input.jsx` |

---

## PHASE 3 STATUS

- [x] Design philosophy defined
- [x] Full color system with CSS variables
- [x] Typography system — 3 font pairing with full scale
- [x] Spacing and layout tokens
- [x] Animation system — principles, timing, keyframes
- [x] 3D strategy — Three.js scenes defined
- [x] Component design language
- [x] Iconography rules
- [x] Stained glass accent system
- [x] Responsive breakpoints
- [x] Accessibility standards

**Next Phase: Phase 4 — Core Feature Development**
Build the ONE thing that makes Kairos real —
The Companion interaction. Starting with the landing page and hero.

---

*"And God said, Let there be light: and there was light." — Genesis 1:3*