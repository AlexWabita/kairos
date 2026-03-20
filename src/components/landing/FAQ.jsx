"use client"

import { useEffect, useRef, useState } from "react"

function useInView(threshold = 0.06) {
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

const faqs = [
  {
    q: "Is Kairos a replacement for the Bible, church, or a pastor?",
    a: "No — and it was never designed to be. Kairos is a companion, not an authority. It draws from scripture and points you back to it. Think of it as a thoughtful friend who knows the Bible well — useful and caring, but not your priest.",
  },
  {
    q: "Can I actually trust an AI with spiritual questions?",
    a: "That depends on what you mean by trust. Kairos will not replace human wisdom, pastoral care, or the Holy Spirit. What it can do is engage your questions honestly, ground its responses in scripture, and never pretend to have authority it doesn't have. It is calibrated for humility.",
  },
  {
    q: "What Bible translations does Kairos use?",
    a: "The built-in Bible reader supports four translations: World English Bible (WEB), King James Version (KJV), American Standard Version (ASV), and Bible in Basic English (BBE). You can set your preferred translation in Settings.",
  },
  {
    q: "Is my data private? Are my conversations stored?",
    a: "Yes, your privacy is taken seriously. Conversations are stored securely under your account and are never sold, shared, or used to train models. You can export or permanently delete all your data at any time from the Account page.",
  },
  {
    q: "Is Kairos free?",
    a: "Yes. Kairos is free to use. You do not need an account to start a conversation. Creating a free account unlocks the Journey, Reading Plans, and personalised settings. There is no paywall on core features.",
  },
  {
    q: "What makes Kairos different from ChatGPT or other AI tools?",
    a: "Three things. First, Kairos is built specifically for spiritual companionship. Second, it is grounded in a curated knowledge base of Biblical theology, not the open internet. Third, it is built with product decisions that protect the tone and integrity of the responses.",
  },
  {
    q: "I am not a Christian. Can I still use Kairos?",
    a: "Kairos is grounded in Christian scripture, so the responses will reflect that. But if you are curious, questioning, or exploring — you are welcome. The only requirement is a willingness to engage honestly.",
  },
  {
    q: "Can I ask about suffering, doubt, or things I struggle with in the Bible?",
    a: "Yes. That is exactly what Kairos is built for. Questions about suffering, theodicy, difficult Old Testament passages, and personal doubt are among the most important conversations a person can have. Kairos engages them without flinching.",
  },
]

function FAQItem({ q, a, index, inView }) {
  const [open, setOpen] = useState(false)
  const bodyRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (bodyRef.current) setHeight(open ? bodyRef.current.scrollHeight : 0)
  }, [open])

  return (
    <div style={{
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      opacity:      inView ? 1 : 0,
      transform:    inView ? "translateY(0)" : "translateY(14px)",
      transition:   `opacity 0.5s ease ${0.03 * index}s, transform 0.5s ease ${0.03 * index}s`,
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{
          width:          "100%",
          background:     "none",
          border:         "none",
          padding:        "20px 0",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          gap:            16,
          cursor:         "pointer",
          textAlign:      "left",
          minHeight:      "44px",
        }}
      >
        <span style={{
          fontFamily:  "var(--font-body)",
          fontSize:    "0.92rem",
          color:       open ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.55)",
          lineHeight:  1.5,
          fontWeight:  open ? 500 : 400,
          transition:  "color 0.2s ease",
        }}>
          {q}
        </span>
        <div style={{
          flexShrink:  0,
          width:       24,
          height:      24,
          borderRadius: "50%",
          border:      `1px solid ${open ? "rgba(240,192,96,0.4)" : "rgba(255,255,255,0.1)"}`,
          background:  open ? "rgba(240,192,96,0.08)" : "transparent",
          display:     "flex",
          alignItems:  "center",
          justifyContent: "center",
          transition:  "all 0.2s ease",
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke={open ? "rgba(240,192,96,0.9)" : "rgba(255,255,255,0.3)"}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.25s ease" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      <div style={{ overflow: "hidden", height: `${height}px`, transition: "height 0.3s ease" }}>
        <div ref={bodyRef} style={{ paddingBottom: 20 }}>
          <p style={{
            color:    "rgba(255,255,255,0.38)",
            fontSize: "0.88rem",
            lineHeight: 1.85,
            maxWidth: "600px",
          }}>
            {a}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [headerRef, headerIn] = useInView(0.1)
  const [bodyRef,   bodyIn]   = useInView(0.04)

  return (
    <section
      id="faq"
      style={{
        background: "#0a0c14",
        padding:    "120px 24px",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      <div className="kairos-container">
        <div className="faq-layout" style={{
          display:             "grid",
          gridTemplateColumns: "260px 1fr",
          gap:                 "80px",
          alignItems:          "flex-start",
        }}>

          {/* Sticky header — sticky only on desktop */}
          <div ref={headerRef} className="faq-header">
            <p style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "0.58rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color:         "rgba(240,192,96,0.7)",
              marginBottom:  18,
              opacity:       headerIn ? 1 : 0,
              transform:     headerIn ? "translateY(0)" : "translateY(12px)",
              transition:    "opacity 0.6s ease, transform 0.6s ease",
            }}>
              Common Questions
            </p>
            <h2 style={{
              fontFamily:  "var(--font-heading)",
              fontSize:    "clamp(1.4rem, 2vw, 2rem)",
              fontWeight:  300,
              color:       "rgba(255,255,255,0.88)",
              lineHeight:  1.3,
              marginBottom: 16,
              opacity:     headerIn ? 1 : 0,
              transform:   headerIn ? "translateY(0)" : "translateY(16px)",
              transition:  "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
            }}>
              Everything
              <br />
              <em style={{ color: "var(--color-gold-warm)" }}>you're wondering.</em>
            </h2>
            <p style={{
              color:      "rgba(255,255,255,0.28)",
              fontSize:   "0.82rem",
              lineHeight: 1.7,
              marginBottom: 24,
              opacity:    headerIn ? 1 : 0,
              transition: "opacity 0.7s ease 0.2s",
            }}>
              Don't see your question?
              <br />Ask us directly below.
            </p>
            <a
              href="#contact"
              style={{
                display:        "inline-flex",
                alignItems:     "center",
                gap:            6,
                color:          "rgba(240,192,96,0.7)",
                fontSize:       "0.72rem",
                fontFamily:     "var(--font-display)",
                letterSpacing:  "0.12em",
                textDecoration: "none",
                textTransform:  "uppercase",
                opacity:        headerIn ? 1 : 0,
                transition:     "opacity 0.7s ease 0.3s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--color-gold-warm)" }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(240,192,96,0.7)" }}
            >
              Contact us →
            </a>
          </div>

          {/* Accordions */}
          <div ref={bodyRef}>
            {faqs.map((item, i) => (
              <FAQItem key={i} {...item} index={i} inView={bodyIn} />
            ))}
          </div>

        </div>
      </div>

      <style>{`
        /* Desktop: sticky header */
        .faq-header {
          position: sticky;
          top: 88px;
        }

        /* Mobile: single column, no sticky (prevents overlap) */
        @media (max-width: 820px) {
          .faq-layout {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .faq-header {
            position: static !important;
            top: auto !important;
          }
        }
      `}</style>
    </section>
  )
}