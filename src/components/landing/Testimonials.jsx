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

const testimonials = [
  {
    quote:    "I left the church three years ago after a painful experience with leadership. I had convinced myself I was done with God. I came to Kairos expecting to argue. Instead I found something that just... listened.",
    name:     "David O.",
    context:  "Former worship leader, Lagos",
    initials: "DO",
    accent:   "#a5b4fc",
  },
  {
    quote:    "My husband passed away in January. I couldn't pray — every time I tried, the words just disappeared. Kairos helped me find language again. Something in those conversations felt sacred.",
    name:     "Grace M.",
    context:  "Nairobi",
    initials: "GM",
    accent:   "#7ec8f0",
  },
  {
    quote:    "I study theology but I had questions I felt I couldn't ask in a seminary setting without judgment. The depth of engagement with the text surprised me. This is not a trivial tool.",
    name:     "James T.",
    context:  "Theology student, Accra",
    initials: "JT",
    accent:   "#f0c060",
  },
  {
    quote:    "My 19-year-old came home from university with questions I didn't know how to answer — about science, suffering, other religions. Kairos gave him a space to work through them seriously. He still believes.",
    name:     "Ruth K.",
    context:  "Mother of three, Kampala",
    initials: "RK",
    accent:   "#7dcf8a",
  },
  {
    quote:    "I've struggled with anxiety most of my life and always felt guilty that prayer 'didn't work'. Kairos helped me see that honest wrestling with God is itself a form of faith. That changed something for me.",
    name:     "Samuel A.",
    context:  "Software developer, Nairobi",
    initials: "SA",
    accent:   "#a5b4fc",
  },
  {
    quote:    "The reading plans are extraordinary. Day 12 of the Psalms plan undid me completely. In the best way.",
    name:     "Amara N.",
    context:  "Journalist, Abuja",
    initials: "AN",
    accent:   "#f0c060",
  },
]

function Card({ quote, name, context, initials, accent, delay, inView }) {
  return (
    <div style={{
      padding:    "28px",
      background: "rgba(255,255,255,0.02)",
      border:     "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14,
      position:   "relative",
      overflow:   "hidden",
      opacity:    inView ? 1 : 0,
      transform:  inView ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.6s ease ${delay}, transform 0.6s ease ${delay}`,
    }}>
      {/* Top accent line */}
      <div style={{
        position:   "absolute",
        top:        0,
        left:       0,
        right:      0,
        height:     1,
        background: `linear-gradient(90deg, ${accent}44, transparent)`,
      }} />

      {/* Quote mark */}
      <div style={{
        fontFamily:  "var(--font-heading)",
        fontSize:    "3.5rem",
        lineHeight:  0.8,
        color:       accent,
        opacity:     0.18,
        marginBottom: 12,
        fontStyle:   "italic",
        userSelect:  "none",
      }}>
        &ldquo;
      </div>

      <p className="t-quote" style={{
        fontSize:     "0.88rem",
        lineHeight:   1.8,
        fontStyle:    "italic",
        marginBottom: 24,
      }}>
        {quote}
      </p>

      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width:          34,
          height:         34,
          borderRadius:   "50%",
          background:     `${accent}18`,
          border:         `1px solid ${accent}33`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
        }}>
          <span style={{
            fontFamily:    "var(--font-display)",
            fontSize:      "0.52rem",
            letterSpacing: "0.04em",
            color:         accent,
          }}>
            {initials}
          </span>
        </div>
        <div>
          <p className="t-name" style={{ fontSize: "0.82rem", fontWeight: 500, lineHeight: 1.3 }}>
            {name}
          </p>
          <p className="t-context" style={{ fontSize: "0.72rem", lineHeight: 1.3 }}>
            {context}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const [headerRef, headerIn] = useInView(0.1)
  const [gridRef,   gridIn]   = useInView(0.05)

  return (
    <section
      id="testimonials"
      style={{
        background: "var(--color-void)",
        padding:    "120px 24px",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      <div aria-hidden="true" style={{
        position:      "absolute",
        top:           "30%",
        right:         "-100px",
        width:         450,
        height:        450,
        background:    "radial-gradient(circle, rgba(240,192,96,0.03) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div className="kairos-container">

        {/* Header */}
        <div ref={headerRef} style={{ textAlign: "center", marginBottom: 60 }}>
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
            Real People. Real Moments.
          </p>
          <h2 className="t-heading" style={{
            fontFamily: "var(--font-heading)",
            fontSize:   "clamp(1.8rem, 3vw, 2.8rem)",
            fontWeight: 300,
            lineHeight: 1.3,
            maxWidth:   "480px",
            margin:     "0 auto 16px",
            opacity:    headerIn ? 1 : 0,
            transform:  headerIn ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
          }}>
            Where Kairos has{" "}
            <em style={{ color: "var(--color-gold-warm)" }}>met people.</em>
          </h2>
          <p className="t-subheading" style={{
            fontSize:   "0.85rem",
            maxWidth:   "340px",
            margin:     "0 auto",
            lineHeight: 1.75,
            opacity:    headerIn ? 1 : 0,
            transition: "opacity 0.7s ease 0.2s",
          }}>
            Real words from real people.
            Names and locations shared with permission.
          </p>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="testimonials-grid" style={{
          display:             "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap:                 2,
        }}>
          {testimonials.map((t, i) => (
            <Card key={t.name} {...t} delay={`${0.05 + i * 0.07}s`} inView={gridIn} />
          ))}
        </div>

      </div>

      <style>{`
        /* Dark (default) */
        .t-heading    { color: rgba(255,255,255,0.88); }
        .t-subheading { color: rgba(255,255,255,0.28); }
        .t-quote      { color: rgba(255,255,255,0.55); }
        .t-name       { color: rgba(255,255,255,0.75); }
        .t-context    { color: rgba(255,255,255,0.25); }

        /* Light overrides */
        [data-theme="light"] .t-heading    { color: var(--color-divine); }
        [data-theme="light"] .t-subheading { color: var(--color-muted);  }
        [data-theme="light"] .t-quote      { color: var(--color-soft);   }
        [data-theme="light"] .t-name       { color: var(--color-divine); }
        [data-theme="light"] .t-context    { color: var(--color-muted);  }

        /* Card backgrounds in light mode */
        [data-theme="light"] #testimonials .testimonials-grid > div {
          background: rgba(0,0,0,0.02) !important;
          border-color: rgba(0,0,0,0.07) !important;
        }

        @media (max-width: 900px) {
          .testimonials-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .testimonials-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}