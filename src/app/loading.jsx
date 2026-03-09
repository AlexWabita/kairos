export default function Loading() {
  return (
    <div
      style={{
        minHeight:      "100vh",
        background:     "#060912",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "1.5rem",
      }}
    >
      {/* Pulsing KAIROS wordmark */}
      <span
        style={{
          fontFamily:    "'Cinzel', serif",
          fontSize:      "1.4rem",
          fontWeight:    700,
          letterSpacing: "0.25em",
          background:    "linear-gradient(135deg, #fff8e8 0%, #f0c060 50%, #d4a040 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor:  "transparent",
          backgroundClip: "text",
          animation:     "pulse 2s ease-in-out infinite",
        }}
      >
        KAIROS
      </span>

      {/* Subtle loading dots */}
      <div style={{ display: "flex", gap: "8px" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width:        "6px",
              height:       "6px",
              borderRadius: "50%",
              background:   "#d4a040",
              animation:    `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              opacity:      0.6,
            }}
          />
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1;   }
        }
      `}</style>
    </div>
  )
}
