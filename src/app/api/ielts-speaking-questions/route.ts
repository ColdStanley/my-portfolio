import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const part = searchParams.get('part')

  if (!part) {
    return NextResponse.json({ error: 'Missing part parameter' }, { status: 400 })
  }

  try {
    const databaseId = process.env.NOTION_SPEAKING_DB_ID!
const res = await notion.databases.query({
  database_id: databaseId,
  filter: {
    property: 'Part',
    select: {
      equals: part
    }
  }
})
// ✅ 打印所有内容看结构
console.log('[调试 Notion 返回原始数据]:', JSON.stringify(res.results[0], null, 2))


    const questions = res.results.map((page: any) => {
      return page.properties?.Question?.title?.map(t => t.plain_text).join('') || ''

    })

    return NextResponse.json({ questions })
  } catch (err) {
    console.error('Notion query failed:', err)
    return NextResponse.json({ error: 'Notion query failed' }, { status: 500 })
  }
}
