"use client"

import { useState, useRef, useEffect } from "react"
import { initKairosSession }  from "@/lib/supabase/sessions"
import { useSettings }        from "@/context/SettingsContext"
import BibleVerse             from "./BibleVerse"
import SaveMomentModal        from "./SaveMomentModal"

// ── Detect if a message is requesting a specific Bible verse ─
function detectVerseRequest(text) {
  const versePattern = /\b(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|1\s?samuel|2\s?samuel|1\s?kings|2\s?kings|1\s?chronicles|2\s?chronicles|ezra|nehemiah|esther|job|psalms?|proverbs|ecclesiastes|song\s?of\s?solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|matthew|mark|luke|john|acts|romans|1\s?corinthians|2\s?corinthians|galatians|ephesians|philippians|colossians|1\s?thessalonians|2\s?thessalonians|1\s?timothy|2\s?timothy|titus|philemon|hebrews|james|1\s?peter|2\s?peter|1\s?john|2\s?john|3\s?john|jude|revelation)\s+\d+:\d+(-\d+)?/i
  const match = text.match(versePattern)
  return match ? match[0] : null
}

/* ── First-visit privacy consent modal ──────────────────── */
function ConsentModal({ onAccept }) {
  return (
    <div style={{
      position:       "fixed",
      inset:          0,
      background:     "rgba(6,9,18,0.92)",
      backdropFilter: "blur(8px)",
      zIndex:         200,
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      padding:        "var(--space-5)",
    }}>
      <div style={{
        background:   "linear-gradient(135deg, rgba(20,29,53,0.98) 0%, rgba(13,20,40,0.98) 100%)",
        border:       "1px solid rgba(240,192,96,0.3)",
        borderRadius: "var(--radius-xl)",
        padding:      "var(--space-8)",
        maxWidth:     "420px",
        width:        "100%",
        textAlign:    "center",
      }}>
        <p style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.65rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color:         "var(--color-gold-warm)",
          marginBottom:  "var(--space-5)",
        }}>
          Before we begin
        </p>
        <h2 style={{
          fontFamily:   "var(--font-heading)",
          fontSize:     "1.3rem",
          fontWeight:   300,
          color:        "var(--color-divine)",
          lineHeight:   1.4,
          marginBottom: "var(--space-4)",
        }}>
          A safe space for honest conversations
        </h2>
        <p style={{
          fontFamily:   "var(--font-body)",
          fontSize:     "0.85rem",
          color:        "var(--color-soft)",
          lineHeight:   "var(--leading-relaxed)",
          marginBottom: "var(--space-3)",
        }}>
          Kairos stores your conversations to provide continuity across sessions.
          What you share here is treated with care and is never sold or used for advertising.
        </p>
        <p style={{
          fontFamily:   "var(--font-body)",
          fontSize:     "0.8rem",
          color:        "var(--color-muted)",
          lineHeight:   "var(--leading-relaxed)",
          marginBottom: "var(--space-7)",
        }}>
          By continuing you agree to our{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--color-gold-warm)", textDecoration: "none" }}>
            Privacy Policy
          </a>.
        </p>
        <button
          onClick={onAccept}
          style={{
            background:    "var(--gradient-gold)",
            border:        "none",
            borderRadius:  "var(--radius-full)",
            padding:       "var(--space-3) var(--space-8)",
            color:         "#060912",
            fontFamily:    "var(--font-display)",
            fontSize:      "0.7rem",
            letterSpacing: "0.15em",
            cursor:        "pointer",
            boxShadow:     "var(--shadow-gold-sm)",
            width:         "100%",
          }}
        >
          I UNDERSTAND — BEGIN
        </button>
      </div>
    </div>
  )
}

function detectBibleSearch(text) {
  const lower    = text.toLowerCase()
  const triggers = [
    "where does the bible say",
    "find verses about",
    "search the bible for",
    "what does the bible say about",
    "verses about",
    "bible verses on",
  ]
  return triggers.some((t) => lower.includes(t))
}

