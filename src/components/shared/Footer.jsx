"use client"

const footerLinks = {
  Product: [
    { label: "Companion",     href: "/journey"       },
    { label: "Bible Reader",  href: "/bible"          },
    { label: "My Journey",    href: "/journey/saved"  },
    { label: "Reading Plans", href: "/plans"          },
    { label: "Settings",      href: "/settings"       },
  ],
  Company: [
    { label: "About Kairos",   href: "#about"        },
    { label: "How It Works",   href: "#how-it-works" },
    { label: "Contact",        href: "#contact"      },
    { label: "Privacy Policy", href: "/privacy"      },
  ],
}

export default function Footer() {
  return (
    <>
      <style>{`
        .footer-link {
          display: block;
          color: var(--color-muted);
          text-decoration: none;
          font-size: 0.875rem;
          margin-bottom: var(--space-2);
          transition: color var(--duration-fast) var(--ease-sacred);
        }
        .footer-link:hover { color: var(--color-gold-warm); }
        .footer-col-label {
          font-family: var(--font-display);
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          color: var(--color-gold-deep);
          text-transform: uppercase;
          margin-bottom: var(--space-3);
        }
      `}</style>

      <footer
        style={{
          background: "var(--color-void)",
          borderTop:  "1px solid var(--color-border)",
          padding:    "var(--space-10) var(--space-5) var(--space-8)",
        }}
      >
        <div
          className="kairos-container"
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap:                 "var(--space-8)",
            marginBottom:        "var(--space-8)",
          }}
        >
          {/* Brand */}
          <div>
            <span
              style={{
                fontFamily:           "var(--font-display)",
                fontSize:             "1.1rem",
                letterSpacing:        "0.2em",
                background:           "var(--gradient-text)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip:       "text",
                display:              "block",
                marginBottom:         "var(--space-3)",
              }}
            >
              KAIROS
            </span>
            <p
              className="text-caption"
              style={{
                color:      "var(--color-muted)",
                lineHeight: 1.7,
                maxWidth:   "220px",
              }}
            >
              A companion for the searching soul.
              Grounded in truth. Open to everyone.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([col, links]) => (
            <div key={col}>
              <p className="footer-col-label">{col}</p>
              {links.map(l => (
                <a key={l.href} href={l.href} className="footer-link">
                  {l.label}
                </a>
              ))}
            </div>
          ))}

          {/* Connect */}
          <div>
            <p className="footer-col-label">Connect</p>
            <a href="#contact" className="footer-link">Send Feedback</a>
            <a href="mailto:kairos.app.official@gmail.com" className="footer-link">
              kairos.app.official@gmail.com
            </a>
            <p
              style={{
                color:      "var(--color-muted)",
                fontSize:   "0.875rem",
                fontStyle:  "italic",
                marginTop:  "var(--space-3)",
                lineHeight: 1.6,
              }}
            >
              Real people.
              <br />
              We read every message.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop:      "1px solid var(--color-border)",
            paddingTop:     "var(--space-5)",
            display:        "flex",
            flexWrap:       "wrap",
            gap:            "var(--space-4)",
            justifyContent: "space-between",
            alignItems:     "center",
          }}
        >
          <p className="text-caption" style={{ color: "var(--color-faint)" }}>
            © {new Date().getFullYear()} Kairos. Built with care for the searching soul.
          </p>
          <div style={{ display: "flex", gap: "var(--space-5)" }}>
            <a href="/privacy" className="footer-link" style={{ marginBottom: 0 }}>Privacy</a>
            <a href="#contact" className="footer-link" style={{ marginBottom: 0 }}>Contact</a>
          </div>
        </div>
      </footer>
    </>
  )
}