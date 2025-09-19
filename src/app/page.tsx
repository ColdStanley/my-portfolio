import HomePageClient from '@/components/HomePageClient'
import { getHomepageContentData } from '@/lib/homepage-data'

// ISR Configuration
export const revalidate = 300 // Revalidate every 5 minutes

export default async function HomePage() {
  console.log('🏠 Homepage: Starting server-side data fetch')

  // Get content using direct SDK call instead of HTTP fetch
  const staticContent = await getHomepageContentData()

  console.log('🏠 Homepage: Server-side fetch result:', {
    success: !!staticContent,
    hasHero: !!staticContent?.hero,
    projectsCount: staticContent?.projects?.length || 0
  })

  return <HomePageClient initialContent={staticContent} />
}