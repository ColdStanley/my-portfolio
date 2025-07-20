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

    const propertyName = `e_p_for_c_${experienceIndex}`
    let pageId: string

    if (database.results.length > 0) {
      // Update existing page
      pageId = database.results[0].id
      await notion.pages.update({
        page_id: pageId,
        properties: {
          [propertyName]: {
            rich_text: [{ text: { content: experienceValue } }]
          },
        },
      })

      // Get the corresponding capability value to create complete callout
      const capabilityPropertyName = `key_required_capability_${experienceIndex}`
      const pageData = await notion.pages.retrieve({ page_id: pageId })
      const capabilityValue = (pageData.properties as any)[capabilityPropertyName]?.rich_text?.[0]?.text?.content || ''

      // Call the unified callout update API
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/jd2cv/update-capability-callout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          company,
          capabilityIndex: experienceIndex,
          capabilityValue,
          experienceValue
        })
      })
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

      // For new pages, we'll handle the callout creation when both capability and experience are available
      // For now, just save the property - the callout will be created when save-individual-capability is called
    }

    return NextResponse.json({ success: true, id: pageId })
  } catch (error) {
    console.error('Error saving experience to Notion:', error)
    return NextResponse.json(
      { error: 'Failed to save experience to database' },
      { status: 500 }
    )
  }
}