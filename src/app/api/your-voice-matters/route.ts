import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

export async function POST(req: NextRequest) {
  const { page, responses } = await req.json()
  const databaseId = process.env.NOTION_VOICE_MATTERS_DB_ID

  const properties: Record<string, any> = {}

  // 将 Page 写入 title（而不是 property）
  properties['Name'] = {
    title: [{ text: { content: page } }],
  }

  for (const [field, value] of Object.entries(responses)) {
    if (field === 'Feature Expectation') {
      properties[field] = {
        select: { name: value },
      }
    } else {
      properties[field] = {
        rich_text: [{ text: { content: value } }],
      }
    }
  }

  try {
    await notion.pages.create({
      parent: { database_id: databaseId! },
      properties,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('❌ Notion write error:', error)
    return NextResponse.json({ ok: false, error: 'Notion write failed' }, { status: 500 })
  }
}
