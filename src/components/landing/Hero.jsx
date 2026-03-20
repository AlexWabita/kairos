"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

/* ─────────────────────────────────────────────────────────────
   HERO
   Leonardo AI-inspired: void background, 3 blur orbs,
   centered dramatic headline, minimal CTAs, trust bar.
───────────────────────────────────────────────────────────── */
export default function Hero() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      style={{
        position:       "relative",
        minHeight:      "100vh",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        overflow:       "hidden",
        background:     "var(--color-void)",
        paddingTop:     "80px",
      }}
    >
      <style>{`
        @keyframes orb-drift-1 {
          0%, 100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.55; }
          50%       { transform: translate(-50%,-55%) scale(1.08); opacity: 0.7;  }
        }
        @keyframes orb-drift-2 {
          0%, 100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.35; }
          50%       { transform: translate(-52%,-48%) scale(1.06); opacity: 0.5;  }
        }
        @keyframes orb-drift-3 {
          0%, 100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.25; }
          60%       { transform: translate(-48%,-52%) scale(1.1);  opacity: 0.4;  }
        }
        @keyframes hero-float {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-8px);  }
        }
        @keyframes hero-fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .hero-stat:hover { border-color: rgba(240,192,96,0.25) !important; }
      `}</style>

      {/* ── Ambient blur orbs ── */}
      <div aria-hidden="true" style={{
        position: "absolute", left: "50%", top: "45%",
        width: "700px", height: "700px",
        background: "radial-gradient(circle, rgba(240,192,96,0.09) 0%, transparent 65%)",
        borderRadius: "50%", pointerEvents: "none",
        animation: "orb-drift-1 8s ease-in-out infinite",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", left: "20%", top: "30%",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(64,100,200,0.07) 0%, transparent 65%)",
        borderRadius: "50%", pointerEvents: "none",
        animation: "orb-drift-2 11s ease-in-out infinite",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", left: "80%", top: "65%",
        width: "300px", height: "300px",
        background: "radial-gradient(circle, rgba(240,192,96,0.06) 0%, transparent 65%)",
        borderRadius: "50%", pointerEvents: "none",
        animation: "orb-drift-3 14s ease-in-out infinite",
      }} />

      {/* ── Noise grain overlay (very subtle) ── */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, opacity: 0.025,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "200px 200px",
        pointerEvents: "none",
      }} />

      {/* ── Content ── */}
      <div style={{
        position: "relative", zIndex: 10,
        textAlign: "center",
        padding: "0 20px",
        maxWidth: "760px",
        width: "100%",
        margin: "0 auto",
      }}>

        {/* Eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          marginBottom: 28,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
        }}>
          <div style={{ width: 28, height: 1, background: "rgba(240,192,96,0.5)" }} />
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.6rem", letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(240,192,96,0.8)",
          }}>
            Your appointed moment
          </span>
          <div style={{ width: 28, height: 1, background: "rgba(240,192,96,0.5)" }} />
        </div>

        {/* Main headline */}
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
          fontWeight: 300,
          lineHeight: 1.1,
          color: "rgba(255,255,255,0.92)",
          marginBottom: 28,
          letterSpacing: "-0.01em",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
        }}>
          A companion for
          <br />
          <em style={{
            background: "linear-gradient(135deg, #f0c060 0%, #d4903a 50%, #f0c060 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontStyle: "italic",
          }}>
            the searching soul.
          </em>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(1rem, 2vw, 1.15rem)",
          color: "rgba(255,255,255,0.42)",
          lineHeight: 1.75,
          maxWidth: "480px",
          margin: "0 auto 40px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.8s ease 0.35s, transform 0.8s ease 0.35s",
        }}>
          Ask the questions you've been afraid to ask.
          Kairos listens, responds with scripture, and walks beside you —
          no judgment, no agenda.
        </p>

        {/* CTAs */}
        <div style={{
          display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap",
          marginBottom: 52,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s",
        }}>
          <Link href="/journey" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 28px", borderRadius: 100,
            background: "var(--gradient-gold)",
            color: "#060912",
            fontFamily: "var(--font-display)", fontSize: "0.65rem",
            letterSpacing: "0.16em",
            textDecoration: "none",
            boxShadow: "0 0 32px rgba(240,192,96,0.3), var(--shadow-gold-sm)",
            transition: "opacity 0.15s ease, box-shadow 0.15s ease",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.boxShadow = "0 0 48px rgba(240,192,96,0.45), var(--shadow-gold-sm)" }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.boxShadow = "0 0 32px rgba(240,192,96,0.3), var(--shadow-gold-sm)" }}
          >
            BEGIN YOUR JOURNEY
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <button
            onClick={() => { document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }) }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 24px", borderRadius: 100,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.55)",
              fontFamily: "var(--font-body)", fontSize: "0.88rem",
              cursor: "pointer", transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)" }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
          >
            Learn more
          </button>
        </div>

        {/* Trust bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 0, flexWrap: "wrap",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease 0.65s",
        }}>
          {[
            { label: "No account needed"    },
            { label: "Grounded in scripture" },
            { label: "100% private"          },
          ].map((item, i) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && (
                <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)", margin: "0 16px" }} />
              )}
              <div className="hero-stat" style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "6px 14px", borderRadius: 100,
                border: "1px solid transparent",
                transition: "border-color 0.2s ease",
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(240,192,96,0.6)" }} />
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.28)", letterSpacing: "0.02em",
                }}>
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => { document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }) }}
        aria-label="Scroll down"
        style={{
          position: "absolute", bottom: 36, left: "50%",
          transform: "translateX(-50%)",
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.2)",
          animation: visible ? "hero-float 3s ease-in-out infinite" : "none",
          opacity: visible ? 1 : 0,
          transition: "opacity 1s ease 1.4s",
          zIndex: 10,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </button>

      {/* Bottom fade */}
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 180,
        background: "linear-gradient(to bottom, transparent, var(--color-void))",
        pointerEvents: "none",
      }} />
    </section>
  )
}