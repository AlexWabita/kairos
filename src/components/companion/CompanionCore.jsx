"use client"

import { useState, useRef, useEffect } from "react"

/* ── Ambient Glow Orb ────────────────────────────────────── */
function GlowOrb({ size, left, top, color, delay = "0s" }) {
  return (
    <div style={{
      position:     "absolute",
      left, top,
      transform:    "translate(-50%, -50%)",
      width:  size,
      height: size,
      background:   `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      borderRadius: "50%",
      pointerEvents: "none",
      animation:    `breathe 4s ease-in-out ${delay} infinite`,
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
        fontFamily: "var(--font-heading)",
        fontStyle:  "italic",
        fontSize:   "0.85rem",
        color:      "var(--color-gold-warm)",
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

/* ── Message Bubble ──────────────────────────────────────── */
function Message({ role, content, isNew }) {
  const isKairos = role === "assistant"

  // Parse scripture blocks from response
  // Format: [scripture]text|reference[/scripture]
  const renderContent = (text) => {
    const parts = text.split(/\[scripture\](.*?)\[\/scripture\]/gs)
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        const [scriptureText, ref] = part.split("|")
        return <ScriptureBlock key={i} text={scriptureText} reference={ref} />
      }
      return part ? (
        <p key={i} style={{
          fontFamily:  isKairos ? "var(--font-heading)" : "var(--font-body)",
          fontSize:    isKairos ? "var(--text-body-lg)" : "var(--text-body-md)",
          fontWeight:  isKairos ? 300 : 400,
          lineHeight:  "var(--leading-relaxed)",
          color:       "var(--color-divine)",
          margin:      "0 0 var(--space-3) 0",
          whiteSpace:  "pre-wrap",
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
        padding:      "var(--space-5) var(--space-5)",
        boxShadow:    isKairos ? "var(--shadow-card)" : "none",
        borderLeft:   isKairos ? "2px solid rgba(240,192,96,0.2)" : "none",
      }}>
        {renderContent(content)}
      </div>
    </div>
  )
}

/* ── Main Companion Component ────────────────────────────── */
export default function CompanionCore({ profile = null }) {
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState("")
  const [loading,   setLoading]   = useState(false)
  const [started,   setStarted]   = useState(false)
  const [newMsgIdx, setNewMsgIdx] = useState(null)

  const bottomRef    = useRef(null)
  const inputRef     = useRef(null)
  const textareaRef  = useRef(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px"
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setStarted(true)
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    // Add user message
    const userMsg = { role: "user", content: text }
    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory)
    setNewMsgIdx(updatedHistory.length - 1)
    setLoading(true)

    try {
      const res = await fetch("/api/ai/companion", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          profile,
        }),
      })

      const data = await res.json()

      const assistantMsg = {
        role:      "assistant",
        content:   data.reply || "Something stilled. Please try again.",
        escalated: data.escalated || false,
      }

      const finalMessages = [...updatedHistory, assistantMsg]
      setMessages(finalMessages)
      setNewMsgIdx(finalMessages.length - 1)

    } catch {
      setMessages(prev => [...prev, {
        role:    "assistant",
        content: "Something stilled for a moment. Please share what is on your heart again.",
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      position:       "relative",
      minHeight:      "100vh",
      display:        "flex",
      flexDirection:  "column",
      background:     "var(--gradient-hero)",
      overflow:       "hidden",
    }}>
      {/* Ambient background */}
      <GlowOrb size="500px" left="60%" top="30%"  color="rgba(240,192,96,0.08)"  delay="0s"   />
      <GlowOrb size="300px" left="20%" top="70%"  color="rgba(64,144,208,0.06)"  delay="2s"   />
      <GlowOrb size="200px" left="80%" top="80%"  color="rgba(240,192,96,0.05)"  delay="1s"   />

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        padding:      "var(--space-5) var(--space-5) var(--space-4)",
        borderBottom: "1px solid var(--color-border)",
        background:   "rgba(6,9,18,0.6)",
        backdropFilter: "blur(12px)",
        position:     "sticky",
        top:          0,
        zIndex:       10,
        display:      "flex",
        alignItems:   "center",
        justifyContent: "space-between",
      }}>
        <div>
          <a href="/" style={{ textDecoration: "none" }}>
            <span style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "1.1rem",
              letterSpacing: "0.2em",
              background:    "var(--gradient-text)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
              backgroundClip: "text",
            }}>
              KAIROS
            </span>
          </a>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize:   "0.7rem",
            color:      "var(--color-muted)",
            marginTop:  "2px",
            letterSpacing: "0.05em",
          }}>
            Your companion is present
          </p>
        </div>

        <div style={{
          width:        "8px",
          height:       "8px",
          borderRadius: "50%",
          background:   "var(--color-life)",
          boxShadow:    "0 0 8px var(--color-life)",
          animation:    "pulse 2s ease-in-out infinite",
        }} />
      </div>

      {/* ── MESSAGES AREA ──────────────────────────────────── */}
      <div style={{
        flex:       1,
        overflowY:  "auto",
        padding:    "var(--space-8) var(--space-5)",
        maxWidth:   "760px",
        width:      "100%",
        margin:     "0 auto",
        paddingBottom: "var(--space-6)",
      }}>
        {/* Opening prompt — shown before first message */}
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
              fontFamily: "var(--font-heading)",
              fontSize:   "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 300,
              color:      "var(--color-divine)",
              lineHeight: 1.4,
              marginBottom: "var(--space-10)",
            }}>
              What are you carrying today?
            </h2>

            {/* Suggested openers */}
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
                    background:    "rgba(20,29,53,0.8)",
                    border:        "1px solid var(--color-border)",
                    borderRadius:  "var(--radius-full)",
                    padding:       "var(--space-2) var(--space-4)",
                    color:         "var(--color-soft)",
                    fontFamily:    "var(--font-body)",
                    fontSize:      "0.8rem",
                    cursor:        "pointer",
                    transition:    "all var(--duration-fast) var(--ease-sacred)",
                    textAlign:     "left",
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

        {/* Message list */}
        {messages.map((msg, i) => (
          <Message
            key={i}
            role={msg.role}
            content={msg.content}
            isNew={i === newMsgIdx}
          />
        ))}

        {/* Typing indicator */}
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
          maxWidth: "760px",
          margin:   "0 auto",
          display:  "flex",
          gap:      "var(--space-3)",
          alignItems: "flex-end",
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

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            style={{
              width:        "52px",
              height:       "52px",
              borderRadius: "50%",
              background:   input.trim() && !loading
                ? "var(--gradient-gold)"
                : "var(--color-surface)",
              border:       "1px solid var(--color-border)",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              cursor:       input.trim() && !loading ? "pointer" : "not-allowed",
              flexShrink:   0,
              transition:   "all var(--duration-fast) var(--ease-sacred)",
              boxShadow:    input.trim() && !loading ? "var(--shadow-gold-sm)" : "none",
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
          textAlign:  "center",
          fontFamily: "var(--font-body)",
          fontSize:   "0.65rem",
          color:      "var(--color-faint)",
          marginTop:  "var(--space-3)",
          letterSpacing: "0.03em",
        }}>
          Press Enter to send · Shift+Enter for new line · Kairos is grounded in Biblical truth
        </p>
      </div>
    </div>
  )
}
