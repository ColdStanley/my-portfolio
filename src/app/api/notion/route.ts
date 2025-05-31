import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

export async function GET() {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
    })

    const results = response.results.map((page: any) => {
      const props = page.properties
      return {
        id: page.id,
        title: props.Title?.title?.[0]?.plain_text || '',
        content: props.Content?.rich_text?.[0]?.plain_text || '',
        subtext: props.Subtext?.rich_text?.[0]?.plain_text || '',
        link: props.Link?.url || '',
        imageUrl: props.Image?.files?.[0]?.file?.url || props.Image?.files?.[0]?.external?.url || '',
        section: props.Section?.select?.name || '',
        category: props.Category?.select?.name?.toLowerCase() || '',
        slug: props.Slug?.url || props.Slug?.rich_text?.[0]?.plain_text || '',
        body: props.Body?.rich_text?.[0]?.plain_text || '',
        }
    })

    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Notion API error:', error)
    return NextResponse.json({ error: 'Failed to fetch Notion data' }, { status: 500 })
  }
}
