import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { createClient } from '@supabase/supabase-js'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const tableName = body.tableName
    const databaseId = body.databaseId || body.notionDatabaseId

    if (!databaseId || !tableName) {
      return NextResponse.json(
        { success: false, message: '缺少 databaseId 或 tableName' },
        { status: 400 }
      )
    }

    // 获取 Notion 数据
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
    })

    const items = response.results.map((page) => {
      const row: Record<string, string> = {}
      const typedPage = page as PageObjectResponse

      for (const [key, prop] of Object.entries(typedPage.properties)) {
        if (prop.type === 'title') continue // ✅ 忽略 Title 字段

        const lowerKey = key.toLowerCase()

        if (prop.type === 'rich_text') {
          row[lowerKey] = prop.rich_text?.[0]?.plain_text || ''
        } else if (prop.type === 'select') {
          row[lowerKey] = prop.select?.name || ''
        } else if (prop.type === 'multi_select') {
          row[lowerKey] = (prop.multi_select || []).map((opt: any) => opt.name).join(', ')
        } else if (prop.type === 'number') {
          row[lowerKey] = String(prop.number ?? '')
        }
        // 其他类型可根据需求扩展
      }

      return row
    })

    // 插入到 Supabase
    const { error } = await supabase.from(tableName).insert(items)
    if (error) throw error

    return NextResponse.json({ success: true, count: items.length })
  } catch (err: any) {
    console.error('[sync-to-supabase]', err.message)
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
