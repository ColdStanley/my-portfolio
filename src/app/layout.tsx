import type { Metadata } from "next"
import { Geist, Geist_Mono, Quicksand } from "next/font/google"
import "./globals.css"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import { Toaster } from "sonner"
import Script from "next/script"

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

export const metadata: Metadata = {
  title: "Stanley's Portfolio",
  description: "Personal website for Stanley - content creator & tutor",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
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
      <body className="pt-24 font-sans bg-white text-gray-900">
        <NavBar />
        {children}
        <Footer />
        {/* ✅ Toast 支持（不影响现有样式） */}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
