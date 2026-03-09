import "./globals.css"

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
        {/* Preconnect to Google Fonts for faster load */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
