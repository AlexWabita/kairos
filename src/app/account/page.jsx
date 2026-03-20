"use client"

import { useState, useEffect } from "react"
import { useRouter }           from "next/navigation"
import { usePathname }         from "next/navigation"
import { supabase }            from "@/lib/supabase/client"
import { signOut }             from "@/lib/supabase/auth"
import ConfirmModal            from "@/components/shared/ConfirmModal"

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const css = `
  @keyframes ac-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ac-spin  { to{transform:rotate(360deg)} }

  .ac-layout {
    display: grid;
    grid-template-columns: 220px 1fr;
    min-height: 100vh;
  }

  .ac-sidebar {
    position: sticky; top: 0; height: 100vh;
    display: flex; flex-direction: column;
    background: rgba(8,10,18,0.98);
    border-right: 1px solid rgba(255,255,255,0.06);
    padding: 24px 14px;
    overflow-y: auto; scrollbar-width: none;
  }
  .ac-sidebar::-webkit-scrollbar { display: none; }

  .ac-main {
    padding: 48px 48px 80px;
    min-width: 0;
  }

  .ac-nav-link {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 8px;
    text-decoration: none; border: none;
    background: transparent; width: 100%;
    cursor: pointer; transition: background 0.15s ease;
    min-height: 40px; text-align: left;
    font-family: var(--font-body); font-size: 0.82rem;
  }
  .ac-nav-link:hover  { background: rgba(255,255,255,0.05); }
  .ac-nav-link.active { background: rgba(255,255,255,0.08); }

  /* Section card */
  .ac-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 28px;
    animation: ac-fade 0.4s ease both;
  }

  /* Row item within a card */
  .ac-row {
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 14px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    gap: 20px;
  }
  .ac-row:last-child { border-bottom: none; padding-bottom: 0; }
  .ac-row:first-child { padding-top: 0; }

  /* Ghost action button */
  .ac-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 18px; border-radius: 9px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.5);
    font-family: var(--font-display); font-size: 0.6rem;
    letter-spacing: 0.14em; cursor: pointer;
    transition: all 0.15s ease; min-height: 38px;
    white-space: nowrap;
  }
  .ac-btn:hover { border-color: rgba(240,192,96,0.4); color: var(--color-gold-warm); }

  /* Danger button */
  .ac-btn-danger {
    border-color: rgba(220,60,60,0.25);
    color: rgba(240,100,100,0.6);
  }
  .ac-btn-danger:hover { border-color: rgba(220,60,60,0.6); color: #f08080; }

  /* Stat chip */
  .ac-stat {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; border-radius: 10px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
  }

  /* Mobile */
  .ac-mobile-nav { display: none; }

  @media (max-width: 768px) {
    .ac-layout { grid-template-columns: 1fr; }
    .ac-sidebar { display: none; }
    .ac-main { padding: 28px 16px 80px; }
    .ac-mobile-nav { display: flex; }
  }
  @media (max-width: 480px) {
    .ac-main { padding: 20px 12px 80px; }
    .ac-row { flex-direction: column; align-items: flex-start; gap: 12px; }
  }
`

