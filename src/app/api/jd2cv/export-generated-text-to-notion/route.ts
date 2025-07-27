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
    const { pageId, experienceIndex, experienceValue, keywords = [] } = await request.json()

    if (!pageId || !experienceIndex || experienceValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: pageId, experienceIndex, experienceValue' },
        { status: 400 }
      )
    }

    console.log(`Exporting generated text ${experienceIndex} to Notion with keywords:`, keywords)

    // Check if generated experience callout already exists and delete it
    const allBlocks = await notion.blocks.children.list({
      block_id: pageId,
    })
    
    const calloutTitle = `Aligned Experience ${experienceIndex}`
    
    // Find and delete existing generated experience callout
    for (const block of allBlocks.results) {
      const blockData = block as any
      if (blockData.type === 'callout') {
        const firstChild = blockData.callout?.children?.[0]
        if (firstChild?.type === 'heading_3') {
          const headingText = firstChild.heading_3?.rich_text?.[0]?.text?.content || ''
          if (headingText === calloutTitle) {
            await notion.blocks.delete({ block_id: blockData.id })
            console.log(`Deleted existing generated experience ${experienceIndex} callout`)
            break
          }
        }
      }
    }
    
    // Create new generated experience callout with bold keywords
    try {
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
                    rich_text: createRichTextWithBoldKeywords(experienceValue, keywords),
                  },
                },
              ],
            },
          },
        ],
      })
      console.log(`Successfully created generated experience ${experienceIndex} callout`)
      
      return NextResponse.json({ 
        success: true, 
        message: `Exported generated text ${experienceIndex} to Notion with ${keywords.length} keywords` 
      })
    } catch (calloutError) {
      console.error(`Failed to create callout for generated experience ${experienceIndex}:`, calloutError)
      return NextResponse.json(
        { 
          error: 'Failed to create Notion callout', 
          details: calloutError 
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error exporting generated text to Notion:', error)
    return NextResponse.json(
      { error: 'Failed to export generated text to Notion' },
      { status: 500 }
    )
  }
}