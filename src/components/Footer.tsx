'use client'

import { Github, Linkedin, Mail } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

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
        {/* 上方主区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* 左侧联系信息 */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400">StanleyHi</h2>

            <div className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <Linkedin className="h-4 w-4 mt-1 text-purple-700 dark:text-purple-300" />
                <div>
                  <span className="font-medium">LinkedIn:</span>{' '}
                  <a
                    href="https://www.linkedin.com/in/stanleyeleven"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 dark:text-purple-300 hover:underline break-all"
                  >
                    https://www.linkedin.com/in/stanleyeleven
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Github className="h-4 w-4 mt-1 text-purple-700 dark:text-purple-300" />
                <div>
                  <span className="font-medium">GitHub:</span>{' '}
                  <a
                    href="https://github.com/ColdStanley"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 dark:text-purple-300 hover:underline break-all"
                  >
                    https://github.com/ColdStanley
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-1 text-purple-700 dark:text-purple-300" />
                <div>
                  <span className="font-medium">Email:</span>{' '}
                  <a
                    href="mailto:stanleytonight@hotmail.com"
                    className="text-purple-700 dark:text-purple-300 hover:underline break-all"
                  >
                    stanleytonight@hotmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧订阅表单 / 成功提示 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">
              Subscribe to Updates
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get occasional updates on new posts or projects.
            </p>

            {subscribed ? (
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                ✅ Thanks for subscribing! We'll be in touch soon.
              </p>
            ) : (
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
            )}
          </div>
        </div>

        {/* 下方版权区域 */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-6 border-t border-gray-100 dark:border-gray-800 font-medium">
          © 2025 Built with ❤️ using Next.js and Tailwind CSS by{' '}
          <motion.span
            className="font-bold text-purple-700 dark:text-purple-300 inline-block"
            animate={{ y: [0, -2, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Stanley
          </motion.span>
        </div>
      </div>
    </footer>
  )
}
