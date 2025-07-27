import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, company, experienceIndex, experienceValue } = await request.json()

    if (!title || !company || !experienceIndex || experienceValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find existing page or create new one
    const database = await notion.databases.query({
      database_id: process.env.NOTION_JD2CV_DB_ID!,
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

    const propertyName = `generated_text_${experienceIndex}`
    let pageId: string

    if (database.results.length > 0) {
      // Update existing page
      pageId = database.results[0].id
      console.log(`Updating page ${pageId} with aligned experience ${experienceIndex}`)
      
      await notion.pages.update({
        page_id: pageId,
        properties: {
          [propertyName]: {
            rich_text: [{ text: { content: experienceValue } }]
          },
        },
      })
      console.log(`Successfully updated database property ${propertyName}`)
    } else {
      // Create new page
      const response = await notion.pages.create({
        parent: { database_id: process.env.NOTION_JD2CV_DB_ID! },
        properties: {
          title: {
            title: [{ text: { content: title } }]
          },
          company: {
            rich_text: [{ text: { content: company } }]
          },
          [propertyName]: {
            rich_text: [{ text: { content: experienceValue } }]
          },
        },
      })
      pageId = response.id
    }

    return NextResponse.json({ success: true, id: pageId })
  } catch (error) {
    console.error('Error saving aligned experience to Notion:', error)
    return NextResponse.json(
      { error: 'Failed to save aligned experience to database' },
      { status: 500 }
    )
  }
}