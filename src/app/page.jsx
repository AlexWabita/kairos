import Navbar          from "@/components/shared/Navbar"
import Footer          from "@/components/shared/Footer"
import Hero            from "@/components/landing/Hero"
import About           from "@/components/landing/About"
import Features        from "@/components/landing/Features"
import HowItWorks      from "@/components/landing/HowItWorks"
import ScriptureBanner from "@/components/landing/ScriptureBanner"
import Testimonials    from "@/components/landing/Testimonials"
import FAQ             from "@/components/landing/FAQ"
import Contact         from "@/components/landing/Contact"

/* ── SEO Metadata ───────────────────────────────────────────── */
export const metadata = {
  title:       "Kairos — A Biblical AI Life Companion",
  description:
    "Kairos is a Biblical AI companion that meets you exactly where you are. Ask hard questions, find peace in scripture, and walk forward — no judgment, no agenda.",
  keywords: [
    "biblical ai", "christian app", "faith companion", "bible study ai",
    "spiritual growth", "prayer app", "christian devotional",
  ],
  authors:      [{ name: "Kairos" }],
  metadataBase: new URL("https://kairos.app"),
  openGraph: {
    title:       "Kairos — A Biblical AI Life Companion",
    description:
      "Ask anything. Find truth. Walk forward. A companion grounded in scripture — built for the searching soul.",
    type:     "website",
    url:      "https://kairos.app",
    siteName: "Kairos",
    images: [
      {
        url:    "/og-image.png",
        width:  1200,
        height: 630,
        alt:    "Kairos — A Biblical AI Life Companion",
      },
    ],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Kairos — A Biblical AI Life Companion",
    description: "Ask hard questions. Find peace in scripture. Walk forward.",
    images:      ["/og-image.png"],
  },
  robots: {
    index:  true,
    follow: true,
  },
}

/* ── Viewport — separate export required by Next.js 15+ ─────── */
export const viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor:   "#060912",
}

/* ── Page ────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <ScriptureBanner />
      <Testimonials />
      <FAQ />
      <Contact />

      {/* ── Final CTA ────────────────────────────────────── */}
      <section
        style={{
          background: "var(--gradient-hero)",
          padding:    "var(--space-24) var(--space-5)",
          textAlign:  "center",
          position:   "relative",
          overflow:   "hidden",
        }}
      >
        <div
          aria-hidden="true"
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
              color:     "var(--color-soft)",
              maxWidth:  "480px",
              margin:    "0 auto var(--space-8)",
            }}
          >
            No account needed. No judgment waiting.
            Just an open door and a question you have been carrying.
          </p>
          <div
            style={{
              display:        "flex",
              gap:            "var(--space-4)",
              justifyContent: "center",
              flexWrap:       "wrap",
            }}
          >
            <a
              href="/journey"
              className="kairos-btn-primary"
              style={{ fontSize: "1rem", padding: "1rem 3rem", textDecoration: "none" }}
            >
              Begin Your Journey — It&apos;s Free
            </a>
            <a
              href="#faq"
              className="kairos-btn-secondary"
              style={{ fontSize: "1rem", padding: "1rem 2rem", textDecoration: "none" }}
            >
              Common Questions
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}