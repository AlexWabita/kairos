import Navbar          from "@/components/shared/HomepageNavbar"
import Footer          from "@/components/shared/Footer"
import Hero            from "@/components/landing/Hero"
import About           from "@/components/landing/About"
import Features        from "@/components/landing/Features"
import HowItWorks      from "@/components/landing/HowItWorks"
import ScriptureBanner from "@/components/landing/ScriptureBanner"
import Testimonials    from "@/components/landing/Testimonials"
import FAQ             from "@/components/landing/FAQ"
import Contact         from "@/components/landing/Contact"
import FinalCTA        from "@/components/landing/FinalCTA"

/* ── SEO ── */
export const metadata = {
  title:       "Kairos — A Biblical AI Life Companion",
  description: "Kairos is a Biblical AI companion that meets you exactly where you are. Ask hard questions, find peace in scripture, and walk forward — no judgment, no agenda.",
  keywords:    ["biblical ai", "christian app", "faith companion", "bible study ai", "spiritual growth", "prayer app", "christian devotional"],
  authors:      [{ name: "Kairos" }],
  metadataBase: new URL("https://kairos-ebon.vercel.app"),
  verification: {
    google: "VRnQo2aiDdytuMbHxXf1kkTeEVHx_0G8WnG9l0gtqBg",
  },
  openGraph: {
    title:       "Kairos — A Biblical AI Life Companion",
    description: "Ask anything. Find truth. Walk forward. A companion grounded in scripture — built for the searching soul.",
    type:        "website",
    url:         "https://kairos-ebon.vercel.app",
    siteName:    "Kairos",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Kairos — A Biblical AI Life Companion" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Kairos — A Biblical AI Life Companion",
    description: "Ask hard questions. Find peace in scripture. Walk forward.",
    images:      ["/og-image.png"],
  },
  robots: { index: true, follow: true },
}

export const viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor:   "#07080f",
}

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
      <FinalCTA />
      <Footer />
    </main>
  )
}