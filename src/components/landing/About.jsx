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

const pillars = [
  {
    title: "Theologically grounded",
    body:  "Every response is shaped by scripture, not opinion. Kairos doesn't improvise theology — it draws from the word.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    title: "No hidden agenda",
    body:  "No denomination to defend. No offering to collect. No institution to protect. Just truth, openly held.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01"/>
      </svg>
    ),
  },
  {
    title: "Built for real struggle",
    body:  "Grief. Doubt. Burnout. Broken faith. Kairos was made for the conversations people are afraid to have in public.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    title: "You are not a data point",
    body:  "Your conversations are private. Your questions are safe. You will never be sold to or profiled against your faith.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
]

export default function About() {
  const [leftRef,  leftIn]  = useInView(0.1)
  const [rightRef, rightIn] = useInView(0.1)

  return (
    <section
      id="about"
      style={{
        background: "var(--color-void)",
        padding:    "120px 24px",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Subtle glow */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "-100px", left: "-100px",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(240,192,96,0.04) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div className="kairos-container">
        <div className="about-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "80px",
          alignItems: "start",
        }}>

          {/* ── Left — Manifesto ── */}
          <div ref={leftRef}>
            <p style={{
              fontFamily: "var(--font-display)", fontSize: "0.58rem",
              letterSpacing: "0.28em", textTransform: "uppercase",
              color: "rgba(240,192,96,0.7)",
              marginBottom: 20,
              opacity: leftIn ? 1 : 0,
              transform: leftIn ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
              What is Kairos?
            </p>

            <h2 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
              fontWeight: 300,
              lineHeight: 1.25,
              color: "rgba(255,255,255,0.88)",
              marginBottom: 24,
              opacity: leftIn ? 1 : 0,
              transform: leftIn ? "translateY(0)" : "translateY(18px)",
              transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
            }}>
              Not a chatbot.
              <br />Not a church app.
              <br />
              <em style={{ color: "var(--color-gold-warm)" }}>
                A companion for<br />the searching soul.
              </em>
            </h2>

            <p style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "0.95rem",
              lineHeight: 1.85,
              marginBottom: 16,
              maxWidth: "480px",
              opacity: leftIn ? 1 : 0,
              transform: leftIn ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
            }}>
              Kairos exists for the people who are spiritually hungry but have
              been burned by religion — those who carry questions too honest for
              Sunday morning, and a quiet sense that truth exists somewhere they
              haven't found it yet.
            </p>

            <p style={{
              color: "rgba(255,255,255,0.28)",
              fontSize: "0.88rem",
              lineHeight: 1.85,
              maxWidth: "440px",
              opacity: leftIn ? 1 : 0,
              transform: leftIn ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
            }}>
              The word <em style={{ color: "rgba(240,192,96,0.65)", fontStyle: "italic" }}>kairos</em> is
              Greek for a sacred, appointed moment — not clock time, but the
              right time. Your moment might be closer than you think.
            </p>

            {/* Accent rule */}
            <div style={{
              width: leftIn ? "64px" : "0px",
              height: "1px",
              background: "var(--gradient-gold)",
              marginTop: 32,
              transition: "width 0.8s ease 0.5s",
            }} />
          </div>

          {/* ── Right — Pillars ── */}
          <div
            ref={rightRef}
            style={{ display: "flex", flexDirection: "column", gap: 0 }}
          >
            {pillars.map((p, i) => (
              <div
                key={p.title}
                style={{
                  display: "flex", gap: 16, alignItems: "flex-start",
                  padding: "24px 0",
                  borderBottom: i < pillars.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  opacity: rightIn ? 1 : 0,
                  transform: rightIn ? "translateX(0)" : "translateX(20px)",
                  transition: `opacity 0.6s ease ${0.1 + i * 0.08}s, transform 0.6s ease ${0.1 + i * 0.08}s`,
                }}
              >
                {/* Icon */}
                <div style={{
                  flexShrink: 0,
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: "rgba(240,192,96,0.07)",
                  border: "1px solid rgba(240,192,96,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(240,192,96,0.8)",
                  marginTop: 2,
                }}>
                  {p.icon}
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.92rem", fontWeight: 500,
                    color: "rgba(255,255,255,0.82)",
                    marginBottom: 6, lineHeight: 1.3,
                  }}>
                    {p.title}
                  </h3>
                  <p style={{
                    color: "rgba(255,255,255,0.38)",
                    fontSize: "0.85rem", lineHeight: 1.75,
                  }}>
                    {p.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  )
}