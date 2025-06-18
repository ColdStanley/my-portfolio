import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_NEW_SPEAKING_DB_ID

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const questionId = searchParams.get('questionId')

  if (!questionId) {
    return NextResponse.json({ error: '❌ 缺少参数 questionId' }, { status: 400 })
  }

  if (!databaseId) {
    return NextResponse.json({ error: '❌ 缺少数据库ID' }, { status: 500 })
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'QuestionText',
        rich_text: {
          equals: questionId
        }
      }
    })

    const page = response.results[0]
    if (!page) {
      return NextResponse.json({ error: '❌ 未找到对应题目' }, { status: 404 })
    }

    const props = (page as any).properties

    const templateSentence =
      props['TemplateSentence']?.rich_text?.map((block: any) => block.plain_text).join('\n') || ''

    const formatAnswer = (band: number) => {
      const bandKey = `Band${band}`
      return {
        band,
        text: props[`${bandKey} Text`]?.rich_text?.[0]?.plain_text || '',
        keywords:
          props[`${bandKey}HighlightWords`]?.multi_select?.flatMap((kw: any) =>
            kw.name.split(';').map((s: string) => s.trim())
          ) || [],
        explanations: parseExplanation(
          props[`${bandKey}HighlightNotes`]?.rich_text
            ?.map((block: any) => block.plain_text)
            ?.join('\n') || ''
        ),
        templateSentence // ✅ 所有 Band 共用一个字段
      }
    }

    const answers = [6, 7, 8].map(formatAnswer)

    return NextResponse.json({ answers })
  } catch (error) {
    console.error('❌ Notion 查询失败:', error)
    return NextResponse.json({ error: '❌ Notion 查询失败', detail: String(error) }, { status: 500 })
  }
}

// ✅ 支持“关键词: 解释”多行解析，容错增强
function parseExplanation(raw: string): Record<string, string> {
  const map: Record<string, string> = {}

  const entries = raw
    .split(/[\n；;。\.]/) // 中文/英文分号、句号、换行
    .map(line => line.trim())
    .filter(Boolean)

  for (const entry of entries) {
    const [key, ...rest] = entry.split(':')
    if (key && rest.length) {
      map[key.trim()] = rest.join(':').trim()
    }
  }

  return map
}
