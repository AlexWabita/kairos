"use client"

import { useState, useEffect }  from "react"
import Link                      from "next/link"
import Image                     from "next/image"
import { usePathname }           from "next/navigation"
import { supabase }              from "@/lib/supabase/client"
import { signOut }               from "@/lib/supabase/auth"
import ConfirmModal              from "@/components/shared/ConfirmModal"

/* ─────────────────────────────────────────────────────────────
   APP LINKS ONLY — homepage has its own HomepageNavbar.jsx
───────────────────────────────────────────────────────────── */
const APP_LINKS = [
  { label: "Companion", href: "/journey"       },
  { label: "Saved",     href: "/journey/saved" },
  { label: "Bible",     href: "/bible"         },
  { label: "Plans",     href: "/plans"         },
]

function getInitials(name) {
  if (!name) return "K"
  const parts = name.trim().split(" ")
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase()
}

export default function Navbar() {
  const pathname = usePathname()

  const [menuOpen,           setMenuOpen]           = useState(false)
  const [user,               setUser]               = useState(null)
  const [userName,           setUserName]            = useState(null)
  const [showSignOutConfirm, setShowSignOutConfirm]  = useState(false)
  const [signOutLoading,     setSignOutLoading]      = useState(false)
  const [theme,              setTheme]               = useState("dark")

  /* ── Read theme from app settings ── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("kairos_settings")
      if (stored) {
        const parsed = JSON.parse(stored)
        setTheme(parsed.theme || "dark")
      }
    } catch (_) {}

    // Stay in sync if settings change in another tab / component
    const onStorage = (e) => {
      if (e.key === "kairos_settings") {
        try {
          const parsed = JSON.parse(e.newValue)
          setTheme(parsed?.theme || "dark")
        } catch (_) {}
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  /* ── Lock body scroll when mobile menu open ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  /* ── Auth state ── */
  useEffect(() => {
    const resolve = (u) => {
      if (u && !u.is_anonymous) {
        setUser(u)
        const name = u.user_metadata?.full_name || u.email?.split("@")[0] || "Friend"
        setUserName(name)
      } else {
        setUser(null)
        setUserName(null)
      }
    }
    supabase.auth.getUser().then(({ data: { user: u } }) => resolve(u))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => resolve(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    setSignOutLoading(true)
    await signOut()
    setUser(null)
    setUserName(null)
    setShowSignOutConfirm(false)
    setSignOutLoading(false)
    window.location.href = "/"
  }

  /* ── Exact-match active check — prevents /journey matching /journey/saved ── */
  const isActive = (href) => pathname === href

  const initials      = getInitials(userName)
  const firstNameOnly = userName?.split(" ")[0] || null

  /* ── Theme-derived colours ── */
  const isLight = theme === "light"
  const bg          = isLight ? "rgba(240,238,232,0.92)" : "rgba(10,12,20,0.82)"
  const bgOpen      = isLight ? "rgba(240,238,232,0.99)" : "rgba(10,12,20,0.99)"
  const border      = isLight ? "rgba(0,0,0,0.09)"       : "rgba(255,255,255,0.09)"
  const textMuted   = isLight ? "rgba(0,0,0,0.45)"       : "rgba(255,255,255,0.4)"
  const textActive  = isLight ? "rgba(0,0,0,0.88)"       : "rgba(255,255,255,0.88)"
  const activeBg    = isLight ? "rgba(0,0,0,0.07)"       : "rgba(255,255,255,0.07)"
  const hoverBg     = isLight ? "rgba(0,0,0,0.05)"       : "rgba(255,255,255,0.05)"
  const hamburgerBg = isLight ? "rgba(0,0,0,0.55)"       : "rgba(255,255,255,0.6)"

  return (
    <>
      <ConfirmModal
        isOpen={showSignOutConfirm}
        title="Sign out?"
        message="You will be returned to the home page."
        detail="Your saved moments and journey entries are safe and will be here when you return."
        confirmLabel="SIGN OUT"
        cancelLabel="Stay"
        variant="neutral"
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutConfirm(false)}
        loading={signOutLoading}
      />

      {/* ════════════════════════════════════════════════════
          FLOATING PILL NAV
          Centred, max-width 880px, hovers 12px from top.
          Does NOT touch the left/right viewport edges.
      ════════════════════════════════════════════════════ */}
      <nav
        style={{
          position:       "fixed",
          top:            "12px",
          left:           "50%",
          transform:      "translateX(-50%)",
          width:          "calc(100% - 32px)",
          maxWidth:       "880px",
          zIndex:         "var(--z-nav, 200)",
          height:         "56px",
          padding:        "0 16px",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          gap:            12,
          background:     bg,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border:         `1px solid ${border}`,
          borderRadius:   "16px",
          boxShadow:      isLight
            ? "0 4px 24px rgba(0,0,0,0.08)"
            : "0 4px 24px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.05) inset",
          transition:     "background 0.3s ease, border-color 0.3s ease",
        }}
      >

        {/* ── Logo ── */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center" }}>
          <Image
            src="/images/logo-full.png"
            alt="Kairos"
            width={110}
            height={36}
            priority
            style={{
              objectFit:      "contain",
              objectPosition: "left center",
              display:        "block",
              maxHeight:      "32px",
              width:          "auto",
              maxWidth:       "100px",
              mixBlendMode:   isLight ? "multiply" : "screen",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none"
              e.currentTarget.nextSibling.style.display = "flex"
            }}
          />
          <span style={{
            display:              "none",
            fontFamily:           "var(--font-display)",
            fontSize:             "1rem",
            letterSpacing:        "0.22em",
            background:           "var(--gradient-text)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip:       "text",
          }}>
            KAIROS
          </span>
        </Link>

        {/* ── Desktop links (centred) ── */}
        <div className="nb-desktop" style={{
          display:        "flex",
          alignItems:     "center",
          gap:            2,
          flex:           1,
          justifyContent: "center",
        }}>
          {APP_LINKS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontFamily:     "var(--font-body)",
                  fontSize:       "0.82rem",
                  color:          active ? textActive : textMuted,
                  textDecoration: "none",
                  padding:        "6px 13px",
                  borderRadius:   "10px",
                  background:     active ? activeBg : "transparent",
                  transition:     "all 0.15s ease",
                  whiteSpace:     "nowrap",
                  letterSpacing:  "0.01em",
                  fontWeight:     active ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color      = isLight ? "rgba(0,0,0,0.7)"        : "rgba(255,255,255,0.75)"
                    e.currentTarget.style.background = hoverBg
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color      = textMuted
                    e.currentTarget.style.background = "transparent"
                  }
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* ── Desktop auth ── */}
        <div className="nb-desktop" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {user ? (
            <>
              {/* Avatar chip → /account */}
              <Link
                href="/account"
                title="Your account"
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            7,
                  padding:        "4px 12px 4px 4px",
                  borderRadius:   100,
                  background:     hoverBg,
                  border:         `1px solid ${border}`,
                  textDecoration: "none",
                  transition:     "all 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(240,192,96,0.4)"; e.currentTarget.style.background = "rgba(240,192,96,0.06)" }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = hoverBg }}
              >
                <div style={{
                  width:          26, height: 26, borderRadius: "50%",
                  background:     "linear-gradient(135deg,rgba(240,192,96,0.28) 0%,rgba(240,150,60,0.28) 100%)",
                  border:         "1px solid rgba(240,192,96,0.35)",
                  display:        "flex", alignItems: "center", justifyContent: "center",
                  fontFamily:     "var(--font-display)",
                  fontSize:       "0.52rem", letterSpacing: "0.04em",
                  color:          "var(--color-gold-warm)", flexShrink: 0,
                }}>
                  {initials}
                </div>
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: "0.78rem",
                  color: isLight ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.65)",
                  maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {firstNameOnly}
                </span>
              </Link>

              {/* Sign out */}
              <button
                onClick={() => setShowSignOutConfirm(true)}
                style={{
                  background: "transparent", border: `1px solid ${border}`,
                  borderRadius: 100, padding: "5px 13px",
                  color: textMuted, fontFamily: "var(--font-body)",
                  fontSize: "0.78rem", cursor: "pointer",
                  transition: "all 0.15s ease", whiteSpace: "nowrap", minHeight: "32px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(240,80,80,0.45)"; e.currentTarget.style.color = "#f08080" }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                fontFamily: "var(--font-body)", fontSize: "0.82rem",
                color: textMuted, textDecoration: "none",
                padding: "5px 13px", borderRadius: 100, transition: "color 0.15s ease",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = textActive }}
                onMouseLeave={(e) => { e.currentTarget.style.color = textMuted }}
              >
                Sign in
              </Link>
              <Link href="/journey" style={{
                fontFamily: "var(--font-display)", fontSize: "0.6rem",
                letterSpacing: "0.14em", color: "#060912",
                textDecoration: "none", padding: "7px 16px",
                borderRadius: 100, background: "var(--gradient-gold)",
                boxShadow: "var(--shadow-gold-sm)", whiteSpace: "nowrap",
                transition: "opacity 0.15s ease",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85" }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
              >
                BEGIN
              </Link>
            </>
          )}
        </div>

        {/* ── Hamburger ── */}
        <button
          className="nb-hamburger"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          style={{
            display: "none", flexDirection: "column",
            justifyContent: "center", alignItems: "center",
            width: "40px", height: "40px",
            background: "transparent", border: "none",
            cursor: "pointer", zIndex: 500, position: "relative",
            padding: 0, flexShrink: 0,
          }}
        >
          {[
            { transform: menuOpen ? "rotate(45deg)" : "translateY(-5px)", opacity: 1            },
            { transform: "none",                                           opacity: menuOpen?0:1 },
            { transform: menuOpen ? "rotate(-45deg)" : "translateY(5px)", opacity: 1            },
          ].map((s, i) => (
            <span key={i} style={{
              display: "block", position: "absolute",
              width: "18px", height: "1.5px",
              background: hamburgerBg, borderRadius: "2px",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
              ...s,
            }} />
          ))}
        </button>

        {/* ── Mobile full-screen menu ── */}
        <div
          className="nb-mobile-menu"
          style={{
            position:        "fixed",
            inset:           0,
            background:      bgOpen,
            backdropFilter:  "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            zIndex:          400,
            display:         "flex",
            flexDirection:   "column",
            padding:         "84px 28px 36px",
            opacity:         menuOpen ? 1 : 0,
            pointerEvents:   menuOpen ? "all" : "none",
            transition:      "opacity 0.25s ease",
          }}
        >
          {/* Ambient glow */}
          <div aria-hidden="true" style={{
            position: "absolute", bottom: "12%", right: "4%",
            width: 260, height: 260,
            background: "radial-gradient(circle, rgba(240,192,96,0.07) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />

          {/* Nav links */}
          <div style={{ flex: 1 }}>
            {APP_LINKS.map((item, i) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display:         "block",
                    fontFamily:      "var(--font-heading)",
                    fontSize:        "clamp(1.5rem, 6vw, 2rem)",
                    fontWeight:      300,
                    color:           active ? "var(--color-gold-warm)" : textActive,
                    textDecoration:  "none",
                    padding:         "13px 0",
                    borderBottom:    `1px solid ${border}`,
                    opacity:         menuOpen ? 1 : 0,
                    transform:       menuOpen ? "translateX(0)" : "translateX(-14px)",
                    transition:      "opacity 0.3s ease, transform 0.3s ease, color 0.15s ease",
                    transitionDelay: menuOpen ? `${i * 50 + 60}ms` : "0ms",
                    lineHeight:      1.2,
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--color-gold-warm)" }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = textActive }}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Auth — pinned to bottom */}
          <div style={{
            opacity:         menuOpen ? 1 : 0,
            transform:       menuOpen ? "translateY(0)" : "translateY(10px)",
            transition:      "opacity 0.3s ease, transform 0.3s ease",
            transitionDelay: menuOpen ? `${APP_LINKS.length * 50 + 80}ms` : "0ms",
          }}>
            {user ? (
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: 20 }}>
                <Link href="/account" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", marginBottom: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: "linear-gradient(135deg,rgba(240,192,96,0.22) 0%,rgba(240,150,60,0.22) 100%)",
                    border: "1px solid rgba(240,192,96,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display)", fontSize: "0.65rem",
                    color: "var(--color-gold-warm)", flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: textActive, margin: 0 }}>{firstNameOnly}</p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: textMuted, margin: "2px 0 0" }}>View account →</p>
                  </div>
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); setShowSignOutConfirm(true) }}
                  style={{
                    width: "100%", padding: "12px 0",
                    background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${border}`,
                    borderRadius: 12, color: textMuted,
                    fontFamily: "var(--font-body)", fontSize: "0.85rem",
                    cursor: "pointer", transition: "all 0.15s ease", minHeight: "44px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(240,80,80,0.4)"; e.currentTarget.style.color = "#f08080" }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <Link href="/journey" onClick={() => setMenuOpen(false)} style={{
                  display: "block", textAlign: "center", padding: "14px 0",
                  background: "var(--gradient-gold)", borderRadius: 14,
                  color: "#060912", fontFamily: "var(--font-display)",
                  fontSize: "0.7rem", letterSpacing: "0.15em",
                  textDecoration: "none", boxShadow: "var(--shadow-gold-sm)", minHeight: "48px", lineHeight: "20px",
                }}>
                  BEGIN JOURNEY
                </Link>
                <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                  display: "block", textAlign: "center", padding: "12px 0",
                  background: "transparent", border: `1px solid ${border}`,
                  borderRadius: 14, color: textMuted,
                  fontFamily: "var(--font-body)", fontSize: "0.85rem",
                  textDecoration: "none", minHeight: "48px", lineHeight: "24px",
                  transition: "all 0.15s ease",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = textActive; e.currentTarget.style.borderColor = isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.18)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; e.currentTarget.style.borderColor = border }}
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Responsive breakpoints ── */}
        <style>{`
          @media (max-width: 680px) {
            .nb-desktop   { display: none !important; }
            .nb-hamburger { display: flex !important; }
          }
          @media (min-width: 681px) {
            .nb-mobile-menu { display: none !important; }
          }
        `}</style>

      </nav>
    </>
  )
}