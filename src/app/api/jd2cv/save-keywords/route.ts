import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, company, keywords } = await request.json()

    if (!title || !company || !keywords) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company, keywords' },
        { status: 400 }
      )
    }

    if (!process.env.NOTION_JD2CV_DB_ID) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      )
    }

    // Find existing record with same title and company
    const existingRecords = await notion.databases.query({
      database_id: process.env.NOTION_JD2CV_DB_ID,
      filter: {
        and: [
          {
            property: 'title',
            title: {
              equals: title,
            },
          },
          {
            property: 'company',
            rich_text: {
              equals: company,
            },
          },
        ],
      },
    })

    if (existingRecords.results.length === 0) {
      return NextResponse.json(
        { error: 'No existing record found for this title and company' },
        { status: 404 }
      )
    }

    // Update existing record with keywords
    const pageId = existingRecords.results[0].id
    await notion.pages.update({
      page_id: pageId,
      properties: {
        keywords_from_sentences: {
          rich_text: [{ text: { content: keywords } }]
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      id: pageId 
    })
  } catch (error: any) {
    console.error('Error saving keywords to Notion:', error)
    return NextResponse.json(
      { error: 'Failed to save keywords', details: error?.message },
      { status: 500 }
    )
  }
}