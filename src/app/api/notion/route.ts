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

    // 提取所有页面
    const rawResults = response.results
      // ✅ 只保留 Status = Published 的页面
      .filter((page) => {
        const props = (page as PageObjectResponse).properties
        const status =
          props.Status?.type === 'select' ? props.Status.select?.name || '' : ''
        return status.toLowerCase() === 'published'
      })

    // ✅ 加入排序逻辑：按 Notion 中的 Order 字段升序排列
    const sortedResults = rawResults.sort((a, b) => {
      const propsA = (a as PageObjectResponse).properties
      const propsB = (b as PageObjectResponse).properties
      const orderA = propsA.Order?.type === 'number' ? propsA.Order.number ?? 0 : 0
      const orderB = propsB.Order?.type === 'number' ? propsB.Order.number ?? 0 : 0
      return orderA - orderB
    })

    // ✅ 映射字段（包含 tech、imageUrl、slug、order 等）
    const results = sortedResults.map((page) => {
      const props = (page as PageObjectResponse).properties

      return {
        pageId: page.id,
        title:
          props.Title?.type === 'title'
            ? props.Title.title?.[0]?.plain_text || ''
            : '',
        content:
          props.Description?.type === 'rich_text'
            ? props.Description.rich_text?.[0]?.plain_text || ''
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
        tech:
          props.Tag?.type === 'multi_select'
            ? props.Tag.multi_select.map((tag) => tag.name)
            : [],
        order:
          props.Order?.type === 'number'
            ? props.Order.number ?? 0
            : 0, // ✅ 可选：便于前端调试用
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
