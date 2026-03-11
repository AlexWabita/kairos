"use client"

import { useState, useEffect } from "react"
import { useRouter }           from "next/navigation"
import { supabase }            from "@/lib/supabase/client"
import { signOut }             from "@/lib/supabase/auth"
import ConfirmModal            from "@/components/shared/ConfirmModal"

/* ── Small section card wrapper ─────────────────────────── */
function Card({ children }) {
  return (
    <div style={{
      background:   "linear-gradient(135deg, rgba(20,29,53,0.8) 0%, rgba(13,20,40,0.8) 100%)",
      border:       "1px solid var(--color-border)",
      borderLeft:   "2px solid rgba(240,192,96,0.2)",
      borderRadius: "var(--radius-xl)",
      padding:      "var(--space-6)",
      boxShadow:    "var(--shadow-card)",
    }}>
      {children}
    </div>
  )
}

/* ── Section heading ─────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p style={{
      fontFamily:    "var(--font-display)",
      fontSize:      "0.6rem",
      letterSpacing: "0.25em",
      textTransform: "uppercase",
      color:         "var(--color-gold-warm)",
      marginBottom:  "var(--space-4)",
    }}>
      {children}
    </p>
  )
}

/* ── Inline status message ───────────────────────────────── */
function StatusMsg({ msg }) {
  if (!msg) return null
  const isError = msg.type === "error"
  return (
    <div style={{
      background:   isError ? "rgba(220,60,60,0.1)" : "rgba(64,144,80,0.1)",
      border:       `1px solid ${isError ? "rgba(220,60,60,0.3)" : "rgba(64,144,80,0.3)"}`,
      borderRadius: "var(--radius-md)",
      padding:      "var(--space-3) var(--space-4)",
      marginTop:    "var(--space-4)",
    }}>
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize:   "0.8rem",
        color:      isError ? "#f08080" : "#7dcf8a",
        margin:     0,
      }}>
        {msg.text}
      </p>
    </div>
  )
}

