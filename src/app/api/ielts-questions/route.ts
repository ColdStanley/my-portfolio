// 文件路径: app/api/ielts-questions/route.ts
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
    const res = await notion.databases.query({
      database_id: '2088ebc7833480a9910ee19cd516a805',
      filter: {
        property: 'Part',
        select: {
          equals: part
        }
      }
    })

    const questions = res.results.map((page: any) => {
      return page.properties?.Question?.title?.map(t => t.plain_text).join('') || ''

    })

    return NextResponse.json({ questions })
  } catch (err) {
    console.error('Notion query failed:', err)
    return NextResponse.json({ error: 'Notion query failed' }, { status: 500 })
  }
}
