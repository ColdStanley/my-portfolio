'use client'

import { useEffect, useState } from 'react'

interface HomepageContent {
  hero?: {
    title: string
    subtitle: string
    background_video: string
    primary_button_text: string
    primary_button_href: string
    secondary_button_text: string
    secondary_button_href: string
    gradient_text: string
  }
  projects: Array<{
    title: string
    description: string
    benefits: string[]
    button_text: string
    href: string
    gradient: string
    project_images?: string[]
    project_video?: string
    reverse?: boolean
  }>
  more_projects: Array<{
    title: string
    subtitle: string
    description: string
    tech: string
    href: string
  }>
  status: string
}

export default function HomePageClient() {
  const [content, setContent] = useState<HomepageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHomepageContent()
  }, [])

  const fetchHomepageContent = async () => {
    try {
      console.log('🏠 Homepage: Starting client-side data fetch')

      const response = await fetch('/api/homepage-content', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('🏠 Homepage: Client-side fetch success:', {
        hasHero: !!data.hero,
        projectsCount: data.projects?.length || 0,
        moreProjectsCount: data.more_projects?.length || 0
      })

      setContent(data)
    } catch (err) {
      console.error('🚨 Homepage: Client-side fetch failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full animate-pulse mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading homepage content...</p>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ Failed to load homepage content</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchHomepageContent}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <h1 className="text-4xl font-bold text-center py-20">Homepage Working!</h1>

      {content?.hero && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-4">{content.hero.title}</h2>
          <p className="text-gray-600">{content.hero.subtitle}</p>
        </div>
      )}

      {content?.projects && (
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-xl font-semibold mb-4">Projects ({content.projects.length})</h3>
          {content.projects.map((project, index) => (
            <div key={index} className="border p-4 mb-4 rounded-lg bg-white">
              <h4 className="font-medium">{project.title}</h4>
              <p className="text-gray-600 text-sm">{project.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}