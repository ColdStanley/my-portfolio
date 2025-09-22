import { Client } from '@notionhq/client'

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// TypeScript Interfaces
export interface NotionRichText {
  type: string
  text?: {
    content: string
  }
  plain_text: string
}

export interface NotionFile {
  type: string
  file?: {
    url: string
  }
  external?: {
    url: string
  }
}

export interface NotionSelect {
  name: string
}

export interface NavigationItem {
  id: string
  normalized_id: string
  item_type: 'logo' | 'nav_item' | 'cta_button'
  parent_id?: string
  normalized_parent_id?: string
  label: string
  href: string
  order: number
  status: 'active' | 'inactive'
  is_dropdown: boolean
  children?: NavigationItem[]
}

export interface HomepageContent {
  hero: {
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
    project_images: string[]
    project_video: string
    reverse: boolean
  }>
  more_projects: Array<{
    title: string
    subtitle: string
    description: string
    tech: string
    href: string
  }>
}

// Data extraction utility functions
export function extractRichText(richText: NotionRichText[] | null): string {
  if (!richText || !Array.isArray(richText)) return ''
  return richText.map(block => block.plain_text || '').join('')
}

export function extractFiles(files: NotionFile[] | null): string[] {
  if (!files || !Array.isArray(files)) return []

  return files.map(file => {
    if (file.type === 'file' && file.file?.url) {
      return file.file.url
    }
    if (file.type === 'external' && file.external?.url) {
      return file.external.url
    }
    return ''
  }).filter(url => url !== '')
}

export function extractSelect(select: NotionSelect | null): string {
  return select?.name || ''
}

export function extractNumber(number: number | null): number {
  return number ?? 0
}

export function extractCheckbox(checkbox: boolean | null): boolean {
  return checkbox === true
}

export function extractUrl(url: string | null): string {
  return url || ''
}

// Validate required fields
export function validateRequiredFields(data: any, requiredFields: string[], context: string): void {
  console.log(`🔍 Validating fields for ${context}:`, requiredFields)

  const missingFields = requiredFields.filter(field => {
    const value = data[field]
    return value === null || value === undefined || value === ''
  })

  if (missingFields.length > 0) {
    console.error(`❌ Missing required fields in ${context}:`, missingFields)
    throw new Error(`Missing required fields in ${context}: ${missingFields.join(', ')}`)
  }

  console.log(`✅ All required fields present for ${context}`)
}

// Build navigation tree from flat items
export function buildNavigationTree(flatItems: any[]): NavigationItem[] {
  console.log(`🌳 Building navigation tree from ${flatItems.length} items`)

  const items: NavigationItem[] = flatItems.map((item: any) => {
    const properties = item.properties
    const parentIdRaw = extractRichText(properties.parent_id?.rich_text).trim()
    const normalizedParentId = parentIdRaw ? parentIdRaw.replace(/-/g, '').toLowerCase() : undefined
    const label = extractRichText(properties.label?.rich_text)

    const navigationItem: NavigationItem = {
      id: item.id,
      normalized_id: item.id ? item.id.replace(/-/g, '').toLowerCase() : '',
      item_type: extractSelect(properties.item_type?.select) as 'logo' | 'nav_item' | 'cta_button',
      parent_id: parentIdRaw || undefined,
      normalized_parent_id: normalizedParentId,
      label,
      href: extractUrl(properties.href?.url),
      order: extractNumber(properties.order?.number),
      status: extractSelect(properties.status?.select) as 'active' | 'inactive',
      is_dropdown: extractCheckbox(properties.is_dropdown?.checkbox),
    }

    return navigationItem
  })

  // Filter active items
  const activeItems = items.filter(item => item.status === 'active')
  console.log(`🎯 Found ${activeItems.length} active navigation items`)

  // Sort by order
  activeItems.sort((a, b) => a.order - b.order)

  // Build tree structure
  const rootItems = activeItems.filter(item => !item.parent_id)
  const childItems = activeItems.filter(item => item.parent_id)

  const parentLookup = new Map<string, NavigationItem>()

  rootItems.forEach(parent => {
    if (parent.normalized_id) {
      parentLookup.set(parent.normalized_id, parent)
    }

    const normalizedLabel = parent.label.trim().toLowerCase()
    if (normalizedLabel) {
      parentLookup.set(normalizedLabel, parent)
    }
  })

  childItems.forEach(child => {
    const lookupKeys = [child.normalized_parent_id, child.parent_id?.trim().toLowerCase()].filter(Boolean) as string[]

    for (const key of lookupKeys) {
      const parent = parentLookup.get(key)
      if (parent && parent.is_dropdown) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(child)
        return
      }
    }
  })

  rootItems.forEach(parent => {
    if (parent.children && parent.children.length > 0) {
      parent.children.sort((a, b) => a.order - b.order)
    }
  })

  console.log(`✅ Navigation tree built with ${rootItems.length} root items`)
  return rootItems
}

