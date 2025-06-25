'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        toast.success(`✅ Thanks for subscribing: ${email}`)
        setSubscribed(true)
      } else {
        toast.error('❌ Subscribe failed. Please try again later.')
      }
    } catch (error) {
      toast.error('❌ Network error. Please try again.')
      console.error('Subscribe error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-700 bg-gradient-to-t from-white to-purple-50 dark:from-black dark:to-gray-900 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10">
        {/* 三栏内容区域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {/* 左栏 */}
          <div className="flex flex-col justify-start gap-4">
            <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400">StanleyHi</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Empowering ideas through code, content, and creativity.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Serving worldwide with ❤️ from Canada.
            </p>
            <p className="flex items-baseline">
              <Mail className="w-4 h-4 mr-2 mt-[1px] text-purple-700 dark:text-purple-300" />
              <a href="mailto:stanleytonight@hotmail.com" className="hover:underline">
                stanleytonight@hotmail.com
              </a>
            </p>
            <p>Fifth Ave, Ottawa, Ontario K1S 5K4, Canada</p>
          </div>

          {/* 中栏 */}
          <div className="flex flex-col justify-start gap-4">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">Explore</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/feelink"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                >
                  Feelink
                </a>
              </li>
              <li>
                <a
                  href="/ielts-speaking"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                >
                  IELTS Speaking
                </a>
              </li>
              
            </ul>
          </div>

          {/* 右栏 */}
          <div id="subscribe" className="flex flex-col justify-start gap-4 pt-1">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">Subscribe</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get occasional updates on new projects or posts.
            </p>

            {subscribed ? (
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                ✅ Thanks for subscribing! We'll be in touch soon.
              </p>
            ) : (
              <>
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row gap-3"
                  aria-label="Subscribe to newsletter"
                >
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!email}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={`min-w-[120px] px-4 py-2 rounded-md text-white font-medium transition-all ${
                      loading
                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed animate-pulse'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {loading ? 'Submitting...' : 'Subscribe'}
                  </button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No spam. Unsubscribe anytime. Join 100+ readers.
                </p>
              </>
            )}
          </div>
        </div>

        {/* 法律声明 / 版权区 */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-6 border-t border-gray-100 dark:border-gray-800 font-medium">
          © 2025 StanleyHi. All rights reserved. Use of this site constitutes acceptance of implied terms.
        </div>
      </div>
    </footer>
  )
}
