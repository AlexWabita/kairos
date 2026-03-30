"use client"

import { useState, useRef, useEffect } from "react"
import { useSettings }    from "@/context/SettingsContext"
import { useAuthState }   from "@/hooks/useAuthState"
import { getTodaysVerse } from "@/lib/bible/daily-verses"
import BibleVerse         from "./BibleVerse"
import SaveMomentModal    from "./SaveMomentModal"

/* ─────────────────────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────────────────────── */
function detectVerseRequest(text) {
  const p = /\b(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|1\s?samuel|2\s?samuel|1\s?kings|2\s?kings|1\s?chronicles|2\s?chronicles|ezra|nehemiah|esther|job|psalms?|proverbs|ecclesiastes|song\s?of\s?solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|matthew|mark|luke|john|acts|romans|1\s?corinthians|2\s?corinthians|galatians|ephesians|philippians|colossians|1\s?thessalonians|2\s?thessalonians|1\s?timothy|2\s?timothy|titus|philemon|hebrews|james|1\s?peter|2\s?peter|1\s?john|2\s?john|3\s?john|jude|revelation)\s+\d+:\d+(-\d+)?/i
  const m = text.match(p); return m ? m[0] : null
}
function detectBibleSearch(text) {
  const t = text.toLowerCase()
  return ["where does the bible say","find verses about","search the bible for","what does the bible say about","verses about","bible verses on"].some(k => t.includes(k))
}

/* ─────────────────────────────────────────────────────────────
   CSS
───────────────────────────────────────────────────────────── */
const css = `
  @keyframes cc-fade  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cc-pulse { 0%,100%{opacity:.4;transform:scale(.85)} 50%{opacity:1;transform:scale(1.15)} }
  @keyframes cc-spin  { to{transform:rotate(360deg)} }
  @keyframes cc-blink { 0%,100%{opacity:1} 50%{opacity:0} }

  .cc-layout {
    display: grid;
    grid-template-columns: 220px 1fr;
    height: 100vh;
    overflow: hidden;
  }

  /* ── Sidebar ── */
  .cc-sidebar {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: rgba(8,10,18,0.95);
    border-right: 1px solid rgba(255,255,255,0.06);
    padding: 0;
    overflow: hidden;
  }

  /* ── Main chat column ── */
  .cc-main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    min-width: 0;
  }

  /* ── Nav link ── */
  .cc-nav-link {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 16px; border-radius: 8px;
    text-decoration: none; cursor: pointer;
    border: none; background: transparent; width: 100%;
    transition: background 0.15s ease, color 0.15s ease;
    min-height: 40px;
  }
  .cc-nav-link:hover { background: rgba(255,255,255,0.05); }
  .cc-nav-link.active { background: rgba(255,255,255,0.08); }

  /* ── Message ── */
  .cc-msg-kairos { animation: cc-fade 0.4s ease forwards; }

  /* ── Textarea auto-resize ── */
  .cc-input { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
  .cc-input::-webkit-scrollbar { width: 4px; }
  .cc-input::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  /* ── Mobile: collapse sidebar into bottom bar ── */
  .cc-mobile-nav { display: none; }

  @media (max-width: 768px) {
    .cc-layout { grid-template-columns: 1fr; }
    .cc-sidebar { display: none; }
    .cc-mobile-nav { display: flex; }
  }

  /* ── Very small screens ── */
  @media (max-width: 420px) {
    .cc-msg-content { font-size: 0.88rem !important; }
  }
`

