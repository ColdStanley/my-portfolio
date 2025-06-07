import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

// ✅ 页面映射表：统一管理 pageId 与实际 Notion DB ID 的映射
const pageMap: Record<string, string> = {
  'home-latest': process.env.NOTION_DATABASE_ID!,
  'ielts-reading': process.env.NOTION_IELTS_READING_DB_ID!,
}

// ✅ 通用 CMS 卡片读取（HomeCardsSection）
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
    sorts: [{ property: 'Order', direction: 'ascending' }],
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
      status:
        props.Status?.type === 'select'
        ? props.Status.select?.name || ''
      : '',
      
      order:
        props.Order?.type === 'number' ? props.Order.number ?? 0 : 0,
    }
  })
}

// ✅ LatestHighlightCard 精简字段
async function fetchLatestHighlightItems(): Promise<any[]> {
  const all = await fetchCardItems()
  return all
    .filter((item) => item.section === 'LatestHighlightCard')
    .map((item) => ({
      title: item.title || 'Untitled',
      description: item.content || '',
      slug: item.slug || '',
      category: item.category || '',
      tag: item.tag || item.tech || [],   
      status: item.status || '',          
      order: item.order ?? 0,       
    }))
}

// ✅ IELTS Reading 专用逻辑
async function fetchReadingQuestions(): Promise<any[]> {
  const databaseId = process.env.NOTION_IELTS_READING_DB_ID
  if (!databaseId) throw new Error('Missing NOTION_IELTS_READING_DB_ID')

  const res: QueryDatabaseResponse = await notion.databases.query({
    database_id: databaseId,
    sorts: [{ property: '题号', direction: 'ascending' }],
  })

  return res.results.map((page) => {
    const props = (page as PageObjectResponse).properties

    const getText = (p: any, key: string) =>
      p[key]?.type === 'rich_text'
        ? p[key].rich_text?.[0]?.plain_text || ''
        : ''

    const getSelect = (p: any, key: string) =>
      p[key]?.type === 'select' ? p[key].select?.name || '' : ''

    return {
      题号: getText(props, '题号'),
      题目: getText(props, '题目'),
      答案: getText(props, '答案'),
      答案句: getText(props, '答案句'),
      单词: getText(props, '单词'),
      词组: getText(props, '词组'),
      Passage: getSelect(props, 'Passage'),
      题型: getSelect(props, '题型'),
      剑雅: getSelect(props, '剑雅'),
    }
  })
}

// ✅ 主 GET 路由
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId')

  try {
    // 特殊处理 home-latest（因为它依赖 fetchCardItems 内部筛选）
    if (pageId === 'home-latest') {
      const data = await fetchLatestHighlightItems()
      return NextResponse.json({ data })
    }

    // 特殊处理 ielts-reading（独立函数）
    if (pageId === 'ielts-reading') {
      const data = await fetchReadingQuestions()
      return NextResponse.json({ data })
    }

    // 默认处理（如 pageId 为空，或用于 HomeCardsSection）
    const data = await fetchCardItems()
    return NextResponse.json({ data })
  } catch (error) {
    console.error('❌ Error fetching Notion content:', error)
    return NextResponse.json({ error: 'Failed to fetch Notion content' }, { status: 500 })
  }
}
