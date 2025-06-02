import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

// ✅ 公共方法：获取所有卡片数据（用于 HomeCardsSection）
async function fetchCardItems(): Promise<any[]> {
  const databaseId = process.env.NOTION_DATABASE_ID
  if (!databaseId) throw new Error('Missing NOTION_DATABASE_ID')

  const res: QueryDatabaseResponse = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: {
        equals: 'Published',
      },
    },
    sorts: [
      {
        property: 'Order',
        direction: 'ascending',
      },
    ],
  })

  return res.results.map((page) => {
    const props = (page as PageObjectResponse).properties

    return {
      pageId: page.id,
      id: page.id,
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
        props.Order?.type === 'number' ? props.Order.number ?? 0 : 0,
    }
  })
}

// ✅ 新增：用于 LatestHighlightCard 精简结构
async function fetchLatestHighlightItems(): Promise<any[]> {
  const all = await fetchCardItems()
  return all
    .filter((item) => item.section === 'LatestHighlightCard')
    .map((item) => ({
      title: item.title || 'Untitled',
      description: item.content || '',
      slug: item.slug || '',
      category: item.category || '',
      tag: item.tech || [],
    }))
}


// ✅ 主 GET 接口
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId')

  try {
    if (pageId === 'home-latest') {
      // ✅ 关键改动在这里：返回精简字段的版本
      const data = await fetchLatestHighlightItems()
      return NextResponse.json({ data })
    }

    // 👉 用于 HomeCardsSection
    const data = await fetchCardItems()
    return NextResponse.json({ data })
  } catch (error) {
    console.error('❌ Error fetching Notion content:', error)
    return NextResponse.json({ error: 'Failed to fetch Notion content' }, { status: 500 })
  }
}

