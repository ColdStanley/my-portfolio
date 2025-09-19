import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Simple memory cache
interface CacheEntry {
  data: any
  timestamp: number
  expiry: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

function getCacheKey(databaseId: string): string {
  return `homepage-content-${databaseId}`
}

function getCachedData(key: string): any | null {
  const entry = cache.get(key)
  if (!entry) return null

  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return null
  }

  return entry.data
}

function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + CACHE_DURATION
  })
}

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
    reverse?: boolean
  }>
  more_projects: Array<{
    title: string
    description: string
    href: string
  }>
  status: string
}

export async function GET(request: NextRequest) {
  try {
    const databaseId = process.env.NOTION_HOMEPAGE_CONTENT_DB_ID

    if (!databaseId) {
      return NextResponse.json({ error: 'Homepage content database ID not configured' }, { status: 500 })
    }

    // Check cache first
    const cacheKey = getCacheKey(databaseId)
    const cachedData = getCachedData(cacheKey)

    if (cachedData) {
      console.log('📦 Serving from cache')
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache-Status': 'HIT'
        }
      })
    }

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

    // Cache the result
    setCachedData(cacheKey, formattedContent)
    console.log('💾 Data cached for future requests')

    return NextResponse.json(formattedContent, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache-Status': 'MISS'
      }
    })

  } catch (error: any) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage content', details: error.message },
      { status: 500 }
    )
  }
}