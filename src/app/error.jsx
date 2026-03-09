"use client"

export default function Error({ error, reset }) {
  return (
    <div
      style={{
        minHeight:      "100vh",
        background:     "var(--color-void)",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        textAlign:      "center",
        padding:        "2rem",
      }}
    >
      <p
        style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.75rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color:         "var(--color-gold-warm)",
          marginBottom:  "1rem",
        }}
      >
        Something went wrong
      </p>
      <h2
        style={{
          fontFamily:   "var(--font-heading)",
          fontSize:     "2rem",
          fontWeight:   300,
          color:        "var(--color-divine)",
          marginBottom: "1.5rem",
        }}
      >
        An unexpected error occurred.
      </h2>
      <button
        className="kairos-btn-primary"
        onClick={() => reset()}
      >
        Try Again
      </button>
    </div>
  )
}
