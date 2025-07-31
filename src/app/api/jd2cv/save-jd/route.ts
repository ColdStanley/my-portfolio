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

    // Check if we need to create additional fields for long content
    if (full_job_description.length > 2000) {
      try {
        // Get current database schema
        const database = await notion.databases.retrieve({ database_id: process.env.NOTION_JD2CV_DB_ID })
        const currentProperties = database.properties

        // Check if additional fields exist
        const needsUpdate = !currentProperties.full_job_description_part_2

        if (needsUpdate) {
          console.log('Creating additional fields for long JD content and new key sentence/keyword fields...')
          await notion.databases.update({
            database_id: process.env.NOTION_JD2CV_DB_ID,
            properties: {
              ...currentProperties,
              full_job_description_part_2: { rich_text: {} },
              full_job_description_part_3: { rich_text: {} },
              full_job_description_part_4: { rich_text: {} },
              full_job_description_part_5: { rich_text: {} },
              jd_key_sentences: { rich_text: {} },
              keywords_from_sentences: { rich_text: {} }
            }
          })
          console.log('Successfully created additional fields')
        }
      } catch (error) {
        console.error('Error creating additional fields:', error)
        // Continue with original logic if field creation fails
      }
    }

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

    // Split job description into chunks if needed
    const jdPart1 = full_job_description.substring(0, 2000)
    const jdPart2 = full_job_description.substring(2000, 4000)
    const jdPart3 = full_job_description.substring(4000, 6000)
    const jdPart4 = full_job_description.substring(6000, 8000)
    const jdPart5 = full_job_description.substring(8000, 10000)

    // Create the page with all parts
    const properties: any = {
      title: {
        title: [{ text: { content: title } }]
      },
      company: {
        rich_text: [{ text: { content: company } }]
      },
      full_job_description: {
        rich_text: [{ text: { content: jdPart1 } }]
      },
    }

    // Add additional parts if they exist
    if (jdPart2) {
      properties.full_job_description_part_2 = {
        rich_text: [{ text: { content: jdPart2 } }]
      }
    }
    if (jdPart3) {
      properties.full_job_description_part_3 = {
        rich_text: [{ text: { content: jdPart3 } }]
      }
    }
    if (jdPart4) {
      properties.full_job_description_part_4 = {
        rich_text: [{ text: { content: jdPart4 } }]
      }
    }
    if (jdPart5) {
      properties.full_job_description_part_5 = {
        rich_text: [{ text: { content: jdPart5 } }]
      }
    }


    let response
    let pageId

    if (existingRecords.results.length > 0) {
      // Update existing record
      pageId = existingRecords.results[0].id
      response = await notion.pages.update({
        page_id: pageId,
        properties
      })
      console.log('Successfully updated page:', pageId)
    } else {
      // Create new record
      response = await notion.pages.create({
        parent: { database_id: process.env.NOTION_JD2CV_DB_ID },
        properties
      })
      pageId = response.id
      console.log('Successfully created page:', pageId)
    }

    return NextResponse.json({ 
      success: true, 
      id: pageId 
    })
  } catch (error: any) {
    console.error('Error saving to Notion:', error)
    console.error('Error details:', error?.body || error?.message)
    return NextResponse.json(
      { error: 'Failed to save to database', details: error?.message },
      { status: 500 }
    )
  }
}