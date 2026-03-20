export default function ScriptureBanner() {
  return (
    <section
      style={{
        background:   "#0a0c14",
        padding:      "100px 24px",
        textAlign:    "center",
        position:     "relative",
        overflow:     "hidden",
      }}
    >
      {/* Radial glow */}
      <div aria-hidden="true" style={{
        position:      "absolute",
        inset:         0,
        background:    "radial-gradient(ellipse at center, rgba(240,192,96,0.04) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Horizontal rules */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 1, background: "rgba(255,255,255,0.05)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 1, background: "rgba(255,255,255,0.05)",
      }} />

      <div className="kairos-container" style={{ position: "relative", zIndex: 1, maxWidth: "700px" }}>

        {/* Ornament */}
        <div aria-hidden="true" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 16, marginBottom: 40,
        }}>
          <div style={{ flex: 1, maxWidth: 60, height: 1, background: "linear-gradient(to right, transparent, rgba(240,192,96,0.4))" }} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.5)" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <div style={{ flex: 1, maxWidth: 60, height: 1, background: "linear-gradient(to left, transparent, rgba(240,192,96,0.4))" }} />
        </div>

        {/* Quote */}
        <p style={{
          fontFamily:   "var(--font-heading)",
          fontSize:     "clamp(1.2rem, 2.5vw, 1.65rem)",
          fontWeight:   300,
          fontStyle:    "italic",
          color:        "rgba(255,255,255,0.75)",
          lineHeight:   1.75,
          marginBottom: 28,
          letterSpacing: "-0.005em",
        }}>
          &ldquo;He has made everything beautiful in its time. He has also set
          eternity in the human heart; yet no one can fathom what God has done
          from beginning to end.&rdquo;
        </p>

        {/* Reference */}
        <p style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.58rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color:         "rgba(240,192,96,0.6)",
        }}>
          Ecclesiastes 3:11
        </p>

      </div>
    </section>
  )
}