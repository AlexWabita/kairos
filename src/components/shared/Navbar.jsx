"use client"

import { useState, useEffect } from "react"
import Link          from "next/link"
import { supabase }  from "@/lib/supabase/client"
import { signOut }   from "@/lib/supabase/auth"
import ConfirmModal  from "@/components/shared/ConfirmModal"

export default function Navbar() {
  const [scrolled,          setScrolled]          = useState(false)
  const [menuOpen,          setMenuOpen]           = useState(false)
  const [user,              setUser]               = useState(null)
  const [userName,          setUserName]           = useState(null)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [signOutLoading,    setSignOutLoading]     = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  // Listen to auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && !user.is_anonymous) {
        setUser(user)
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Friend"
        setUserName(name.split(" ")[0])
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      if (u && !u.is_anonymous) {
        setUser(u)
        const name = u.user_metadata?.full_name || u.email?.split("@")[0] || "Friend"
        setUserName(name.split(" ")[0])
      } else {
        setUser(null)
        setUserName(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Confirmed sign out ───────────────────────────────────
  const handleSignOut = async () => {
    setSignOutLoading(true)
    await signOut()
    setUser(null)
    setUserName(null)
    setShowSignOutConfirm(false)
    window.location.href = "/"
  }

  const navItems = [
    { label: "About",        href: "/#about"        },
    { label: "How It Works", href: "/#how-it-works"  },
    { label: "Journey",      href: "/journey"        },
    { label: "Bible",        href: "/bible"          },
    { label: "Settings",     href: "/settings"       },
  ]

  const linkStyle = {
    fontFamily:     "var(--font-body)",
    fontSize:       "var(--text-body-sm)",
    fontWeight:     400,
    color:          "var(--color-muted)",
    textDecoration: "none",
    transition:     "color var(--duration-fast) var(--ease-sacred)",
    letterSpacing:  "var(--tracking-normal)",
  }

  return (
    <>
      {/* ── Sign-out confirmation ──────────────────────────── */}
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

      <nav style={{
        position:       "fixed",
        top:            0,
        left:           0,
        right:          0,
        zIndex:         "var(--z-nav)",
        padding:        "0 var(--space-5)",
        height:         "68px",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        transition:     `background var(--duration-normal) var(--ease-sacred),
                         border-color var(--duration-normal) var(--ease-sacred),
                         backdrop-filter var(--duration-normal) var(--ease-sacred)`,
        background:     scrolled ? "rgba(6, 9, 18, 0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom:   scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", zIndex: 10 }}>
          <span style={{
            fontFamily:           "var(--font-display)",
            fontSize:             "1.4rem",
            fontWeight:           700,
            letterSpacing:        "0.2em",
            background:           "var(--gradient-text)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip:       "text",
          }}>
            KAIROS
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-soft)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            /* Authenticated state */
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span style={{
                fontFamily:    "var(--font-body)",
                fontSize:      "0.75rem",
                color:         "var(--color-gold-warm)",
                letterSpacing: "0.04em",
              }}>
                {userName}
              </span>
              <button
                onClick={() => setShowSignOutConfirm(true)}
                style={{
                  background:    "transparent",
                  border:        "1px solid var(--color-border)",
                  borderRadius:  "var(--radius-full)",
                  padding:       "0.4rem 1rem",
                  color:         "var(--color-muted)",
                  fontFamily:    "var(--font-body)",
                  fontSize:      "0.75rem",
                  cursor:        "pointer",
                  transition:    "all var(--duration-fast) var(--ease-sacred)",
                  minHeight:     "36px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(220,60,60,0.4)"
                  e.currentTarget.style.color       = "#f08080"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)"
                  e.currentTarget.style.color       = "var(--color-muted)"
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            /* Guest state */
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <Link
                href="/login"
                style={{ ...linkStyle, fontSize: "0.8rem" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
              >
                Sign in
              </Link>
              <Link href="/journey">
                <button className="kairos-btn-primary" style={{ padding: "0.5rem 1.5rem", fontSize: "0.8rem" }}>
                  Begin Journey
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          style={{
            display:        "none",
            flexDirection:  "column",
            justifyContent: "center",
            alignItems:     "center",
            width:          "44px",
            height:         "44px",
            padding:        "8px",
            background:     "transparent",
            border:         "none",
            cursor:         "pointer",
            zIndex:         400,
            position:       "relative",
          }}
        >
          <span style={{
            display:      "block",
            width:        "22px",
            height:       "1.5px",
            background:   "var(--color-soft)",
            borderRadius: "2px",
            position:     "absolute",
            transition:   `transform var(--duration-normal) var(--ease-divine), opacity var(--duration-fast) var(--ease-sacred)`,
            transform:    menuOpen ? "rotate(45deg)" : "translateY(-6px)",
          }} />
          <span style={{
            display:      "block",
            width:        "22px",
            height:       "1.5px",
            background:   "var(--color-soft)",
            borderRadius: "2px",
            position:     "absolute",
            transition:   "opacity var(--duration-fast) var(--ease-sacred)",
            opacity:      menuOpen ? 0 : 1,
          }} />
          <span style={{
            display:      "block",
            width:        "22px",
            height:       "1.5px",
            background:   "var(--color-soft)",
            borderRadius: "2px",
            position:     "absolute",
            transition:   `transform var(--duration-normal) var(--ease-divine), opacity var(--duration-fast) var(--ease-sacred)`,
            transform:    menuOpen ? "rotate(-45deg)" : "translateY(6px)",
          }} />
        </button>

        {/* Mobile Dropdown */}
        <div
          className="mobile-menu-dropdown"
          style={{
            position:       "fixed",
            top:            "68px",
            left:           0,
            right:          0,
            bottom:         0,
            background:     "rgba(6, 9, 18, 0.98)",
            backdropFilter: "blur(24px)",
            borderTop:      "1px solid var(--color-border)",
            padding:        "var(--space-8) var(--space-6)",
            display:        "flex",
            flexDirection:  "column",
            gap:            "var(--space-2)",
            zIndex:         350,
            opacity:        menuOpen ? 1 : 0,
            transform:      menuOpen ? "translateY(0)" : "translateY(-8px)",
            pointerEvents:  menuOpen ? "all" : "none",
            transition:     `opacity var(--duration-normal) var(--ease-divine), transform var(--duration-normal) var(--ease-divine)`,
          }}
        >
          {navItems.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily:      "var(--font-heading)",
                fontSize:        "clamp(1.4rem, 5vw, 1.8rem)",
                fontWeight:      300,
                color:           "var(--color-soft)",
                textDecoration:  "none",
                padding:         "var(--space-4) 0",
                borderBottom:    "1px solid var(--color-border)",
                display:         "block",
                opacity:         menuOpen ? 1 : 0,
                transform:       menuOpen ? "translateX(0)" : "translateX(-12px)",
                transition:      `color var(--duration-fast) var(--ease-sacred), opacity var(--duration-normal) var(--ease-divine), transform var(--duration-normal) var(--ease-divine)`,
                transitionDelay: menuOpen ? `${i * 60 + 100}ms` : "0ms",
                minHeight:       "44px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-gold-warm)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-soft)")}
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <div style={{ marginTop: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <p style={{
                fontFamily:    "var(--font-body)",
                fontSize:      "0.8rem",
                color:         "var(--color-gold-warm)",
                letterSpacing: "0.04em",
              }}>
                Signed in as {userName}
              </p>
              <button
                onClick={() => { setMenuOpen(false); setShowSignOutConfirm(true) }}
                style={{
                  background:    "transparent",
                  border:        "1px solid var(--color-border)",
                  borderRadius:  "var(--radius-full)",
                  padding:       "0.75rem 1.5rem",
                  color:         "var(--color-muted)",
                  fontFamily:    "var(--font-body)",
                  fontSize:      "0.85rem",
                  cursor:        "pointer",
                  width:         "100%",
                  minHeight:     "44px",
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ marginTop: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <Link href="/journey" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none" }}>
                <button className="kairos-btn-primary" style={{ fontSize: "1rem", padding: "1rem 2rem", width: "100%", minHeight: "44px" }}>
                  Begin Journey
                </button>
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  textAlign:      "center",
                  fontFamily:     "var(--font-body)",
                  fontSize:       "0.8rem",
                  color:          "var(--color-muted)",
                  textDecoration: "none",
                  padding:        "var(--space-3)",
                  minHeight:      "44px",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                }}
              >
                Sign in
              </Link>
            </div>
          )}

          <div style={{
            position:      "absolute",
            bottom:        "10%",
            right:         "10%",
            width:         "300px",
            height:        "300px",
            background:    "radial-gradient(circle, rgba(240,192,96,0.06) 0%, transparent 70%)",
            borderRadius:  "50%",
            pointerEvents: "none",
          }} />
        </div>

        <style>{`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-menu-btn { display: flex !important; }
          }
          @media (min-width: 769px) {
            .mobile-menu-dropdown { display: none !important; }
          }
        `}</style>
      </nav>
    </>
  )
}