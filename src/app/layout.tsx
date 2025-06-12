import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import { Toaster } from "sonner"
import { Quicksand } from 'next/font/google'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: "Stanley's Portfolio",
  description: "Personal website for Stanley - content creator & tutor",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="pt-24 font-sans bg-white text-gray-900">
        <NavBar />
        {children}
        <Footer />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
