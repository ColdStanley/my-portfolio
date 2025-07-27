import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { pageId } = await request.json()

    if (!pageId) {
      return NextResponse.json(
        { error: 'Missing required field: pageId' },
        { status: 400 }
      )
    }

    // Delete the Notion page
    await notion.blocks.delete({
      block_id: pageId
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting Notion page:', error)
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    )
  }
}