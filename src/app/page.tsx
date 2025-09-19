import { useHomepageContent } from '@/hooks/useHomepageContent'
import HomePageClient from '@/components/HomePageClient'

// ISR Configuration
export const revalidate = 300 // Revalidate every 5 minutes

async function getHomepageContent() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/homepage-content`, {
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch homepage content')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return null
  }
}

export default async function HomePage() {
  // Get static content at build time
  const staticContent = await getHomepageContent()

  return <HomePageClient initialContent={staticContent} />
}