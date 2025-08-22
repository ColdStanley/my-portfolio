import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Readlingua | Stanley's Portfolio",
  description: "42-Language Learning Platform - Advanced language learning system with AI tutoring, pronunciation tools, and adaptive learning paths.",
}

export default function ReadlinguaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}