import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { pageId, type, index, keywords } = await request.json()

    if (!pageId || !type || index === undefined || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Missing required fields: pageId, type, index, keywords' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['capability', 'experience', 'generated']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: capability, experience, generated' },
        { status: 400 }
      )
    }

    // Determine the property name based on type and index
    // Note: index is 0-based from frontend, but database fields are 1-based
    let keywordsPropertyName: string
    if (type === 'capability') {
      keywordsPropertyName = `capability_${index + 1}_keywords`
    } else if (type === 'experience') {
      keywordsPropertyName = `your_experience_${index + 1}_keywords`
    } else if (type === 'generated') {
      keywordsPropertyName = `generated_text_${index + 1}_keywords`
    } else {
      return NextResponse.json(
        { error: 'Invalid type specified' },
        { status: 400 }
      )
    }

    // Convert keywords array to JSON string
    const keywordsJson = JSON.stringify(keywords)

    console.log(`Updating ${keywordsPropertyName} with keywords:`, keywords)

    // Update the Notion page with new keywords
    try {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          [keywordsPropertyName]: {
            rich_text: [{ text: { content: keywordsJson } }]
          }
        }
      })
    } catch (notionError: any) {
      console.error('Notion API error:', notionError)
      return NextResponse.json(
        { 
          error: 'Failed to update Notion page', 
          details: notionError.message || notionError.toString(),
          field: keywordsPropertyName 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${keywordsPropertyName} with ${keywords.length} keywords` 
    })
  } catch (error) {
    console.error('Error updating keywords:', error)
    return NextResponse.json(
      { error: 'Failed to update keywords' },
      { status: 500 }
    )
  }
}