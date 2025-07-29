import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { pageId, comment } = await request.json()

    if (!pageId || comment === undefined) {
      return NextResponse.json(
        { error: 'Page ID and comment are required' },
        { status: 400 }
      )
    }

    await notion.pages.update({
      page_id: pageId,
      properties: {
        comment: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: comment || ''
              }
            }
          ]
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving comment:', error)
    return NextResponse.json(
      { error: 'Failed to save comment' },
      { status: 500 }
    )
  }
}