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
    const { searchParams } = new URL(request.url)
    const jdId = searchParams.get('id')
    
    if (!jdId) {
      return NextResponse.json(
        { success: false, error: 'JD ID is required' },
        { status: 400 }
      )
    }

    if (!process.env.NOTION_JD2CV_DB_ID) {
      return NextResponse.json(
        { success: false, error: 'JD2CV database configuration missing.' },
        { status: 500 }
      )
    }

    console.log(`Fetching JD record with ID: ${jdId}`)

    // Get the specific JD record
    const page = await notion.pages.retrieve({ page_id: jdId }) as any
    
    if (!page) {
      return NextResponse.json(
        { success: false, error: 'JD record not found' },
        { status: 404 }
      )
    }

    const properties = page.properties
    
    // Transform the data to match JDData interface
    const jdData = {
      title: extractTitle(properties.title?.title),
      company: extractText(properties.company?.rich_text),
      full_job_description: [
        extractText(properties.full_job_description?.rich_text),
        extractText(properties.full_job_description_part_2?.rich_text),
        extractText(properties.full_job_description_part_3?.rich_text),
        extractText(properties.full_job_description_part_4?.rich_text),
        extractText(properties.full_job_description_part_5?.rich_text)
      ].filter(part => part.trim()).join(''),
      jd_key_sentences: extractText(properties.jd_key_sentences?.rich_text),
      keywords_from_sentences: extractText(properties.keywords_from_sentences?.rich_text),
      application_stage: extractSelect(properties.application_stage?.select),
      role_group: extractSelect(properties.role_group?.select),
      firm_type: extractSelect(properties.firm_type?.select),
      match_score: extractNumber(properties.match_score?.number),
      comment: extractText(properties.comment?.rich_text),
      // Company experience fields
      stanleyhi: extractText(properties.stanleyhi?.rich_text),
      savvypro: extractText(properties.savvypro?.rich_text),
      ncs: extractText(properties.ncs?.rich_text),
      icekredit: extractText(properties.icekredit?.rich_text),
      huawei: extractText(properties.huawei?.rich_text),
      dieboldnixdorf: extractText(properties.dieboldnixdorf?.rich_text),
      fujixerox: extractText(properties.fujixerox?.rich_text)
    }

    console.log(`Successfully loaded JD: ${jdData.title} at ${jdData.company}`)

    return NextResponse.json({
      success: true,
      jd: jdData
    })

  } catch (error) {
    console.error('Error fetching JD record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch JD record. Please try again.' },
      { status: 500 }
    )
  }
}