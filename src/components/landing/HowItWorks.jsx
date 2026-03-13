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

const steps = [
  {
    number: "01",
    title:  "Arrive as you are",
    body:   "No account required. No form to fill. No right way to begin. Just open Kairos and share what is on your heart — whatever that looks like today.",
    detail: "The companion is available immediately, to anyone.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.3">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    number: "02",
    title:  "Ask anything",
    body:   "Faith questions. Life questions. Theological confusion. Cultural tension. Doubt. Grief. Kairos engages every question with Biblical honesty — without deflection, without judgment.",
    detail: "No question is too dark, too strange, or too honest.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.3">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "03",
    title:  "Walk forward",
    body:   "Every conversation opens a door — to scripture that speaks directly to your situation, to reflection prompts, to a reading plan, to your saved journey. Kairos never leaves you at a dead end.",
    detail: "Kairos is the door. It always opens outward.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.3">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const [headerRef, headerIn] = useInView(0.1)
  const [bodyRef, bodyIn]     = useInView(0.08)

  return (
    <section
      id="how-it-works"
      style={{
        background: "var(--color-void)",
        padding:    "var(--space-24) var(--space-5)",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Background accent */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          top:           "50%",
          left:          "50%",
          transform:     "translate(-50%, -50%)",
          width:         "800px",
          height:        "400px",
          background:    "radial-gradient(ellipse, rgba(240,192,96,0.03) 0%, transparent 70%)",
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
            How It Works
          </p>
          <h2
            style={{
              fontFamily:   "var(--font-heading)",
              fontSize:     "clamp(1.8rem, 3vw, 2.8rem)",
              fontWeight:   300,
              color:        "var(--color-divine)",
              marginBottom: "var(--space-3)",
              opacity:      headerIn ? 1 : 0,
              transform:    headerIn ? "translateY(0)" : "translateY(16px)",
              transition:   "opacity 0.7s var(--ease-divine) 0.1s, transform 0.7s var(--ease-divine) 0.1s",
            }}
          >
            Three things.{" "}
            <span style={{ color: "var(--color-gold-warm)", fontStyle: "italic" }}>No more.</span>
          </h2>
          <p
            style={{
              color:      "var(--color-muted)",
              fontSize:   "1rem",
              maxWidth:   "440px",
              margin:     "0 auto",
              lineHeight: 1.7,
              opacity:    headerIn ? 1 : 0,
              transition: "opacity 0.7s var(--ease-divine) 0.2s",
            }}
          >
            Kairos was deliberately designed to be simple.
            Complexity is the enemy of presence.
          </p>
        </div>

        {/* Steps */}
        <div
          ref={bodyRef}
          style={{ position: "relative" }}
        >
          {/* Connecting line — desktop only */}
          <div
            aria-hidden="true"
            style={{
              position:      "absolute",
              top:           "52px",
              left:          "calc(16.66% - 1px)",
              right:         "calc(16.66% - 1px)",
              height:        "1px",
              background:    bodyIn
                ? "linear-gradient(90deg, var(--color-gold-deep) 0%, var(--color-gold-warm) 50%, var(--color-gold-deep) 100%)"
                : "transparent",
              transition:    "background 1.2s var(--ease-divine) 0.4s",
              opacity:       0.35,
            }}
          />

          <div
            style={{
              display:             "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap:                 "var(--space-8)",
            }}
          >
            {steps.map((step, i) => (
              <div
                key={step.number}
                style={{
                  opacity:    bodyIn ? 1 : 0,
                  transform:  bodyIn ? "translateY(0)" : "translateY(32px)",
                  transition: `opacity 0.7s var(--ease-divine) ${0.05 + i * 0.12}s, transform 0.7s var(--ease-divine) ${0.05 + i * 0.12}s`,
                }}
              >
                {/* Step number circle */}
                <div
                  style={{
                    width:          "52px",
                    height:         "52px",
                    borderRadius:   "50%",
                    background:     "var(--color-deep)",
                    border:         "1px solid rgba(240,192,96,0.3)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    marginBottom:   "var(--space-5)",
                    position:       "relative",
                    zIndex:         1,
                    boxShadow:      "0 0 24px rgba(240,192,96,0.1)",
                  }}
                >
                  {step.icon}
                </div>

                {/* Step number label */}
                <p
                  style={{
                    fontFamily:    "var(--font-display)",
                    fontSize:      "0.65rem",
                    letterSpacing: "0.2em",
                    color:         "var(--color-gold-deep)",
                    marginBottom:  "var(--space-3)",
                    textTransform: "uppercase",
                  }}
                >
                  Step {step.number}
                </p>

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
                  {step.title}
                </h3>

                <p
                  style={{
                    color:        "var(--color-soft)",
                    fontSize:     "0.95rem",
                    lineHeight:   1.8,
                    marginBottom: "var(--space-3)",
                  }}
                >
                  {step.body}
                </p>

                <p
                  style={{
                    color:       "var(--color-gold-deep)",
                    fontSize:    "0.8rem",
                    fontStyle:   "italic",
                    lineHeight:  1.6,
                    paddingLeft: "var(--space-3)",
                    borderLeft:  "2px solid rgba(240,192,96,0.3)",
                  }}
                >
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            textAlign:  "center",
            marginTop:  "var(--space-10)",
            opacity:    bodyIn ? 1 : 0,
            transition: "opacity 0.8s var(--ease-divine) 0.6s",
          }}
        >
          <a
            href="/journey"
            className="kairos-btn-primary"
            style={{ textDecoration: "none" }}
          >
            Try It Now — No Account Needed
          </a>
        </div>
      </div>
    </section>
  )
}