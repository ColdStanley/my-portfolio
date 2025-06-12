import { NextRequest, NextResponse } from 'next/server'
import { fetchBlockChildrenRecursively } from '@/lib/notion/fetchBlocks'

// GET /api/notion/page?pageId=xxxxxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pageId = searchParams.get('pageId')

  if (!pageId) {
    return NextResponse.json({ error: 'Missing pageId' }, { status: 400 })
  }

  try {
    const blocks = await fetchBlockChildrenRecursively(pageId)
    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('❌ Failed to fetch Notion page blocks:', error)
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 })
  }
}
