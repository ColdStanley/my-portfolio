import { useState, useEffect } from 'react'

interface HeroData {
  title: string
  subtitle: string
  background_video: string
  primary_button_text: string
  primary_button_href: string
  secondary_button_text: string
  secondary_button_href: string
  gradient_text: string
}

interface ProjectData {
  title: string
  description: string
  benefits: string[]
  button_text: string
  href: string
  gradient: string
  reverse?: boolean
}

interface MoreProjectData {
  title: string
  description: string
  href: string
}

interface HomepageContent {
  hero?: HeroData
  projects: ProjectData[]
  more_projects: MoreProjectData[]
  status: string
}

export function useHomepageContent() {
  const [content, setContent] = useState<HomepageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/homepage-content')
        if (!response.ok) {
          throw new Error('Failed to fetch homepage content')
        }
        const data = await response.json()
        setContent(data)
      } catch (err) {
        console.error('Failed to fetch homepage content:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // No fallback during testing
        setContent(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [])

  return { content, isLoading, error }
}