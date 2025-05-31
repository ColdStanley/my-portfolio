'use client'

import Link from 'next/link'
import { Github, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-gradient-to-t from-white to-purple-50 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10">
        {/* 主体内容三栏布局 */}
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* 左侧：Logo */}
          <div className="flex-shrink-0">
            <h2 className="text-xl font-bold text-purple-700">Stanley</h2>
          </div>

          {/* 中间：导航链接（靠左一点） */}
          <div className="flex flex-col gap-1 text-sm text-gray-700 md:pl-16">
            <Link href="/" className="hover:text-purple-600">Home</Link>
            <Link href="/tech-career" className="hover:text-purple-600">Technology</Link>
            <Link href="/tutor" className="hover:text-purple-600">Knowledge</Link>
            <Link href="/projects" className="hover:text-purple-600">Life</Link>
            <Link href="/contact" className="hover:text-purple-600">Contact</Link>
            <Link href="/about" className="hover:text-purple-600">About</Link>
          </div>

          {/* 右侧：完整联系方式 + 图标 */}
          <div className="flex flex-col gap-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <Linkedin className="h-4 w-4 mt-1 text-purple-700" />
              <div>
                <span className="font-medium">LinkedIn:</span>{' '}
                <a
                  href="https://www.linkedin.com/in/stanleyeleven"
                  target="_blank"
                  className="text-purple-700 hover:underline break-all"
                >
                  https://www.linkedin.com/in/stanleyeleven
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Github className="h-4 w-4 mt-1 text-purple-700" />
              <div>
                <span className="font-medium">GitHub:</span>{' '}
                <a
                  href="https://github.com/ColdStanley"
                  target="_blank"
                  className="text-purple-700 hover:underline break-all"
                >
                  https://github.com/ColdStanley
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-1 text-purple-700" />
              <div>
                <span className="font-medium">Email:</span>{' '}
                <a
                  href="mailto:stanleytonight@hotmail.com"
                  className="text-purple-700 hover:underline break-all"
                >
                  stanleytonight@hotmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 底部版权说明 */}
        <div className="text-center text-xs text-gray-500 pt-6 border-t border-gray-100">
          © 2025 Stanley. Built with ❤️ using Next.js and Tailwind CSS.
        </div>
      </div>
    </footer>
  )
}
