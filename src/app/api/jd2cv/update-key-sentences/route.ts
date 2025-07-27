import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, company, keySentences } = await request.json()

    if (!title || !company || !Array.isArray(keySentences)) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company, keySentences (array)' },
        { status: 400 }
      )
    }

    if (!process.env.NOTION_JD2CV_DB_ID) {
      console.error('NOTION_JD2CV_DB_ID not found in environment variables')
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      )
    }

    // Find existing record by title and company
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
        { error: 'No matching record found' },
        { status: 404 }
      )
    }

    // Update the first matching record
    const pageId = existingRecords.results[0].id
    await notion.pages.update({
      page_id: pageId,
      properties: {
        job_description_key_sentences: {
          rich_text: [{ text: { content: JSON.stringify(keySentences) } }]
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Key sentences updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating key sentences:', error)
    return NextResponse.json(
      { error: 'Failed to update key sentences', details: error?.message },
      { status: 500 }
    )
  }
}