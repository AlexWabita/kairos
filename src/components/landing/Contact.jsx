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

const reasons = [
  { title: "Share feedback",    body: "Tell us what works, what doesn't, and what you wish Kairos could do." },
  { title: "Ask a question",    body: "Something unclear? We are real people and we read every message." },
  { title: "Request prayer",    body: "If you are carrying something heavy and want someone to know, tell us." },
  { title: "Talk partnerships", body: "Church, ministry, or organisation? We would love to hear from you." },
]

export default function Contact() {
  const [ref, inView] = useInView(0.06)

  const [form,       setForm]       = useState({ name: "", email: "", type: "feedback", message: "" })
  const [status,     setStatus]     = useState("idle")
  const [focusField, setFocusField] = useState(null)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus("sending")
    await new Promise(r => setTimeout(r, 1200))
    setStatus("success")
  }

  const fieldStyle = (name) => ({
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${focusField === name ? "rgba(240,192,96,0.45)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: 10,
    padding: "11px 14px",
    color: "rgba(255,255,255,0.85)",
    fontSize: "0.9rem", fontFamily: "var(--font-body)",
    outline: "none",
    transition: "border-color 0.2s ease",
    boxShadow: focusField === name ? "0 0 0 3px rgba(240,192,96,0.06)" : "none",
  })

  return (
    <section
      id="contact"
      style={{
        background: "var(--color-void)",
        padding: "120px 24px",
        position: "relative", overflow: "hidden",
      }}
    >
      <div aria-hidden="true" style={{
        position: "absolute", bottom: "-80px", left: "8%",
        width: 500, height: 400,
        background: "radial-gradient(ellipse, rgba(240,192,96,0.03) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div ref={ref} className="kairos-container">
        <div className="contact-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr",
          gap: "80px",
          alignItems: "flex-start",
        }}>

          {/* ── Left ── */}
          <div>
            <p style={{
              fontFamily: "var(--font-display)", fontSize: "0.58rem",
              letterSpacing: "0.28em", textTransform: "uppercase",
              color: "rgba(240,192,96,0.7)", marginBottom: 18,
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
              Get in Touch
            </p>
            <h2 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.8rem, 2.5vw, 2.4rem)",
              fontWeight: 300, color: "rgba(255,255,255,0.88)",
              lineHeight: 1.25, marginBottom: 16,
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
            }}>
              We are{" "}
              <em style={{ color: "var(--color-gold-warm)" }}>real people.</em>
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.35)", fontSize: "0.88rem",
              lineHeight: 1.8, marginBottom: 40, maxWidth: "320px",
              opacity: inView ? 1 : 0,
              transition: "opacity 0.7s ease 0.2s",
            }}>
              Kairos is not built by a faceless corporation. Reach out for any
              reason — we read every message and respond within 24 hours.
            </p>

            {/* Reason tiles */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {reasons.map((r, i) => (
                <div key={r.title} style={{
                  padding: "16px 0",
                  borderBottom: i < reasons.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateX(0)" : "translateX(-14px)",
                  transition: `opacity 0.6s ease ${0.25 + i * 0.06}s, transform 0.6s ease ${0.25 + i * 0.06}s`,
                }}>
                  <p style={{
                    color: "rgba(255,255,255,0.65)", fontSize: "0.85rem",
                    fontWeight: 500, marginBottom: 3, lineHeight: 1.3,
                  }}>
                    {r.title}
                  </p>
                  <p style={{
                    color: "rgba(255,255,255,0.28)", fontSize: "0.8rem", lineHeight: 1.6,
                  }}>
                    {r.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right — Form ── */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "32px",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
          }}>

            {status === "success" ? (
              <div style={{
                textAlign: "center", padding: "40px 20px",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "rgba(240,192,96,0.1)",
                  border: "1px solid rgba(240,192,96,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="var(--color-gold-warm)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3 style={{
                  fontFamily: "var(--font-heading)", fontSize: "1.3rem",
                  fontWeight: 400, color: "rgba(255,255,255,0.88)",
                }}>
                  Message received.
                </h3>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.88rem", lineHeight: 1.7, maxWidth: "280px" }}>
                  Thank you for reaching out. A real person will read this and respond within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{
                  fontFamily: "var(--font-heading)", fontSize: "1.15rem",
                  fontWeight: 400, color: "rgba(255,255,255,0.85)",
                  marginBottom: 4,
                }}>
                  Send us a message
                </h3>

                {/* Name + Email */}
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label htmlFor="c-name" style={{ display: "block", color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", marginBottom: 6, letterSpacing: "0.04em" }}>
                      Your name
                    </label>
                    <input id="c-name" name="name" type="text" value={form.name}
                      onChange={handleChange}
                      onFocus={() => setFocusField("name")} onBlur={() => setFocusField(null)}
                      placeholder="David" required style={fieldStyle("name")} />
                  </div>
                  <div>
                    <label htmlFor="c-email" style={{ display: "block", color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", marginBottom: 6, letterSpacing: "0.04em" }}>
                      Email address
                    </label>
                    <input id="c-email" name="email" type="email" value={form.email}
                      onChange={handleChange}
                      onFocus={() => setFocusField("email")} onBlur={() => setFocusField(null)}
                      placeholder="you@example.com" required style={fieldStyle("email")} />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label htmlFor="c-type" style={{ display: "block", color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", marginBottom: 6, letterSpacing: "0.04em" }}>
                    What is this about?
                  </label>
                  <select id="c-type" name="type" value={form.type}
                    onChange={handleChange}
                    onFocus={() => setFocusField("type")} onBlur={() => setFocusField(null)}
                    style={{
                      ...fieldStyle("type"), cursor: "pointer",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.25)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: "40px",
                    }}>
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
                  <label htmlFor="c-message" style={{ display: "block", color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", marginBottom: 6, letterSpacing: "0.04em" }}>
                    Your message
                  </label>
                  <textarea id="c-message" name="message" value={form.message}
                    onChange={handleChange}
                    onFocus={() => setFocusField("message")} onBlur={() => setFocusField(null)}
                    placeholder="Share what is on your heart..."
                    required rows={5}
                    style={{ ...fieldStyle("message"), resize: "vertical", minHeight: "120px" }} />
                </div>

                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.72rem", lineHeight: 1.65 }}>
                  Your message is private. We will never share it or use it for marketing.
                </p>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    padding: "13px 0", borderRadius: 12,
                    background: status === "sending" ? "rgba(240,192,96,0.6)" : "var(--gradient-gold)",
                    border: "none", color: "#060912",
                    fontFamily: "var(--font-display)", fontSize: "0.65rem",
                    letterSpacing: "0.15em",
                    cursor: status === "sending" ? "not-allowed" : "pointer",
                    boxShadow: status === "sending" ? "none" : "var(--shadow-gold-sm)",
                    transition: "opacity 0.2s ease",
                  }}
                  onMouseEnter={(e) => { if (status !== "sending") e.currentTarget.style.opacity = "0.88" }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
                >
                  {status === "sending" ? "Sending…" : "SEND MESSAGE"}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}