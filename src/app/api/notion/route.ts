import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')

    if (!pageId) {
      return NextResponse.json({ error: 'Missing pageId' }, { status: 400 })
    }

    let databaseId = ''

    // Map pageId to database ID
    switch (pageId) {
      case 'cards':
        databaseId = process.env.NOTION_DATABASE_ID || ''
        break
      case 'home-latest':
        databaseId = process.env.NOTION_DATABASE_ID || ''
        break
      default:
        return NextResponse.json({ error: 'Invalid pageId' }, { status: 400 })
    }

    if (!databaseId) {
      return NextResponse.json({ error: 'Database ID not configured' }, { status: 500 })
    }

    const response = await notion.databases.query({
      database_id: databaseId,
    })

    return NextResponse.json({
      data: response.results,
      status: 'success'
    })

  } catch (error: any) {
    console.error('Error fetching Notion data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, databaseId } = await request.json()

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Failed to fetch from Notion' }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Notion API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
