"use client"

import { useEffect, useRef, useState } from "react"

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

const faqs = [
  {
    q: "Is Kairos a replacement for the Bible, church, or a pastor?",
    a: "No — and it was never designed to be. Kairos is a companion, not an authority. It draws from scripture and points you back to it. It encourages community, not dependence on itself. Think of it the way you might think of a thoughtful friend who knows the Bible well — useful and caring, but not your priest.",
  },
  {
    q: "Can I actually trust an AI with spiritual questions?",
    a: "That depends on what you mean by trust. Kairos will not replace human wisdom, pastoral care, or the Holy Spirit. What it can do is engage your questions honestly, ground its responses in scripture, and never pretend to have authority it doesn't have. It is calibrated for humility. You should bring the same. That is a healthy dynamic.",
  },
  {
    q: "What Bible translations does Kairos use?",
    a: "The built-in Bible reader supports four translations: World English Bible (WEB), King James Version (KJV), American Standard Version (ASV), and Bible in Basic English (BBE). You can set your preferred translation in Settings. All four are in the public domain.",
  },
  {
    q: "Is my data private? Are my conversations stored?",
    a: "Yes, your privacy is taken seriously. Conversations are stored securely under your account and are never sold, shared, or used to train models. You can export or permanently delete all your data at any time from the Account page. Anonymous conversations (without an account) are session-only and not persisted.",
  },
  {
    q: "Is Kairos free?",
    a: "Yes. Kairos is free to use. You do not need an account to start a conversation with the companion. Creating a free account unlocks the Journey (saved entries), Reading Plans, and personalised settings. There is no paywall on core features.",
  },
  {
    q: "What makes Kairos different from ChatGPT or other AI tools?",
    a: "Three things. First, Kairos is built specifically for spiritual companionship — not general tasks, not productivity, not everything. Second, it is grounded in a curated knowledge base of Biblical theology, not the open internet. Third, it is built with product decisions that protect the tone and integrity of the responses — Kairos will not be theologically casual, vague, or relativistic.",
  },
  {
    q: "I am not a Christian. Can I still use Kairos?",
    a: "Kairos is grounded in Christian scripture, so the responses will reflect that. But if you are curious, questioning, or exploring — you are welcome. Many people who use Kairos are not church members. Some have left faith entirely. The only requirement is a willingness to engage honestly.",
  },
  {
    q: "What are Reading Plans and how do they work?",
    a: "Reading Plans are structured, multi-day devotional journeys. Each day includes a scripture passage, a devotional text, a reflection prompt, and a prayer prompt. Plans range from 7 to 365 days. You can read at your own pace, use the 'Catch Me Up' feature if you fall behind, and optionally reflect with Kairos at any point. Your notes are saved to your Journey.",
  },
  {
    q: "Can I ask about suffering, doubt, or things I struggle with in the Bible?",
    a: "Yes. That is exactly what Kairos is built for. Questions about suffering, theodicy, difficult Old Testament passages, scientific tension, and personal doubt are among the most important conversations a person can have. Kairos engages them without flinching and without dismissing the real weight they carry.",
  },
  {
    q: "Who built Kairos?",
    a: "Kairos is built by a small team who believe that spiritual hunger is widespread and that people deserve a thoughtful, honest companion for the questions they carry. The product is independent, not affiliated with any denomination, ministry, or church institution.",
  },
]

