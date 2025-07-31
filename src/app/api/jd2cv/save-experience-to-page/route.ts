import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      jdTitle, 
      jdCompany, 
      experienceTitle, 
      experienceContent 
    } = await request.json()

    // Validate required fields
    if (!jdTitle || !jdCompany) {
      return NextResponse.json(
        { success: false, error: 'Missing job description title or company information.' },
        { status: 400 }
      )
    }

    if (!experienceTitle || !experienceContent) {
      return NextResponse.json(
        { success: false, error: 'Missing experience title or content.' },
        { status: 400 }
      )
    }

    if (!process.env.NOTION_JD2CV_DB_ID) {
      return NextResponse.json(
        { success: false, error: 'JD2CV database configuration missing.' },
        { status: 500 }
      )
    }

    // Search for matching JD record with both title and company
    const searchResults = await notion.databases.query({
      database_id: process.env.NOTION_JD2CV_DB_ID,
      filter: {
        and: [
          {
            property: 'title',
            title: {
              equals: jdTitle,
            },
          },
          {
            property: 'company',
            rich_text: {
              equals: jdCompany,
            },
          },
        ],
      },
    })

    if (searchResults.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `No matching job description found for "${jdTitle}" at "${jdCompany}". Please ensure the JD record exists.` 
      }, { status: 404 })
    }

    // Get the first matching record
    const targetPage = searchResults.results[0] as any
    const pageId = targetPage.id

    // Get the title field page ID - the title field itself is a page
    const titleProperty = targetPage.properties.title
    if (!titleProperty || !titleProperty.title || titleProperty.title.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No title page found for this JD record.'
      }, { status: 404 })
    }

    // Create content blocks to append to the title page
    const contentBlocks = [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `Experience: ${experienceTitle}`
              }
            }
          ]
        }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: experienceContent
              }
            }
          ]
        }
      },
      {
        object: 'block',
        type: 'divider',
        divider: {}
      }
    ]

    // Append the experience content to the title page
    await notion.blocks.children.append({
      block_id: pageId, // Use the page ID directly - this will add content to the page
      children: contentBlocks
    })

    return NextResponse.json({
      success: true,
      message: `Experience successfully saved to JD page: "${jdTitle}" at "${jdCompany}"`
    })
  } catch (error) {
    console.error('Error saving experience to page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save experience to page. Please try again.' },
      { status: 500 }
    )
  }
}