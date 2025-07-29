import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { pageId, firmType } = await request.json()

    if (!pageId || firmType === undefined) {
      return NextResponse.json(
        { error: 'Page ID and firm type are required' },
        { status: 400 }
      )
    }

    await notion.pages.update({
      page_id: pageId,
      properties: {
        firm_type: {
          select: firmType ? { name: firmType } : null
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving firm type:', error)
    return NextResponse.json(
      { error: 'Failed to save firm type' },
      { status: 500 }
    )
  }
}