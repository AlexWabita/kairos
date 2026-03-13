export default function ScriptureBanner() {
  return (
    <section
      style={{
        background:   "var(--color-deep)",
        padding:      "var(--space-16) var(--space-5)",
        textAlign:    "center",
        borderTop:    "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        position:     "relative",
        overflow:     "hidden",
      }}
    >
      {/* Glow */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          inset:         0,
          background:    "radial-gradient(ellipse at center, rgba(240,192,96,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="kairos-container" style={{ position: "relative", zIndex: 1 }}>
        {/* Ornament */}
        <div
          aria-hidden="true"
          style={{
            display:       "flex",
            alignItems:    "center",
            justifyContent: "center",
            gap:           "var(--space-4)",
            marginBottom:  "var(--space-5)",
          }}
        >
          <div style={{ width: "40px", height: "1px", background: "var(--gradient-gold)", opacity: 0.5 }} />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-deep)" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <div style={{ width: "40px", height: "1px", background: "var(--gradient-gold)", opacity: 0.5 }} />
        </div>

        <p
          className="text-scripture"
          style={{
            display:    "inline-block",
            border:     "none",
            padding:    0,
            fontSize:   "clamp(1.1rem, 2vw, 1.5rem)",
            maxWidth:   "640px",
            textAlign:  "center",
            fontStyle:  "italic",
            color:      "var(--color-divine)",
            lineHeight: 1.7,
          }}
        >
          &ldquo;He has made everything beautiful in its time. He has also set
          eternity in the human heart; yet no one can fathom what God has done
          from beginning to end.&rdquo;
        </p>
        <p
          className="text-label"
          style={{
            marginTop: "var(--space-4)",
            color:     "var(--color-gold-deep)",
            fontSize:  "0.8rem",
            letterSpacing: "0.12em",
            fontFamily: "var(--font-display)",
          }}
        >
          ECCLESIASTES 3:11
        </p>
      </div>
    </section>
  )
}