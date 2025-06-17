import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_NEW_SPEAKING_DB_ID as string

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const part = searchParams.get('part')

  if (!part) {
    return NextResponse.json({ error: '❌ 缺少参数 part' }, { status: 400 })
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Part',
        select: {
          equals: part
        }
      },
      sorts: [
        {
          property: 'CreatedTime',
          direction: 'descending',
        },
      ],
    })

    const items = response.results.map((page) => {
      const props: any = page.properties
      return {
        id: page.id,
        questionText: props.QuestionText?.rich_text?.[0]?.plain_text || '',
        part: props.Part?.select?.name || '',
      }
    })

    return NextResponse.json({ items })
  } catch (err: any) {
    return NextResponse.json(
      { error: '❌ Notion 查询失败', detail: err.message },
      { status: 500 }
    )
  }
}
