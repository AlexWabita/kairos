"use client"

import { useState, useEffect } from "react"
import { usePathname }         from "next/navigation"
import { useSettings }         from "@/context/SettingsContext"
import { useAuthState }        from "@/hooks/useAuthState"

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const css = `
  @keyframes st-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .st-layout {
    display: grid;
    grid-template-columns: 220px 1fr;
    min-height: 100vh;
  }
  .st-sidebar {
    position: sticky; top: 0; height: 100vh;
    display: flex; flex-direction: column;
    background: rgba(8,10,18,0.98);
    border-right: 1px solid rgba(255,255,255,0.06);
    padding: 24px 14px;
    overflow-y: auto; scrollbar-width: none;
  }
  .st-sidebar::-webkit-scrollbar { display: none; }
  .st-main { padding: 48px 48px 80px; min-width: 0; }

  .st-nav-link {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 8px;
    text-decoration: none; border: none;
    background: transparent; width: 100%;
    cursor: pointer; transition: background 0.15s ease;
    min-height: 40px; text-align: left;
    font-family: var(--font-body); font-size: 0.82rem;
  }
  .st-nav-link:hover  { background: rgba(255,255,255,0.05); }
  .st-nav-link.active { background: rgba(255,255,255,0.08); }

  .st-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 28px;
    animation: st-fade 0.4s ease both;
  }

  .st-opt {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 8px 16px; border-radius: 10px; cursor: pointer;
    font-family: var(--font-body); font-size: 0.82rem;
    transition: all 0.15s ease; min-height: 38px;
    border: 1px solid rgba(255,255,255,0.08);
    background: transparent; color: rgba(255,255,255,0.4);
    gap: 7px; white-space: nowrap;
  }
  .st-opt:hover  { border-color: rgba(255,255,255,0.16); color: rgba(255,255,255,0.75); }
  .st-opt.active { border-color: var(--color-gold-warm); background: rgba(var(--accent-rgb,240,192,96),0.1); color: var(--color-gold-warm); }

  .st-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    gap: 20px;
  }
  .st-row:last-child { border-bottom: none; padding-bottom: 0; }
  .st-row:first-child { padding-top: 0; }

  /* Toggle */
  .st-toggle {
    width: 44px; height: 24px; border-radius: 100px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    position: relative; cursor: pointer; flex-shrink: 0;
    transition: all 0.2s ease;
  }
  .st-toggle.on { background: rgba(var(--accent-rgb,240,192,96),0.2); border-color: rgba(var(--accent-rgb,240,192,96),0.5); }
  .st-thumb {
    position: absolute; top: 2px; left: 2px;
    width: 18px; height: 18px; border-radius: 50%;
    background: rgba(255,255,255,0.3);
    transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
  }
  .st-toggle.on .st-thumb { transform: translateX(20px); background: var(--color-gold-warm); }

  /* Palette swatch */
  .st-swatch {
    width: 32px; height: 32px; border-radius: 50%;
    cursor: pointer; border: 2px solid transparent;
    transition: all 0.15s ease; flex-shrink: 0;
  }
  .st-swatch.active { border-color: rgba(255,255,255,0.9); transform: scale(1.1); }
  .st-swatch:hover  { transform: scale(1.08); }

  .st-mobile-nav { display: none; }

  @media (max-width: 768px) {
    .st-layout { grid-template-columns: 1fr; }
    .st-sidebar { display: none; }
    .st-main { padding: 28px 16px 80px; }
    .st-mobile-nav { display: flex; }
  }
  @media (max-width: 480px) {
    .st-main { padding: 20px 12px 80px; }
    .st-row { flex-wrap: wrap; }
  }
`

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const NAV = [
  { label: "Companion", href: "/journey",       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { label: "Saved",     href: "/journey/saved", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> },
  { label: "Bible",     href: "/bible",         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { label: "Plans",     href: "/plans",         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label: "Account",   href: "/account",       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: "Settings",  href: "/settings",      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
]

const ACCENT_PALETTES = [
  { key: "gold",   label: "Golden Hour", color: "#f0c060" },
  { key: "blue",   label: "Ocean",       color: "#60b4f0" },
  { key: "purple", label: "Dusk",        color: "#c090f0" },
  { key: "green",  label: "Forest",      color: "#60d090" },
  { key: "rose",   label: "Rose",        color: "#f090b0" },
]

const READING_FONTS = [
  { value: "default", label: "Kairos",       preview: "Aa" },
  { value: "serif",   label: "Serif",        preview: "Aa" },
  { value: "mono",    label: "Monospace",    preview: "Aa" },
]

function getInitials(name) {
  if (!name) return "K"
  const parts = name.trim().split(" ")
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0][0].toUpperCase()
}

/* ─────────────────────────────────────────────────────────────
   SHARED COMPONENTS
───────────────────────────────────────────────────────────── */
function Sidebar({ pathname, displayName, initials }) {
  return (
    <nav className="st-sidebar">
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
            <a key={item.href} href={item.href} className={`st-nav-link${active ? " active" : ""}`} style={{ color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)" }}>
              <span style={{ color: active ? "var(--color-gold-warm)" : "rgba(255,255,255,0.25)", flexShrink: 0 }}>{item.icon}</span>
              {item.label}
              {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "var(--color-gold-warm)", flexShrink: 0 }} />}
            </a>
          )
        })}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14, marginTop: 12 }}>
        <a href="/account" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", padding: "8px 10px", borderRadius: 10, transition: "background 0.15s ease" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,rgba(240,192,96,0.2),rgba(200,140,40,0.2))", border: "1px solid rgba(240,192,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "0.52rem", color: "var(--color-gold-warm)", flexShrink: 0 }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{displayName}</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(255,255,255,0.2)", margin: "1px 0 0" }}>View account →</p>
          </div>
        </a>
      </div>
    </nav>
  )
}

