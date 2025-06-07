import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const databaseId = process.env.NOTION_IELTS_READING_DB_ID!

export async function GET() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
    })

    const questions = response.results.map((page: any) => {
      const props = page.properties

      return {
        QuestionID: props?.QuestionID?.title?.[0]?.plain_text || '',
        QuestionText: props?.QuestionText?.rich_text?.[0]?.plain_text || '',
        Answer: props?.Answer?.rich_text?.[0]?.plain_text || '',
        AnswerSentence: props?.AnswerSentence?.rich_text?.[0]?.plain_text || '',
        AnswerContext: props?.AnswerContext?.rich_text?.map((r: any) => r.plain_text).join('\n') || '',
        Vocabulary: props?.Vocabulary?.rich_text?.map((r: any) => r.plain_text).join('\n') || '',
        Phrases: props?.Phrases?.rich_text?.map((r: any) => r.plain_text).join('\n') || '',
        Book: props?.Book?.select?.name || '',
        Passage: props?.Passage?.select?.name || '',
        QuestionType: props?.QuestionType?.select?.name || '',
        Test: props?.Test?.select?.name || '', // 如果你后续添加 Test 字段，这里支持
      }
    })

    return NextResponse.json({ data: questions })
  } catch (error) {
    console.error('❌ Error fetching Notion Reading questions:', error)
    return NextResponse.json({ error: 'Failed to fetch Notion Reading questions' }, { status: 500 })
  }
}
