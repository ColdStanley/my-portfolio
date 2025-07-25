import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, company, capabilityIndex, capabilityValue } = await request.json()

    if (!title || !company || !capabilityIndex || capabilityValue === undefined) {
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

    const propertyName = `capability_${capabilityIndex}`
    let pageId: string

    if (database.results.length > 0) {
      // Update existing page
      pageId = database.results[0].id
      await notion.pages.update({
        page_id: pageId,
        properties: {
          [propertyName]: {
            rich_text: [{ text: { content: capabilityValue } }]
          },
        },
      })

      // Check if capability callout already exists and delete it
      const allBlocks = await notion.blocks.children.list({
        block_id: pageId,
      })
      
      const calloutTitle = `Capability ${capabilityIndex}`
      
      // Find and delete existing capability callout
      for (const block of allBlocks.results) {
        const blockData = block as any
        if (blockData.type === 'callout') {
          const firstChild = blockData.callout?.children?.[0]
          if (firstChild?.type === 'heading_3') {
            const headingText = firstChild.heading_3?.rich_text?.[0]?.text?.content || ''
            if (headingText === calloutTitle) {
              await notion.blocks.delete({ block_id: blockData.id })
              console.log(`Deleted existing capability ${capabilityIndex} callout`)
              break
            }
          }
        }
      }
      
      // Create new capability callout
      const calloutResponse = await notion.blocks.children.append({
        block_id: pageId,
        children: [
          {
            object: 'block',
            type: 'callout',
            callout: {
              rich_text: [],
              color: 'gray_background',
              children: [
                {
                  object: 'block',
                  type: 'heading_3',
                  heading_3: {
                    rich_text: [
                      {
                        type: 'text',
                        text: {
                          content: calloutTitle,
                        },
                        annotations: {
                          bold: true
                        }
                      },
                    ],
                  },
                },
                {
                  object: 'block',
                  type: 'paragraph',
                  paragraph: {
                    rich_text: [
                      {
                        type: 'text',
                        text: {
                          content: capabilityValue,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      })
      
      console.log(`Created/updated capability ${capabilityIndex} callout`)
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
            rich_text: [{ text: { content: capabilityValue } }]
          },
        },
      })
      pageId = response.id

      // Create capability callout for new page
      const calloutTitle = `Capability ${capabilityIndex}`
      
      const calloutResponse = await notion.blocks.children.append({
        block_id: pageId,
        children: [
          {
            object: 'block',
            type: 'callout',
            callout: {
              rich_text: [],
              color: 'gray_background',
              children: [
                {
                  object: 'block',
                  type: 'heading_3',
                  heading_3: {
                    rich_text: [
                      {
                        type: 'text',
                        text: {
                          content: calloutTitle,
                        },
                        annotations: {
                          bold: true
                        }
                      },
                    ],
                  },
                },
                {
                  object: 'block',
                  type: 'paragraph',
                  paragraph: {
                    rich_text: [
                      {
                        type: 'text',
                        text: {
                          content: capabilityValue,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      })
      
      console.log(`Created capability ${capabilityIndex} callout for new page`)
    }

    return NextResponse.json({ success: true, id: pageId })
  } catch (error) {
    console.error('Error saving individual capability to Notion:', error)
    return NextResponse.json(
      { error: 'Failed to save capability to database' },
      { status: 500 }
    )
  }
}