function MobileNav({ pathname }) {
  return (
    <div className="st-mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 58, zIndex: 100, background: "rgba(8,10,18,0.96)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "space-around", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {NAV.slice(0, 5).map(item => {
        const active = pathname === item.href
        return (
          <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", color: active ? "var(--color-gold-warm)" : "rgba(255,255,255,0.3)", minWidth: 44, minHeight: 44, justifyContent: "center" }}>
            {item.icon}
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.45rem", letterSpacing: "0.08em" }}>{item.label}</span>
          </a>
        )
      })}
    </div>
  )
}

function Section({ title, description, icon, children, delay = "0s" }) {
  return (
    <div className="st-card" style={{ animationDelay: delay }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 22, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(var(--accent-rgb,240,192,96),0.07)", border: "1px solid rgba(var(--accent-rgb,240,192,96),0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-gold-warm)", flexShrink: 0, marginTop: 1 }}>
          {icon}
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 500, color: "rgba(255,255,255,0.82)", margin: "0 0 3px" }}>{title}</h2>
          {description && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.77rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.6, margin: 0 }}>{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function SettingRow({ label, hint, children }) {
  return (
    <div className="st-row">
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.4 }}>{label}</p>
        {hint && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", margin: "3px 0 0", lineHeight: 1.5 }}>{hint}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ value, onChange, disabled = false }) {
  return (
    <div className={`st-toggle${value ? " on" : ""}`}
      onClick={() => !disabled && onChange(!value)}
      role="switch" aria-checked={value} aria-disabled={disabled}
      tabIndex={0}
      onKeyDown={e => { if (!disabled && (e.key === "Enter" || e.key === " ")) onChange(!value) }}
      style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <div className="st-thumb" />
    </div>
  )
}

function OptionGroup({ options, value, onChange, vertical = false }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flexDirection: vertical ? "column" : "row" }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`st-opt${value === opt.value ? " active" : ""}`}
          style={opt.style || {}}>
          {opt.icon && <span style={{ flexShrink: 0 }}>{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   NOTIFICATION PERMISSION COMPONENT
   Handles the real browser Notification.requestPermission() flow.
───────────────────────────────────────────────────────────── */
function NotificationToggle({ label, hint, settingKey, value, onChange }) {
  const [permState, setPermState] = useState("default")

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermState(Notification.permission)
    }
  }, [])

  const handleToggle = async (newVal) => {
    if (!newVal) {
      onChange(false)
      return
    }

    // Notifications not supported
    if (typeof Notification === "undefined") {
      alert("Your browser does not support notifications.")
      return
    }

    // Already denied — can only be changed in browser settings
    if (Notification.permission === "denied") {
      alert("Notifications are blocked by your browser. Please enable them in your browser's site settings, then try again.")
      return
    }

    // Request permission if not yet granted
    if (Notification.permission !== "granted") {
      const result = await Notification.requestPermission()
      setPermState(result)
      if (result !== "granted") return  // user declined — don't enable
    }

    onChange(true)
  }

  const isBlocked = permState === "denied"

  return (
    <div className="st-row">
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", margin: 0 }}>{label}</p>
        {isBlocked ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "#f08080", margin: "3px 0 0", lineHeight: 1.5 }}>
            Blocked by browser — enable in site settings to use this.
          </p>
        ) : hint ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", margin: "3px 0 0", lineHeight: 1.5 }}>{hint}</p>
        ) : null}
      </div>
      <Toggle value={value && !isBlocked} onChange={handleToggle} disabled={isBlocked} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const pathname = usePathname()
  const { settings, updateSetting, resetSettings } = useSettings()
  const { user } = useAuthState()

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Friend"
  const initials    = getInitials(displayName)

  const currentAccent = settings.accentColor || "gold"
  const currentFont   = settings.readingFont  || "default"

  return (
    <>
      <style>{css}</style>

      <div style={{ background: "var(--color-void)", minHeight: "100vh" }}>
        <div aria-hidden="true" style={{ position: "fixed", top: "30%", left: "-5%", width: 300, height: 300, background: "radial-gradient(circle,rgba(var(--accent-rgb,240,192,96),0.03) 0%,transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

        <div className="st-layout" style={{ position: "relative", zIndex: 1 }}>
          <Sidebar pathname={pathname} displayName={displayName} initials={initials} />

          <main className="st-main">

            {/* Header */}
            <div style={{ marginBottom: 36 }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--color-gold-warm)", opacity: 0.7, marginBottom: 12 }}>Settings</p>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 300, color: "var(--color-divine)", lineHeight: 1.25, margin: "0 0 8px" }}>
                Personalise <em style={{ color: "var(--color-gold-warm)" }}>Kairos</em>
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-muted)", lineHeight: 1.7, maxWidth: 480 }}>
                Changes apply instantly and are saved to your device.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 660 }}>

              {/* ── APPEARANCE ── */}
              <Section delay="0.04s" title="Appearance" description="How Kairos looks across the entire app."
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>}
              >
                {/* Theme */}
                <SettingRow label="Theme" hint="Dark is easier on the eyes for late-night reflection.">
                  <OptionGroup
                    value={settings.theme || "dark"}
                    onChange={v => updateSetting("theme", v)}
                    options={[
                      { value: "dark",   label: "Dark",   icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> },
                      { value: "light",  label: "Light",  icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg> },
                      { value: "system", label: "System", icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
                    ]}
                  />
                </SettingRow>

                {/* Accent colour */}
                <SettingRow label="Accent colour" hint="Applies to buttons, highlights, active states, and the companion's response style.">
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {ACCENT_PALETTES.map(p => (
                      <div key={p.key} title={p.label}>
                        <div
                          className={`st-swatch${currentAccent === p.key ? " active" : ""}`}
                          style={{ background: p.color }}
                          onClick={() => updateSetting("accentColor", p.key)}
                          role="radio"
                          aria-checked={currentAccent === p.key}
                          aria-label={p.label}
                          tabIndex={0}
                          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") updateSetting("accentColor", p.key) }}
                        />
                      </div>
                    ))}
                  </div>
                </SettingRow>

                {/* Accent label */}
                <div style={{ paddingBottom: 4 }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-gold-warm)", opacity: 0.7 }}>
                    {ACCENT_PALETTES.find(p => p.key === currentAccent)?.label || "Golden Hour"}
                  </p>
                </div>
              </Section>

              {/* ── READING / TYPOGRAPHY ── */}
              <Section delay="0.08s" title="Reading & Typography" description="Controls text appearance in the Bible reader and companion."
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>}
              >
                {/* Reading font */}
                <SettingRow label="Reading font" hint="Applies to scripture text and companion responses.">
                  <div style={{ display: "flex", gap: 6 }}>
                    {READING_FONTS.map(f => (
                      <button key={f.value}
                        onClick={() => updateSetting("readingFont", f.value)}
                        className={`st-opt${currentFont === f.value ? " active" : ""}`}
                        style={{
                          fontFamily: f.value === "serif" ? "Georgia,serif" : f.value === "mono" ? "monospace" : "var(--font-heading)",
                          fontSize: "0.88rem", minWidth: 64,
                        }}
                      >
                        {f.preview}
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", marginLeft: 4 }}>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </SettingRow>

                {/* Bible translation */}
                <SettingRow label="Default translation" hint="Used in the Bible reader and any scripture references in conversations.">
                  <OptionGroup
                    value={settings.bibleTranslation || "WEB"}
                    onChange={v => updateSetting("bibleTranslation", v)}
                    options={[
                      { value: "WEB", label: "WEB" },
                      { value: "KJV", label: "KJV" },
                      { value: "ASV", label: "ASV" },
                      { value: "BBE", label: "BBE" },
                    ]}
                  />
                </SettingRow>

                {/* Font size */}
                <SettingRow label="Text size" hint="Applies in the Bible reader.">
                  <OptionGroup
                    value={settings.fontSize || "md"}
                    onChange={v => updateSetting("fontSize", v)}
                    options={[
                      { value: "sm", label: "Small",  style: { fontSize: "0.75rem" } },
                      { value: "md", label: "Medium", style: { fontSize: "0.82rem" } },
                      { value: "lg", label: "Large",  style: { fontSize: "0.92rem" } },
                    ]}
                  />
                </SettingRow>

                {/* Line spacing */}
                <SettingRow label="Line spacing" hint="More breathing room between lines for easier reading.">
                  <OptionGroup
                    value={settings.lineSpacing || "normal"}
                    onChange={v => updateSetting("lineSpacing", v)}
                    options={[
                      { value: "tight",  label: "Tight"    },
                      { value: "normal", label: "Normal"   },
                      { value: "loose",  label: "Spacious" },
                    ]}
                  />
                </SettingRow>
              </Section>

              {/* ── COMPANION ── */}
              <Section delay="0.12s" title="Companion" description="Control what the companion shows you before and during conversations."
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
              >
                <SettingRow label="Verse of the Day" hint="Shows a daily scripture card before conversations begin.">
                  <Toggle value={settings.showVotD !== false} onChange={v => updateSetting("showVotD", v)} />
                </SettingRow>
                <SettingRow label="Active reading plan card" hint="Shows your current plan and progress on the companion home.">
                  <Toggle value={settings.showActivePlan !== false} onChange={v => updateSetting("showActivePlan", v)} />
                </SettingRow>
                <SettingRow label="Example prompts" hint="Shows suggested conversation starters when the chat is empty.">
                  <Toggle value={settings.showExamplePrompts !== false} onChange={v => updateSetting("showExamplePrompts", v)} />
                </SettingRow>
              </Section>

              {/* ── NOTIFICATIONS ── */}
              <Section delay="0.16s" title="Notifications" description="Kairos will ask for browser notification permission the first time you enable these."
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
              >
                <NotificationToggle
                  label="Daily reading reminder"
                  hint="A gentle nudge to continue your reading plan each day."
                  settingKey="dailyReminder"
                  value={settings.dailyReminder === true}
                  onChange={v => updateSetting("dailyReminder", v)}
                />
                <NotificationToggle
                  label="Verse of the Day"
                  hint="Receive today's verse as a browser notification each morning."
                  settingKey="votdNotification"
                  value={settings.votdNotification === true}
                  onChange={v => updateSetting("votdNotification", v)}
                />
              </Section>

              {/* ── RESET ── */}
              <div style={{ paddingTop: 4, animation: "st-fade 0.4s ease 0.2s both" }}>
                <button
                  onClick={() => { if (window.confirm("Reset all settings to defaults?")) resetSettings() }}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "8px 16px", borderRadius: 9,
                    background: "transparent",
                    borderWidth: 1, borderStyle: "solid", borderColor: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.28)",
                    fontFamily: "var(--font-body)", fontSize: "0.78rem",
                    cursor: "pointer", transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.28)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.7"/></svg>
                  Reset to defaults
                </button>
              </div>

            </div>
          </main>
        </div>
      </div>

      <MobileNav pathname={pathname} />
    </>
  )
}