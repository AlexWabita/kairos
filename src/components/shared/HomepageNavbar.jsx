"use client"

import { useState, useEffect } from "react"
import Link                     from "next/link"
import Image                    from "next/image"
import { supabase }             from "@/lib/supabase/client"
import { signOut }              from "@/lib/supabase/auth"
import ConfirmModal             from "@/components/shared/ConfirmModal"

const MARKETING_LINKS = [
  { label: "About",        href: "/#about"        },
  { label: "Features",     href: "/#features"     },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ",          href: "/#faq"          },
]

const APP_LINKS = [
  { label: "Companion", href: "/journey" },
  { label: "Bible",     href: "/bible"   },
  { label: "Plans",     href: "/plans"   },
]

function getInitials(name) {
  if (!name) return "K"
  const parts = name.trim().split(" ")
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase()
}

export default function HomepageNavbar() {
  const [scrolled,           setScrolled]          = useState(false)
  const [menuOpen,           setMenuOpen]           = useState(false)
  const [user,               setUser]               = useState(null)
  const [userName,           setUserName]           = useState(null)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [signOutLoading,     setSignOutLoading]     = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  useEffect(() => {
    const resolve = (u) => {
      if (u && !u.is_anonymous) {
        setUser(u)
        setUserName(u.user_metadata?.full_name || u.email?.split("@")[0] || "Friend")
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

  const initials      = getInitials(userName)
  const firstNameOnly = userName?.split(" ")[0] || null
  const showPill      = scrolled || menuOpen

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

      {/* ── Nav bar ── */}
      <nav
        className={menuOpen ? "hn-nav hn-nav-open" : "hn-nav"}
        style={{
          position:             "fixed",
          top:                  showPill ? "12px" : "0",
          left:                 showPill ? "50%" : "0",
          right:                showPill ? "auto" : "0",
          transform:            showPill ? "translateX(-50%)" : "none",
          width:                showPill ? "calc(100% - 32px)" : "100%",
          maxWidth:             showPill ? "920px" : "none",
          zIndex:               200,
          height:               "64px",
          padding:              "0 24px",
          display:              "flex",
          alignItems:           "center",
          justifyContent:       "space-between",
          gap:                  16,
          background:           showPill ? "rgba(8,10,18,0.88)" : "transparent",
          backdropFilter:       showPill ? "blur(24px)" : "none",
          WebkitBackdropFilter: showPill ? "blur(24px)" : "none",
          border:               showPill
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid transparent",
          borderRadius:         showPill ? "16px" : "0",
          boxShadow:            showPill ? "0 4px 28px rgba(0,0,0,0.4)" : "none",
          transition: [
            "top 0.35s cubic-bezier(0.4,0,0.2,1)",
            "left 0.35s cubic-bezier(0.4,0,0.2,1)",
            "width 0.35s cubic-bezier(0.4,0,0.2,1)",
            "max-width 0.35s cubic-bezier(0.4,0,0.2,1)",
            "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
            "background 0.35s ease",
            "border-color 0.35s ease",
            "border-radius 0.35s ease",
            "box-shadow 0.35s ease",
          ].join(", "),
        }}
      >

        {/* ── Logo ── */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center" }}>
          <Image
            src="/images/logo-full.png"
            alt="Kairos"
            width={120}
            height={40}
            priority
            style={{
              objectFit:      "contain",
              objectPosition: "left center",
              display:        "block",
              maxHeight:      "34px",
              width:          "auto",
              maxWidth:       "108px",
              mixBlendMode:   "screen",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none"
              e.currentTarget.nextSibling.style.display = "flex"
            }}
          />
          <span style={{
            display:              "none",
            fontFamily:           "var(--font-display)",
            fontSize:             "1.05rem",
            letterSpacing:        "0.22em",
            background:           "var(--gradient-text)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip:       "text",
          }}>KAIROS</span>
        </Link>

        {/* ── Desktop marketing links ── */}
        <div className="hn-desktop" style={{
          display:         "flex",
          alignItems:      "center",
          gap:             2,
          flex:            1,
          justifyContent:  "center",
        }}>
          {MARKETING_LINKS.map(item => (
            <a
              key={item.href}
              href={item.href}
              style={{
                fontFamily:     "var(--font-body)",
                fontSize:       "0.82rem",
                color:          scrolled ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.55)",
                textDecoration: "none",
                padding:        "6px 12px",
                borderRadius:   "10px",
                transition:     "all 0.15s ease",
                whiteSpace:     "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.9)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)" }}
              onMouseLeave={e => { e.currentTarget.style.color = scrolled ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "transparent" }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* ── Desktop auth / CTA ── */}
        <div className="hn-desktop" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {user ? (
            <>
              <Link href="/account" style={{
                display:    "flex",
                alignItems: "center",
                gap:        7,
                padding:    "4px 12px 4px 4px",
                borderRadius: 100,
                background:   "rgba(255,255,255,0.05)",
                border:       "1px solid rgba(255,255,255,0.09)",
                textDecoration: "none",
                transition:   "all 0.15s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(240,192,96,0.4)"; e.currentTarget.style.background = "rgba(240,192,96,0.06)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
              >
                <div style={{
                  width:          26,
                  height:         26,
                  borderRadius:   "50%",
                  background:     "linear-gradient(135deg,rgba(240,192,96,0.28) 0%,rgba(240,150,60,0.28) 100%)",
                  border:         "1px solid rgba(240,192,96,0.35)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontFamily:     "var(--font-display)",
                  fontSize:       "0.52rem",
                  color:          "var(--color-gold-warm)",
                  flexShrink:     0,
                }}>
                  {initials}
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {firstNameOnly}
                </span>
              </Link>
              <Link href="/journey" style={{
                fontFamily:     "var(--font-display)",
                fontSize:       "0.6rem",
                letterSpacing:  "0.14em",
                color:          "#060912",
                textDecoration: "none",
                padding:        "7px 16px",
                borderRadius:   100,
                background:     "var(--gradient-gold)",
                boxShadow:      "var(--shadow-gold-sm)",
                whiteSpace:     "nowrap",
                transition:     "opacity 0.15s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.85" }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1" }}
              >
                OPEN
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                fontFamily:     "var(--font-body)",
                fontSize:       "0.82rem",
                color:          "rgba(255,255,255,0.45)",
                textDecoration: "none",
                padding:        "5px 13px",
                borderRadius:   100,
                transition:     "color 0.15s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.85)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)" }}
              >
                Sign in
              </Link>
              <Link href="/journey" style={{
                fontFamily:     "var(--font-display)",
                fontSize:       "0.6rem",
                letterSpacing:  "0.14em",
                color:          "#060912",
                textDecoration: "none",
                padding:        "8px 18px",
                borderRadius:   100,
                background:     "var(--gradient-gold)",
                boxShadow:      "var(--shadow-gold-sm)",
                whiteSpace:     "nowrap",
                transition:     "opacity 0.15s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.85" }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1" }}
              >
                BEGIN
              </Link>
            </>
          )}
        </div>

        {/* ── Hamburger ── */}
        <button
          className="hn-hamburger"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          style={{
            display:        "none",
            flexDirection:  "column",
            justifyContent: "center",
            alignItems:     "center",
            width:          "40px",
            height:         "40px",
            background:     "transparent",
            border:         "none",
            cursor:         "pointer",
            zIndex:         500,
            position:       "relative",
            padding:        0,
            flexShrink:     0,
          }}
        >
          {[
            { transform: menuOpen ? "rotate(45deg)"  : "translateY(-5px)", opacity: 1             },
            { transform: "none",                                            opacity: menuOpen ? 0 : 1 },
            { transform: menuOpen ? "rotate(-45deg)" : "translateY(5px)",  opacity: 1             },
          ].map((s, i) => (
            <span key={i} style={{
              display:      "block",
              position:     "absolute",
              width:        "18px",
              height:       "1.5px",
              background:   "rgba(255,255,255,0.7)",
              borderRadius: "2px",
              transition:   "all 0.25s cubic-bezier(0.4,0,0.2,1)",
              ...s,
            }} />
          ))}
        </button>

        {/* ── Mobile full-screen overlay ── */}
        <div
          className="hn-mobile-menu"
          style={{
            position:             "fixed",
            inset:                0,
            background:           "rgba(6,9,18,0.98)",
            backdropFilter:       "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            zIndex:               400,
            display:              "flex",
            flexDirection:        "column",
            padding:              "88px 28px 36px",
            opacity:              menuOpen ? 1 : 0,
            pointerEvents:        menuOpen ? "all" : "none",
            transition:           "opacity 0.25s ease",
          }}
        >
          <div aria-hidden="true" style={{
            position:     "absolute",
            bottom:       "10%",
            right:        "5%",
            width:        260,
            height:       260,
            background:   "radial-gradient(circle, rgba(240,192,96,0.07) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }} />

          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily:     "var(--font-display)",
              fontSize:       "0.5rem",
              letterSpacing:  "0.2em",
              textTransform:  "uppercase",
              color:          "rgba(255,255,255,0.2)",
              marginBottom:   6,
              opacity:        menuOpen ? 1 : 0,
              transition:     "opacity 0.3s ease",
              transitionDelay: "40ms",
            }}>
              Explore
            </p>
            {MARKETING_LINKS.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display:         "block",
                  fontFamily:      "var(--font-heading)",
                  fontSize:        "clamp(1.3rem, 5vw, 1.7rem)",
                  fontWeight:      300,
                  color:           "rgba(255,255,255,0.65)",
                  textDecoration:  "none",
                  padding:         "10px 0",
                  borderBottom:    "1px solid rgba(255,255,255,0.05)",
                  opacity:         menuOpen ? 1 : 0,
                  transform:       menuOpen ? "translateX(0)" : "translateX(-14px)",
                  transition:      "opacity 0.3s ease, transform 0.3s ease, color 0.15s ease",
                  transitionDelay: menuOpen ? `${i * 45 + 60}ms` : "0ms",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.9)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.65)" }}
              >
                {item.label}
              </a>
            ))}

            <p style={{
              fontFamily:      "var(--font-display)",
              fontSize:        "0.5rem",
              letterSpacing:   "0.2em",
              textTransform:   "uppercase",
              color:           "rgba(255,255,255,0.2)",
              marginTop:       20,
              marginBottom:    6,
              opacity:         menuOpen ? 1 : 0,
              transition:      "opacity 0.3s ease",
              transitionDelay: menuOpen ? `${MARKETING_LINKS.length * 45 + 60}ms` : "0ms",
            }}>
              The App
            </p>
            {APP_LINKS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display:         "block",
                  fontFamily:      "var(--font-heading)",
                  fontSize:        "clamp(1.3rem, 5vw, 1.7rem)",
                  fontWeight:      300,
                  color:           "rgba(255,255,255,0.55)",
                  textDecoration:  "none",
                  padding:         "10px 0",
                  borderBottom:    "1px solid rgba(255,255,255,0.05)",
                  opacity:         menuOpen ? 1 : 0,
                  transform:       menuOpen ? "translateX(0)" : "translateX(-14px)",
                  transition:      "opacity 0.3s ease, transform 0.3s ease, color 0.15s ease",
                  transitionDelay: menuOpen ? `${(MARKETING_LINKS.length + i) * 45 + 80}ms` : "0ms",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--color-gold-warm)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)" }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth — bottom */}
          <div style={{
            opacity:         menuOpen ? 1 : 0,
            transform:       menuOpen ? "translateY(0)" : "translateY(10px)",
            transition:      "opacity 0.3s ease, transform 0.3s ease",
            transitionDelay: menuOpen ? `${(MARKETING_LINKS.length + APP_LINKS.length) * 45 + 100}ms` : "0ms",
          }}>
            {user ? (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
                <Link href="/account" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", marginBottom: 14 }}>
                  <div style={{
                    width:          42,
                    height:         42,
                    borderRadius:   "50%",
                    background:     "linear-gradient(135deg,rgba(240,192,96,0.22) 0%,rgba(240,150,60,0.22) 100%)",
                    border:         "1px solid rgba(240,192,96,0.3)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontFamily:     "var(--font-display)",
                    fontSize:       "0.65rem",
                    color:          "var(--color-gold-warm)",
                    flexShrink:     0,
                  }}>
                    {initials}
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", margin: 0 }}>{firstNameOnly}</p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>View account →</p>
                  </div>
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); setShowSignOutConfirm(true) }}
                  style={{
                    width:       "100%",
                    padding:     "12px 0",
                    background:  "rgba(255,255,255,0.04)",
                    border:      "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    color:       "rgba(255,255,255,0.4)",
                    fontFamily:  "var(--font-body)",
                    fontSize:    "0.85rem",
                    cursor:      "pointer",
                    transition:  "all 0.15s ease",
                    minHeight:   "44px",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(240,80,80,0.4)"; e.currentTarget.style.color = "#f08080" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)" }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <Link href="/journey" onClick={() => setMenuOpen(false)} style={{
                  display:        "block",
                  textAlign:      "center",
                  padding:        "14px 0",
                  background:     "var(--gradient-gold)",
                  borderRadius:   14,
                  color:          "#060912",
                  fontFamily:     "var(--font-display)",
                  fontSize:       "0.7rem",
                  letterSpacing:  "0.15em",
                  textDecoration: "none",
                  boxShadow:      "var(--shadow-gold-sm)",
                  minHeight:      "48px",
                  lineHeight:     "20px",
                }}>
                  BEGIN JOURNEY
                </Link>
                <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                  display:        "block",
                  textAlign:      "center",
                  padding:        "12px 0",
                  background:     "transparent",
                  border:         "1px solid rgba(255,255,255,0.08)",
                  borderRadius:   14,
                  color:          "rgba(255,255,255,0.4)",
                  fontFamily:     "var(--font-body)",
                  fontSize:       "0.85rem",
                  textDecoration: "none",
                  minHeight:      "48px",
                  lineHeight:     "24px",
                  transition:     "all 0.15s ease",
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)" }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)" }}
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @media (max-width: 700px) {
            .hn-desktop   { display: none !important; }
            .hn-hamburger { display: flex !important; }

            /* When menu is open on mobile: force full-width solid bar,
               no pill transform — otherwise corners of screen are exposed */
            .hn-nav.hn-nav-open {
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              transform: none !important;
              width: 100% !important;
              max-width: none !important;
              border-radius: 0 !important;
              border-left: none !important;
              border-right: none !important;
              border-top: none !important;
              background: rgba(6,9,18,0.98) !important;
              box-shadow: none !important;
            }
          }
          @media (min-width: 701px) {
            .hn-mobile-menu { display: none !important; }
          }
        `}</style>
      </nav>
    </>
  )
}