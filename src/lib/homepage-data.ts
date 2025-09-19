import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

interface HomepageContentItem {
  id: string
  section_type: string
  title: string
  description: string
  subtitle?: string
  benefits: string[]
  button_text: string
  href: string
  primary_button_text?: string
  primary_button_href?: string
  secondary_button_text?: string
  secondary_button_href?: string
  background_video?: string
  gradient_text?: string
  gradient: string
  order: number
  status: string
  tech?: string
  project_images?: string[]
  project_video?: string
}

interface FormattedContent {
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

export async function getHomepageContentData(): Promise<FormattedContent | null> {
  try {
    const databaseId = process.env.NOTION_HOMEPAGE_CONTENT_DB_ID

    if (!databaseId) {
      console.error('❌ Homepage content database ID not configured')
      return null
    }

    console.log('🔍 Direct SDK call - Environment check:', {
      NOTION_API_KEY: process.env.NOTION_API_KEY ? '✅ Present' : '❌ Missing',
      NOTION_HOMEPAGE_CONTENT_DB_ID: databaseId,
      NODE_ENV: process.env.NODE_ENV
    })

    // Add timeout wrapper for Notion API call
    const fetchWithTimeout = async (timeout = 10000) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await notion.databases.query({
          database_id: databaseId,
          filter: {
            property: 'status',
            select: {
              equals: 'active'
            }
          },
          sorts: [
            {
              property: 'order',
              direction: 'ascending'
            }
          ]
        })

        clearTimeout(timeoutId)
        return response
      } catch (error) {
        clearTimeout(timeoutId)
        if (controller.signal.aborted) {
          throw new Error('Notion API request timed out')
        }
        throw error
      }
    }

    const response = await fetchWithTimeout()

    // Parse Notion data
    const items: HomepageContentItem[] = response.results.map((page: any) => {
      const properties = page.properties

      // Parse benefits from multi-line text
      const benefitsText = properties.benefits?.rich_text?.[0]?.text?.content || ''
      const benefits = benefitsText.split('\n').filter(line => line.trim())

      return {
        id: page.id,
        section_type: properties.section_type?.select?.name || '',
        title: properties.title?.rich_text?.[0]?.text?.content || '',
        description: properties.description?.rich_text?.[0]?.text?.content || '',
        subtitle: properties.subtitle?.rich_text?.[0]?.text?.content || '',
        benefits: benefits,
        button_text: properties.button_text?.rich_text?.[0]?.text?.content || '',
        href: properties.href?.url || '',
        primary_button_text: properties.primary_button_text?.rich_text?.[0]?.text?.content || '',
        primary_button_href: properties.primary_button_href?.url || '',
        secondary_button_text: properties.secondary_button_text?.rich_text?.[0]?.text?.content || '',
        secondary_button_href: properties.secondary_button_href?.url || '',
        background_video: properties.background_video?.files?.[0]?.file?.url || '',
        gradient_text: properties.gradient_text?.rich_text?.[0]?.text?.content || '',
        gradient: properties.gradient?.rich_text?.[0]?.text?.content || '',
        tech: properties.tech?.rich_text?.[0]?.text?.content || '',
        project_images: properties.project_image?.files?.map((file: any) => file.file?.url).filter(Boolean) || [],
        project_video: properties.project_video?.files?.[0]?.file?.url || '',
        order: properties.order?.number || 0,
        status: properties.status?.select?.name || '',
      }
    })

    // Build structured content
    const heroItem = items.find(item => item.section_type === 'hero')
    const projectItems = items.filter(item => item.section_type === 'project')
    const moreProjectItems = items.filter(item => item.section_type === 'more_project')

    const formattedContent: FormattedContent = {
      status: 'success',
      projects: projectItems.map((item, index) => ({
        title: item.title,
        description: item.description,
        benefits: item.benefits,
        button_text: item.button_text,
        href: item.href,
        gradient: item.gradient,
        project_images: item.project_images,
        project_video: item.project_video,
        reverse: index % 2 === 1 // Alternate layout for visual variety
      })),
      more_projects: moreProjectItems.map(item => ({
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        tech: item.tech,
        href: item.href
      }))
    }

    // Add hero if exists
    if (heroItem) {
      formattedContent.hero = {
        title: heroItem.title,
        subtitle: heroItem.subtitle || heroItem.description,
        background_video: heroItem.background_video || '',
        primary_button_text: heroItem.primary_button_text || heroItem.button_text,
        primary_button_href: heroItem.primary_button_href || heroItem.href,
        secondary_button_text: heroItem.secondary_button_text || '',
        secondary_button_href: heroItem.secondary_button_href || '',
        gradient_text: heroItem.gradient_text || ''
      }
    }

    console.log('✅ Homepage data fetched successfully:', {
      hero: !!formattedContent.hero,
      projects: formattedContent.projects.length,
      more_projects: formattedContent.more_projects.length
    })

    return formattedContent

  } catch (error: any) {
    console.error('🚨 Homepage data fetch error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack,
      full: JSON.stringify(error, null, 2)
    })
    return null
  }
}