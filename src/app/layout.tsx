import type { Metadata } from "next"
import { Geist, Geist_Mono, Quicksand, Dancing_Script, PT_Serif, Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import Script from "next/script"
import CookieConsent from "@/components/CookieConsent"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dancing-script",
})

const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-serif",
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant-garamond",
})

export const metadata: Metadata = {
  title: {
    default: "StanleyHi",
    template: "%s | StanleyHi"
  },
  description: "Personal website for Stanley - content creator & tutor",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${ptSerif.variable} ${cormorantGaramond.variable}`}>
      <head>
        {/* SEO & Social Media Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#111111" />
        <meta name="msapplication-TileColor" content="#111111" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Open Graph default tags */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Stanley Hi Portfolio" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter default tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@stanleyhi" />
        <meta name="twitter:creator" content="@stanleyhi" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//vercel.live" />
        <link rel="dns-prefetch" href="//github.com" />
        
        {/* ✅ Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-RYW791SKJH"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RYW791SKJH');
            `,
          }}
        />
      </head>
      <body className="font-sans bg-white text-gray-900">
        {children}
        {/* ✅ Toast 支持（不影响现有样式） */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'white',
              color: '#111111',
              border: '1px solid #E5E7EB',
            },
          }}
        />
        {/* ✅ Cookie同意弹窗 */}
        <CookieConsent />
      </body>
    </html>
  )
}