/* ─────────────────────────────────────────────────────────────
   NAV
───────────────────────────────────────────────────────────── */
const NAV = [
  { label: "Companion", href: "/journey",       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { label: "Saved",     href: "/journey/saved", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> },
  { label: "Bible",     href: "/bible",         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { label: "Plans",     href: "/plans",         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label: "Account",   href: "/account",       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: "Settings",  href: "/settings",      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
]

function getInitials(name) {
  if (!name) return "K"
  const parts = name.trim().split(" ")
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase()
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────── */
function Sidebar({ pathname, displayName, initials }) {
  return (
    <nav className="ac-sidebar">
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 28 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,rgba(240,192,96,0.28),rgba(200,140,40,0.28))", border: "1px solid rgba(240,192,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(240,192,96,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", letterSpacing: "0.22em", background: "var(--gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>KAIROS</span>
      </a>

      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", padding: "0 12px 6px", margin: 0 }}>Navigation</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <a key={item.href} href={item.href}
              className={`ac-nav-link${active ? " active" : ""}`}
              style={{ color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)" }}>
              <span style={{ color: active ? "rgba(240,192,96,0.8)" : "rgba(255,255,255,0.25)", flexShrink: 0 }}>{item.icon}</span>
              {item.label}
              {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "rgba(240,192,96,0.7)", flexShrink: 0 }} />}
            </a>
          )
        })}
      </div>

      {/* User chip */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,rgba(240,192,96,0.25),rgba(200,140,40,0.25))", border: "1px solid rgba(240,192,96,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "0.55rem", color: "var(--color-gold-warm)", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{displayName || "Account"}</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(240,192,96,0.5)", margin: "1px 0 0" }}>Your profile</p>
          </div>
        </div>
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────────────────────────
   MOBILE BOTTOM NAV
───────────────────────────────────────────────────────────── */
function MobileNav({ pathname }) {
  return (
    <div className="ac-mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 58, zIndex: 100, background: "rgba(8,10,18,0.96)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "space-around", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {NAV.slice(0, 5).map(item => {
        const active = pathname === item.href
        return (
          <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", color: active ? "rgba(240,192,96,0.9)" : "rgba(255,255,255,0.3)", minWidth: 44, minHeight: 44, justifyContent: "center" }}>
            {item.icon}
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.45rem", letterSpacing: "0.08em" }}>{item.label}</span>
          </a>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STATUS MESSAGE
───────────────────────────────────────────────────────────── */
function StatusMsg({ msg }) {
  if (!msg) return null
  const isErr = msg.type === "error"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "10px 14px", borderRadius: 9, background: isErr ? "rgba(220,60,60,0.08)" : "rgba(64,168,80,0.08)", border: `1px solid ${isErr ? "rgba(220,60,60,0.25)" : "rgba(64,168,80,0.25)"}` }}>
      {isErr
        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f08080" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7dcf8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      }
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: isErr ? "#f08080" : "#7dcf8a", margin: 0 }}>{msg.text}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────────────────────── */
function Section({ title, icon, children, delay = "0s", accent = false }) {
  return (
    <div className="ac-card" style={{ animationDelay: delay, borderColor: accent ? "rgba(220,60,60,0.2)" : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: accent ? "rgba(220,60,60,0.08)" : "rgba(240,192,96,0.07)", border: `1px solid ${accent ? "rgba(220,60,60,0.2)" : "rgba(240,192,96,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: accent ? "#f08080" : "rgba(240,192,96,0.8)", flexShrink: 0 }}>
          {icon}
        </div>
        <h2 style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", fontWeight: 500, color: "rgba(255,255,255,0.75)", margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   DATA ROW
───────────────────────────────────────────────────────────── */
function DataRow({ label, value, action }) {
  return (
    <div className="ac-row">
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 4 }}>{label}</p>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>{value}</div>
      </div>
      {action}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function AccountPage() {
  const router   = useRouter()
  const pathname = usePathname()

  const [authUser,     setAuthUser]     = useState(null)
  const [profile,      setProfile]      = useState(null)
  const [journeyCount, setJourneyCount] = useState(null)
  const [plansCount,   setPlansCount]   = useState(null)
  const [pageLoading,  setPageLoading]  = useState(true)
  const [pwLoading,    setPwLoading]    = useState(false)
  const [pwMsg,        setPwMsg]        = useState(null)

  const [confirmState, setConfirmState] = useState({
    isOpen: false, title: "", message: "", detail: "",
    confirmLabel: "", variant: "danger", onConfirm: null, loading: false,
  })

  const openConfirm  = (cfg) => setConfirmState({ ...confirmState, isOpen: true, loading: false, ...cfg })
  const closeConfirm = () => setConfirmState(p => ({ ...p, isOpen: false, loading: false }))
  const setConfirmLoading = (v) => setConfirmState(p => ({ ...p, loading: v }))

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.is_anonymous) { router.replace("/login"); return }
      setAuthUser(user)

      const { data: prof } = await supabase.from("users").select("*").eq("auth_id", user.id).maybeSingle()
      setProfile(prof)

      if (prof?.id) {
        const { count: jCount } = await supabase.from("journey_entries").select("id", { count: "exact", head: true }).eq("user_id", prof.id)
        setJourneyCount(jCount ?? 0)

        const { data: enrollments } = await supabase.from("plan_enrollments").select("id").eq("user_id", prof.id)
        setPlansCount(enrollments?.length ?? 0)
      }
      setPageLoading(false)
    }
    load()
  }, [router])

  const handlePasswordReset = async () => {
    if (!authUser?.email) return
    setPwLoading(true); setPwMsg(null)
    const { error } = await supabase.auth.resetPasswordForEmail(authUser.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    setPwMsg(error ? { type: "error", text: error.message } : { type: "success", text: "Password reset link sent — check your email." })
    setPwLoading(false)
  }

  const executeSignOut = async () => {
    setConfirmLoading(true)
    await signOut()
    router.push("/"); router.refresh()
  }

  const executeDelete = async () => {
    setConfirmLoading(true)
    try {
      if (profile?.id) {
        await supabase.from("journey_entries").delete().eq("user_id", profile.id)
        await supabase.from("users").delete().eq("id", profile.id)
      }
      const res  = await fetch("/api/account/delete", { method: "DELETE" })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Delete failed")
      await signOut(); router.push("/"); router.refresh()
    } catch (err) {
      console.error("[Kairos] Delete failed:", err.message); closeConfirm()
    }
  }

  const handleExport = () => {
    if (!profile?.id) return
    window.open(`/api/account/export?userId=${profile.id}`, "_blank")
  }

  /* ── Derived display values ── */
  const displayName = profile?.display_name || authUser?.user_metadata?.full_name || authUser?.email?.split("@")[0] || "Friend"
  const initials    = getInitials(displayName)
  const memberSince = authUser?.created_at
    ? new Date(authUser.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—"

  /* ── Loading ── */
  if (pageLoading) return (
    <div style={{ minHeight: "100vh", background: "var(--color-void)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "1px solid rgba(240,192,96,0.2)", borderTop: "1px solid rgba(240,192,96,0.7)", borderRadius: "50%", animation: "ac-spin 0.8s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", color: "rgba(240,192,96,0.5)", fontSize: "0.88rem" }}>Loading your account…</p>
      </div>
      <style>{`@keyframes ac-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <>
      <style>{css}</style>

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

      <div style={{ background: "var(--color-void)", minHeight: "100vh" }}>
        {/* Ambient glow */}
        <div aria-hidden="true" style={{ position: "fixed", top: "20%", right: "-5%", width: 350, height: 350, background: "radial-gradient(circle,rgba(240,192,96,0.04) 0%,transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

        <div className="ac-layout" style={{ position: "relative", zIndex: 1 }}>
          <Sidebar pathname={pathname} displayName={displayName} initials={initials} />

          <main className="ac-main">

            {/* ── Page header ── */}
            <div style={{ marginBottom: 36 }}>
              {/* Avatar */}
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,rgba(240,192,96,0.2),rgba(200,140,40,0.2))", border: "2px solid rgba(240,192,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "1.1rem", letterSpacing: "0.05em", color: "var(--color-gold-warm)", marginBottom: 18 }}>
                {initials}
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(240,192,96,0.7)", marginBottom: 10 }}>Your Account</p>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300, color: "rgba(255,255,255,0.88)", lineHeight: 1.25, margin: 0 }}>
                {displayName}
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.28)", marginTop: 6 }}>
                Member since {memberSince}
              </p>
            </div>

            {/* ── Stats strip ── */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
              {[
                { label: "Saved moments", value: journeyCount ?? "—", href: "/journey/saved", color: "rgba(240,192,96,0.7)" },
                { label: "Plans enrolled", value: plansCount ?? "—", href: "/plans", color: "rgba(165,180,252,0.7)" },
              ].map(s => (
                <a key={s.label} href={s.href} style={{ textDecoration: "none" }}>
                  <div className="ac-stat" style={{ transition: "all 0.15s ease", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
                  >
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 300, color: s.color, lineHeight: 1 }}>{s.value}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>{s.label}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </a>
              ))}
            </div>

            {/* ── Sections ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>

              {/* Identity */}
              <Section title="Identity" delay="0.05s" icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              }>
                <DataRow label="Email address" value={
                  <span style={{ color: "rgba(255,255,255,0.65)" }}>{authUser?.email}</span>
                } />
                {profile?.display_name && (
                  <DataRow label="Display name" value={
                    <span style={{ color: "rgba(255,255,255,0.65)" }}>{profile.display_name}</span>
                  } />
                )}
                <DataRow label="Member since" value={
                  <span style={{ color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>{memberSince}</span>
                } />
              </Section>

              {/* Security */}
              <Section title="Security" delay="0.1s" icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              }>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.32)", lineHeight: 1.7, marginBottom: 16 }}>
                  A password reset link will be sent to your email address.
                </p>
                <button
                  onClick={handlePasswordReset}
                  disabled={pwLoading}
                  className="ac-btn"
                  style={{ opacity: pwLoading ? 0.6 : 1, cursor: pwLoading ? "wait" : "pointer" }}
                >
                  {pwLoading
                    ? <><div style={{ width: 10, height: 10, border: "1.5px solid rgba(255,255,255,0.2)", borderTop: "1.5px solid rgba(255,255,255,0.6)", borderRadius: "50%", animation: "ac-spin 0.7s linear infinite" }} />Sending…</>
                    : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>CHANGE PASSWORD</>
                  }
                </button>
                <StatusMsg msg={pwMsg} />
              </Section>

              {/* Data & Privacy */}
              <Section title="Data & Privacy" delay="0.15s" icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              }>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.32)", lineHeight: 1.7, marginBottom: 16 }}>
                  Your conversations and journey entries belong to you. Export or delete them at any time.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={handleExport} className="ac-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    EXPORT DATA
                  </button>
                  <a href="/privacy" className="ac-btn" style={{ textDecoration: "none" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    PRIVACY POLICY
                  </a>
                </div>
              </Section>

              {/* Quick links */}
              <Section title="Quick links" delay="0.2s" icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              }>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "COMPANION",      href: "/journey"       },
                    { label: "SAVED MOMENTS",  href: "/journey/saved" },
                    { label: "READING PLANS",  href: "/plans"         },
                    { label: "SETTINGS",       href: "/settings"      },
                  ].map(l => (
                    <a key={l.href} href={l.href} className="ac-btn" style={{ textDecoration: "none" }}>
                      {l.label}
                    </a>
                  ))}
                  <button
                    onClick={() => openConfirm({
                      title: "Sign out?",
                      message: "You will be returned to the home page.",
                      detail: "Your saved moments are safe and will be here when you return.",
                      confirmLabel: "SIGN OUT",
                      variant: "neutral",
                      onConfirm: executeSignOut,
                    })}
                    className="ac-btn"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    SIGN OUT
                  </button>
                </div>
              </Section>

              {/* Danger zone */}
              <Section title="Danger zone" accent delay="0.25s" icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              }>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.7, marginBottom: 16 }}>
                  Permanently delete your account and all saved journey entries. This action cannot be undone.
                </p>
                <button
                  onClick={() => openConfirm({
                    title: "Delete your account?",
                    message: "This will permanently delete your account and all saved journey entries.",
                    detail: "This cannot be undone.",
                    confirmLabel: "DELETE ACCOUNT",
                    variant: "danger",
                    onConfirm: executeDelete,
                  })}
                  className="ac-btn ac-btn-danger"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  DELETE ACCOUNT
                </button>
              </Section>

            </div>
          </main>
        </div>
      </div>

      <MobileNav pathname={pathname} />
    </>
  )
}