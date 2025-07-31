import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, company, key_sentences } = await request.json()

    if (!title || !company || !key_sentences) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company, key_sentences' },
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

    // Update existing record with key sentences
    const pageId = existingRecords.results[0].id
    await notion.pages.update({
      page_id: pageId,
      properties: {
        jd_key_sentences: {
          rich_text: [{ text: { content: key_sentences } }]
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      id: pageId 
    })
  } catch (error: any) {
    console.error('Error saving key sentences to Notion:', error)
    return NextResponse.json(
      { error: 'Failed to save key sentences', details: error?.message },
      { status: 500 }
    )
  }
}