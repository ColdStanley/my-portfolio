import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const databaseId = body.databaseId

  if (!databaseId) {
    return NextResponse.json({ error: 'Missing databaseId' }, { status: 400 })
  }

  try {
    const response = await notion.databases.retrieve({ database_id: databaseId })

    const schema: Record<string, string> = {}
    const properties = response.properties

    for (const [key, value] of Object.entries(properties)) {
      schema[key] = value.type // e.g., title, rich_text, multi_select, url, date
    }

    return NextResponse.json({ schema })
  } catch (error: any) {
    console.error('❌ Error fetching schema:', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
