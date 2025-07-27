import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, company, experienceIndex, inputExperienceValue, model = 'deepseek', keywordCount = 8 } = await request.json()

    if (!title || !company || !experienceIndex || inputExperienceValue === undefined) {
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

    const propertyName = `your_experience_${experienceIndex}`
    const keywordsPropertyName = `your_experience_${experienceIndex}_keywords`
    let pageId: string

    // Extract keywords from input experience using LLM
    let keywords: string[] = []
    let keywordsJson = '[]'
    
    try {
      const keywordResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jd2cv/extract-keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputExperienceValue,
          type: 'experience',
          model: model,
          keywordCount: keywordCount
        })
      })
      
      if (keywordResponse.ok) {
        const keywordData = await keywordResponse.json()
        if (keywordData.success && keywordData.keywords) {
          keywords = keywordData.keywords
          keywordsJson = JSON.stringify(keywords)
        }
      }
    } catch (keywordError) {
      console.error('Failed to extract keywords:', keywordError)
      // Continue with empty keywords - don't fail the main operation
    }

    if (database.results.length > 0) {
      // Update existing page
      pageId = database.results[0].id
      await notion.pages.update({
        page_id: pageId,
        properties: {
          [propertyName]: {
            rich_text: [{ text: { content: inputExperienceValue } }]
          },
          [keywordsPropertyName]: {
            rich_text: [{ text: { content: keywordsJson } }]
          },
        },
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
            rich_text: [{ text: { content: inputExperienceValue } }]
          },
          [keywordsPropertyName]: {
            rich_text: [{ text: { content: keywordsJson } }]
          },
        },
      })
      pageId = response.id
    }

    return NextResponse.json({ success: true, id: pageId, keywords: keywords })
  } catch (error) {
    console.error('Error saving input experience to Notion:', error)
    return NextResponse.json(
      { error: 'Failed to save input experience to database' },
      { status: 500 }
    )
  }
}