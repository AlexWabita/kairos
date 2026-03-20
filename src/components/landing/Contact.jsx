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

const reasons = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Share feedback",
    body:  "Tell us what works, what doesn't, and what you wish Kairos could do.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round" />
      </svg>
    ),
    title: "Ask a question",
    body:  "Something unclear? We are real people and we read every message.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Request prayer",
    body:  "If you are carrying something heavy and want someone to know, tell us.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    ),
    title: "Talk partnerships",
    body:  "Church, ministry, or organisation? We would love to hear from you.",
  },
]

const inputStyle = {
  width:        "100%",
  background:   "var(--color-surface)",
  border:       "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  padding:      "0.85rem var(--space-4)",
  color:        "var(--color-divine)",
  fontSize:     "0.95rem",
  fontFamily:   "var(--font-body)",
  outline:      "none",
  boxSizing:    "border-box",
  transition:   "border-color 0.2s var(--ease-sacred), box-shadow 0.2s var(--ease-sacred)",
}

export default function Contact() {
  const [ref, inView] = useInView(0.08)

  const [form,       setForm]       = useState({ name: "", email: "", type: "feedback", message: "" })
  const [status,     setStatus]     = useState("idle") // idle | sending | success | error
  const [focusField, setFocusField] = useState(null)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus("sending")

    try {
      const res  = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setStatus("success")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  const fieldStyle = (name) => ({
    ...inputStyle,
    borderColor: focusField === name ? "rgba(240,192,96,0.5)" : "var(--color-border)",
    boxShadow:   focusField === name ? "var(--shadow-input)" : "none",
  })

  return (
    <section
      id="contact"
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
          bottom:        "-100px",
          left:          "10%",
          width:         "500px",
          height:        "400px",
          background:    "radial-gradient(ellipse, rgba(240,192,96,0.03) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        ref={ref}
        className="kairos-container"
        style={{
          display:             "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap:                 "var(--space-10)",
          alignItems:          "flex-start",
        }}
      >
        {/* ── Left: Info panel ─────────────────────────── */}
        <div>
          <p
            className="kairos-section-label"
            style={{
              opacity:    inView ? 1 : 0,
              transform:  inView ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.6s var(--ease-divine), transform 0.6s var(--ease-divine)",
            }}
          >
            Get in Touch
          </p>
          <h2
            style={{
              fontFamily:   "var(--font-heading)",
              fontSize:     "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight:   300,
              color:        "var(--color-divine)",
              lineHeight:   1.35,
              marginBottom: "var(--space-4)",
              opacity:      inView ? 1 : 0,
              transform:    inView ? "translateY(0)" : "translateY(16px)",
              transition:   "opacity 0.7s var(--ease-divine) 0.1s, transform 0.7s var(--ease-divine) 0.1s",
            }}
          >
            We are
            <br />
            <span style={{ color: "var(--color-gold-warm)", fontStyle: "italic" }}>
              real people.
            </span>
          </h2>
          <p
            style={{
              color:        "var(--color-muted)",
              fontSize:     "0.92rem",
              lineHeight:   1.8,
              marginBottom: "var(--space-8)",
              maxWidth:     "340px",
              opacity:      inView ? 1 : 0,
              transition:   "opacity 0.7s var(--ease-divine) 0.2s",
            }}
          >
            Kairos is not built by a faceless corporation. Reach out for any
            reason — we read every message and respond within 24 hours.
          </p>

          {/* Reason tiles */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {reasons.map((r, i) => (
              <div
                key={r.title}
                style={{
                  display:    "flex",
                  gap:        "var(--space-3)",
                  alignItems: "flex-start",
                  opacity:    inView ? 1 : 0,
                  transform:  inView ? "translateX(0)" : "translateX(-16px)",
                  transition: `opacity 0.6s var(--ease-divine) ${0.25 + i * 0.07}s, transform 0.6s var(--ease-divine) ${0.25 + i * 0.07}s`,
                }}
              >
                <div
                  style={{
                    flexShrink:     0,
                    width:          "34px",
                    height:         "34px",
                    borderRadius:   "var(--radius-sm)",
                    background:     "rgba(240,192,96,0.06)",
                    border:         "1px solid rgba(240,192,96,0.12)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                  }}
                >
                  {r.icon}
                </div>
                <div>
                  <p style={{ color: "var(--color-divine)", fontSize: "0.88rem", fontWeight: 500, marginBottom: "var(--space-1)" }}>
                    {r.title}
                  </p>
                  <p style={{ color: "var(--color-muted)", fontSize: "0.82rem", lineHeight: 1.6 }}>
                    {r.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Email */}
          <div
            style={{
              marginTop:  "var(--space-8)",
              opacity:    inView ? 1 : 0,
              transition: "opacity 0.7s var(--ease-divine) 0.6s",
            }}
          >
            <p style={{ color: "var(--color-faint)", fontSize: "0.78rem", marginBottom: "var(--space-1)" }}>
              Or email us directly
            </p>
            <a
              href="mailtokairos.app.official@gmail.com"
              style={{
                color:          "var(--color-gold-warm)",
                fontSize:       "0.92rem",
                textDecoration: "none",
                borderBottom:   "1px solid rgba(240,192,96,0.3)",
                paddingBottom:  "2px",
              }}
            >
              kairos.app.official@gmail.com
            </a>
          </div>
        </div>

        {/* ── Right: Form ──────────────────────────────── */}
        <div
          style={{
            background:   "var(--color-surface)",
            border:       "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding:      "var(--space-8)",
            opacity:      inView ? 1 : 0,
            transform:    inView ? "translateY(0)" : "translateY(24px)",
            transition:   "opacity 0.7s var(--ease-divine) 0.15s, transform 0.7s var(--ease-divine) 0.15s",
            position:     "relative",
            overflow:     "hidden",
          }}
        >
          {/* Top accent */}
          <div
            aria-hidden="true"
            style={{
              position:   "absolute",
              top:        0,
              left:       0,
              right:      0,
              height:     "1px",
              background: "var(--gradient-gold)",
              opacity:    0.4,
            }}
          />

          {status === "success" ? (
            /* ── Success state ── */
            <div
              style={{
                textAlign:     "center",
                padding:       "var(--space-10) var(--space-5)",
                display:       "flex",
                flexDirection: "column",
                alignItems:    "center",
                gap:           "var(--space-4)",
              }}
            >
              <div
                style={{
                  width:          "56px",
                  height:         "56px",
                  borderRadius:   "50%",
                  background:     "rgba(240,192,96,0.1)",
                  border:         "1px solid rgba(240,192,96,0.3)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  marginBottom:   "var(--space-3)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-warm)" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
                  <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 400, color: "var(--color-divine)" }}>
                Message received.
              </h3>
              <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: "320px" }}>
                Thank you for reaching out. A real person will read this and respond within 24 hours.
              </p>
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <h3
                style={{
                  fontFamily:   "var(--font-heading)",
                  fontSize:     "1.3rem",
                  fontWeight:   400,
                  color:        "var(--color-divine)",
                  marginBottom: "var(--space-2)",
                }}
              >
                Send us a message
              </h3>

              {/* Error banner */}
              {status === "error" && (
                <div style={{
                  padding:      "var(--space-3) var(--space-4)",
                  borderRadius: "var(--radius-md)",
                  background:   "rgba(220,60,60,0.08)",
                  border:       "1px solid rgba(220,60,60,0.25)",
                  color:        "#e88",
                  fontSize:     "0.82rem",
                  fontFamily:   "var(--font-body)",
                  lineHeight:   1.5,
                }}>
                  Something went wrong. Please try again or email us directly at kairos.app.official@gmail.com
                </div>
              )}

              {/* Name + Email row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <label
                    htmlFor="contact-name"
                    style={{ display: "block", color: "var(--color-muted)", fontSize: "0.78rem", marginBottom: "var(--space-2)", letterSpacing: "0.05em" }}
                  >
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    onFocus={() => setFocusField("name")}
                    onBlur={() => setFocusField(null)}
                    placeholder="David"
                    required
                    style={fieldStyle("name")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    style={{ display: "block", color: "var(--color-muted)", fontSize: "0.78rem", marginBottom: "var(--space-2)", letterSpacing: "0.05em" }}
                  >
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocusField("email")}
                    onBlur={() => setFocusField(null)}
                    placeholder="you@example.com"
                    required
                    style={fieldStyle("email")}
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label
                  htmlFor="contact-type"
                  style={{ display: "block", color: "var(--color-muted)", fontSize: "0.78rem", marginBottom: "var(--space-2)", letterSpacing: "0.05em" }}
                >
                  What is this about?
                </label>
                <select
                  id="contact-type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  onFocus={() => setFocusField("type")}
                  onBlur={() => setFocusField(null)}
                  style={{
                    ...fieldStyle("type"),
                    cursor:             "pointer",
                    appearance:         "none",
                    backgroundImage:    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236878a8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat:   "no-repeat",
                    backgroundPosition: "right 1rem center",
                    paddingRight:       "2.5rem",
                  }}
                >
                  <option value="feedback">Feedback</option>
                  <option value="question">General question</option>
                  <option value="prayer">Prayer request</option>
                  <option value="partnership">Partnership / Church</option>
                  <option value="bug">Bug report</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  style={{ display: "block", color: "var(--color-muted)", fontSize: "0.78rem", marginBottom: "var(--space-2)", letterSpacing: "0.05em" }}
                >
                  Your message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  onFocus={() => setFocusField("message")}
                  onBlur={() => setFocusField(null)}
                  placeholder="Share what is on your heart..."
                  required
                  rows={5}
                  style={{
                    ...fieldStyle("message"),
                    resize:    "vertical",
                    minHeight: "120px",
                  }}
                />
              </div>

              {/* Privacy note */}
              <p style={{ color: "var(--color-faint)", fontSize: "0.75rem", lineHeight: 1.6 }}>
                Your message is private. We will never share it or use it for marketing.
                We typically respond within 24 hours.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "sending"}
                className="kairos-btn-primary"
                style={{
                  width:   "100%",
                  fontSize: "0.95rem",
                  opacity: status === "sending" ? 0.7 : 1,
                  cursor:  status === "sending" ? "not-allowed" : "pointer",
                }}
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 820px) {
          #contact .kairos-container {
            grid-template-columns: 1fr !important;
          }
          #contact form > div:nth-child(3) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}