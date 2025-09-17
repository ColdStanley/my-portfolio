import { NextRequest, NextResponse } from 'next/server'

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