/* ─────────────────────────────────────────────────────────────
   NAV ITEMS
───────────────────────────────────────────────────────────── */
const NAV = [
  { label: "Companion", href: "/journey",       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { label: "Saved",     href: "/journey/saved", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> },
  { label: "Bible",     href: "/bible",         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { label: "Plans",     href: "/plans",         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label: "Account",   href: "/account",       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: "Settings",  href: "/settings",      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
]

const PROMPTS = [
  "I have questions about faith I'm afraid to ask",
  "I've been hurt by the church",
  "I don't know if God is real",
  "I'm going through something really hard",
  "I just feel lost",
  "Help me understand a Bible passage",
]

/* ─────────────────────────────────────────────────────────────
   INLINE SIGN-IN MODAL
───────────────────────────────────────────────────────────── */
function InlineSignInModal({ onSuccess, onCancel }) {
  const [email,   setEmail]   = useState("")
  const [password,setPassword]= useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleSignIn = async () => {
    if (!email || !password) return
    setLoading(true); setError(null)
    try {
      const { signIn } = await import("@/lib/supabase/auth")
      const { error }  = await signIn({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      await new Promise(r => setTimeout(r, 300))
      onSuccess()
    } catch { setError("Something went wrong. Please try again."); setLoading(false) }
  }

  return (
    <div role="dialog" aria-modal="true" style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(4,6,14,0.9)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        background: "#0f1117", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16, padding: "32px 28px",
        maxWidth: "380px", width: "100%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        animation: "cc-fade 0.2s ease forwards",
      }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,192,96,0.7)", marginBottom: 10 }}>Save to Journey</p>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 300, color: "rgba(255,255,255,0.88)", marginBottom: 6 }}>Sign in to save this moment</h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.6, marginBottom: 24 }}>Your conversation will stay exactly as it is.</p>

        {error && <div style={{ background: "rgba(240,60,60,0.1)", border: "1px solid rgba(240,60,60,0.25)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#f08080", margin: 0 }}>{error}</p>
        </div>}

        {["email","password"].map((field) => (
          <div key={field} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.68rem", letterSpacing: "0.06em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>{field.toUpperCase()}</label>
            <input
              autoFocus={field === "email"}
              type={field}
              value={field === "email" ? email : password}
              onChange={e => field === "email" ? setEmail(e.target.value) : setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSignIn(); if (e.key === "Escape") onCancel() }}
              placeholder={field === "email" ? "your@email.com" : "••••••••"}
              autoComplete={field === "email" ? "email" : "current-password"}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.09)",
                borderRadius: 10, padding: "10px 14px",
                color: "rgba(255,255,255,0.85)",
                fontFamily: "var(--font-body)", fontSize: "0.9rem",
                outline: "none",
              }}
              onFocus={e => { e.target.style.borderColor = "rgba(240,192,96,0.5)" }}
              onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.09)" }}
            />
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px 0", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)", fontSize: "0.85rem", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSignIn} disabled={!email || !password || loading}
            style={{
              flex: 2, padding: "11px 0",
              background: email && password && !loading ? "var(--gradient-gold)" : "rgba(255,255,255,0.06)",
              border: "none", borderRadius: 10,
              color: email && password && !loading ? "#060912" : "rgba(255,255,255,0.25)",
              fontFamily: "var(--font-display)", fontSize: "0.65rem",
              letterSpacing: "0.14em", cursor: email && password && !loading ? "pointer" : "not-allowed",
              boxShadow: email && password && !loading ? "var(--shadow-gold-sm)" : "none",
            }}>
            {loading ? "Signing in…" : "SIGN IN & SAVE"}
          </button>
        </div>
        <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", marginTop: 16 }}>
          No account?{" "}
          <a href="/register" style={{ color: "rgba(240,192,96,0.7)", textDecoration: "none" }}>Create one →</a>
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   CONSENT MODAL
───────────────────────────────────────────────────────────── */
function ConsentModal({ onAccept }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 400,
      background: "rgba(4,6,14,0.95)", backdropFilter: "blur(16px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#0f1117", border: "1px solid rgba(240,192,96,0.2)",
        borderRadius: 18, padding: "36px 32px",
        maxWidth: "400px", width: "100%", textAlign: "center",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(240,192,96,0.1)", border: "1px solid rgba(240,192,96,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "rgba(240,192,96,0.8)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,192,96,0.7)", marginBottom: 14 }}>Before we begin</p>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 300, color: "rgba(255,255,255,0.88)", lineHeight: 1.4, marginBottom: 12 }}>A safe space for honest conversations</h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.75, marginBottom: 28 }}>
          Kairos stores your conversations to provide continuity. What you share is treated with care and is never sold or used for advertising. By continuing you agree to our{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(240,192,96,0.7)", textDecoration: "none" }}>Privacy Policy</a>.
        </p>
        <button onClick={onAccept} style={{
          width: "100%", padding: "13px 0",
          background: "var(--gradient-gold)", border: "none",
          borderRadius: 12, color: "#060912",
          fontFamily: "var(--font-display)", fontSize: "0.65rem",
          letterSpacing: "0.15em", cursor: "pointer",
          boxShadow: "var(--shadow-gold-sm)",
        }}>
          I UNDERSTAND — BEGIN
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SCRIPTURE BLOCK (inside message)
───────────────────────────────────────────────────────────── */
function ScriptureBlock({ text, reference }) {
  return (
    <div style={{
      borderLeft: "2px solid rgba(240,192,96,0.4)",
      paddingLeft: 14, margin: "10px 0",
    }}>
      <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontSize: "0.92rem", color: "rgba(240,192,96,0.9)", lineHeight: 1.7, margin: 0 }}>
        &ldquo;{text}&rdquo;
      </p>
      {reference && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginTop: 6, textTransform: "uppercase" }}>
          — {reference}
        </p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SAVE BUTTON
