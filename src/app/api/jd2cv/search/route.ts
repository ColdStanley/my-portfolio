import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, company } = await request.json()

    if (!title || !company) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company' },
        { status: 400 }
      )
    }

    if (!process.env.NOTION_JD2CV_DB_ID) {
      console.error('NOTION_JD2CV_DB_ID not found in environment variables')
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      )
    }

    // Search for record with matching title and company
    const searchResults = await notion.databases.query({
      database_id: process.env.NOTION_JD2CV_DB_ID,
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

    if (searchResults.results.length === 0) {
      return NextResponse.json({ 
        found: false, 
        message: 'No matching record found' 
      })
    }

    // Get the first (and should be only) matching record
    const record = searchResults.results[0] as any
    
    // Extract all properties from the Notion record
    const jdPart1 = record.properties.full_job_description?.rich_text?.[0]?.text?.content || ''
    const jdPart2 = record.properties.full_job_description_part_2?.rich_text?.[0]?.text?.content || ''
    const jdPart3 = record.properties.full_job_description_part_3?.rich_text?.[0]?.text?.content || ''
    const jdPart4 = record.properties.full_job_description_part_4?.rich_text?.[0]?.text?.content || ''
    const jdPart5 = record.properties.full_job_description_part_5?.rich_text?.[0]?.text?.content || ''
    
    // Combine all JD parts into complete content
    const completeJobDescription = jdPart1 + jdPart2 + jdPart3 + jdPart4 + jdPart5

    // Extract key sentences
    const keySentencesRaw = record.properties.job_description_key_sentences?.rich_text?.[0]?.text?.content || ''
    let keySentences: string[] = []
    if (keySentencesRaw) {
      try {
        keySentences = JSON.parse(keySentencesRaw)
      } catch (error) {
        console.error('Failed to parse key sentences:', error)
        keySentences = []
      }
    }

    // Extract match score
    const matchScore = record.properties.match_score?.number || 0

    const extractedData = {
      id: record.id,
      title: record.properties.title?.title?.[0]?.text?.content || '',
      company: record.properties.company?.rich_text?.[0]?.text?.content || '',
      full_job_description: completeJobDescription,
      job_description_key_sentences: keySentences,
      match_score: matchScore,
      capability_1: record.properties.capability_1?.rich_text?.[0]?.text?.content || '',
      capability_2: record.properties.capability_2?.rich_text?.[0]?.text?.content || '',
      capability_3: record.properties.capability_3?.rich_text?.[0]?.text?.content || '',
      capability_4: record.properties.capability_4?.rich_text?.[0]?.text?.content || '',
      capability_5: record.properties.capability_5?.rich_text?.[0]?.text?.content || '',
      generated_text_1: record.properties.generated_text_1?.rich_text?.[0]?.text?.content || '',
      generated_text_2: record.properties.generated_text_2?.rich_text?.[0]?.text?.content || '',
      generated_text_3: record.properties.generated_text_3?.rich_text?.[0]?.text?.content || '',
      generated_text_4: record.properties.generated_text_4?.rich_text?.[0]?.text?.content || '',
      generated_text_5: record.properties.generated_text_5?.rich_text?.[0]?.text?.content || '',
      your_experience_1: record.properties.your_experience_1?.rich_text?.[0]?.text?.content || '',
      your_experience_2: record.properties.your_experience_2?.rich_text?.[0]?.text?.content || '',
      your_experience_3: record.properties.your_experience_3?.rich_text?.[0]?.text?.content || '',
      your_experience_4: record.properties.your_experience_4?.rich_text?.[0]?.text?.content || '',
      your_experience_5: record.properties.your_experience_5?.rich_text?.[0]?.text?.content || '',
      comment: record.properties.comment?.rich_text?.[0]?.text?.content || '',
      application_stage: record.properties.application_stage?.select?.name || '',
      role_group: record.properties.role_group?.select?.name || '',
      firm_type: record.properties.firm_type?.select?.name || '',
      cv_pdf: record.properties.cv_pdf?.files?.[0]?.file?.url || '',
    }

    return NextResponse.json({ 
      found: true, 
      record: extractedData 
    })
  } catch (error: any) {
    console.error('Error searching Notion database:', error)
    return NextResponse.json(
      { error: 'Failed to search database', details: error?.message },
      { status: 500 }
    )
  }
}