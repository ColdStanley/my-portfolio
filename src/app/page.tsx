import { getAllHomepageData } from '@/lib/notionHomepage'
import HomePageClient from '@/components/HomePageClient'

// ISR Configuration
export const revalidate = 300 // Revalidate every 5 minutes

export default async function HomePage() {
  console.log('🏠 Starting homepage data fetch...')

  try {
    // Get dynamic content from Notion
    const { navigation, content } = await getAllHomepageData()

    console.log('✅ Homepage data loaded successfully')

    return (
      <HomePageClient
        initialContent={{
          status: 'success',
          ...content
        }}
        navigationData={navigation}
      />
    )

  } catch (error) {
    console.error('❌ Failed to load homepage data:', error)

    // Re-throw the error to trigger Next.js error boundary
    // This ensures problems are immediately visible in development
    throw new Error(`Homepage data loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}