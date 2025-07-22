'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EnglishReading() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to new language reading structure
    router.replace('/language-reading/english')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-purple-600 mb-4">
          <svg className="w-8 h-8 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <p className="text-gray-600">Redirecting to English Reading Assistant...</p>
      </div>
    </div>
  )
}