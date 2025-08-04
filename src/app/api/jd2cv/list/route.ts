import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Extract text from Notion rich text property
const extractText = (richText: any): string => {
  if (!richText || !Array.isArray(richText)) return ''
  return richText.map((item: any) => item.plain_text || '').join('')
}

// Extract title from Notion title property
const extractTitle = (title: any): string => {
  if (!title || !Array.isArray(title)) return ''
  return title.map((item: any) => item.plain_text || '').join('')
}

// Extract select value from Notion select property
const extractSelect = (select: any): string => {
  return select?.name || ''
}

// Extract number from Notion number property
const extractNumber = (number: any): number => {
  return number || 0
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NOTION_JD2CV_DB_ID) {
      return NextResponse.json(
        { success: false, error: 'JD2CV database configuration missing.' },
        { status: 500 }
      )
    }

    console.log('Fetching all JD records from database...')

    // Fetch all JD records, sorted by creation time (newest first)
    const response = await notion.databases.query({
      database_id: process.env.NOTION_JD2CV_DB_ID,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending'
        }
      ]
    })

    console.log(`Found ${response.results.length} JD records`)

    // Transform the data
    const jdList = response.results.map((page: any) => {
      const properties = page.properties
      
      return {
        id: page.id,
        title: extractTitle(properties.title?.title),
        company: extractText(properties.company?.rich_text),
        application_stage: extractSelect(properties.application_stage?.select),
        role_group: extractSelect(properties.role_group?.select),
        firm_type: extractSelect(properties.firm_type?.select),
        match_score: extractNumber(properties.match_score?.number),
        comment: extractText(properties.comment?.rich_text),
        keywords_from_sentences: extractText(properties.keywords_from_sentences?.rich_text),
        created_time: page.created_time,
        last_edited_time: page.last_edited_time
      }
    })

    console.log(`Returning ${jdList.length} transformed JD records`)

    return NextResponse.json({
      success: true,
      data: jdList,
      total: jdList.length
    })

  } catch (error) {
    console.error('Error fetching JD list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch JD list. Please try again.' },
      { status: 500 }
    )
  }
}