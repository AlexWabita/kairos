"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

function useInView(threshold = 0.08) {
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

const features = [
  {
    label: "Core",
    title: "AI Companion",
    description: "Ask anything — faith questions, life crises, cultural confusion, deep doubt. Kairos listens without judgment and responds with the wisdom of scripture.",
    href: "/journey",
    delay: "0.05s",
    accent: "#f0c060",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: "Scripture",
    title: "Bible Reader",
    description: "Read in WEB, KJV, ASV, and BBE. Search by verse, browse by chapter, and send any passage directly to the companion for deeper reflection.",
    href: "/bible",
    delay: "0.12s",
    accent: "#7ec8f0",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    label: "Reflection",
    title: "Your Journey",
    description: "Every meaningful conversation, prayer, and scripture reflection is saved in your personal journey — a living record of your walk with God.",
    href: "/journey/saved",
    delay: "0.19s",
    accent: "#a5b4fc",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: "Growth",
    title: "Reading Plans",
    description: "Structured devotional journeys — from a 7-day foundation for new believers to a full year through scripture. Pre-authored, spiritually intentional.",
    href: "/plans",
    delay: "0.26s",
    accent: "#7dcf8a",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round"/>
        <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round"/>
        <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round"/>
      </svg>
    ),
  },
]

function FeatureCard({ label, title, description, href, delay, accent, icon, inView }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      style={{
        display: "block", textDecoration: "none",
        padding: "28px",
        background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 14,
        position: "relative", overflow: "hidden",
        transition: "all 0.25s ease",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transitionDelay: inView ? delay : "0s",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top inset glow line on hover */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: hovered
          ? `linear-gradient(90deg, transparent, ${accent}55, transparent)`
          : "transparent",
        transition: "background 0.3s ease",
      }} />

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: hovered ? `${accent}18` : `${accent}12`,
        borderWidth: 1, borderStyle: "solid",
        borderColor: hovered ? `${accent}35` : `${accent}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: accent, marginBottom: 20,
        transition: "background 0.25s ease, border-color 0.25s ease",
      }}>
        {icon}
      </div>

      {/* Label */}
      <p style={{
        fontFamily: "var(--font-display)", fontSize: "0.5rem",
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: `${accent}99`, marginBottom: 8,
      }}>
        {label}
      </p>

      {/* Title */}
      <h3 style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.25rem", fontWeight: 400,
        color: "rgba(255,255,255,0.88)",
        marginBottom: 12, lineHeight: 1.3,
      }}>
        {title}
      </h3>

      {/* Description */}
      <p style={{
        color: "rgba(255,255,255,0.38)",
        fontSize: "0.88rem", lineHeight: 1.75,
        marginBottom: 24,
      }}>
        {description}
      </p>

      {/* Arrow link */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        color: hovered ? accent : "rgba(255,255,255,0.2)",
        fontFamily: "var(--font-display)", fontSize: "0.58rem",
        letterSpacing: "0.12em", textTransform: "uppercase",
        transition: "color 0.2s ease",
      }}>
        Explore
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: hovered ? "translateX(3px)" : "none", transition: "transform 0.2s ease" }}>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </Link>
  )
}

export default function Features() {
  const [headerRef, headerIn] = useInView(0.1)
  const [gridRef, gridIn]     = useInView(0.06)

  return (
    <section
      id="features"
      style={{
        background: "#0a0c14",
        padding: "120px 24px",
        position: "relative", overflow: "hidden",
      }}
    >
      <div aria-hidden="true" style={{
        position: "absolute", bottom: "-80px", right: "-80px",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(240,192,96,0.04) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div className="kairos-container">

        {/* Header */}
        <div ref={headerRef} style={{ textAlign: "center", marginBottom: 60 }}>
          <p style={{
            fontFamily: "var(--font-display)", fontSize: "0.58rem",
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: "rgba(240,192,96,0.7)", marginBottom: 18,
            opacity: headerIn ? 1 : 0,
            transform: headerIn ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}>
            Everything You Need
          </p>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
            fontWeight: 300, color: "rgba(255,255,255,0.88)",
            lineHeight: 1.3, maxWidth: "520px", margin: "0 auto",
            opacity: headerIn ? 1 : 0,
            transform: headerIn ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
          }}>
            One place for your entire{" "}
            <em style={{ color: "var(--color-gold-warm)" }}>spiritual journey.</em>
          </h2>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="features-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 2,
        }}>
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} inView={gridIn} />
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 680px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}