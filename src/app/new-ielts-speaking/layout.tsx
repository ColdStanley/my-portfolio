// src/app/new-ielts-speaking/layout.tsx
export const metadata = {
  title: 'IELTS Speaking 高分范文 · 雅思口语题库精选',
  description:
    'Explore high-scoring sample answers (Band 6–8) for real IELTS Speaking questions. 真实雅思口语题库，涵盖高分范文、关键词解释与表达训练。',
  openGraph: {
    title: 'IELTS Speaking 高分范文 · 雅思口语题库精选',
    description:
      'Explore high-scoring sample answers (Band 6–8) for real IELTS Speaking questions. 真实雅思口语题库，涵盖高分范文、关键词解释与表达训练。',
    url: 'https://stanleyhi.com/new-ielts-speaking',
    siteName: 'StanleyHi',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://stanleyhi.com/og/ielts-speaking-cover.png',
        width: 1200,
        height: 630,
        alt: 'IELTS Speaking Sample Answers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IELTS Speaking 高分范文 · 雅思口语题库精选',
    description:
      '真实雅思口语题库，涵盖高分范文、关键词解释与表达训练。Explore high-scoring sample answers (Band 6–8) for real IELTS Speaking questions.',
    images: ['https://stanleyhi.com/og/ielts-speaking-cover.png'],
  },
  keywords: [
    'IELTS Speaking',
    '雅思口语',
    '雅思口语范文',
    'IELTS Sample Answers',
    'IELTS Speaking Questions',
    '雅思高分技巧',
    'Band 6',
    'Band 7',
    'Band 8',
  ],
}

export default function NewIELTSSpeakingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
