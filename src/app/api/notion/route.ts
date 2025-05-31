import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import {
  QueryDatabaseResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

export async function GET() {
  try {
    const response: QueryDatabaseResponse = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
    })

    const results = response.results
      // ✅ 先过滤 Status 为 Published 的页面
      .filter((page) => {
        const props = (page as PageObjectResponse).properties
        const status =
          props.Status?.type === 'select' ? props.Status.select?.name || '' : ''
        return status.toLowerCase() === 'published'
      })
      // ✅ 映射成前端所需结构
      .map((page) => {
        const props = (page as PageObjectResponse).properties

        return {
          id: page.id,
          title:
            props.Title?.type === 'title'
              ? props.Title.title?.[0]?.plain_text || ''
              : '',
          content:
            props.Content?.type === 'rich_text'
              ? props.Content.rich_text?.[0]?.plain_text || ''
              : '',
          subtext:
            props.Subtext?.type === 'rich_text'
              ? props.Subtext.rich_text?.[0]?.plain_text || ''
              : '',
          link: props.Link?.type === 'url' ? props.Link.url || '' : '',
          imageUrl:
            props.Image?.type === 'files'
              ? props.Image.files?.[0]?.file?.url ||
                props.Image.files?.[0]?.external?.url ||
                ''
              : '',
          section:
            props.Section?.type === 'select'
              ? props.Section.select?.name || ''
              : '',
          category:
            props.Category?.type === 'select'
              ? props.Category.select?.name?.toLowerCase() || ''
              : '',
          slug:
            props.Slug?.type === 'url'
              ? props.Slug.url || ''
              : props.Slug?.type === 'rich_text'
              ? props.Slug.rich_text?.[0]?.plain_text || ''
              : '',
          body:
            props.Body?.type === 'rich_text'
              ? props.Body.rich_text?.[0]?.plain_text || ''
              : '',
        }
      })

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error('Notion API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Notion data' },
      { status: 500 }
    )
  }
}
