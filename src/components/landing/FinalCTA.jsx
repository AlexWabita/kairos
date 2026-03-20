"use client"

export default function FinalCTA() {
  return (
    <section style={{
      background: "var(--color-void)",
      padding: "120px 24px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Orb */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "600px", height: "400px",
        background: "radial-gradient(ellipse, rgba(240,192,96,0.06) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      {/* Top border */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 1, background: "rgba(255,255,255,0.05)",
      }} />

      <div className="kairos-container" style={{ position: "relative", zIndex: 1 }}>
        <p style={{
          fontFamily: "var(--font-display)", fontSize: "0.58rem",
          letterSpacing: "0.28em", textTransform: "uppercase",
          color: "rgba(240,192,96,0.7)", marginBottom: 24,
        }}>
          Begin Now
        </p>
        <h2 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(2rem, 5vw, 3.8rem)",
          fontWeight: 300,
          color: "rgba(255,255,255,0.88)",
          lineHeight: 1.2, marginBottom: 20,
        }}>
          Your Kairos moment
          <br />
          <em style={{ color: "var(--color-gold-warm)" }}>might be right now.</em>
        </h2>
        <p style={{
          color: "rgba(255,255,255,0.32)", fontSize: "0.95rem",
          maxWidth: "420px", margin: "0 auto 44px",
          lineHeight: 1.8,
        }}>
          No account needed. No judgment waiting.
          Just an open door and a question you have been carrying.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/journey"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 28px", borderRadius: 100,
              background: "var(--gradient-gold)",
              color: "#060912",
              fontFamily: "var(--font-display)", fontSize: "0.65rem",
              letterSpacing: "0.16em",
              textDecoration: "none",
              boxShadow: "0 0 32px rgba(240,192,96,0.25), var(--shadow-gold-sm)",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88" }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
          >
            BEGIN YOUR JOURNEY — IT&apos;S FREE
          </a>
          <a
            href="#faq"
            style={{
              display: "inline-flex", alignItems: "center",
              padding: "13px 22px", borderRadius: 100,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "var(--font-body)", fontSize: "0.88rem",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"
              e.currentTarget.style.color = "rgba(255,255,255,0.75)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
              e.currentTarget.style.color = "rgba(255,255,255,0.4)"
            }}
          >
            Common questions
          </a>
        </div>
      </div>
    </section>
  )
}