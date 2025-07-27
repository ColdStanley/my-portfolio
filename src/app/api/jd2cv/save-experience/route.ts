import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Helper function to create rich text with bold keywords
function createRichTextWithBoldKeywords(text: string, keywords: string[]) {
  if (!keywords || keywords.length === 0) {
    return [{
      type: 'text',
      text: { content: text }
    }]
  }

  const richTextParts: any[] = []
  let currentText = text
  let currentIndex = 0

  // Sort keywords by length (longest first) to handle overlapping matches
  const sortedKeywords = keywords.sort((a, b) => b.length - a.length)

  while (currentIndex < currentText.length) {
    let foundMatch = false
    
    for (const keyword of sortedKeywords) {
      const keywordIndex = currentText.toLowerCase().indexOf(keyword.toLowerCase(), currentIndex)
      
      if (keywordIndex === currentIndex) {
        // Add the keyword as bold text
        richTextParts.push({
          type: 'text',
          text: { content: currentText.substring(keywordIndex, keywordIndex + keyword.length) },
          annotations: { bold: true }
        })
        currentIndex = keywordIndex + keyword.length
        foundMatch = true
        break
      }
    }
    
    if (!foundMatch) {
      // Find the next keyword occurrence
      let nextKeywordIndex = currentText.length
      let nextKeyword = ''
      
      for (const keyword of sortedKeywords) {
        const keywordIndex = currentText.toLowerCase().indexOf(keyword.toLowerCase(), currentIndex)
        if (keywordIndex !== -1 && keywordIndex < nextKeywordIndex) {
          nextKeywordIndex = keywordIndex
          nextKeyword = keyword
        }
      }
      
      // Add regular text until next keyword
      const regularText = currentText.substring(currentIndex, nextKeywordIndex)
      if (regularText) {
        richTextParts.push({
          type: 'text',
          text: { content: regularText }
        })
      }
      currentIndex = nextKeywordIndex
    }
  }

  return richTextParts.length > 0 ? richTextParts : [{
    type: 'text',
    text: { content: text }
  }]
}

export async function POST(request: NextRequest) {
  try {
    const { title, company, experienceIndex, experienceValue, model = 'deepseek', keywordCount = 8 } = await request.json()

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
    const keywordsPropertyName = `generated_text_${experienceIndex}_keywords`
    let pageId: string

    // Extract keywords from generated experience text using LLM
    let keywords: string[] = []
    let keywordsJson = '[]'
    
    try {
      const keywordResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jd2cv/extract-keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: experienceValue,
          type: 'generated',
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
            rich_text: [{ text: { content: experienceValue } }]
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
            rich_text: [{ text: { content: experienceValue } }]
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
    console.error('Error saving experience to Notion:', error)
    return NextResponse.json(
      { error: 'Failed to save experience to database' },
      { status: 500 }
    )
  }
}