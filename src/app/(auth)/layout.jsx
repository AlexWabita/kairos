/**
 * KAIROS — Auth Layout
 * Wraps login, register, and forgot-password pages
 * with the Kairos dark aesthetic.
 */

export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight:      "100vh",
      background:     "var(--gradient-hero)",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      padding:        "var(--space-6)",
      position:       "relative",
      overflow:       "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position:     "absolute",
        top:          "30%",
        left:         "50%",
        transform:    "translate(-50%, -50%)",
        width:        "600px",
        height:       "600px",
        background:   "radial-gradient(circle, rgba(240,192,96,0.06) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <a href="/" style={{ textDecoration: "none", marginBottom: "var(--space-8)" }}>
        <span style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "1.2rem",
          letterSpacing: "0.25em",
          background:    "var(--gradient-text)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor:  "transparent",
          backgroundClip: "text",
        }}>
          KAIROS
        </span>
      </a>

      {children}

      <p style={{
        fontFamily:    "var(--font-body)",
        fontSize:      "0.65rem",
        color:         "var(--color-faint)",
        marginTop:     "var(--space-8)",
        letterSpacing: "0.03em",
        textAlign:     "center",
      }}>
        Your appointed moment awaits
      </p>
    </div>
  )
}