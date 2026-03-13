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

const testimonials = [
  {
    quote:
      "I left the church three years ago after a painful experience with leadership. I had convinced myself I was done with God. I came to Kairos expecting to argue. Instead I found something that just... listened. It asked me better questions than I had been asking myself.",
    name:     "David O.",
    context:  "Former worship leader, Lagos",
    initials: "DO",
    accent:   "var(--color-accent)",
  },
  {
    quote:
      "My husband passed away in January. I couldn't pray — every time I tried, the words just disappeared. Kairos helped me find language again. I don't fully understand it, but something in those conversations felt sacred.",
    name:     "Grace M.",
    context:  "Nairobi",
    initials: "GM",
    accent:   "var(--color-peace)",
  },
  {
    quote:
      "I study theology but I had questions I felt I couldn't ask in a seminary setting without judgment. The depth of engagement with the text surprised me. This is not a trivial tool.",
    name:     "James T.",
    context:  "Theology student, Accra",
    initials: "JT",
    accent:   "var(--color-gold-warm)",
  },
  {
    quote:
      "My 19-year-old came home from university with questions I didn't know how to answer — about science, suffering, other religions. Kairos gave him a space to work through them seriously. He still believes. I'm grateful.",
    name:     "Ruth K.",
    context:  "Mother of three, Kampala",
    initials: "RK",
    accent:   "var(--color-life)",
  },
  {
    quote:
      "I've struggled with anxiety most of my life and always felt guilty that prayer 'didn't work' the way people described. Kairos helped me see that honest wrestling with God is itself a form of faith. That changed something for me.",
    name:     "Samuel A.",
    context:  "Software developer, Nairobi",
    initials: "SA",
    accent:   "var(--color-accent)",
  },
  {
    quote:
      "The reading plans are extraordinary. I enrolled in the Psalms plan expecting religion. What I got was poetry that met me exactly where I was in a season of real darkness. Day 12 undid me completely. In the best way.",
    name:     "Amara N.",
    context:  "Journalist, Abuja",
    initials: "AN",
    accent:   "var(--color-gold-warm)",
  },
]

function TestimonialCard({ quote, name, context, initials, accent, delay, inView }) {
  return (
    <div
      style={{
        background:    "var(--color-surface)",
        border:        "1px solid var(--color-border)",
        borderRadius:  "var(--radius-lg)",
        padding:       "var(--space-6)",
        opacity:       inView ? 1 : 0,
        transform:     inView ? "translateY(0)" : "translateY(24px)",
        transition:    `opacity 0.7s var(--ease-divine) ${delay}, transform 0.7s var(--ease-divine) ${delay}`,
        position:      "relative",
        overflow:      "hidden",
      }}
    >
      {/* Top accent bar */}
      <div
        aria-hidden="true"
        style={{
          position:   "absolute",
          top:        0,
          left:       0,
          right:      0,
          height:     "2px",
          background: `linear-gradient(90deg, ${accent}, transparent)`,
          opacity:    0.6,
        }}
      />

      {/* Quote mark */}
      <p
        aria-hidden="true"
        style={{
          fontFamily:   "var(--font-heading)",
          fontSize:     "4rem",
          lineHeight:   0.8,
          color:        accent,
          opacity:      0.2,
          marginBottom: "var(--space-3)",
          fontStyle:    "italic",
          userSelect:   "none",
        }}
      >
        &ldquo;
      </p>

      <p
        style={{
          color:        "var(--color-soft)",
          fontSize:     "0.92rem",
          lineHeight:   1.8,
          marginBottom: "var(--space-5)",
          fontStyle:    "italic",
        }}
      >
        {quote}
      </p>

      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        {/* Avatar */}
        <div
          style={{
            width:          "36px",
            height:         "36px",
            borderRadius:   "50%",
            background:     `${accent}22`,
            border:         `1px solid ${accent}44`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}
        >
          <span
            style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "0.6rem",
              letterSpacing: "0.05em",
              color:         accent,
            }}
          >
            {initials}
          </span>
        </div>
        <div>
          <p
            style={{
              color:      "var(--color-divine)",
              fontSize:   "0.85rem",
              fontWeight: 500,
              lineHeight: 1.3,
            }}
          >
            {name}
          </p>
          <p
            style={{
              color:    "var(--color-faint)",
              fontSize: "0.75rem",
              lineHeight: 1.3,
            }}
          >
            {context}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const [headerRef, headerIn] = useInView(0.1)
  const [gridRef, gridIn]     = useInView(0.05)

  return (
    <section
      style={{
        background: "var(--color-void)",
        padding:    "var(--space-24) var(--space-5)",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Background */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          top:           "30%",
          right:         "-150px",
          width:         "500px",
          height:        "500px",
          background:    "radial-gradient(circle, rgba(240,192,96,0.03) 0%, transparent 70%)",
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
            Real People. Real Moments.
          </p>
          <h2
            style={{
              fontFamily:   "var(--font-heading)",
              fontSize:     "clamp(1.8rem, 3vw, 2.8rem)",
              fontWeight:   300,
              color:        "var(--color-divine)",
              lineHeight:   1.35,
              maxWidth:     "520px",
              margin:       "0 auto var(--space-3)",
              opacity:      headerIn ? 1 : 0,
              transform:    headerIn ? "translateY(0)" : "translateY(16px)",
              transition:   "opacity 0.7s var(--ease-divine) 0.1s, transform 0.7s var(--ease-divine) 0.1s",
            }}
          >
            Where Kairos has
            <br />
            <span style={{ color: "var(--color-gold-warm)", fontStyle: "italic" }}>
              met people.
            </span>
          </h2>
          <p
            style={{
              color:      "var(--color-muted)",
              fontSize:   "0.9rem",
              maxWidth:   "380px",
              margin:     "0 auto",
              lineHeight: 1.7,
              opacity:    headerIn ? 1 : 0,
              transition: "opacity 0.7s var(--ease-divine) 0.2s",
            }}
          >
            These are real words from real people.
            Names and locations shared with permission.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap:                 "var(--space-5)",
          }}
        >
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={t.name}
              {...t}
              delay={`${0.05 + i * 0.08}s`}
              inView={gridIn}
            />
          ))}
        </div>
      </div>
    </section>
  )
}