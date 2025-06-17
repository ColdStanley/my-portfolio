import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_SUBSCRIBE_DB_ID!

export async function POST(req: Request) {
  const { email } = await req.json()

  console.log('📩 收到邮箱:', email)

  if (!email || typeof email !== 'string') {
    console.log('❌ 邮箱格式错误')
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  try {
    console.log('🚀 正在尝试写入 Notion...')
    const res = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Email: {
          title: [
            {
              text: { content: email },
            },
          ],
        },
      },
    })

    console.log('✅ 写入成功:', res.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Failed to write to Notion:', error)
    return NextResponse.json({ error: 'Failed to save email' }, { status: 500 })
  }
}
