import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

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

    return NextResponse.json({
      logo: logoItem ? { name: logoItem.label, href: logoItem.href } : null,
      navItems: structuredNavItems,
      ctaButton: ctaButton ? { name: ctaButton.label, href: ctaButton.href } : null,
      status: 'success'
    })

  } catch (error: any) {
    console.error('Error fetching navigation data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch navigation data', details: error.message },
      { status: 500 }
    )
  }
}