───────────────────────────────────────────────────────────── */
function SaveButton({ saved, isAuthenticated, onSave, onSignInToSave }) {
  if (saved) return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="rgba(240,192,96,0.8)" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(240,192,96,0.7)", letterSpacing: "0.03em" }}>Saved to journey</span>
    </div>
  )

  const handler = isAuthenticated ? onSave : onSignInToSave
  return (
    <button onClick={handler} style={{
      display: "flex", alignItems: "center", gap: 6,
      marginTop: 12, paddingTop: 10,
      borderTop: "1px solid rgba(255,255,255,0.05)",
      background: "none", border: "none", padding: "10px 0 0",
      cursor: "pointer", color: "rgba(255,255,255,0.2)",
      fontFamily: "var(--font-body)", fontSize: "0.7rem",
      letterSpacing: "0.03em", transition: "color 0.15s ease",
    }}
      onMouseEnter={e => e.currentTarget.style.color = "rgba(240,192,96,0.8)"}
      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      {isAuthenticated ? "Save this moment" : "Sign in to save"}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────────── */
function Message({ role, content, isNew, verseData, onSave, onSignInToSave, saved, isAuthenticated, wasTruncated }) {
  const isKairos = role === "assistant"

  const renderContent = (text) => {
    const parts = text.split(/\[scripture\](.*?)\[\/scripture\]/gs)
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        const [t, ref] = part.split("|")
        return <ScriptureBlock key={i} text={t} reference={ref} />
      }
      return part ? (
        <p key={i} className="cc-msg-content" style={{
          fontFamily: isKairos ? "var(--font-heading)" : "var(--font-body)",
          fontSize: isKairos ? "0.95rem" : "0.9rem",
          fontWeight: isKairos ? 300 : 400,
          lineHeight: isKairos ? 1.8 : 1.7,
          color: isKairos ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.75)",
          margin: "0 0 6px",
          whiteSpace: "pre-wrap",
        }}>{part}</p>
      ) : null
    })
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: isKairos ? "row" : "row-reverse",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 20,
      animation: isNew ? "cc-fade 0.4s ease" : "none",
    }}>
      {/* Avatar */}
      <div style={{
        flexShrink: 0,
        width: 30, height: 30, borderRadius: "50%",
        background: isKairos
          ? "linear-gradient(135deg, rgba(240,192,96,0.2) 0%, rgba(200,140,40,0.2) 100%)"
          : "rgba(255,255,255,0.07)",
        border: isKairos ? "1px solid rgba(240,192,96,0.3)" : "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginTop: 2,
      }}>
        {isKairos ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: "82%",
        padding: "14px 16px",
        background: isKairos ? "rgba(255,255,255,0.03)" : "rgba(240,192,96,0.06)",
        border: isKairos ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(240,192,96,0.15)",
        borderRadius: isKairos ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
        minWidth: 0,
      }}>
        {isKairos && (
          <p style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,192,96,0.6)", marginBottom: 8 }}>
            Kairos
          </p>
        )}
        {renderContent(content)}
        {wasTruncated && isKairos && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", fontStyle: "italic", marginTop: 6 }}>
            Response may be incomplete — ask Kairos to continue.
          </p>
        )}
        {verseData && <BibleVerse reference={verseData.reference} text={verseData.text} translation={verseData.translation} />}
        {isKairos && (
          <SaveButton
            saved={saved} isAuthenticated={isAuthenticated}
            onSave={onSave} onSignInToSave={onSignInToSave}
          />
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, rgba(240,192,96,0.2) 0%, rgba(200,140,40,0.2) 100%)", border: "1px solid rgba(240,192,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>
      <div style={{
        padding: "14px 16px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "4px 14px 14px 14px",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <span style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontSize: "0.78rem", color: "rgba(240,192,96,0.5)", marginRight: 4 }}>Kairos is listening</span>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(240,192,96,0.6)", animation: `cc-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   VERSE OF THE DAY CARD
───────────────────────────────────────────────────────────── */
function VotDCard({ verse, onReflect }) {
  if (!verse) return null
  const reflectPrompt = `I'd like to reflect on today's verse — ${verse.ref}${verse.text ? `: "${verse.text}"` : ""}. What does this mean for my life today?`

  return (
    <div style={{
      background: "rgba(240,192,96,0.04)",
      border: "1px solid rgba(240,192,96,0.15)",
      borderLeft: "2px solid rgba(240,192,96,0.5)",
      borderRadius: 14, padding: "20px 20px 16px",
      marginBottom: 12, animation: "cc-fade 0.6s ease",
    }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(240,192,96,0.6)", marginBottom: 10 }}>
        Verse of the Day
      </p>
      {verse.text ? (
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(0.88rem, 2vw, 1rem)", fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.78)", lineHeight: 1.7, marginBottom: 6 }}>
          &ldquo;{verse.text}&rdquo;
        </p>
      ) : (
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.88rem", fontStyle: "italic", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Loading verse…</p>
      )}
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", letterSpacing: "0.08em", color: "rgba(240,192,96,0.55)", marginBottom: verse.thought ? 10 : 16 }}>
        — {verse.ref}
      </p>
      {verse.thought && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.7, marginBottom: 16 }}>
          {verse.thought}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => onReflect(reflectPrompt)} style={{
          padding: "7px 16px", borderRadius: 100,
          background: "var(--gradient-gold)", border: "none",
          color: "#060912", fontFamily: "var(--font-display)",
          fontSize: "0.56rem", letterSpacing: "0.12em",
          cursor: "pointer", boxShadow: "var(--shadow-gold-sm)",
          minHeight: 34,
        }}>
          REFLECT WITH KAIROS
        </button>
        <a href={`/bible?ref=${encodeURIComponent(verse.ref)}`} style={{
          display: "inline-flex", alignItems: "center",
          padding: "7px 16px", borderRadius: 100,
          background: "transparent",
          borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.35)",
          fontFamily: "var(--font-display)", fontSize: "0.56rem",
          letterSpacing: "0.12em", textDecoration: "none",
          minHeight: 34, transition: "all 0.15s ease",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)" }}
        >
          OPEN IN BIBLE
        </a>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ACTIVE PLAN CARD
───────────────────────────────────────────────────────────── */
function ActivePlanCard({ plan }) {
  if (!plan?.enrollment || plan.enrollment.status === "completed") return null
  const { current_day } = plan.enrollment
  const total = plan.total_days || plan.day_count || 1
  const pct = Math.min(((current_day - 1) / total) * 100, 100)

  return (
    <a href={`/plans/${plan.id}/day/${current_day}`} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 16px", borderRadius: 12,
      background: "rgba(255,255,255,0.02)",
      borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.06)",
      textDecoration: "none", marginBottom: 12,
      transition: "all 0.15s ease", animation: "cc-fade 0.7s ease",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)" }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)" }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 4 }}>Today's Plan</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 400, color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 6 }}>{plan.name || plan.title}</p>
        <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--gradient-gold)", borderRadius: 2, transition: "width 0.5s ease" }} />
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(255,255,255,0.2)", textAlign: "right" }}>Day {current_day}</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.64rem", color: "rgba(255,255,255,0.15)", textAlign: "right" }}>of {total}</p>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
    </a>
  )
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────── */
function Sidebar({ userName, initials }) {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/journey"

  return (
    <div className="cc-sidebar">
      {/* Logo */}
      <div style={{ padding: "20px 20px 0" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 28 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, rgba(240,192,96,0.3) 0%, rgba(200,140,40,0.3) 100%)", border: "1px solid rgba(240,192,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", letterSpacing: "0.22em", background: "var(--gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            KAIROS
          </span>
        </a>

        {/* Nav links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", padding: "4px 16px 6px", marginBottom: 0 }}>Navigation</p>
          {NAV.map(item => {
            const active = currentPath === item.href || (item.href !== "/journey" && currentPath.startsWith(item.href)) || (item.href === "/journey" && currentPath === "/journey")
            return (
              <a
                key={item.href}
                href={item.href}
                className={`cc-nav-link${active ? " active" : ""}`}
                style={{ color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)", fontFamily: "var(--font-body)", fontSize: "0.82rem" }}
              >
                <span style={{ color: active ? "rgba(240,192,96,0.8)" : "rgba(255,255,255,0.25)", flexShrink: 0 }}>{item.icon}</span>
                {item.label}
                {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "rgba(240,192,96,0.7)", flexShrink: 0 }} />}
              </a>
            )
          })}
        </div>
      </div>

      {/* Bottom: user */}
      <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {userName ? (
          <a href="/account" style={{
            display: "flex", alignItems: "center", gap: 10,
            textDecoration: "none", padding: "8px 10px",
            borderRadius: 10, transition: "background 0.15s ease",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, rgba(240,192,96,0.2) 0%, rgba(200,140,40,0.2) 100%)", border: "1px solid rgba(240,192,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "0.52rem", color: "rgba(240,192,96,0.8)", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName.split(" ")[0]}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(255,255,255,0.2)" }}>View account →</p>
            </div>
          </a>
        ) : (
          <a href="/login" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, textDecoration: "none", background: "rgba(240,192,96,0.06)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(240,192,96,0.15)", transition: "all 0.15s ease" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(240,192,96,0.1)"; e.currentTarget.style.borderColor = "rgba(240,192,96,0.3)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(240,192,96,0.06)"; e.currentTarget.style.borderColor = "rgba(240,192,96,0.15)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "rgba(240,192,96,0.7)" }}>Sign in</span>
          </a>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MOBILE BOTTOM NAV BAR
───────────────────────────────────────────────────────────── */
function MobileNav() {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/journey"
  const items = NAV.slice(0, 5) // show first 5

  return (
    <div className="cc-mobile-nav" style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      height: 58, zIndex: 100,
      background: "rgba(8,10,18,0.96)",
      backdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      alignItems: "center", justifyContent: "space-around",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {items.map(item => {
        const active = currentPath === item.href || (item.href === "/journey" && currentPath === "/journey")
        return (
          <a key={item.href} href={item.href} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            textDecoration: "none", padding: "4px 10px",
            color: active ? "rgba(240,192,96,0.9)" : "rgba(255,255,255,0.3)",
            transition: "color 0.15s ease",
            minWidth: 44, minHeight: 44, justifyContent: "center",
          }}>
            {item.icon}
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.45rem", letterSpacing: "0.08em" }}>{item.label}</span>
          </a>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPANION COMPONENT
───────────────────────────────────────────────────────────── */
export default function CompanionCore({ profile = null }) {
  const { settings, updateSetting } = useSettings()
  const { isAuth, profileId, loading: authLoading, user } = useAuthState()

  const [messages,       setMessages]       = useState([])
  const [input,          setInput]          = useState("")
  const [loading,        setLoading]        = useState(false)
  const [started,        setStarted]        = useState(false)
  const [newMsgIdx,      setNewMsgIdx]      = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [savedMsgIds,    setSavedMsgIds]    = useState(new Set())
  const [showConsent,    setShowConsent]    = useState(false)
  const [lastModelId,    setLastModelId]    = useState(null)
  const [votd,           setVotd]           = useState(null)
  const [activePlan,     setActivePlan]     = useState(null)
  const [pendingSave,    setPendingSave]    = useState(null)
  const [savingModal,    setSavingModal]    = useState(false)
  const [showInlineSignIn, setShowInlineSignIn] = useState(false)

  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const textareaRef = useRef(null)

  const translation = settings.bibleTranslation || "WEB"

  // Derive user display info
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || null
  const initials = userName ? userName.trim().split(" ").slice(0,2).map(p => p[0]).join("").toUpperCase() : "K"

  // Consent
  useEffect(() => {
    const accepted = document.cookie.split("; ").find(r => r.startsWith("kairos_consent="))
    if (!accepted) setShowConsent(true)
  }, [])

  const handleConsentAccept = () => {
    const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1)
    document.cookie = `kairos_consent=1; expires=${exp.toUTCString()}; path=/; SameSite=Lax`
    setShowConsent(false)
  }

  // Bible verse handoff from Bible reader
  useEffect(() => {
    try {
      const ctx = sessionStorage.getItem("kairos_verse_context")
      if (ctx) { sessionStorage.removeItem("kairos_verse_context"); setInput(ctx); setStarted(true) }
    } catch (_) {}
  }, [])

  // Verse of the day
  useEffect(() => {
    const { ref, thought } = getTodaysVerse()
    setVotd({ ref, thought, text: null })
    fetch(`/api/bible/verse?ref=${encodeURIComponent(ref)}&translation=WEB`)
      .then(r => r.json())
      .then(d => { if (d.success) setVotd({ ref, thought, text: d.text }) })
      .catch(() => {})
  }, [])

  // Active plan (only when authenticated)
  useEffect(() => {
    if (!isAuth) return
    fetch("/api/plans")
      .then(r => r.json())
      .then(d => {
        const active = (d.plans || []).find(p => p.enrollment?.status === "active")
        if (active) setActivePlan(active)
      })
      .catch(() => {})
  }, [isAuth])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleInputChange = (e) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px"
  }

  const fetchVerse = async (reference) => {
    try {
      const r = await fetch(`/api/bible/verse?ref=${encodeURIComponent(reference)}&translation=${translation}`)
      const d = await r.json()
      if (d.success) return d
    } catch { }
    return null
  }

  // ── Save flow ──
  const handleSave = (idx) => { if (!savedMsgIds.has(idx)) setPendingSave(idx) }
  const handleSignInToSave = (idx) => { setPendingSave(idx); setShowInlineSignIn(true) }
  const handleInlineSignInSuccess = () => { setShowInlineSignIn(false) }

  const handleSaveConfirm = async ({ title, entry_type }) => {
    const idx = pendingSave
    if (idx === null) return
    const msg = messages[idx]
    if (!msg) return
    setSavingModal(true)
    try {
      const scripture_ref = msg.verseData ? `${msg.verseData.reference} (${msg.verseData.translation})` : null
      const res = await fetch("/api/journey/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msg.content, title, entry_type, scripture_ref, conversation_id: conversationId }),
      })
      const d = await res.json()
      if (d.success) setSavedMsgIds(prev => new Set([...prev, idx]))
      else console.error("[Kairos] Save failed:", d.error)
    } catch (err) { console.error("[Kairos] Save error:", err.message) }
    finally { setSavingModal(false); setPendingSave(null) }
  }

  const handleReflectFromVerse = (prompt) => {
    setInput(prompt); setStarted(true)
    setTimeout(() => {
      inputRef.current?.focus()
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + "px"
      }
    }, 50)
  }

  const handlePromptClick = (prompt) => {
    setInput(prompt)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setStarted(true); setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    const userMsg = { role: "user", content: text }
    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory); setNewMsgIdx(updatedHistory.length - 1); setLoading(true)
    try {
      const verseRef = detectVerseRequest(text)
      const isSearch = detectBibleSearch(text)
      let verseData = null
      if (verseRef) verseData = await fetchVerse(verseRef)
      const res = await fetch("/api/ai/companion", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          verseContext: verseData ? `Exact text already retrieved: "${verseData.text}" — ${verseData.reference} (${verseData.translation}). Reference this directly, do not paraphrase it.` : null,
          isVerseRequest: !!verseRef, isSearch, lastModelId,
        }),
      })
      const data = await res.json()
      if (data.conversationId && !conversationId) setConversationId(data.conversationId)
      if (data.modelId) setLastModelId(data.modelId)
      const assistantMsg = { role: "assistant", content: data.reply || "Something stilled. Please try again.", escalated: data.escalated || false, verseData, wasTruncated: data.wasTruncated || false }
      const finalMessages = [...updatedHistory, assistantMsg]
      setMessages(finalMessages); setNewMsgIdx(finalMessages.length - 1)
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something stilled for a moment. Please share what is on your heart again." }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const pendingMsg = pendingSave !== null ? messages[pendingSave] : null
  const showSaveModal = pendingSave !== null && isAuth && !showInlineSignIn

  return (
    <>
      <style>{css}</style>

      {/* Modals */}
      {showConsent && <ConsentModal onAccept={handleConsentAccept} />}
      {showInlineSignIn && (
        <InlineSignInModal
          onSuccess={handleInlineSignInSuccess}
          onCancel={() => { setShowInlineSignIn(false); setPendingSave(null) }}
        />
      )}
      <SaveMomentModal
        isOpen={showSaveModal}
        content={pendingMsg?.content || ""}
        scriptureRef={pendingMsg?.verseData ? `${pendingMsg.verseData.reference} (${pendingMsg.verseData.translation})` : null}
        onConfirm={handleSaveConfirm}
        onCancel={() => setPendingSave(null)}
        saving={savingModal}
      />

      <div className="cc-layout">

        {/* ── SIDEBAR (desktop) ── */}
        <Sidebar userName={userName} initials={initials} />

        {/* ── MAIN CHAT COLUMN ── */}
        <div className="cc-main" style={{ background: "var(--color-void)" }}>

          {/* ── Top bar ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px",
            height: 56, flexShrink: 0,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(8,10,18,0.6)", backdropFilter: "blur(12px)",
          }}>
            {/* Mobile: logo (desktop has sidebar) */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <a href="/" className="cc-mobile-logo" style={{ display: "none", alignItems: "center", gap: 6, textDecoration: "none" }}>
                <style>{`.cc-mobile-logo { display: none !important; } @media(max-width:768px){.cc-mobile-logo{display:flex!important}}`}</style>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", letterSpacing: "0.22em", background: "var(--gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>KAIROS</span>
              </a>
              <div className="cc-desktop-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <style>{`.cc-desktop-title{display:flex!important} @media(max-width:768px){.cc-desktop-title{display:none!important}}`}</style>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>Companion</p>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(100,220,100,0.7)", boxShadow: "0 0 6px rgba(100,220,100,0.5)", animation: "cc-pulse 2.5s ease-in-out infinite" }} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Translation selector */}
              <select
                value={translation}
                onChange={e => updateSetting("bibleTranslation", e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.08)",
                  borderRadius: 8, padding: "5px 10px",
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "var(--font-body)", fontSize: "0.72rem",
                  cursor: "pointer", outline: "none",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(240,192,96,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              >
                {["WEB","KJV","ASV","BBE"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* ── Messages area ── */}
          <div style={{
            flex: 1, overflowY: "auto",
            padding: "24px 24px 12px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.08) transparent",
          }}>
            <div style={{ maxWidth: 720, margin: "0 auto" }}>

              {/* Pre-conversation state */}
              {!started && messages.length === 0 && (
                <div style={{ animation: "cc-fade 0.8s ease" }}>
                  {/* VotD — respects settings.showVotD */}
                  {settings.showVotD !== false && (
                    <VotDCard verse={votd} onReflect={handleReflectFromVerse} />
                  )}
                  {/* Active plan — respects settings.showActivePlan */}
                  {settings.showActivePlan !== false && (
                    <ActivePlanCard plan={activePlan} />
                  )}

                  {/* Headline */}
                  <div style={{ textAlign: "center", padding: "32px 0 28px" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(240,192,96,0.5)", marginBottom: 14 }}>
                      Your appointed moment
                    </p>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 300, color: "rgba(255,255,255,0.85)", lineHeight: 1.3, marginBottom: 0 }}>
                      What are you carrying today?
                    </h2>
                  </div>

                  {/* Example prompts — respects settings.showExamplePrompts */}
                  {settings.showExamplePrompts !== false && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 8, marginBottom: 24,
                  }}>
                    {PROMPTS.map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => handlePromptClick(prompt)}
                        style={{
                          padding: "12px 14px", borderRadius: 10,
                          background: "rgba(255,255,255,0.02)",
                          borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.07)",
                          color: "rgba(255,255,255,0.5)",
                          fontFamily: "var(--font-body)", fontSize: "0.82rem",
                          cursor: "pointer", textAlign: "left", lineHeight: 1.5,
                          transition: "all 0.15s ease", minHeight: 48,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(240,192,96,0.2)"; e.currentTarget.style.background = "rgba(240,192,96,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.78)" }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)" }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                  )}
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, i) => (
                <Message
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  isNew={i === newMsgIdx}
                  verseData={msg.verseData || null}
                  isAuthenticated={isAuth}
                  saved={savedMsgIds.has(i)}
                  onSave={() => handleSave(i)}
                  onSignInToSave={() => handleSignInToSave(i)}
                  wasTruncated={msg.wasTruncated || false}
                />
              ))}

              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* ── Input bar ── */}
          <div style={{
            flexShrink: 0,
            padding: "12px 24px 16px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(8,10,18,0.8)",
            backdropFilter: "blur(12px)",
            paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
          }}>
            {/* On mobile add bottom padding for nav bar */}
            <style>{`@media(max-width:768px){.cc-input-wrap{padding-bottom:66px!important}}`}</style>
            <div className="cc-input-wrap" style={{ maxWidth: 720, margin: "0 auto" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "4px 0",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                transition: "border-color 0.2s ease",
              }}
                onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(240,192,96,0.3)"}
                onBlurCapture={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
              >
                <textarea
                  ref={el => { textareaRef.current = el; inputRef.current = el }}
                  className="cc-input"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Share what is on your heart…"
                  rows={1}
                  style={{
                    flex: 1,
                    background: "transparent", border: "none", outline: "none",
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "var(--font-body)", fontSize: "0.92rem",
                    lineHeight: 1.6, resize: "none",
                    minHeight: "36px", maxHeight: "140px",
                    overflowY: "auto", display: "block",
                    padding: 0,
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  style={{
                    flexShrink: 0,
                    width: 36, height: 36, borderRadius: 10,
                    background: input.trim() && !loading ? "var(--gradient-gold)" : "rgba(255,255,255,0.06)",
                    border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                    transition: "all 0.15s ease",
                    boxShadow: input.trim() && !loading ? "var(--shadow-gold-sm)" : "none",
                    marginBottom: 1,
                  }}
                  onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.opacity = "0.85" }}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  {loading ? (
                    <div style={{ width: 14, height: 14, border: "1.5px solid rgba(255,255,255,0.2)", borderTop: "1.5px solid rgba(255,255,255,0.7)", borderRadius: "50%", animation: "cc-spin 0.7s linear infinite" }} />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#060912" : "rgba(255,255,255,0.2)"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
                    </svg>
                  )}
                </button>
              </div>
              <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(255,255,255,0.15)", marginTop: 8, letterSpacing: "0.02em" }}>
                Enter to send · Shift+Enter for new line · Grounded in Biblical truth
              </p>
            </div>
          </div>

        </div>{/* end cc-main */}
      </div>{/* end cc-layout */}

      {/* Mobile bottom nav */}
      <MobileNav />
    </>
  )
}