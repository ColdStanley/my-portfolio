import type { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: "C'est La Vie | Stanley's Portfolio",
  description: "Life Management System - Strategy, Plan, and Task management integrated with Notion for seamless productivity.",
}

export default function CestLaVieLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
