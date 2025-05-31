import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer" // ✅ 添加 Footer 引入

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Stanley's Portfolio",
  description: "Personal website for Stanley - content creator & tutor",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="pt-24 font-sans bg-white text-gray-900">
        <NavBar />
        {children}
        <Footer /> {/* ✅ 添加 Footer */}
      </body>
    </html>
  )
}
