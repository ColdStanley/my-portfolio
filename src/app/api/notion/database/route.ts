import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing database ID' }, { status: 400 })
  }

  try {
    // 获取所有行数据
    const res = await notion.databases.query({
      database_id: id,
      page_size: 100,
    })

    const rows: Record<string, string>[] = []

    // 尝试从第一行推导列顺序（更贴近 Notion 前端展示）
    const firstRow = res.results.find(r => 'properties' in r) as any
    const columnOrder = firstRow ? Object.keys(firstRow.properties) : []

    for (const result of res.results) {
      if (!('properties' in result)) continue
      const props = result.properties
      const row: Record<string, string> = {}

      for (const [key, prop] of Object.entries(props)) {
        const type = prop.type
        let val = ''

        switch (type) {
          case 'title':
            val = prop.title.map((t) => t.plain_text).join('')
            break
          case 'rich_text':
            val = prop.rich_text.map((t) => t.plain_text).join('')
            break
          case 'select':
            val = prop.select?.name || ''
            break
          case 'multi_select':
            val = prop.multi_select.map((s) => s.name).join(', ')
            break
          case 'number':
            val = prop.number?.toString() || ''
            break
          case 'checkbox':
            val = prop.checkbox ? '✅' : ''
            break
          case 'url':
            val = prop.url || ''
            break
          case 'email':
            val = prop.email || ''
            break
          case 'phone_number':
            val = prop.phone_number || ''
            break
          case 'date':
            val = prop.date?.start || ''
            break
          case 'people':
            val = (prop.people || []).map((p) => p.name || '').join(', ')
            break
          case 'formula':
            val = 'formula' in prop ? JSON.stringify(prop.formula) : ''
            break
          case 'files':
            val = prop.files.map((f) =>
              f.type === 'external' ? f.external.url : f.file.url
            ).join(', ')
            break
          default:
            val = '[Unsupported]'
        }

        row[key] = val
      }

      rows.push(row)
    }

    return NextResponse.json({
      columns: columnOrder,
      rows,
    })
  } catch (err) {
    console.error('❌ Failed to query Notion database:', err)
    return NextResponse.json({ error: 'Failed to fetch database content' }, { status: 500 })
  }
}
