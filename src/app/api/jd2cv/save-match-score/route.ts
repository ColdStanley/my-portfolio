import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { pageId, matchScore } = await request.json()

    if (!pageId || matchScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: pageId, matchScore' },
        { status: 400 }
      )
    }

    // Validate match score range (1-5)
    if (matchScore < 1 || matchScore > 5 || !Number.isInteger(matchScore)) {
      return NextResponse.json(
        { error: 'Match score must be an integer between 1 and 5' },
        { status: 400 }
      )
    }

    // Update the Notion page with match score
    await notion.pages.update({
      page_id: pageId,
      properties: {
        match_score: {
          number: matchScore
        }
      }
    })

    return NextResponse.json({ success: true, matchScore })
  } catch (error) {
    console.error('Error saving match score:', error)
    return NextResponse.json(
      { error: 'Failed to save match score' },
      { status: 500 }
    )
  }
}