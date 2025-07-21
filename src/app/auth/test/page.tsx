'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthTest() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        setError(error.message)
      }
      setUser(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signInWithEmail = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    }
  }

  const signUpWithEmail = async () => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) {
        setError(error.message)
      } else {
        setError('Check your email for confirmation link!')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?returnTo=/cestlavie`
        }
      })
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError(error.message)
      } else {
        setUser(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Auth Test</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {user ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-100 border border-green-300 rounded">
              <p className="text-green-700 font-semibold">Authenticated!</p>
              <p className="text-sm text-green-600 mt-2">
                User ID: {user.id}
              </p>
              <p className="text-sm text-green-600">
                Email: {user.email}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={signOut}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={() => router.push('/cestlavie')}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Go to CestLaVie
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">Please sign in to continue</p>
            
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              <div className="flex gap-2">
                <button
                  onClick={signInWithEmail}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={signUpWithEmail}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <button
                onClick={signInWithGoogle}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Sign in with Google
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}