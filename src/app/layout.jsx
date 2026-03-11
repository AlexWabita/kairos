import "./globals.css"
import { SettingsProvider } from "@/context/SettingsContext"

export const metadata = {
  title: "Kairos — Your Appointed Moment",
  description:
    "A spiritually grounded life companion for anyone seeking truth, healing, or direction. Grounded in Biblical wisdom. Open to everyone.",
  keywords: [
    "faith",
    "spiritual guidance",
    "Bible",
    "truth",
    "healing",
    "Christian",
    "life companion",
    "Kairos",
  ],
  openGraph: {
    title: "Kairos — Your Appointed Moment",
    description:
      "A companion grounded in truth — for anyone searching for light in the noise of the world.",
    type: "website",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ── Anti-FOUC: apply theme before React hydrates ─── */}
        {/* Reads kairos_settings from localStorage and sets    */}
        {/* data-theme on <html> synchronously, preventing any  */}
        {/* flash of wrong theme on page load.                  */}
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

        {/* ── Google Fonts ───────────────────────────────────── */}
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* All font families in one request:                    */}
        {/* Cinzel        — display/brand (always fixed)         */}
        {/* Cormorant     — heading: Standard + Pilgrim pairing  */}
        {/* Nunito        — body: Standard pairing               */}
        {/* Playfair      — heading: Scholar pairing             */}
        {/* Lato          — body: Scholar pairing                */}
        {/* Source Sans 3 — body: Pilgrim pairing                */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Nunito:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@400;700&family=Source+Sans+3:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/*
          SettingsProvider is a client component wrapping server children.
          This is the standard Next.js App Router pattern — layout stays
          a server component for metadata support; the provider handles
          all client-side settings logic.
        */}
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  )
}