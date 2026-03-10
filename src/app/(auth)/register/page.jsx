"use client"

import { useState }  from "react"
import { useRouter } from "next/navigation"
import { signUp }    from "@/lib/supabase/auth"

export default function RegisterPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [success,  setSuccess]  = useState(false)

  const handleSubmit = async () => {
    if (!email || !password || !fullName) return
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await signUp({ email, password, fullName })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit()
  }

  if (success) {
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
          width:        "48px",
          height:       "48px",
          borderRadius: "50%",
          background:   "rgba(240,192,96,0.15)",
          border:       "1px solid rgba(240,192,96,0.3)",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          margin:       "0 auto var(--space-6)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-gold-warm)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 style={{
          fontFamily:   "var(--font-heading)",
          fontSize:     "1.5rem",
          fontWeight:   300,
          color:        "var(--color-divine)",
          marginBottom: "var(--space-4)",
        }}>
          Your moment is appointed
        </h2>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize:   "0.85rem",
          color:      "var(--color-soft)",
          lineHeight: "var(--leading-relaxed)",
          marginBottom: "var(--space-6)",
        }}>
          A confirmation link has been sent to <strong style={{ color: "var(--color-gold-warm)" }}>{email}</strong>.
          Open it to activate your account and begin your journey.
        </p>
        <a href="/journey" style={{
          fontFamily:     "var(--font-body)",
          fontSize:       "0.75rem",
          color:          "var(--color-muted)",
          textDecoration: "none",
        }}>
          Continue without confirming →
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
      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
        <p style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.65rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color:         "var(--color-gold-warm)",
          marginBottom:  "var(--space-3)",
        }}>
          Begin your journey
        </p>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize:   "1.8rem",
          fontWeight: 300,
          color:      "var(--color-divine)",
          lineHeight: 1.3,
        }}>
          This is your<br />appointed moment
        </h1>
      </div>

      {/* Error */}
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

      {/* Full Name */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <label style={{
          fontFamily:    "var(--font-body)",
          fontSize:      "0.7rem",
          letterSpacing: "0.08em",
          color:         "var(--color-muted)",
          display:       "block",
          marginBottom:  "var(--space-2)",
        }}>
          YOUR NAME
        </label>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What should Kairos call you?"
          id="fullName"
          name="fullName"
          autoComplete="name"
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
          onBlur={e => e.target.style.borderColor  = "var(--color-border)"}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: "var(--space-4)" }}>
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
          onKeyDown={handleKeyDown}
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
          onBlur={e => e.target.style.borderColor  = "var(--color-border)"}
        />
      </div>

      {/* Password */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <label style={{
          fontFamily:    "var(--font-body)",
          fontSize:      "0.7rem",
          letterSpacing: "0.08em",
          color:         "var(--color-muted)",
          display:       "block",
          marginBottom:  "var(--space-2)",
        }}>
          PASSWORD
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="At least 8 characters"
          id="password"
          name="password"
          autoComplete="new-password"
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
          onBlur={e => e.target.style.borderColor  = "var(--color-border)"}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!email || !password || !fullName || loading}
        style={{
          width:         "100%",
          padding:       "var(--space-4)",
          background:    email && password && fullName && !loading
            ? "var(--gradient-gold)"
            : "var(--color-surface)",
          border:        "1px solid var(--color-border)",
          borderRadius:  "var(--radius-lg)",
          color:         email && password && fullName && !loading ? "#060912" : "var(--color-muted)",
          fontFamily:    "var(--font-display)",
          fontSize:      "0.75rem",
          letterSpacing: "0.15em",
          cursor:        email && password && fullName && !loading ? "pointer" : "not-allowed",
          transition:    "all 0.2s ease",
          boxShadow:     email && password && fullName && !loading ? "var(--shadow-gold-sm)" : "none",
        }}
      >
        {loading ? "Creating your moment..." : "BEGIN YOUR JOURNEY"}
      </button>

      {/* Login link */}
      <p style={{
        textAlign:  "center",
        fontFamily: "var(--font-body)",
        fontSize:   "0.75rem",
        color:      "var(--color-muted)",
        marginTop:  "var(--space-6)",
      }}>
        Already have an account?{" "}
        <a href="/login" style={{
          color:          "var(--color-gold-warm)",
          textDecoration: "none",
        }}>
          Sign in
        </a>
      </p>

      {/* Continue anonymously */}
      <p style={{
        textAlign:  "center",
        fontFamily: "var(--font-body)",
        fontSize:   "0.7rem",
        color:      "var(--color-faint)",
        marginTop:  "var(--space-3)",
      }}>
        <a href="/journey" style={{
          color:          "var(--color-faint)",
          textDecoration: "none",
        }}>
          Continue without signing in →
        </a>
      </p>
    </div>
  )
}