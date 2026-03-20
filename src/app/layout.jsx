import "./globals.css"
import { SettingsProvider } from "@/context/SettingsContext"
import ThemeApplier from "@/components/shared/ThemeApplier"

/* ── Metadata ────────────────────────────────────────────────── */
export const metadata = {
  title:        "Kairos — Your Appointed Moment",
  description:
    "A spiritually grounded life companion for anyone seeking truth, healing, or direction. Grounded in Biblical wisdom. Open to everyone.",
  keywords: [
    "faith", "spiritual guidance", "Bible", "truth",
    "healing", "Christian", "life companion", "Kairos",
  ],
  metadataBase: new URL("https://kairos.app"),
  manifest:     "/manifest.json",

  /* ── Icons ──────────────────────────────────────────────── */
  icons: {
    icon:    [
      { url: "/favicon.ico",   sizes: "any"     },
      { url: "/icon.png",      sizes: "512x512", type: "image/png" },
    ],
    apple:   [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },

  /* ── Open Graph ─────────────────────────────────────────── */
  openGraph: {
    title:       "Kairos — Your Appointed Moment",
    description:
      "A companion grounded in truth — for anyone searching for light in the noise of the world.",
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

  /* ── Twitter ─────────────────────────────────────────────── */
  twitter: {
    card:        "summary_large_image",
    title:       "Kairos — Your Appointed Moment",
    description: "A companion grounded in truth — for the searching soul.",
    images:      ["/og-image.png"],
  },

  /* ── Robots ──────────────────────────────────────────────── */
  robots: {
    index:  true,
    follow: true,
  },
}

/* ── Viewport — must be a separate export in Next.js 15+ ─────── */
export const viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor:   "#060912",
}

/* ── Root Layout ─────────────────────────────────────────────── */
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ── Anti-FOUC: apply theme before React hydrates ────
            Reads kairos_settings from localStorage and sets
            data-theme on <html> synchronously, preventing any
            flash of wrong theme on page load.               */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var s = JSON.parse(localStorage.getItem('kairos_settings') || '{}');
                  var theme = s.theme || 'dark';
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = theme === 'dark' || (theme === 'system' && prefersDark);
                  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />

        {/* ── Google Fonts ────────────────────────────────────
            Cinzel        — display/brand (always fixed)
            Cormorant     — heading: Standard + Pilgrim
            Nunito        — body: Standard
            Playfair      — heading: Scholar
            Lato          — body: Scholar
            Source Sans 3 — body: Pilgrim                    */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Nunito:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@400;700&family=Source+Sans+3:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/*
          SettingsProvider is a client component wrapping server children.
          Standard Next.js App Router pattern — layout stays a server
          component for metadata support; provider handles all
          client-side settings logic.
        */}
                
        <SettingsProvider>
            <ThemeApplier />   {/* ← add this */}
            {children}
        </SettingsProvider>
      </body>
    </html>
  )
}