/* ── Main Account Page ───────────────────────────────────── */
export default function AccountPage() {
  const router = useRouter()

  const [authUser,          setAuthUser]          = useState(null)
  const [profile,           setProfile]           = useState(null)
  const [journeyCount,      setJourneyCount]      = useState(null)
  const [pageLoading,       setPageLoading]       = useState(true)
  const [pwLoading,         setPwLoading]         = useState(false)
  const [pwMsg,             setPwMsg]             = useState(null)

  // Confirm modal state — one modal, configured per action
  const [confirmState, setConfirmState] = useState({
    isOpen:       false,
    title:        "",
    message:      "",
    detail:       "",
    confirmLabel: "",
    variant:      "danger",
    onConfirm:    null,
    loading:      false,
  })

  // ── Open / close confirm helpers ───────────────────────
  const openConfirm = (config) => {
    setConfirmState({ ...confirmState, isOpen: true, loading: false, ...config })
  }

  const closeConfirm = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false, loading: false }))
  }

  const setConfirmLoading = (val) => {
    setConfirmState((prev) => ({ ...prev, loading: val }))
  }

  // ── Load user on mount ──────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || user.is_anonymous) {
        router.replace("/login")
        return
      }

      setAuthUser(user)

      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", user.id)
        .maybeSingle()

      setProfile(profileData)

      const { count } = await supabase
        .from("journey_entries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profileData?.id)

      setJourneyCount(count ?? 0)
      setPageLoading(false)
    }

    load()
  }, [router])

  // ── Send password reset email ───────────────────────────
  const handlePasswordReset = async () => {
    if (!authUser?.email) return
    setPwLoading(true)
    setPwMsg(null)

    const { error } = await supabase.auth.resetPasswordForEmail(authUser.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    setPwMsg(error
      ? { type: "error",   text: error.message }
      : { type: "success", text: "Password reset link sent — check your email." }
    )
    setPwLoading(false)
  }

  // ── Sign out (called after confirm) ────────────────────
  const executeSignOut = async () => {
    setConfirmLoading(true)
    await signOut()
    router.push("/")
    router.refresh()
  }

  // ── Delete account (called after confirm) ──────────────
  const executeDelete = async () => {
    setConfirmLoading(true)
    try {
      if (profile?.id) {
        await supabase
          .from("journey_entries")
          .delete()
          .eq("user_id", profile.id)

        await supabase
          .from("users")
          .delete()
          .eq("id", profile.id)
      }

      const res  = await fetch("/api/account/delete", { method: "DELETE" })
      const data = await res.json()

      if (!data.success) throw new Error(data.error || "Delete failed")

      await signOut()
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("[Kairos] Delete failed:", err.message)
      closeConfirm()
    }
  }

  // ── Export data ─────────────────────────────────────────
  const handleExport = () => {
    if (!profile?.id) return
    window.open(`/api/account/export?userId=${profile.id}`, "_blank")
  }

  // ── Loading state ───────────────────────────────────────
  if (pageLoading) {
    return (
      <div style={{
        minHeight:      "100vh",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        background:     "var(--gradient-hero)",
      }}>
        <p style={{
          fontFamily: "var(--font-heading)",
          fontStyle:  "italic",
          color:      "var(--color-gold-warm)",
          fontSize:   "1rem",
        }}>
          Loading your account…
        </p>
      </div>
    )
  }

  return (
    <>
      {/* ── Shared confirm modal — configured per action ── */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        detail={confirmState.detail}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
        loading={confirmState.loading}
      />

      <div style={{
        minHeight:  "100vh",
        background: "var(--gradient-hero)",
        padding:    "var(--space-10) var(--space-5)",
      }}>
        <div style={{
          maxWidth:      "600px",
          margin:        "0 auto",
          display:       "flex",
          flexDirection: "column",
          gap:           "var(--space-5)",
        }}>

          {/* ── Page title ─────────────────────────────── */}
          <div style={{ marginBottom: "var(--space-4)" }}>
            <p style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "0.65rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color:         "var(--color-gold-warm)",
              marginBottom:  "var(--space-3)",
            }}>
              Your account
            </p>
            <h1 style={{
              fontFamily: "var(--font-heading)",
              fontSize:   "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: 300,
              color:      "var(--color-divine)",
              lineHeight: 1.3,
            }}>
              {profile?.display_name
                ? `Welcome, ${profile.display_name}`
                : "Your profile"}
            </h1>
          </div>

          {/* ── Identity card ──────────────────────────── */}
          <Card>
            <SectionLabel>Identity</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

              <div>
                <p style={{
                  fontFamily:    "var(--font-body)",
                  fontSize:      "0.65rem",
                  letterSpacing: "0.1em",
                  color:         "var(--color-muted)",
                  marginBottom:  "var(--space-1)",
                }}>EMAIL</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "var(--color-divine)" }}>
                  {authUser?.email}
                </p>
              </div>

              {profile?.display_name && (
                <div>
                  <p style={{
                    fontFamily:    "var(--font-body)",
                    fontSize:      "0.65rem",
                    letterSpacing: "0.1em",
                    color:         "var(--color-muted)",
                    marginBottom:  "var(--space-1)",
                  }}>NAME</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "var(--color-divine)" }}>
                    {profile.display_name}
                  </p>
                </div>
              )}

              <div>
                <p style={{
                  fontFamily:    "var(--font-body)",
                  fontSize:      "0.65rem",
                  letterSpacing: "0.1em",
                  color:         "var(--color-muted)",
                  marginBottom:  "var(--space-1)",
                }}>SAVED MOMENTS</p>
                {journeyCount === 0 ? (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "var(--color-muted)" }}>
                    None yet — start a conversation and save what resonates
                  </p>
                ) : (
                  <a
                    href="/journey/saved"
                    style={{
                      fontFamily:     "var(--font-body)",
                      fontSize:       "0.95rem",
                      color:          "var(--color-gold-warm)",
                      textDecoration: "none",
                      display:        "inline-flex",
                      alignItems:     "center",
                      gap:            "var(--space-2)",
                      transition:     "opacity 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {journeyCount} moment{journeyCount !== 1 ? "s" : ""} saved
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                )}
              </div>

              <div>
                <p style={{
                  fontFamily:    "var(--font-body)",
                  fontSize:      "0.65rem",
                  letterSpacing: "0.1em",
                  color:         "var(--color-muted)",
                  marginBottom:  "var(--space-1)",
                }}>MEMBER SINCE</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "var(--color-divine)" }}>
                  {authUser?.created_at
                    ? new Date(authUser.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </Card>

          {/* ── Security card ──────────────────────────── */}
          <Card>
            <SectionLabel>Security</SectionLabel>
            <p style={{
              fontFamily:   "var(--font-body)",
              fontSize:     "0.85rem",
              color:        "var(--color-soft)",
              lineHeight:   "var(--leading-relaxed)",
              marginBottom: "var(--space-5)",
            }}>
              We will send a password reset link to your email address.
            </p>
            <button
              onClick={handlePasswordReset}
              disabled={pwLoading}
              style={{
                background:    "none",
                border:        "1px solid var(--color-border)",
                borderRadius:  "var(--radius-lg)",
                padding:       "var(--space-3) var(--space-5)",
                color:         "var(--color-soft)",
                fontFamily:    "var(--font-display)",
                fontSize:      "0.65rem",
                letterSpacing: "0.15em",
                cursor:        pwLoading ? "wait" : "pointer",
                opacity:       pwLoading ? 0.6 : 1,
                transition:    "all 0.2s ease",
                minHeight:     "44px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-gold-warm)"
                e.currentTarget.style.color       = "var(--color-gold-warm)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)"
                e.currentTarget.style.color       = "var(--color-soft)"
              }}
            >
              {pwLoading ? "SENDING…" : "CHANGE PASSWORD"}
            </button>
            <StatusMsg msg={pwMsg} />
          </Card>

          {/* ── Navigation card ────────────────────────── */}
          <Card>
            <SectionLabel>Navigation</SectionLabel>
            <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>

              <a
                href="/journey"
                style={{
                  background:     "none",
                  border:         "1px solid var(--color-border)",
                  borderRadius:   "var(--radius-lg)",
                  padding:        "var(--space-3) var(--space-5)",
                  color:          "var(--color-soft)",
                  fontFamily:     "var(--font-display)",
                  fontSize:       "0.65rem",
                  letterSpacing:  "0.15em",
                  textDecoration: "none",
                  display:        "inline-flex",
                  alignItems:     "center",
                  transition:     "all 0.2s ease",
                  minHeight:      "44px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-gold-warm)"
                  e.currentTarget.style.color       = "var(--color-gold-warm)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)"
                  e.currentTarget.style.color       = "var(--color-soft)"
                }}
              >
                OPEN COMPANION
              </a>

              <a
                href="/settings"
                style={{
                  background:     "none",
                  border:         "1px solid var(--color-border)",
                  borderRadius:   "var(--radius-lg)",
                  padding:        "var(--space-3) var(--space-5)",
                  color:          "var(--color-soft)",
                  fontFamily:     "var(--font-display)",
                  fontSize:       "0.65rem",
                  letterSpacing:  "0.15em",
                  textDecoration: "none",
                  display:        "inline-flex",
                  alignItems:     "center",
                  transition:     "all 0.2s ease",
                  minHeight:      "44px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-gold-warm)"
                  e.currentTarget.style.color       = "var(--color-gold-warm)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)"
                  e.currentTarget.style.color       = "var(--color-soft)"
                }}
              >
                SETTINGS
              </a>

              <button
                onClick={handleExport}
                style={{
                  background:    "none",
                  border:        "1px solid var(--color-border)",
                  borderRadius:  "var(--radius-lg)",
                  padding:       "var(--space-3) var(--space-5)",
                  color:         "var(--color-muted)",
                  fontFamily:    "var(--font-display)",
                  fontSize:      "0.65rem",
                  letterSpacing: "0.15em",
                  cursor:        "pointer",
                  transition:    "all 0.2s ease",
                  minHeight:     "44px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-gold-warm)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
              >
                EXPORT DATA
              </button>

              <button
                onClick={() => openConfirm({
                  title:        "Sign out?",
                  message:      "You will be returned to the home page.",
                  detail:       "Your saved moments are safe and will be here when you return.",
                  confirmLabel: "SIGN OUT",
                  variant:      "neutral",
                  onConfirm:    executeSignOut,
                })}
                style={{
                  background:    "none",
                  border:        "1px solid var(--color-border)",
                  borderRadius:  "var(--radius-lg)",
                  padding:       "var(--space-3) var(--space-5)",
                  color:         "var(--color-muted)",
                  fontFamily:    "var(--font-display)",
                  fontSize:      "0.65rem",
                  letterSpacing: "0.15em",
                  cursor:        "pointer",
                  transition:    "all 0.2s ease",
                  minHeight:     "44px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-gold-warm)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
              >
                SIGN OUT
              </button>

            </div>
          </Card>

          {/* ── Danger zone ────────────────────────────── */}
          <Card>
            <SectionLabel>Danger zone</SectionLabel>
            <p style={{
              fontFamily:   "var(--font-body)",
              fontSize:     "0.85rem",
              color:        "var(--color-muted)",
              lineHeight:   "var(--leading-relaxed)",
              marginBottom: "var(--space-5)",
            }}>
              Permanently delete your account and all saved journey entries. This cannot be undone.
            </p>
            <button
              onClick={() => openConfirm({
                title:        "Are you sure?",
                message:      "This will permanently delete your account and all saved journey entries.",
                detail:       "This cannot be undone.",
                confirmLabel: "DELETE ACCOUNT",
                variant:      "danger",
                onConfirm:    executeDelete,
              })}
              style={{
                background:    "none",
                border:        "1px solid rgba(220,60,60,0.3)",
                borderRadius:  "var(--radius-lg)",
                padding:       "var(--space-3) var(--space-5)",
                color:         "#f08080",
                fontFamily:    "var(--font-display)",
                fontSize:      "0.65rem",
                letterSpacing: "0.15em",
                cursor:        "pointer",
                opacity:       0.7,
                transition:    "all 0.2s ease",
                minHeight:     "44px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity     = "1"
                e.currentTarget.style.borderColor = "rgba(220,60,60,0.7)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity     = "0.7"
                e.currentTarget.style.borderColor = "rgba(220,60,60,0.3)"
              }}
            >
              DELETE ACCOUNT
            </button>
          </Card>

          {/* ── Privacy link ───────────────────────────── */}
          <div style={{ textAlign: "center", paddingBottom: "var(--space-4)" }}>
            <a
              href="/privacy"
              style={{
                fontFamily:     "var(--font-body)",
                fontSize:       "0.7rem",
                color:          "var(--color-muted)",
                textDecoration: "none",
                transition:     "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-gold-warm)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
            >
              Privacy Policy
            </a>
          </div>

        </div>
      </div>
    </>
  )
}