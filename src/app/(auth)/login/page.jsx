"use client"

import { useState }          from "react"
import { useRouter }         from "next/navigation"
import { signIn }            from "@/lib/supabase/auth"
import { supabase }          from "@/lib/supabase/client"
import { migrateAnonymousSession } from "@/lib/supabase/sessions"

export default function LoginPage() {
  const router = useRouter()

  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError(null)

    const { error } = await signIn({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Migrate any anonymous session data to the now-authenticated user
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        await migrateAnonymousSession(authUser.id)
      }
    } catch (migrationErr) {
      // Non-fatal — log and continue
      console.warn('[Kairos] Migration skipped:', migrationErr.message)
    }

    router.push("/journey")
    router.refresh()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit()
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
          Welcome back
        </p>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize:   "1.8rem",
          fontWeight: 300,
          color:      "var(--color-divine)",
          lineHeight: 1.3,
        }}>
          Your companion<br />is waiting
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
          onBlur={e  => e.target.style.borderColor = "var(--color-border)"}
        />
      </div>

      {/* Password */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
          <label style={{
            fontFamily:    "var(--font-body)",
            fontSize:      "0.7rem",
            letterSpacing: "0.08em",
            color:         "var(--color-muted)",
          }}>
            PASSWORD
          </label>
          <a href="/forgot-password" style={{
            fontFamily:     "var(--font-body)",
            fontSize:       "0.7rem",
            color:          "var(--color-gold-warm)",
            textDecoration: "none",
            opacity:        0.8,
          }}>
            Forgot password?
          </a>
        </div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="••••••••"
          id="password"
          name="password"
          autoComplete="current-password"
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

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!email || !password || loading}
        style={{
          width:         "100%",
          padding:       "var(--space-4)",
          background:    email && password && !loading
            ? "var(--gradient-gold)"
            : "var(--color-surface)",
          border:        "1px solid var(--color-border)",
          borderRadius:  "var(--radius-lg)",
          color:         email && password && !loading ? "#060912" : "var(--color-muted)",
          fontFamily:    "var(--font-display)",
          fontSize:      "0.75rem",
          letterSpacing: "0.15em",
          cursor:        email && password && !loading ? "pointer" : "not-allowed",
          transition:    "all 0.2s ease",
          boxShadow:     email && password && !loading ? "var(--shadow-gold-sm)" : "none",
        }}
      >
        {loading ? "Entering..." : "ENTER YOUR MOMENT"}
      </button>

      {/* Register link */}
      <p style={{
        textAlign:  "center",
        fontFamily: "var(--font-body)",
        fontSize:   "0.75rem",
        color:      "var(--color-muted)",
        marginTop:  "var(--space-6)",
      }}>
        New here?{" "}
        <a href="/register" style={{
          color:          "var(--color-gold-warm)",
          textDecoration: "none",
        }}>
          Begin your journey
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