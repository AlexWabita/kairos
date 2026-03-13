"use client"

import { useEffect, useRef, useState } from "react"

/* ── useInView hook ─────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref     = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView]
}

/* ── Value Pillar ────────────────────────────────────────────── */
function Pillar({ icon, title, body, delay, inView }) {
  return (
    <div
      style={{
        display:         "flex",
        gap:             "var(--space-4)",
        alignItems:      "flex-start",
        opacity:         inView ? 1 : 0,
        transform:       inView ? "translateX(0)" : "translateX(24px)",
        transition:      `opacity 0.7s var(--ease-divine) ${delay}, transform 0.7s var(--ease-divine) ${delay}`,
      }}
    >
      {/* Icon container */}
      <div
        style={{
          flexShrink:   0,
          width:        "44px",
          height:       "44px",
          borderRadius: "var(--radius-md)",
          background:   "var(--color-gold-subtle)",
          border:       "1px solid rgba(240,192,96,0.2)",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div>
        <h3
          style={{
            fontFamily:   "var(--font-heading)",
            fontSize:     "1.1rem",
            fontWeight:   500,
            color:        "var(--color-divine)",
            marginBottom: "var(--space-2)",
          }}
        >
          {title}
        </h3>
        <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
          {body}
        </p>
      </div>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────── */
export default function About() {
  const [ref,   inView]   = useInView(0.1)
  const [right, rightIn]  = useInView(0.1)

  const pillars = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Theologically grounded",
      body:  "Every response is shaped by scripture, not opinion. Kairos doesn't improvise theology — it draws from the word.",
      delay: "0.1s",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
        </svg>
      ),
      title: "No hidden agenda",
      body:  "Kairos has no denomination to defend, no offering to collect, no institution to protect. Just truth, openly held.",
      delay: "0.2s",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Built for real struggle",
      body:  "Grief. Doubt. Burnout. Broken faith. Kairos was made for the conversations people are afraid to have in public.",
      delay: "0.3s",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
        </svg>
      ),
      title: "You are not a data point",
      body:  "Your conversations are private. Your questions are safe. You will never be sold to or profiled against your faith.",
      delay: "0.4s",
    },
  ]

  return (
    <section
      id="about"
      style={{
        background:    "var(--color-void)",
        padding:       "var(--space-24) var(--space-5)",
        position:      "relative",
        overflow:      "hidden",
      }}
    >
      {/* Subtle background texture */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          top:           "-200px",
          left:          "-200px",
          width:         "600px",
          height:        "600px",
          background:    "radial-gradient(circle, rgba(240,192,96,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="kairos-container"
        style={{
          display:   "grid",
          gridTemplateColumns: "1fr 1fr",
          gap:       "var(--space-10)",
          alignItems: "center",
        }}
      >
        {/* ── Left — Manifesto ─────────────────────────── */}
        <div ref={ref}>
          <p
            className="kairos-section-label"
            style={{
              opacity:    inView ? 1 : 0,
              transform:  inView ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.6s var(--ease-divine) 0.05s, transform 0.6s var(--ease-divine) 0.05s",
            }}
          >
            What is Kairos?
          </p>

          <h2
            style={{
              fontFamily:   "var(--font-heading)",
              fontSize:     "clamp(2rem, 3.5vw, 3rem)",
              fontWeight:   300,
              lineHeight:   1.35,
              color:        "var(--color-divine)",
              marginBottom: "var(--space-6)",
              opacity:      inView ? 1 : 0,
              transform:    inView ? "translateY(0)" : "translateY(20px)",
              transition:   "opacity 0.7s var(--ease-divine) 0.1s, transform 0.7s var(--ease-divine) 0.1s",
            }}
          >
            Not a chatbot.
            <br />
            Not a church app.
            <br />
            <em style={{ color: "var(--color-gold-warm)" }}>
              A companion for the&nbsp;searching&nbsp;soul.
            </em>
          </h2>

          <p
            style={{
              color:        "var(--color-soft)",
              fontSize:     "1rem",
              lineHeight:   1.8,
              marginBottom: "var(--space-5)",
              maxWidth:     "520px",
              opacity:      inView ? 1 : 0,
              transform:    inView ? "translateY(0)" : "translateY(16px)",
              transition:   "opacity 0.7s var(--ease-divine) 0.2s, transform 0.7s var(--ease-divine) 0.2s",
            }}
          >
            Kairos exists for the people who are spiritually hungry but have
            been burned by religion — those who carry questions too honest for
            Sunday morning, wounds too deep for a quick prayer, and a quiet
            sense that truth exists somewhere they haven&apos;t found it yet.
          </p>

          <p
            style={{
              color:      "var(--color-muted)",
              fontSize:   "0.95rem",
              lineHeight: 1.8,
              maxWidth:   "480px",
              opacity:    inView ? 1 : 0,
              transform:  inView ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.7s var(--ease-divine) 0.3s, transform 0.7s var(--ease-divine) 0.3s",
            }}
          >
            The word <em style={{ color: "var(--color-gold-deep)", fontStyle: "italic" }}>kairos</em> is
            Greek for a sacred, appointed moment — not clock time, but the
            right time. We believe your moment might be closer than you think.
          </p>

          {/* Divider line */}
          <div
            style={{
              width:      inView ? "80px" : "0px",
              height:     "1px",
              background: "var(--gradient-gold)",
              marginTop:  "var(--space-6)",
              transition: "width 0.8s var(--ease-divine) 0.5s",
            }}
          />
        </div>

        {/* ── Right — Value Pillars ────────────────────── */}
        <div
          ref={right}
          style={{
            display:       "flex",
            flexDirection: "column",
            gap:           "var(--space-6)",
          }}
        >
          {pillars.map((p) => (
            <Pillar key={p.title} {...p} inView={rightIn} />
          ))}
        </div>
      </div>

      {/* Responsive — stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          #about .kairos-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}