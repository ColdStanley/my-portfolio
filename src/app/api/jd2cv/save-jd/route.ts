import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, company, full_job_description } = await request.json()

    console.log('Received data:', { title, company, full_job_description: full_job_description?.length })

    if (!title || !company || !full_job_description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company, full_job_description' },
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

    console.log('Using database ID:', process.env.NOTION_JD2CV_DB_ID)

    // Check if record with same title and company already exists
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

    if (existingRecords.results.length > 0) {
      return NextResponse.json(
        { error: 'Record with same title and company already exists' },
        { status: 409 }
      )
    }

    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_JD2CV_DB_ID },
      properties: {
        title: {
          title: [{ text: { content: title } }]
        },
        company: {
          rich_text: [{ text: { content: company } }]
        },
        full_job_description: {
          rich_text: [{ text: { content: full_job_description.substring(0, 2000) } }]
        },
      },
    })

    console.log('Successfully created page:', response.id)
    return NextResponse.json({ success: true, id: response.id })
  } catch (error: any) {
    console.error('Error saving to Notion:', error)
    console.error('Error details:', error?.body || error?.message)
    return NextResponse.json(
      { error: 'Failed to save to database', details: error?.message },
      { status: 500 }
    )
  }
}