import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { pageId, roleGroup } = await request.json()

    if (!pageId || roleGroup === undefined) {
      return NextResponse.json(
        { error: 'Page ID and role group are required' },
        { status: 400 }
      )
    }

    await notion.pages.update({
      page_id: pageId,
      properties: {
        role_group: {
          select: roleGroup ? { name: roleGroup } : null
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving role group:', error)
    return NextResponse.json(
      { error: 'Failed to save role group' },
      { status: 500 }
    )
  }
}