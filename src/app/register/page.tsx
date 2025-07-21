'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'

const projectId = 'cestlavie'

function RegisterPageInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const setUser = useAuthStore((s) => s.setUser)
  const setMembershipTier = useAuthStore((s) => s.setMembershipTier)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get('redirect') || '/'

  const handleRegister = async () => {
    setLoading(true)
    setMessage('')

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setMessage(`Registration failed: ${signUpError.message}`)
      setLoading(false)
      return
    }

    const user = signUpData.user
    if (!user) {
      setMessage('Registered, but failed to retrieve user ID.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('user_product_membership').insert([
      {
        user_id: user.id,
        product_id: projectId,
        membership_tier: 'registered',
        invite_code: inviteCode || null,
        joined_at: new Date().toISOString(),
      },
    ])

    if (insertError) {
      console.error('Failed to insert membership:', insertError)
      setMessage(`Registered, but failed to assign membership: ${insertError.message}`)
      setLoading(false)
      return
    }

    setUser(user)
    setMembershipTier('registered')

    setMessage('Registration successful! Redirecting...')
    setTimeout(() => {
      router.push(redirectPath)
    }, 1200)

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Create Your Account</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 mb-3 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 mb-3 rounded"
      />
      <input
        type="text"
        placeholder="Invite code (optional)"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        className="w-full border p-2 mb-3 rounded"
      />

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
      >
        {loading ? 'Registering...' : 'Register Now'}
      </button>

      {message && <p className="mt-4 text-sm text-center text-gray-700">{message}</p>}
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-gray-500 mt-20">Loading registration page...</div>}>
      <RegisterPageInner />
    </Suspense>
  )
}
