// ✅ Final Stable /api/notion/database/route.ts
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
    const meta = await notion.databases.retrieve({ database_id: id })
    const orderedColumnNames = Object.keys(meta.properties)

    const res = await notion.databases.query({
      database_id: id,
      page_size: 100,
    })

    const rows: Record<string, string>[] = []

    for (const result of res.results) {
      if (!('properties' in result)) continue
      const props = result.properties
      const row: Record<string, string> = {}

      for (const colName of orderedColumnNames) {
        const prop = props[colName]
        if (!prop) {
          row[colName] = ''
          continue
        }

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

        row[colName] = val
      }

      rows.push(row)
    }

    return NextResponse.json({
      columns: orderedColumnNames,
      rows,
    })
  } catch (err) {
    console.error('❌ Failed to query Notion database:', err)
    return NextResponse.json({ error: 'Failed to fetch database content' }, { status: 500 })
  }
}
