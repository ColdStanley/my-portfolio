import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function GET(request: NextRequest) {
  try {
    const databaseId = process.env.NOTION_AI4EDU_DB_ID

    if (!databaseId) {
      return NextResponse.json(
        { error: 'AI4EDU database ID not configured' },
        { status: 500 }
      )
    }

    const response = await notion.databases.query({
      database_id: databaseId,
    })

    return NextResponse.json({
      results: response.results,
      status: 'success'
    })

  } catch (error: any) {
    console.error('Error fetching AI4EDU Notion data:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch AI4EDU showcase data',
        details: error.message
      },
      { status: 500 }
    )
  }
}