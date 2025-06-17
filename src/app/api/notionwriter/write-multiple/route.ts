import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { databaseId, content } = body

  if (!databaseId || !content) {
    return NextResponse.json({ error: 'Missing databaseId or content' }, { status: 400 })
  }

  // 获取字段 schema
  let schema: Record<string, string> = {}
  try {
    const response = await notion.databases.retrieve({ database_id: databaseId })
    for (const [key, value] of Object.entries(response.properties)) {
      schema[key] = value.type
    }
  } catch (error: any) {
    console.error('Error retrieving schema:', error)
    return NextResponse.json({ error: 'Failed to retrieve Notion schema' }, { status: 500 })
  }

  // 解析记录
  const rawEntries = content
    .split(/\n\s*\n/) // 按空行分隔每条记录
    .map((entry) => {
      const lines = entry.split('\n').map((l) => l.trim()).filter(Boolean)
      const result: Record<string, string> = {}
      for (const line of lines) {
        const [key, ...rest] = line.split(':')
        if (key && rest.length) {
          result[key.trim()] = rest.join(':').trim()
        }
      }
      return result
    })

  // 反向写入以保证显示顺序 = 输入顺序
  const entries = rawEntries.reverse()

  const failures: { line: number; reason: string }[] = []
  let successCount = 0

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const line = rawEntries.length - i // 原始输入中的行号（用于提示）

    // ✅ 检查 title 是否存在
    if (!entry.Title) {
      failures.push({ line, reason: 'Missing Title field' })
      continue
    }

    const properties: any = {}
    let entryHasError = false
    const fieldErrors: string[] = []

    for (const [field, value] of Object.entries(entry)) {
      const type = schema[field]
      if (!type) {
        fieldErrors.push(`Unrecognized field: ${field}`)
        entryHasError = true
        continue
      }

      try {
        switch (type) {
          case 'title':
            properties[field] = {
              title: [{ text: { content: value } }],
            }
            break
          case 'rich_text':
            properties[field] = {
              rich_text: [{ text: { content: value } }],
            }
            break
          case 'multi_select':
            properties[field] = {
              multi_select: value.split(',').map((v) => ({ name: v.trim() })),
            }
            break
          case 'select':
            properties[field] = {
              select: { name: value },
            }
            break
          case 'url':
            properties[field] = {
              url: value,
            }
            break
          case 'date':
            properties[field] = {
              date: { start: value },
            }
            break
          default:
            fieldErrors.push(`Unsupported field type: ${type} for ${field}`)
            entryHasError = true
        }
      } catch (err: any) {
        fieldErrors.push(`Error processing field ${field}: ${err.message}`)
        entryHasError = true
      }
    }

    if (entryHasError) {
      failures.push({ line, reason: fieldErrors.join('; ') })
      continue
    }

    try {
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties,
      })
      successCount++
      await new Promise((res) => setTimeout(res, 1000)) // 节流
    } catch (err: any) {
      failures.push({ line, reason: err.message || 'Unknown error writing to Notion' })
    }
  }

  return NextResponse.json({ successCount, failureCount: failures.length, failures })
}
