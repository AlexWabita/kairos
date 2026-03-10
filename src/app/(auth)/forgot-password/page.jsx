"use client"

import { useState }   from "react"
import { resetPassword } from "@/lib/supabase/auth"

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [sent,    setSent]    = useState(false)

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true)
    setError(null)

    const { error } = await resetPassword(email)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{
        width:        "100%",
        maxWidth:     "400px",
        background:   "linear-gradient(135deg, rgba(20,29,53,0.95) 0%, rgba(13,20,40,0.95) 100%)",
        border:       "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding:      "var(--space-10)",
        boxShadow:    "var(--shadow-card)",
        textAlign:    "center",
      }}>
        <div style={{
          width:          "48px",
          height:         "48px",
          borderRadius:   "50%",
          background:     "rgba(240,192,96,0.15)",
          border:         "1px solid rgba(240,192,96,0.3)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          margin:         "0 auto var(--space-6)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-gold-warm)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h2 style={{
          fontFamily:   "var(--font-heading)",
          fontSize:     "1.5rem",
          fontWeight:   300,
          color:        "var(--color-divine)",
          marginBottom: "var(--space-4)",
        }}>
          Check your inbox
        </h2>
        <p style={{
          fontFamily:   "var(--font-body)",
          fontSize:     "0.85rem",
          color:        "var(--color-soft)",
          lineHeight:   "var(--leading-relaxed)",
          marginBottom: "var(--space-6)",
        }}>
          A reset link has been sent to{" "}
          <strong style={{ color: "var(--color-gold-warm)" }}>{email}</strong>.
          Follow it to set a new password.
        </p>
        <a href="/login" style={{
          fontFamily:     "var(--font-body)",
          fontSize:       "0.75rem",
          color:          "var(--color-gold-warm)",
          textDecoration: "none",
        }}>
          ← Back to sign in
        </a>
      </div>
    )
  }

  return (
    <div style={{
      width:        "100%",
      maxWidth:     "400px",
      background:   "linear-gradient(135deg, rgba(20,29,53,0.95) 0%, rgba(13,20,40,0.95) 100%)",
      border:       "1px solid var(--color-border)",
      borderRadius: "var(--radius-xl)",
      padding:      "var(--space-8)",
      boxShadow:    "var(--shadow-card)",
    }}>
      <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
        <p style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.65rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color:         "var(--color-gold-warm)",
          marginBottom:  "var(--space-3)",
        }}>
          Password reset
        </p>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize:   "1.8rem",
          fontWeight: 300,
          color:      "var(--color-divine)",
          lineHeight: 1.3,
        }}>
          We will find<br />your way back
        </h1>
      </div>

      {error && (
        <div style={{
          background:   "rgba(220,60,60,0.1)",
          border:       "1px solid rgba(220,60,60,0.3)",
          borderRadius: "var(--radius-md)",
          padding:      "var(--space-3) var(--space-4)",
          marginBottom: "var(--space-5)",
        }}>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize:   "0.8rem",
            color:      "#f08080",
            margin:     0,
          }}>
            {error}
          </p>
        </div>
      )}

      <div style={{ marginBottom: "var(--space-6)" }}>
        <label style={{
          fontFamily:    "var(--font-body)",
          fontSize:      "0.7rem",
          letterSpacing: "0.08em",
          color:         "var(--color-muted)",
          display:       "block",
          marginBottom:  "var(--space-2)",
        }}>
          EMAIL
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="your@email.com"
          id="email"
          name="email"
          autoComplete="email"
          style={{
            width:        "100%",
            background:   "rgba(6,9,18,0.6)",
            border:       "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding:      "var(--space-3) var(--space-4)",
            color:        "var(--color-divine)",
            fontFamily:   "var(--font-body)",
            fontSize:     "0.9rem",
            outline:      "none",
            boxSizing:    "border-box",
            transition:   "border-color 0.2s ease",
          }}
          onFocus={e => e.target.style.borderColor = "var(--color-gold-warm)"}
          onBlur={e  => e.target.style.borderColor = "var(--color-border)"}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!email || loading}
        style={{
          width:         "100%",
          padding:       "var(--space-4)",
          background:    email && !loading ? "var(--gradient-gold)" : "var(--color-surface)",
          border:        "1px solid var(--color-border)",
          borderRadius:  "var(--radius-lg)",
          color:         email && !loading ? "#060912" : "var(--color-muted)",
          fontFamily:    "var(--font-display)",
          fontSize:      "0.75rem",
          letterSpacing: "0.15em",
          cursor:        email && !loading ? "pointer" : "not-allowed",
          transition:    "all 0.2s ease",
          boxShadow:     email && !loading ? "var(--shadow-gold-sm)" : "none",
        }}
      >
        {loading ? "Sending..." : "SEND RESET LINK"}
      </button>

      <p style={{
        textAlign:  "center",
        fontFamily: "var(--font-body)",
        fontSize:   "0.75rem",
        color:      "var(--color-muted)",
        marginTop:  "var(--space-6)",
      }}>
        <a href="/login" style={{
          color:          "var(--color-gold-warm)",
          textDecoration: "none",
        }}>
          ← Back to sign in
        </a>
      </p>
    </div>
  )
}