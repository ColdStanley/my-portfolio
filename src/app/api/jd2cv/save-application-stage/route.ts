import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { pageId, applicationStage } = await request.json()

    if (!pageId || applicationStage === undefined) {
      return NextResponse.json(
        { error: 'Page ID and application stage are required' },
        { status: 400 }
      )
    }

    await notion.pages.update({
      page_id: pageId,
      properties: {
        application_stage: {
          select: applicationStage ? { name: applicationStage } : null
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving application stage:', error)
    return NextResponse.json(
      { error: 'Failed to save application stage' },
      { status: 500 }
    )
  }
}