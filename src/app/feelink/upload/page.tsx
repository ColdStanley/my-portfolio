'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PicGameUploadPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to main feelink page since creation is now embedded in header
    router.replace('/feelink')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-purple-600 font-medium">Redirecting to Feelink...</p>
      </div>
    </div>
  )
}