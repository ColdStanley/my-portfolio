import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "AI Agent Gala | Stanley's Portfolio",
  description: "Comprehensive AI agent ecosystem for various professional and educational applications. IELTS Speaking Practice and advanced AI-powered learning tools.",
}

export default function AIAgentGalaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}