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
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes for navigation (more stable)

function getCacheKey(databaseId: string): string {
  return `navigation-${databaseId}`
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

interface NavigationItem {
  id: string
  item_type: string
  parent_id: string | null
  label: string
  href: string
  order: number
  status: string
  is_dropdown: boolean
}

interface FormattedNavItem {
  name: string
  type: 'dropdown' | 'link'
  href?: string
  items?: { name: string; href: string }[]
}

export async function GET(request: NextRequest) {
  try {
    const databaseId = process.env.NOTION_SITE_NAVIGATION_DB_ID

    if (!databaseId) {
      return NextResponse.json({ error: 'Navigation database ID not configured' }, { status: 500 })
    }

    // Check cache first
    const cacheKey = getCacheKey(databaseId)
    const cachedData = getCachedData(cacheKey)

    if (cachedData) {
      console.log('📦 Navigation served from cache')
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
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
    const items: NavigationItem[] = response.results.map((page: any) => {
      const properties = page.properties
      return {
        id: page.id,
        item_type: properties.item_type?.select?.name || '',
        parent_id: properties.parent_id?.rich_text?.[0]?.text?.content || null,
        label: properties.label?.rich_text?.[0]?.text?.content || '',
        href: properties.href?.url || '',
        order: properties.order?.number || 0,
        status: properties.status?.select?.name || '',
        is_dropdown: properties.is_dropdown?.checkbox || false
      }
    })

    // Build navigation structure
    const logoItem = items.find(item => item.item_type === 'logo')
    const ctaButton = items.find(item => item.item_type === 'cta_button')
    const navItems = items.filter(item => item.item_type === 'nav_item')

    // Group navigation items by parent
    const topLevelItems = navItems.filter(item => !item.parent_id)
    const childItems = navItems.filter(item => item.parent_id)

    // Build structured navigation
    const structuredNavItems: FormattedNavItem[] = topLevelItems.map(item => {
      const children = childItems
        .filter(child => {
          // Normalize IDs by removing hyphens for comparison
          const normalizedParentId = child.parent_id?.replace(/-/g, '')
          const normalizedItemId = item.id.replace(/-/g, '')
          return normalizedParentId === normalizedItemId
        })
        .sort((a, b) => a.order - b.order)
        .map(child => ({
          name: child.label,
          href: child.href
        }))

      return {
        name: item.label,
        type: item.is_dropdown ? 'dropdown' as const : 'link' as const,
        href: item.is_dropdown ? undefined : item.href,
        items: children.length > 0 ? children : undefined
      }
    })

    const navigationData = {
      logo: logoItem ? { name: logoItem.label, href: logoItem.href } : null,
      navItems: structuredNavItems,
      ctaButton: ctaButton ? { name: ctaButton.label, href: ctaButton.href } : null,
      status: 'success'
    }

    // Cache the result
    setCachedData(cacheKey, navigationData)
    console.log('💾 Navigation data cached')

    return NextResponse.json(navigationData, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        'X-Cache-Status': 'MISS'
      }
    })

  } catch (error: any) {
    console.error('Error fetching navigation data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch navigation data', details: error.message },
      { status: 500 }
    )
  }
}