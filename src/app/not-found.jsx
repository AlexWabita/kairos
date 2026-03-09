import Link from "next/link"

export default function NotFound() {
  return (
    <div
      style={{
        minHeight:      "100vh",
        background:     "#060912",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        textAlign:      "center",
        padding:        "2rem",
        gap:            "1.5rem",
      }}
    >
      <p
        style={{
          fontFamily:    "'Cinzel', serif",
          fontSize:      "0.7rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color:         "#d4a040",
        }}
      >
        Lost?
      </p>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize:   "clamp(1.8rem, 4vw, 3rem)",
          fontWeight: 300,
          color:      "#fff8e8",
          lineHeight: 1.3,
        }}
      >
        This page does not exist.
        <br />
        <span style={{ color: "#d4a040", fontStyle: "italic" }}>
          But your moment still might.
        </span>
      </h2>
      <Link
        href="/"
        style={{
          marginTop:     "1rem",
          background:    "linear-gradient(135deg, #f0c060, #a07828)",
          color:         "#060912",
          fontFamily:    "'Nunito', sans-serif",
          fontWeight:    700,
          fontSize:      "0.85rem",
          padding:       "0.75rem 2rem",
          borderRadius:  "9999px",
          textDecoration: "none",
          display:       "inline-block",
        }}
      >
        Return Home
      </Link>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Nunito:wght@700&display=swap');
      `}</style>
    </div>
  )
}