function FAQItem({ q, a, index, inView }) {
  const [open, setOpen] = useState(false)
  const contentRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? contentRef.current.scrollHeight : 0)
    }
  }, [open])

  return (
    <div
      style={{
        borderBottom:  "1px solid var(--color-border)",
        opacity:       inView ? 1 : 0,
        transform:     inView ? "translateY(0)" : "translateY(16px)",
        transition:    `opacity 0.6s var(--ease-divine) ${0.03 * index}s, transform 0.6s var(--ease-divine) ${0.03 * index}s`,
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width:          "100%",
          background:     "none",
          border:         "none",
          padding:        "var(--space-5) 0",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          gap:            "var(--space-4)",
          cursor:         "pointer",
          textAlign:      "left",
          minHeight:      "44px",
        }}
        aria-expanded={open}
      >
        <span
          style={{
            fontFamily:  "var(--font-heading)",
            fontSize:    "1.05rem",
            fontWeight:  open ? 500 : 400,
            color:       open ? "var(--color-divine)" : "var(--color-soft)",
            lineHeight:  1.4,
            transition:  "color 0.25s var(--ease-sacred)",
          }}
        >
          {q}
        </span>
        <div
          style={{
            flexShrink:     0,
            width:          "28px",
            height:         "28px",
            borderRadius:   "50%",
            border:         `1px solid ${open ? "rgba(240,192,96,0.4)" : "var(--color-border)"}`,
            background:     open ? "rgba(240,192,96,0.08)" : "transparent",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            transition:     "all 0.25s var(--ease-sacred)",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke={open ? "var(--color-gold-warm)" : "var(--color-muted)"}
            strokeWidth="2.5"
            style={{
              transform:  open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s var(--ease-divine)",
            }}
          >
            <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Answer */}
      <div
        style={{
          overflow:   "hidden",
          height:     `${height}px`,
          transition: "height 0.35s var(--ease-divine)",
        }}
      >
        <div ref={contentRef} style={{ paddingBottom: "var(--space-5)" }}>
          <p
            style={{
              color:      "var(--color-muted)",
              fontSize:   "0.92rem",
              lineHeight: 1.8,
              maxWidth:   "680px",
            }}
          >
            {a}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [headerRef, headerIn] = useInView(0.1)
  const [bodyRef, bodyIn]     = useInView(0.05)

  return (
    <section
      id="faq"
      style={{
        background: "var(--color-deep)",
        padding:    "var(--space-24) var(--space-5)",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      <div className="kairos-container">
        {/* Layout: header left, items right */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "280px 1fr",
            gap:                 "var(--space-10)",
            alignItems:          "flex-start",
          }}
        >
          {/* Sticky header */}
          <div
            ref={headerRef}
            style={{ position: "sticky", top: "80px" }}
          >
            <p
              className="kairos-section-label"
              style={{
                opacity:    headerIn ? 1 : 0,
                transform:  headerIn ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.6s var(--ease-divine), transform 0.6s var(--ease-divine)",
              }}
            >
              Common Questions
            </p>
            <h2
              style={{
                fontFamily:   "var(--font-heading)",
                fontSize:     "clamp(1.5rem, 2.5vw, 2.2rem)",
                fontWeight:   300,
                color:        "var(--color-divine)",
                lineHeight:   1.35,
                marginBottom: "var(--space-4)",
                opacity:      headerIn ? 1 : 0,
                transform:    headerIn ? "translateY(0)" : "translateY(16px)",
                transition:   "opacity 0.7s var(--ease-divine) 0.1s, transform 0.7s var(--ease-divine) 0.1s",
              }}
            >
              Everything
              <br />
              <span style={{ color: "var(--color-gold-warm)", fontStyle: "italic" }}>
                you are wondering.
              </span>
            </h2>
            <p
              style={{
                color:      "var(--color-muted)",
                fontSize:   "0.85rem",
                lineHeight: 1.7,
                marginBottom: "var(--space-5)",
                opacity:    headerIn ? 1 : 0,
                transition: "opacity 0.7s var(--ease-divine) 0.2s",
              }}
            >
              Don&apos;t see your question?
              <br />
              Ask us directly below.
            </p>
            <a
              href="#contact"
              style={{
                display:        "inline-block",
                color:          "var(--color-gold-warm)",
                fontSize:       "0.82rem",
                fontFamily:     "var(--font-display)",
                letterSpacing:  "0.1em",
                textDecoration: "none",
                borderBottom:   "1px solid rgba(240,192,96,0.3)",
                paddingBottom:  "2px",
                opacity:        headerIn ? 1 : 0,
                transition:     "opacity 0.7s var(--ease-divine) 0.3s",
              }}
            >
              CONTACT US →
            </a>
          </div>

          {/* Questions */}
          <div ref={bodyRef}>
            {faqs.map((item, i) => (
              <FAQItem key={i} {...item} index={i} inView={bodyIn} />
            ))}
          </div>
        </div>
      </div>

      {/* Responsive collapse */}
      <style>{`
        @media (max-width: 768px) {
          #faq .kairos-container > div {
            grid-template-columns: 1fr !important;
          }
          #faq h2 { position: static !important; }
        }
      `}</style>
    </section>
  )
}