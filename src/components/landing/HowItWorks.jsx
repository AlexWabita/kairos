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

const steps = [
  {
    number: "01",
    title: "Arrive as you are",
    body: "No account required. No form to fill. No right way to begin. Just open Kairos and share what is on your heart — whatever that looks like today.",
    detail: "The companion is available immediately, to anyone.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Ask anything",
    body: "Faith questions. Life questions. Theological confusion. Doubt. Grief. Kairos engages every question with Biblical honesty — without deflection, without judgment.",
    detail: "No question is too dark, too strange, or too honest.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Walk forward",
    body: "Every conversation opens a door — to scripture that speaks directly, to reflection, to a reading plan, to your saved journey. Kairos never leaves you at a dead end.",
    detail: "Kairos is the door. It always opens outward.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const [headerRef, headerIn] = useInView(0.1)
  const [stepsRef, stepsIn]   = useInView(0.06)

  return (
    <section
      id="how-it-works"
      style={{
        background: "var(--color-void)",
        padding: "120px 24px",
        position: "relative", overflow: "hidden",
      }}
    >
      <div aria-hidden="true" style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "900px", height: "500px",
        background: "radial-gradient(ellipse, rgba(240,192,96,0.025) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div className="kairos-container">

        {/* Header */}
        <div ref={headerRef} style={{ textAlign: "center", marginBottom: 80 }}>
          <p style={{
            fontFamily: "var(--font-display)", fontSize: "0.58rem",
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: "rgba(240,192,96,0.7)", marginBottom: 18,
            opacity: headerIn ? 1 : 0,
            transform: headerIn ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}>
            How It Works
          </p>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
            fontWeight: 300, color: "rgba(255,255,255,0.88)",
            lineHeight: 1.3,
            opacity: headerIn ? 1 : 0,
            transform: headerIn ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
          }}>
            Three things.{" "}
            <em style={{ color: "var(--color-gold-warm)" }}>No more.</em>
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.32)", fontSize: "0.95rem",
            maxWidth: "400px", margin: "16px auto 0",
            lineHeight: 1.75,
            opacity: headerIn ? 1 : 0,
            transition: "opacity 0.7s ease 0.2s",
          }}>
            Kairos was deliberately designed to be simple.
            Complexity is the enemy of presence.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="steps-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
        }}>
          {steps.map((step, i) => (
            <div
              key={step.number}
              style={{
                position: "relative",
                padding: "36px 28px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 14,
                overflow: "hidden",
                opacity: stepsIn ? 1 : 0,
                transform: stepsIn ? "translateY(0)" : "translateY(28px)",
                transition: `opacity 0.7s ease ${0.1 + i * 0.1}s, transform 0.7s ease ${0.1 + i * 0.1}s`,
              }}
            >
              {/* Large faded step number — background texture */}
              <div aria-hidden="true" style={{
                position: "absolute", right: 16, bottom: -8,
                fontFamily: "var(--font-heading)",
                fontSize: "8rem", fontWeight: 300, lineHeight: 1,
                color: "rgba(255,255,255,0.025)",
                userSelect: "none", pointerEvents: "none",
                letterSpacing: "-0.04em",
              }}>
                {step.number}
              </div>

              {/* Step label */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "rgba(240,192,96,0.07)",
                  border: "1px solid rgba(240,192,96,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(240,192,96,0.8)",
                }}>
                  {step.icon}
                </div>
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: "0.52rem",
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "rgba(240,192,96,0.5)",
                }}>
                  Step {step.number}
                </span>
              </div>

              <h3 style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.2rem", fontWeight: 400,
                color: "rgba(255,255,255,0.85)",
                marginBottom: 12, lineHeight: 1.3,
              }}>
                {step.title}
              </h3>

              <p style={{
                color: "rgba(255,255,255,0.38)", fontSize: "0.88rem",
                lineHeight: 1.8, marginBottom: 16,
              }}>
                {step.body}
              </p>

              {/* Detail callout */}
              <p style={{
                color: "rgba(240,192,96,0.55)", fontSize: "0.78rem",
                fontStyle: "italic", lineHeight: 1.6,
                paddingLeft: 12,
                borderLeft: "2px solid rgba(240,192,96,0.2)",
              }}>
                {step.detail}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          textAlign: "center", marginTop: 56,
          opacity: stepsIn ? 1 : 0,
          transition: "opacity 0.8s ease 0.5s",
        }}>
          <Link href="/journey" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px", borderRadius: 100,
            background: "transparent",
            border: "1px solid rgba(240,192,96,0.3)",
            color: "var(--color-gold-warm)",
            fontFamily: "var(--font-display)", fontSize: "0.62rem",
            letterSpacing: "0.14em",
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(240,192,96,0.08)"; e.currentTarget.style.borderColor = "rgba(240,192,96,0.6)" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(240,192,96,0.3)" }}
          >
            TRY IT NOW — NO ACCOUNT NEEDED
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

      </div>

      <style>{`
        @media (max-width: 820px) {
          .steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}