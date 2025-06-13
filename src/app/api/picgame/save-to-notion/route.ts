import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_PICGAME_DB_ID!

export async function POST(req: NextRequest) {
  const { imageUrl, description, quotes, type = '未分类' } = await req.json()

  try {
    const title = `PicGame_${Date.now()}`

    const safeImageUrl = imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Title: {
          title: [{ text: { content: title } }],
        },
        ImageURL: {
          url: safeImageUrl,
        },
        Description: {
          rich_text: [{ text: { content: description } }],
        },
        Quotes: {
          rich_text: [{ text: { content: quotes } }],
        },
        Type: {
          select: { name: type },
        },
      },
    })

    return NextResponse.json({ title }) // ✅ 返回 title 给前端用作路径
  } catch (error) {
    console.error('❌ Notion 写入失败:', error)
    return NextResponse.json({ error: 'Notion 写入失败' }, { status: 500 })
  }
}
