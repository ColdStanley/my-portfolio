// src/app/new-ielts-speaking/layout.tsx

import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { TabProvider } from './context/TabContext'
import SideNavigation from './components/SideNavigation'
import MobileTabNavigation from './components/MobileTabNavigation'

export const metadata: Metadata = {
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
  return (
    <TabProvider>
      <div className="flex min-h-screen font-sans text-gray-800 relative">
        {/* 左侧固定导航栏（仅桌面端） */}
        <div className="hidden md:block">
          <SideNavigation />
        </div>

        {/* 移动端右上角竖排按钮 */}
        <MobileTabNavigation />

        {/* 右侧主内容区域 */}
        <main className="w-full md:ml-56 flex-1 flex flex-col justify-start gap-8 px-4 md:px-6 py-4 md:py-6 scroll-smooth pt-16 md:pt-6 max-w-none min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
      <Toaster richColors position="top-center" />
    </TabProvider>
  )
}
