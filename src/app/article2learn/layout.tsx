import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Article2Learn - Language Learning Tool',
  description: 'Learn languages by reading articles',
}

export default function Article2LearnLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
