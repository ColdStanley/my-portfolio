import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_PICGAME_DB_ID

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  // 🛑 检查参数是否提供
  if (!id) {
    return NextResponse.json({ error: '❌ 缺少参数 id' }, { status: 400 })
  }

  // 🛑 检查环境变量是否设置
  if (!databaseId) {
    return NextResponse.json({ error: '服务器配置错误：缺少数据库ID' }, { status: 500 })
  }

  try {
    // 🔍 查询 Notion 数据库
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Title',
        title: {
          equals: id,
        },
      },
    })


    // ❌ 没有找到记录
    if (response.results.length === 0) {
      return NextResponse.json({ error: '❌ 未找到对应记录' }, { status: 404 })
    }

    const page = response.results[0] as any

    const rawUrl = page.properties.ImageURL?.url || ''
    const imageUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

    const description = page.properties.Description?.rich_text?.[0]?.plain_text || ''
    const quotes = page.properties.Quotes?.rich_text?.[0]?.plain_text || ''
    const type = page.properties.Type?.select?.name || ''

    // ✅ 返回 JSON 数据
    return NextResponse.json({
      id,
      imageUrl,
      description,
      quotes,
      type,
    })
  } catch (error) {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
