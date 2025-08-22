import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "JD2CV | Stanley's Portfolio",
  description: "Resume Automation Engine - Intelligent resume generation that automatically analyzes job requirements and creates perfectly tailored professional documents.",
}

export default function JD2CVLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}