/* ── Ambient Glow Orb ────────────────────────────────────── */
function GlowOrb({ size, left, top, color, delay = "0s" }) {
  return (
    <div style={{
      position:      "absolute",
      left, top,
      transform:     "translate(-50%, -50%)",
      width:  size,
      height: size,
      background:    `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      borderRadius:  "50%",
      pointerEvents: "none",
      animation:     `breathe 4s ease-in-out ${delay} infinite`,
    }} />
  )
}

/* ── Typing Indicator ────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div style={{
      display:    "flex",
      alignItems: "center",
      gap:        "6px",
      padding:    "var(--space-4) 0",
    }}>
      <span style={{
        fontFamily:  "var(--font-heading)",
        fontStyle:   "italic",
        fontSize:    "0.85rem",
        color:       "var(--color-gold-warm)",
        marginRight: "4px",
      }}>
        Kairos is listening
      </span>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width:        "5px",
          height:       "5px",
          borderRadius: "50%",
          background:   "var(--color-gold-warm)",
          animation:    `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          opacity:      0.6,
        }} />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

/* ── Scripture Block ─────────────────────────────────────── */
function ScriptureBlock({ text, reference }) {
  return (
    <div style={{
      borderLeft:  "2px solid var(--color-gold-warm)",
      paddingLeft: "var(--space-4)",
      margin:      "var(--space-4) 0",
    }}>
      <p style={{
        fontFamily: "var(--font-heading)",
        fontStyle:  "italic",
        fontSize:   "1rem",
        color:      "var(--color-gold-warm)",
        lineHeight: "var(--leading-relaxed)",
        margin:     0,
      }}>
        &ldquo;{text}&rdquo;
      </p>
      {reference && (
        <p style={{
          fontFamily:    "var(--font-body)",
          fontSize:      "0.75rem",
          letterSpacing: "0.1em",
          color:         "var(--color-muted)",
          marginTop:     "var(--space-2)",
          textTransform: "uppercase",
        }}>
          — {reference}
        </p>
      )}
    </div>
  )
}

/* ── Save Button ─────────────────────────────────────────── */
function SaveButton({ saved, isAuthenticated, onSave }) {
  if (saved) {
    return (
      <div style={{
        display:    "flex",
        alignItems: "center",
        gap:        "var(--space-2)",
        marginTop:  "var(--space-4)",
        paddingTop: "var(--space-3)",
        borderTop:  "1px solid rgba(240,192,96,0.1)",
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24"
          fill="var(--color-gold-warm)" stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span style={{
          fontFamily:    "var(--font-body)",
          fontSize:      "0.72rem",
          color:         "var(--color-gold-warm)",
          letterSpacing: "0.05em",
        }}>
          Saved to your journey
        </span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        marginTop:  "var(--space-4)",
        paddingTop: "var(--space-3)",
        borderTop:  "1px solid rgba(240,192,96,0.1)",
      }}>
        <a href="/register" style={{
          fontFamily:     "var(--font-body)",
          fontSize:       "0.72rem",
          color:          "var(--color-muted)",
          letterSpacing:  "0.05em",
          textDecoration: "none",
          display:        "flex",
          alignItems:     "center",
          gap:            "var(--space-2)",
          transition:     "color 0.2s ease",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-gold-warm)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          Sign in to save this moment
        </a>
      </div>
    )
  }

  return (
    <div style={{
      marginTop:  "var(--space-4)",
      paddingTop: "var(--space-3)",
      borderTop:  "1px solid rgba(240,192,96,0.1)",
    }}>
      <button
        onClick={onSave}
        style={{
          background:    "none",
          border:        "none",
          padding:       0,
          cursor:        "pointer",
          display:       "flex",
          alignItems:    "center",
          gap:           "var(--space-2)",
          color:         "var(--color-muted)",
          fontFamily:    "var(--font-body)",
          fontSize:      "0.72rem",
          letterSpacing: "0.05em",
          transition:    "color 0.2s ease",
          minHeight:     "32px",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-gold-warm)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        Save this moment
      </button>
    </div>
  )
}

/* ── Message Bubble ──────────────────────────────────────── */
function Message({ role, content, isNew, verseData, onSave, saved, isAuthenticated, wasTruncated }) {
  const isKairos = role === "assistant"

  const renderContent = (text) => {
    const parts = text.split(/\[scripture\](.*?)\[\/scripture\]/gs)
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        const [scriptureText, ref] = part.split("|")
        return <ScriptureBlock key={i} text={scriptureText} reference={ref} />
      }
      return part ? (
        <p key={i} style={{
          fontFamily: isKairos ? "var(--font-heading)" : "var(--font-body)",
          fontSize:   isKairos ? "var(--text-body-lg)" : "var(--text-body-md)",
          fontWeight: isKairos ? 300 : 400,
          lineHeight: "var(--leading-relaxed)",
          color:      "var(--color-divine)",
          margin:     "0 0 var(--space-3) 0",
          whiteSpace: "pre-wrap",
        }}>
          {part}
        </p>
      ) : null
    })
  }

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      alignItems:    isKairos ? "flex-start" : "flex-end",
      marginBottom:  "var(--space-6)",
      animation:     isNew ? "fadeUp 0.5s var(--ease-divine) forwards" : "none",
      opacity:       isNew ? undefined : 1,
    }}>
      {isKairos && (
        <p style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.65rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color:         "var(--color-gold-warm)",
          marginBottom:  "var(--space-2)",
        }}>
          Kairos
        </p>
      )}

      <div style={{
        maxWidth:     "88%",
        background:   isKairos
          ? "linear-gradient(135deg, rgba(20,29,53,0.8) 0%, rgba(13,20,40,0.8) 100%)"
          : "rgba(42,58,92,0.5)",
        border:       `1px solid ${isKairos ? "var(--color-border)" : "rgba(42,58,92,0.8)"}`,
        borderRadius: isKairos
          ? "0 var(--radius-lg) var(--radius-lg) var(--radius-lg)"
          : "var(--radius-lg) 0 var(--radius-lg) var(--radius-lg)",
        padding:      "var(--space-5)",
        boxShadow:    isKairos ? "var(--shadow-card)" : "none",
        borderLeft:   isKairos ? "2px solid rgba(240,192,96,0.2)" : "none",
        width:        "100%",
      }}>
        {renderContent(content)}

        {wasTruncated && isKairos && (
          <p style={{
            fontFamily:   "var(--font-body)",
            fontSize:     "0.7rem",
            color:        "var(--color-muted)",
            fontStyle:    "italic",
            marginTop:    "var(--space-2)",
            marginBottom: 0,
          }}>
            Response may be incomplete — you can ask Kairos to continue.
          </p>
        )}

        {verseData && (
          <BibleVerse
            reference={verseData.reference}
            text={verseData.text}
            translation={verseData.translation}
          />
        )}

        {isKairos && (
          <SaveButton
            saved={saved}
            isAuthenticated={isAuthenticated}
            onSave={onSave}
          />
        )}
      </div>
    </div>
  )
}

