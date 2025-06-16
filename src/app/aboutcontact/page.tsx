'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-6 md:px-12 bg-gray-50 dark:bg-background">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {/* 页面标题 */}
        <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-300">
          About & Contact
        </h1>

        {/* 主句 */}
        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
          I built this space not just to speak, but to listen.
        </p>

        {/* 补充说明 */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          If something here resonates with you—I'd love to hear from you.
        </p>

        {/* 链接部分 */}
        <div className="text-sm space-x-1">
          <Link
            href="https://stanleyhi.com/feelink"
            className="text-purple-600 underline underline-offset-2 hover:text-purple-800 transition-colors"
          >
            A Feelink
          </Link>
          <span className="text-gray-600 dark:text-gray-400">or</span>
          <a
            href="mailto:stanleytonight@hotmail.com"
            className="text-purple-600 font-medium hover:text-purple-800 transition-colors"
          >
            stanleytonight@hotmail.com
          </a>
        </div>
      </div>
    </main>
  )
}