// Get navigation data from Notion
export async function getNavigationData(): Promise<NavigationItem[]> {
  console.log('🚀 Fetching navigation data from Notion...')

  if (!process.env.NOTION_SITE_NAVIGATION_DB_ID) {
    throw new Error('NOTION_SITE_NAVIGATION_DB_ID environment variable is not set')
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_SITE_NAVIGATION_DB_ID,
      sorts: [
        {
          property: 'order',
          direction: 'ascending',
        },
      ],
    })

    console.log(`📊 Retrieved ${response.results.length} navigation items from Notion`)

    const navigationTree = buildNavigationTree(response.results)
    console.log('✅ Navigation data processed successfully')

    return navigationTree
  } catch (error) {
    console.error('❌ Failed to fetch navigation data:', error)
    throw error
  }
}

// Get homepage content data from Notion
export async function getHomepageContentData(): Promise<HomepageContent> {
  console.log('🚀 Fetching homepage content from Notion...')

  if (!process.env.NOTION_HOMEPAGE_CONTENT_DB_ID) {
    throw new Error('NOTION_HOMEPAGE_CONTENT_DB_ID environment variable is not set')
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_HOMEPAGE_CONTENT_DB_ID,
      filter: {
        property: 'status',
        select: {
          equals: 'active',
        },
      },
      sorts: [
        {
          property: 'order',
          direction: 'ascending',
        },
      ],
    })

    console.log(`📊 Retrieved ${response.results.length} homepage content items from Notion`)

    // Group by section_type
    const itemsBySection: { [key: string]: any[] } = {}

    response.results.forEach(item => {
      const properties = (item as any).properties
      const sectionType = extractSelect(properties.section_type?.select)

      if (!itemsBySection[sectionType]) {
        itemsBySection[sectionType] = []
      }
      itemsBySection[sectionType].push(item)
    })

    console.log('📋 Content grouped by section:', Object.keys(itemsBySection))

    // Process Hero section
    const heroItems = itemsBySection['hero'] || []
    if (heroItems.length === 0) {
      throw new Error('No hero section found in homepage content')
    }

    const heroItem = heroItems[0]
    const heroProps = (heroItem as any).properties

    const hero = {
      title: extractRichText(heroProps.title?.rich_text),
      subtitle: extractRichText(heroProps.description?.rich_text),
      background_video: extractFiles(heroProps.background_video?.files)[0] || '',
      primary_button_text: extractRichText(heroProps.primary_button_text?.rich_text),
      primary_button_href: extractUrl(heroProps.primary_button_href?.url),
      secondary_button_text: extractRichText(heroProps.secondary_button_text?.rich_text),
      secondary_button_href: extractUrl(heroProps.secondary_button_href?.url),
      gradient_text: extractRichText(heroProps.gradient_text?.rich_text),
    }

    validateRequiredFields(hero, ['title', 'subtitle'], 'Hero section')
    console.log('✅ Hero section processed')

    // Process Project sections
    const projectItems = itemsBySection['project'] || []
    const projects = projectItems.map((item, index) => {
      const props = (item as any).properties

      const benefits = extractRichText(props.benefits?.rich_text)
      const benefitsList = benefits ? benefits.split('\n').filter(b => b.trim()) : []

      const project = {
        title: extractRichText(props.title?.rich_text),
        description: extractRichText(props.description?.rich_text),
        benefits: benefitsList,
        button_text: extractRichText(props.button_text?.rich_text),
        href: extractUrl(props.href?.url),
        gradient: extractRichText(props.gradient?.rich_text),
        project_images: extractFiles(props.project_image?.files),
        project_video: extractFiles(props.project_video?.files)[0] || '',
        reverse: index % 2 === 1, // Alternate layout
      }

      validateRequiredFields(project, ['title', 'description', 'href'], `Project: ${project.title}`)
      return project
    })

    console.log(`✅ Processed ${projects.length} project sections`)

    // Process More Projects sections
    const moreProjectItems = itemsBySection['more_project'] || []
    const more_projects = moreProjectItems.map(item => {
      const props = (item as any).properties

      const moreProject = {
        title: extractRichText(props.title?.rich_text),
        subtitle: extractRichText(props.subtitle?.rich_text),
        description: extractRichText(props.description?.rich_text),
        tech: extractRichText(props.tech?.rich_text),
        href: extractUrl(props.href?.url),
      }

      validateRequiredFields(moreProject, ['title', 'description', 'href'], `More Project: ${moreProject.title}`)
      return moreProject
    })

    console.log(`✅ Processed ${more_projects.length} more project sections`)

    const content: HomepageContent = {
      hero,
      projects,
      more_projects,
    }

    console.log('✅ Homepage content processed successfully')
    return content

  } catch (error) {
    console.error('❌ Failed to fetch homepage content:', error)
    throw error
  }
}

// Main function to get all homepage data
export async function getAllHomepageData(): Promise<{
  navigation: NavigationItem[]
  content: HomepageContent
}> {
  console.log('🚀 Starting to fetch all homepage data...')

  try {
    // Fetch both datasets in parallel for better performance
    const [navigation, content] = await Promise.all([
      getNavigationData(),
      getHomepageContentData(),
    ])

    console.log('🎉 All homepage data fetched successfully!')

    return {
      navigation,
      content,
    }
  } catch (error) {
    console.error('❌ Failed to fetch homepage data:', error)
    throw error
  }
}
