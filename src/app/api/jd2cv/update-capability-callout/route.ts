import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, company, capabilityIndex, capabilityValue, experienceValue } = await request.json()

    if (!title || !company || !capabilityIndex || !capabilityValue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find existing page
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

    if (database.results.length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    const pageId = database.results[0].id

    // Get all blocks in the page
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
    })

    // Find the callout block for this capability (simple approach: delete all and recreate)
    // In production, you might want to find and update specific blocks
    
    // For now, let's append a new complete callout
    const experienceLines = experienceValue ? experienceValue.split('\n').filter(line => line.trim().length > 0) : []
    const bulletBlocks = experienceLines.map(line => ({
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: line.replace(/^[•\-\*]\s*/, ''),
            },
          },
        ],
      },
    }))

    const calloutChildren = [
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `Expected Capability from Job Description - ${capabilityIndex}`,
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
    ]

    // Add divider and experience if experienceValue exists
    if (experienceValue && experienceValue.trim()) {
      calloutChildren.push(
        {
          object: 'block',
          type: 'divider',
          divider: {},
        },
        {
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `Relevant Experience/Project - ${capabilityIndex}`,
                },
                annotations: {
                  bold: true
                }
              },
            ],
          },
        },
        ...bulletBlocks
      )
    }

    await notion.blocks.children.append({
      block_id: pageId,
      children: [
        {
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: [],
            icon: {
              emoji: '📋'
            },
            color: 'gray_background',
            children: calloutChildren,
          },
        },
      ],
    })

    return NextResponse.json({ success: true, id: pageId })
  } catch (error) {
    console.error('Error updating capability callout to Notion:', error)
    return NextResponse.json(
      { error: 'Failed to update capability callout to database' },
      { status: 500 }
    )
  }
}