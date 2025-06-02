import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import {
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

async function fetchBlockChildren(blockId: string): Promise<BlockObjectResponse[]> {
  const children: BlockObjectResponse[] = []
  let cursor: string | undefined = undefined

  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    })
    children.push(...(res.results as BlockObjectResponse[]))
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
    const blocks = await fetchBlockChildren(pageId)
    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('❌ Error fetching Notion blocks:', error)
    return NextResponse.json({ error: 'Failed to fetch Notion content' }, { status: 500 })
  }
}
