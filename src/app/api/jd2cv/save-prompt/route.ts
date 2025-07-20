import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, company, prompt_for_jd_keypoints } = await request.json()

    if (!title || !company || !prompt_for_jd_keypoints) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company, prompt_for_jd_keypoints' },
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
          prompt_for_jd_keypoints: {
            rich_text: [
              {
                text: {
                  content: prompt_for_jd_keypoints,
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
          prompt_for_jd_keypoints: {
            rich_text: [
              {
                text: {
                  content: prompt_for_jd_keypoints,
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
    console.error('Error saving prompt to Notion:', error)
    return NextResponse.json(
      { error: 'Failed to save prompt to database' },
      { status: 500 }
    )
  }
}