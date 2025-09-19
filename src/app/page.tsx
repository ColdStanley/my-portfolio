import { useHomepageContent } from '@/hooks/useHomepageContent'
import HomePageClient from '@/components/HomePageClient'

// ISR Configuration
export const revalidate = 300 // Revalidate every 5 minutes

async function getHomepageContent() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    console.log('🏠 Server-side fetch starting:', {
      baseUrl,
      fullUrl: `${baseUrl}/api/homepage-content`,
      env: process.env.NODE_ENV
    })

    const response = await fetch(`${baseUrl}/api/homepage-content`, {
      next: { revalidate: 300 }
    })

    console.log('🏠 Server-side fetch response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch homepage content: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('🏠 Server-side data received:', {
      hasData: !!data,
      hasHero: !!data?.hero,
      projectCount: data?.projects?.length || 0,
      status: data?.status
    })

    return data
  } catch (error) {
    console.error('🚨 Server-side fetch error:', error)
    return null
  }
}

export default async function HomePage() {
  // Get static content at build time
  const staticContent = await getHomepageContent()

  return <HomePageClient initialContent={staticContent} />
}