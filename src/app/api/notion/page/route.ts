import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import {
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

// ✅ 递归抓取所有子 block，注入 block.children
async function fetchBlockChildrenRecursively(blockId: string): Promise<BlockObjectResponse[]> {
  const children: BlockObjectResponse[] = []
  let cursor: string | undefined = undefined

  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    })

    const blocks = res.results as BlockObjectResponse[]

    for (const block of blocks) {
      if ('has_children' in block && block.has_children) {
        const nested = await fetchBlockChildrenRecursively(block.id)
        ;(block as any).children = nested
      }
    }

    children.push(...blocks)
    cursor = res.has_more ? res.next_cursor || undefined : undefined
  } while (cursor)

  return children
}

// ✅ 查询数据库内容（用于读取 LatestHighlightCard）
// ✅ 查询数据库内容（用于读取 LatestHighlightCard）
async function fetchHighlightCards(): Promise<any[]> {
  const databaseId = process.env.NOTION_DATABASE_ID
  if (!databaseId) throw new Error('Missing NOTION_DATABASE_ID')

  const meta = await notion.databases.retrieve({ database_id: databaseId })
  const orderedColumnNames = Object.keys(meta.properties)

  const res = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Section',
      select: {
        equals: 'LatestHighlightCard',
      },
    },
    sorts: [
      {
        property: 'Order',
        direction: 'ascending',
      },
    ],
  })

  const rows = res.results.map((page: any) => {
    const props = page.properties
    const row: Record<string, string> = {}
    for (const col of orderedColumnNames) {
      const value = props[col]
      if (!value) continue

      const key = col.toLowerCase()  // ✅ 强制转为小写字段名

      if (value.type === 'title') {
        row[key] = value.title[0]?.plain_text || ''
      } else if (value.type === 'rich_text') {
        row[key] = value.rich_text[0]?.plain_text || ''
      } else if (value.type === 'select') {
        row[key] = value.select?.name || ''
      } else if (value.type === 'multi_select') {
        row[key] = value.multi_select.map((t: any) => t.name).join(', ')
      } else if (value.type === 'url') {
        row[key] = value.url
      } else if (value.type === 'files' && value.files.length > 0) {
        row[key] = value.files[0].name || ''
      }
    }
    return row
  })

  return rows
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId')

  try {
    if (pageId === 'home-latest') {
      const data = await fetchHighlightCards()
      return NextResponse.json({ data })
    }

    if (!pageId) {
      return NextResponse.json({ error: 'Missing pageId parameter' }, { status: 400 })
    }

    const blocks = await fetchBlockChildrenRecursively(pageId)
    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('❌ Error fetching Notion content:', error)
    return NextResponse.json({ error: 'Failed to fetch Notion content' }, { status: 500 })
  }
}