/* ── Main Companion Component ────────────────────────────── */
export default function CompanionCore({ profile = null }) {
  const { settings, updateSetting } = useSettings()

  const [messages,       setMessages]       = useState([])
  const [input,          setInput]          = useState("")
  const [loading,        setLoading]        = useState(false)
  const [started,        setStarted]        = useState(false)
  const [newMsgIdx,      setNewMsgIdx]      = useState(null)
  const [kairosUser,     setKairosUser]     = useState(null)
  const [sessionType,    setSessionType]    = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [savedMsgIds,    setSavedMsgIds]    = useState(new Set())
  const [showConsent,    setShowConsent]    = useState(false)
  const [lastModelId,    setLastModelId]    = useState(null)

  // ── Save modal state ──────────────────────────────────────
  // pendingSave holds the message index waiting for modal confirm
  const [pendingSave,  setPendingSave]  = useState(null)   // number | null
  const [savingModal,  setSavingModal]  = useState(false)

  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const textareaRef = useRef(null)

  const isAuthenticated = sessionType === "authenticated"
  const translation     = settings.bibleTranslation || "WEB"

  useEffect(() => {
    const accepted = document.cookie
      .split("; ")
      .find((row) => row.startsWith("kairos_consent="))
    if (!accepted) setShowConsent(true)
  }, [])

  const handleConsentAccept = () => {
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    document.cookie = `kairos_consent=1; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
    setShowConsent(false)
  }

  useEffect(() => {
    initKairosSession().then((session) => {
      if (session?.user) {
        setKairosUser(session.user)
        setSessionType(session.type)
      }
    })

    // Check for verse context passed from Bible reader
    try {
      const verseCtx = sessionStorage.getItem("kairos_verse_context")
      if (verseCtx) {
        sessionStorage.removeItem("kairos_verse_context")
        setInput(verseCtx)
        setStarted(true)
      }
    } catch (_) {}
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleInputChange = (e) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px"
  }

  const fetchVerse = async (reference) => {
    try {
      const res  = await fetch(`/api/bible/verse?ref=${encodeURIComponent(reference)}&translation=${translation}`)
      const data = await res.json()
      if (data.success) return data
    } catch (err) {
      console.warn("[Kairos Bible] Verse fetch failed:", err.message)
    }
    return null
  }

  // ── Open the save modal — does NOT call API yet ───────────
  const handleSave = (msgIndex) => {
    const msg = messages[msgIndex]
    if (!msg || savedMsgIds.has(msgIndex)) return
    setPendingSave(msgIndex)
  }

  // ── Called when user confirms in the modal ────────────────
  const handleSaveConfirm = async ({ title, entry_type }) => {
    const msgIndex = pendingSave
    if (msgIndex === null) return

    const msg = messages[msgIndex]
    if (!msg) return

    setSavingModal(true)
    try {
      const scripture_ref = msg.verseData
        ? `${msg.verseData.reference} (${msg.verseData.translation})`
        : null

      const res = await fetch("/api/journey/save", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          content:         msg.content,
          title,
          entry_type,
          scripture_ref,
          conversation_id: conversationId,
          userId:          kairosUser?.id || null,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setSavedMsgIds((prev) => new Set([...prev, msgIndex]))
        console.log("[Kairos] Moment saved:", data.id)
      } else {
        console.error("[Kairos] Save failed:", data.error)
      }
    } catch (err) {
      console.error("[Kairos] Save error:", err.message)
    } finally {
      setSavingModal(false)
      setPendingSave(null)
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setStarted(true)
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    const userMsg        = { role: "user", content: text }
    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory)
    setNewMsgIdx(updatedHistory.length - 1)
    setLoading(true)

    try {
      const verseRef  = detectVerseRequest(text)
      const isSearch  = detectBibleSearch(text)
      let   verseData = null

      if (verseRef) {
        verseData = await fetchVerse(verseRef)
      }

      const res = await fetch("/api/ai/companion", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          message:        text,
          history:        messages.map((m) => ({ role: m.role, content: m.content })),
          profile,
          userId:         kairosUser?.id || null,
          conversationId: conversationId,
          verseContext:   verseData
            ? `Exact text already retrieved: "${verseData.text}" — ${verseData.reference} (${verseData.translation}). Reference this directly, do not paraphrase it.`
            : null,
          isVerseRequest: !!verseRef,
          isSearch,
          lastModelId,
        }),
      })

      const data = await res.json()

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId)
      }

      if (data.modelId) setLastModelId(data.modelId)

      const assistantMsg = {
        role:         "assistant",
        content:      data.reply || "Something stilled. Please try again.",
        escalated:    data.escalated || false,
        verseData:    verseData,
        wasTruncated: data.wasTruncated || false,
      }

      const finalMessages = [...updatedHistory, assistantMsg]
      setMessages(finalMessages)
      setNewMsgIdx(finalMessages.length - 1)

    } catch {
      setMessages((prev) => [...prev, {
        role:    "assistant",
        content: "Something stilled for a moment. Please share what is on your heart again.",
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // The message currently pending save (for passing to modal)
  const pendingMsg = pendingSave !== null ? messages[pendingSave] : null

  return (
    <div style={{
      position:      "relative",
      minHeight:     "100vh",
      display:       "flex",
      flexDirection: "column",
      background:    "var(--gradient-hero)",
      overflow:      "hidden",
    }}>
      {showConsent && <ConsentModal onAccept={handleConsentAccept} />}

      {/* ── Save moment modal ───────────────────────────────── */}
      <SaveMomentModal
        isOpen={pendingSave !== null}
        content={pendingMsg?.content || ""}
        scriptureRef={
          pendingMsg?.verseData
            ? `${pendingMsg.verseData.reference} (${pendingMsg.verseData.translation})`
            : null
        }
        onConfirm={handleSaveConfirm}
        onCancel={() => setPendingSave(null)}
        saving={savingModal}
      />

      <GlowOrb size="500px" left="60%" top="30%"  color="rgba(240,192,96,0.08)"  delay="0s"  />
      <GlowOrb size="300px" left="20%" top="70%"  color="rgba(64,144,208,0.06)"  delay="2s"  />
      <GlowOrb size="200px" left="80%" top="80%"  color="rgba(240,192,96,0.05)"  delay="1s"  />

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        padding:        "var(--space-5) var(--space-5) var(--space-4)",
        borderBottom:   "1px solid var(--color-border)",
        background:     "rgba(6,9,18,0.6)",
        backdropFilter: "blur(12px)",
        position:       "sticky",
        top:            0,
        zIndex:         10,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
      }}>
        <div>
          <a href="/" style={{ textDecoration: "none" }}>
            <span style={{
              fontFamily:           "var(--font-display)",
              fontSize:             "1.1rem",
              letterSpacing:        "0.2em",
              background:           "var(--gradient-text)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
              backgroundClip:       "text",
            }}>
              KAIROS
            </span>
          </a>
          <p style={{
            fontFamily:    "var(--font-body)",
            fontSize:      "0.7rem",
            color:         "var(--color-muted)",
            marginTop:     "2px",
            letterSpacing: "0.05em",
          }}>
            Your companion is present
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <select
            value={translation}
            onChange={(e) => updateSetting("bibleTranslation", e.target.value)}
            title="Bible translation"
            style={{
              background:    "rgba(13,20,40,0.8)",
              border:        "1px solid var(--color-border)",
              borderRadius:  "var(--radius-full)",
              padding:       "4px 10px",
              color:         "var(--color-muted)",
              fontFamily:    "var(--font-body)",
              fontSize:      "0.65rem",
              letterSpacing: "0.08em",
              cursor:        "pointer",
              outline:       "none",
            }}
          >
            <option value="WEB">WEB</option>
            <option value="KJV">KJV</option>
            <option value="ASV">ASV</option>
            <option value="BBE">BBE</option>
          </select>

          <div style={{
            width:        "8px",
            height:       "8px",
            borderRadius: "50%",
            background:   "var(--color-life)",
            boxShadow:    "0 0 8px var(--color-life)",
            animation:    "pulse 2s ease-in-out infinite",
          }} />
        </div>
      </div>

      {/* ── MESSAGES AREA ──────────────────────────────────── */}
      <div style={{
        flex:          1,
        overflowY:     "auto",
        padding:       "var(--space-8) var(--space-5)",
        maxWidth:      "760px",
        width:         "100%",
        margin:        "0 auto",
        paddingBottom: "var(--space-6)",
      }}>
        {!started && messages.length === 0 && (
          <div style={{
            textAlign:  "center",
            paddingTop: "var(--space-16)",
            animation:  "sacredEnter 1s var(--ease-divine) forwards",
          }}>
            <p style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color:         "var(--color-gold-warm)",
              marginBottom:  "var(--space-5)",
            }}>
              Your appointed moment
            </p>
            <h2 style={{
              fontFamily:   "var(--font-heading)",
              fontSize:     "clamp(1.8rem, 4vw, 3rem)",
              fontWeight:   300,
              color:        "var(--color-divine)",
              lineHeight:   1.4,
              marginBottom: "var(--space-10)",
            }}>
              What are you carrying today?
            </h2>

            <div style={{
              display:        "flex",
              flexWrap:       "wrap",
              gap:            "var(--space-3)",
              justifyContent: "center",
              maxWidth:       "600px",
              margin:         "0 auto",
            }}>
              {[
                "I have questions about faith I'm afraid to ask",
                "I've been hurt by the church",
                "I don't know if God is real",
                "I'm going through something really hard",
                "I'm from a different religion and I'm curious",
                "I just feel lost",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt)
                    inputRef.current?.focus()
                  }}
                  style={{
                    background:   "rgba(20,29,53,0.8)",
                    border:       "1px solid var(--color-border)",
                    borderRadius: "var(--radius-full)",
                    padding:      "var(--space-2) var(--space-4)",
                    color:        "var(--color-soft)",
                    fontFamily:   "var(--font-body)",
                    fontSize:     "0.8rem",
                    cursor:       "pointer",
                    transition:   "all var(--duration-fast) var(--ease-sacred)",
                    textAlign:    "left",
                    minHeight:    "44px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-gold-warm)"
                    e.currentTarget.style.color       = "var(--color-gold-warm)"
                    e.currentTarget.style.background  = "rgba(240,192,96,0.08)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border)"
                    e.currentTarget.style.color       = "var(--color-soft)"
                    e.currentTarget.style.background  = "rgba(20,29,53,0.8)"
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message
            key={i}
            role={msg.role}
            content={msg.content}
            isNew={i === newMsgIdx}
            verseData={msg.verseData || null}
            isAuthenticated={isAuthenticated}
            saved={savedMsgIds.has(i)}
            onSave={() => handleSave(i)}
            wasTruncated={msg.wasTruncated || false}
          />
        ))}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT AREA ─────────────────────────────────────── */}
      <div style={{
        position:       "sticky",
        bottom:         0,
        padding:        "var(--space-4) var(--space-5) var(--space-6)",
        background:     "linear-gradient(to top, rgba(6,9,18,0.98) 80%, transparent)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth:   "760px",
          margin:     "0 auto",
          display:    "flex",
          gap:        "var(--space-3)",
          alignItems: "center",
        }}>
          <div style={{ flex: 1, position: "relative" }}>
            <textarea
              ref={(el) => {
                textareaRef.current = el
                inputRef.current    = el
              }}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Share what is on your heart..."
              rows={1}
              style={{
                width:        "100%",
                background:   "rgba(13,20,40,0.9)",
                border:       "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding:      "var(--space-4) var(--space-5)",
                color:        "var(--color-divine)",
                fontFamily:   "var(--font-body)",
                fontSize:     "var(--text-body-md)",
                lineHeight:   "var(--leading-normal)",
                resize:       "none",
                outline:      "none",
                minHeight:    "52px",
                maxHeight:    "160px",
                overflowY:    "auto",
                display:      "block",
                transition:   "border-color var(--duration-fast) var(--ease-sacred), box-shadow var(--duration-fast) var(--ease-sacred)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--color-gold-warm)"
                e.target.style.boxShadow   = "0 0 0 3px rgba(240,192,96,0.1)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--color-border)"
                e.target.style.boxShadow   = "none"
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            style={{
              width:          "52px",
              height:         "52px",
              borderRadius:   "50%",
              background:     input.trim() && !loading
                ? "var(--gradient-gold)"
                : "var(--color-surface)",
              border:         "1px solid var(--color-border)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              cursor:         input.trim() && !loading ? "pointer" : "not-allowed",
              flexShrink:     0,
              transition:     "all var(--duration-fast) var(--ease-sacred)",
              boxShadow:      input.trim() && !loading ? "var(--shadow-gold-sm)" : "none",
            }}
          >
            {loading ? (
              <div style={{
                width:        "18px",
                height:       "18px",
                border:       "2px solid var(--color-border)",
                borderTop:    "2px solid var(--color-gold-warm)",
                borderRadius: "50%",
                animation:    "spin 0.8s linear infinite",
              }} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke={input.trim() ? "#060912" : "var(--color-muted)"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>

        <p style={{
          textAlign:     "center",
          fontFamily:    "var(--font-body)",
          fontSize:      "0.72rem",
          color:         "var(--color-muted)",
          marginTop:     "var(--space-3)",
          letterSpacing: "0.03em",
        }}>
          Press Enter to send · Shift+Enter for new line · Kairos is grounded in Biblical truth
        </p>
      </div>
    </div>
  )
}