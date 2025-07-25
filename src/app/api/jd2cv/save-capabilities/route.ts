import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      company,
      capability_1,
      capability_2,
      capability_3,
      capability_4,
      capability_5
    } = await request.json()

    if (!title || !company) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company' },
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

    let pageId: string

    if (database.results.length > 0) {
      // Update existing page
      pageId = database.results[0].id
      await notion.pages.update({
        page_id: pageId,
        properties: {
          capability_1: {
            rich_text: [
              {
                text: {
                  content: capability_1 || '',
                },
              },
            ],
          },
          capability_2: {
            rich_text: [
              {
                text: {
                  content: capability_2 || '',
                },
              },
            ],
          },
          capability_3: {
            rich_text: [
              {
                text: {
                  content: capability_3 || '',
                },
              },
            ],
          },
          capability_4: {
            rich_text: [
              {
                text: {
                  content: capability_4 || '',
                },
              },
            ],
          },
          capability_5: {
            rich_text: [
              {
                text: {
                  content: capability_5 || '',
                },
              },
            ],
          },
        },
      })
    } else {
      // Create new page
      const response = await notion.pages.create({
        parent: { database_id: process.env.NOTION_JD2CV_DB_ID! },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
          company: {
            rich_text: [
              {
                text: {
                  content: company,
                },
              },
            ],
          },
          capability_1: {
            rich_text: [
              {
                text: {
                  content: capability_1 || '',
                },
              },
            ],
          },
          capability_2: {
            rich_text: [
              {
                text: {
                  content: capability_2 || '',
                },
              },
            ],
          },
          capability_3: {
            rich_text: [
              {
                text: {
                  content: capability_3 || '',
                },
              },
            ],
          },
          capability_4: {
            rich_text: [
              {
                text: {
                  content: capability_4 || '',
                },
              },
            ],
          },
          capability_5: {
            rich_text: [
              {
                text: {
                  content: capability_5 || '',
                },
              },
            ],
          },
        },
      })
      pageId = response.id
    }

    return NextResponse.json({ success: true, id: pageId })
  } catch (error) {
    console.error('Error saving capabilities to Notion:', error)
    return NextResponse.json(
      { error: 'Failed to save capabilities to database' },
      { status: 500 }
    )
  }
}