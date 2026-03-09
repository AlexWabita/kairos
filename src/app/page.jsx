import Navbar from "@/components/shared/Navbar"
import Hero   from "@/components/landing/Hero"

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />

      {/* ── PLACEHOLDER SECTIONS ─────────────────────────── */}
      {/* These will be replaced in later steps */}

      {/* About Section */}
      <section
        id="about"
        style={{
          background: "var(--color-void)",
          padding:    "var(--space-24) var(--space-5)",
          textAlign:  "center",
        }}
      >
        <div className="kairos-container">
          <p className="kairos-section-label">What is Kairos?</p>
          <h2
            className="text-heading-lg"
            style={{
              fontFamily:   "var(--font-heading)",
              fontSize:     "clamp(1.8rem, 3vw, 2.8rem)",
              fontWeight:   300,
              lineHeight:   1.4,
              maxWidth:     "640px",
              margin:       "0 auto var(--space-6)",
              color:        "var(--color-divine)",
            }}
          >
            Not a chatbot. Not a church app.
            <br />
            <span style={{ color: "var(--color-gold-warm)", fontStyle: "italic" }}>
              A companion for the searching soul.
            </span>
          </h2>
          <p
            className="text-companion"
            style={{
              maxWidth: "580px",
              margin:   "0 auto",
              color:    "var(--color-soft)",
            }}
          >
            Kairos exists for the people who are spiritually hungry but have
            been burned by religion — those who have questions they are afraid
            to ask, wounds they carry alone, and a quiet sense that truth
            exists somewhere they have not found it yet.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        style={{
          background: "var(--color-deep)",
          padding:    "var(--space-24) var(--space-5)",
        }}
      >
        <div className="kairos-container">
          <p className="kairos-section-label" style={{ textAlign: "center" }}>How It Works</p>
          <h2
            className="text-heading-lg"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize:   "clamp(1.8rem, 3vw, 2.8rem)",
              fontWeight: 300,
              textAlign:  "center",
              marginBottom: "var(--space-10)",
            }}
          >
            Three things. No more.
          </h2>

          <div
            style={{
              display:             "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap:                 "var(--space-5)",
            }}
          >
            {[
              {
                number: "01",
                title:  "Arrive as you are",
                body:   "No account needed. No form to fill. Just share what is on your heart and Kairos meets you exactly where you are.",
              },
              {
                number: "02",
                title:  "Ask anything",
                body:   "Faith questions. Life questions. Cultural confusion. Political tension. Kairos engages every question with honesty and Biblical wisdom — without judgment.",
              },
              {
                number: "03",
                title:  "Walk forward",
                body:   "Every conversation points somewhere real — scripture, reflection, community. Kairos is the door. It always opens outward.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="kairos-card"
                style={{ padding: "var(--space-8) var(--space-6)" }}
              >
                <p
                  style={{
                    fontFamily:    "var(--font-display)",
                    fontSize:      "3rem",
                    fontWeight:    900,
                    letterSpacing: "0.1em",
                    color:         "var(--color-gold-deep)",
                    lineHeight:    1,
                    marginBottom:  "var(--space-4)",
                    opacity:       0.6,
                  }}
                >
                  {item.number}
                </p>
                <h3
                  style={{
                    fontFamily:   "var(--font-heading)",
                    fontSize:     "1.3rem",
                    fontWeight:   400,
                    color:        "var(--color-divine)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  {item.title}
                </h3>
                <p className="text-companion" style={{ color: "var(--color-soft)", fontSize: "1rem" }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scripture Banner */}
      <section
        style={{
          background: "var(--color-void)",
          padding:    "var(--space-16) var(--space-5)",
          textAlign:  "center",
          borderTop:  "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="kairos-container">
          <p
            className="text-scripture"
            style={{
              display:    "inline-block",
              border:     "none",
              padding:    0,
              fontSize:   "clamp(1.1rem, 2vw, 1.4rem)",
              maxWidth:   "600px",
              textAlign:  "center",
            }}
          >
            &ldquo;He has made everything beautiful in its time.&rdquo;
          </p>
          <p
            className="text-label"
            style={{
              marginTop: "var(--space-3)",
              color:     "var(--color-muted)",
            }}
          >
            Ecclesiastes 3:11
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          background:     "var(--gradient-hero)",
          padding:        "var(--space-24) var(--space-5)",
          textAlign:      "center",
          position:       "relative",
          overflow:       "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position:      "absolute",
            inset:         0,
            background:    "var(--gradient-glow)",
            pointerEvents: "none",
          }}
        />
        <div className="kairos-container" style={{ position: "relative", zIndex: 1 }}>
          <p className="kairos-section-label">Begin Now</p>
          <h2
            style={{
              fontFamily:   "var(--font-heading)",
              fontSize:     "clamp(2rem, 4vw, 3.5rem)",
              fontWeight:   300,
              color:        "var(--color-divine)",
              marginBottom: "var(--space-5)",
              lineHeight:   1.3,
            }}
          >
            Your Kairos moment
            <br />
            <span style={{ color: "var(--color-gold-warm)", fontStyle: "italic" }}>
              might be right now.
            </span>
          </h2>
          <p
            className="text-companion"
            style={{
              color:        "var(--color-soft)",
              maxWidth:     "480px",
              margin:       "0 auto var(--space-8)",
            }}
          >
            No account needed. No judgment waiting.
            Just an open door and a question you have been carrying.
          </p>
          <button className="kairos-btn-primary" style={{ fontSize: "1rem", padding: "1rem 3rem" }}>
            Begin Your Journey — It&apos;s Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background:   "var(--color-void)",
          borderTop:    "1px solid var(--color-border)",
          padding:      "var(--space-8) var(--space-5)",
          textAlign:    "center",
        }}
      >
        <div className="kairos-container">
          <span
            style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "1.1rem",
              letterSpacing: "0.2em",
              background:    "var(--gradient-text)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
              backgroundClip: "text",
            }}
          >
            KAIROS
          </span>
          <p className="text-caption" style={{ marginTop: "var(--space-3)" }}>
            A companion for the searching soul. Grounded in truth. Open to everyone.
          </p>
        </div>
      </footer>
    </main>
  )
}
