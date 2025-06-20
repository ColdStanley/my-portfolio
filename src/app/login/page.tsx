'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage('Login failed: ' + error.message)
    } else {
      setMessage('Login successful! Redirecting...')
      router.push('/')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">Sign in to your account</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded mb-4 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded mb-4 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded transition duration-200"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      {message && <p className="text-sm text-center text-red-600 dark:text-red-400 mt-4">{message}</p>}

      <p className="text-center text-sm mt-6 text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <a href="/register" className="text-purple-600 hover:underline">Register here</a>
      </p>
    </div>
  )
}