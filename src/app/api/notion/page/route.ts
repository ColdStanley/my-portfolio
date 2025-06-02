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

    // 对每个 block 判断是否嵌套 children
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId')

  if (!pageId) {
    return NextResponse.json({ error: 'Missing pageId parameter' }, { status: 400 })
  }

  try {
    const blocks = await fetchBlockChildrenRecursively(pageId); console.log('📦 Final blocks:', JSON.stringify(blocks, null, 2))

    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('❌ Error fetching Notion blocks recursively:', error)
    return NextResponse.json({ error: 'Failed to fetch Notion content' }, { status: 500 })
  }
}
