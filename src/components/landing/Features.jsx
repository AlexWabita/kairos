"use client"

import { useEffect, useRef, useState } from "react"

function useInView(threshold = 0.1) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

/* ── Feature Card ────────────────────────────────────────────── */
function FeatureCard({ icon, label, title, description, href, delay, inView }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={href}
      style={{
        display:        "block",
        textDecoration: "none",
        background:     hovered
          ? "linear-gradient(135deg, var(--color-elevated) 0%, var(--color-surface) 100%)"
          : "var(--color-surface)",
        border:         `1px solid ${hovered ? "rgba(240,192,96,0.25)" : "var(--color-border)"}`,
        borderRadius:   "var(--radius-lg)",
        padding:        "var(--space-8) var(--space-6)",
        cursor:         "pointer",
        transition:     "all 0.3s var(--ease-sacred)",
        boxShadow:      hovered ? "var(--shadow-gold-md)" : "var(--shadow-card)",
        opacity:        inView ? 1 : 0,
        transform:      inView ? "translateY(0)" : "translateY(28px)",
        transitionDelay: delay,
        position:       "relative",
        overflow:       "hidden",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top glow on hover */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          top:           0,
          left:          0,
          right:         0,
          height:        "1px",
          background:    hovered ? "var(--gradient-gold)" : "transparent",
          transition:    "background 0.3s var(--ease-sacred)",
        }}
      />

      {/* Label */}
      <p
        style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.6rem",
          letterSpacing: "0.2em",
          color:         "var(--color-gold-deep)",
          textTransform: "uppercase",
          marginBottom:  "var(--space-4)",
        }}
      >
        {label}
      </p>

      {/* Icon */}
      <div
        style={{
          width:          "52px",
          height:         "52px",
          borderRadius:   "var(--radius-md)",
          background:     hovered ? "rgba(240,192,96,0.12)" : "rgba(240,192,96,0.06)",
          border:         "1px solid rgba(240,192,96,0.15)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          marginBottom:   "var(--space-5)",
          transition:     "background 0.3s var(--ease-sacred)",
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily:   "var(--font-heading)",
          fontSize:     "1.4rem",
          fontWeight:   400,
          color:        "var(--color-divine)",
          marginBottom: "var(--space-3)",
          lineHeight:   1.3,
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={{
          color:      "var(--color-muted)",
          fontSize:   "0.9rem",
          lineHeight: 1.75,
          marginBottom: "var(--space-5)",
        }}
      >
        {description}
      </p>

      {/* Arrow */}
      <div
        style={{
          display:    "flex",
          alignItems: "center",
          gap:        "var(--space-2)",
          color:      hovered ? "var(--color-gold-warm)" : "var(--color-faint)",
          fontSize:   "0.8rem",
          fontFamily: "var(--font-display)",
          letterSpacing: "0.1em",
          transition: "color 0.3s var(--ease-sacred)",
        }}
      >
        <span>EXPLORE</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform:  hovered ? "translateX(4px)" : "translateX(0)",
            transition: "transform 0.3s var(--ease-divine)",
          }}
        >
          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </a>
  )
}

/* ── Main Component ──────────────────────────────────────────── */
export default function Features() {
  const [headerRef, headerIn] = useInView(0.1)
  const [gridRef, gridIn]     = useInView(0.05)

  const features = [
    {
      label: "Core",
      title: "Your AI Companion",
      description:
        "Ask anything — faith questions, life crises, cultural confusion, deep doubt. Kairos listens without judgment and responds with the wisdom of scripture.",
      href:  "/journey",
      delay: "0.05s",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Scripture",
      title: "In-App Bible Reader",
      description:
        "Read the Bible in WEB, KJV, ASV, and BBE translations. Search by verse, browse by chapter, and save moments directly to your journey.",
      href:  "/bible",
      delay: "0.12s",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Reflection",
      title: "Your Journey",
      description:
        "Every meaningful conversation, prayer, and scripture reflection is saved in your personal journey — a living record of your walk with God.",
      href:  "/journey/saved",
      delay: "0.19s",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Growth",
      title: "Reading Plans",
      description:
        "Structured devotional journeys — from a 7-day foundation for new believers to a full year through scripture. Pre-authored. Spiritually intentional.",
      href:  "/plans",
      delay: "0.26s",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
          <line x1="8"  y1="2" x2="8"  y2="6" strokeLinecap="round" />
          <line x1="3"  y1="10" x2="21" y2="10" strokeLinecap="round" />
        </svg>
      ),
    },
  ]

  return (
    <section
      style={{
        background: "var(--color-deep)",
        padding:    "var(--space-24) var(--space-5)",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          bottom:        "-100px",
          right:         "-100px",
          width:         "400px",
          height:        "400px",
          background:    "radial-gradient(circle, rgba(240,192,96,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="kairos-container">
        {/* Header */}
        <div
          ref={headerRef}
          style={{ textAlign: "center", marginBottom: "var(--space-10)" }}
        >
          <p
            className="kairos-section-label"
            style={{
              opacity:    headerIn ? 1 : 0,
              transform:  headerIn ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.6s var(--ease-divine), transform 0.6s var(--ease-divine)",
            }}
          >
            Everything You Need
          </p>
          <h2
            style={{
              fontFamily:   "var(--font-heading)",
              fontSize:     "clamp(1.8rem, 3vw, 2.8rem)",
              fontWeight:   300,
              color:        "var(--color-divine)",
              lineHeight:   1.35,
              maxWidth:     "560px",
              margin:       "0 auto",
              opacity:      headerIn ? 1 : 0,
              transform:    headerIn ? "translateY(0)" : "translateY(16px)",
              transition:   "opacity 0.7s var(--ease-divine) 0.1s, transform 0.7s var(--ease-divine) 0.1s",
            }}
          >
            One place for your entire
            <br />
            <span style={{ color: "var(--color-gold-warm)", fontStyle: "italic" }}>
              spiritual journey.
            </span>
          </h2>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap:                 "var(--space-5)",
          }}
        >
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} inView={gridIn} />
          ))}
        </div>
      </div>
    </section>
  )
}