'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'

const projectId = 'new-ielts-speaking' // ✅ Current project ID

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const setUser = useAuthStore((s) => s.setUser)
  const setMembershipTier = useAuthStore((s) => s.setMembershipTier)

  const handleLogin = async () => {
    setLoading(true)
    setMessage('')

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage('Login failed: ' + error.message)
      setLoading(false)
      return
    }

    const user = signInData.user
    if (!user) {
      setMessage('Login succeeded, but failed to retrieve user info.')
      setLoading(false)
      return
    }

    setUser(user)

    const { data, error: tierError } = await supabase
      .from('user_project_membership')
      .select('membership_tier')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single()

    if (data?.membership_tier) {
      setMembershipTier(data.membership_tier)
    } else {
      setMembershipTier('registered')
    }

    setMessage('Login successful. Redirecting...')
    setTimeout(() => {
      router.push(redirectPath)
    }, 1000)

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">Log In</h1>

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
        {loading ? 'Logging in...' : 'Log In'}
      </button>

      {message && <p className="text-sm text-center text-red-600 dark:text-red-400 mt-4">{message}</p>}

      <p className="text-center text-sm mt-6 text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <a href="/register" className="text-purple-600 hover:underline">Sign up here</a>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-gray-500 mt-20">Loading login page...</div>}>
      <LoginPageInner />
    </Suspense>
  )
}
