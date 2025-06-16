'use client'

import { Mail, Github, Linkedin } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-6 md:px-12 bg-gray-50 dark:bg-background">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-300 mb-2">
            About & Contact
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Learn more about this project and how to get in touch.
          </p>
        </div>

        {/* About 区块 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">About</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            This website is built as a creative expression platform to explore ideas in technology,
            knowledge, and everyday life. Designed and developed by Stanley, it reflects a passion
            for interactive design, media storytelling, and digital experiences.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            It also serves as a portfolio, sharing personal experiments with AI tools, coding projects,
            music performance, language learning, and more.
          </p>
        </section>

        {/* Contact 区块 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Contact</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Feel free to reach out through the following channels:
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <ContactCard
              icon={<Mail className="w-5 h-5 text-purple-600" />}
              title="Email"
              link="mailto:stanleytonight@hotmail.com"
              text="stanleytonight@hotmail.com"
            />
            <ContactCard
              icon={<Github className="w-5 h-5 text-purple-600" />}
              title="GitHub"
              link="https://github.com/stanleytonight"
              text="@stanleytonight"
            />
            <ContactCard
              icon={<Linkedin className="w-5 h-5 text-purple-600" />}
              title="LinkedIn"
              link="https://www.linkedin.com/in/stanleytonight/"
              text="Stanley Dong"
            />
          </div>
        </section>
      </div>
    </main>
  )
}

function ContactCard({
  icon,
  title,
  link,
  text,
}: {
  icon: React.ReactNode
  title: string
  link: string
  text: string
}) {
  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 border rounded-xl p-4 shadow-sm hover:shadow-md transition-all w-full md:w-1/3 bg-white dark:bg-[#1f1f1f]"
    >
      <div className="shrink-0">{icon}</div>
      <div>
        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{title}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 break-all">{text}</div>
      </div>
    </Link>
  )
}
