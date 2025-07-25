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

    const extractedData = {
      id: record.id,
      title: record.properties.title?.title?.[0]?.text?.content || '',
      company: record.properties.company?.rich_text?.[0]?.text?.content || '',
      full_job_description: completeJobDescription,
      prompt_for_jd_keypoints: record.properties.prompt_for_jd_keypoints?.rich_text?.[0]?.text?.content || '',
      key_required_capability_1: record.properties.key_required_capability_1?.rich_text?.[0]?.text?.content || '',
      key_required_capability_2: record.properties.key_required_capability_2?.rich_text?.[0]?.text?.content || '',
      key_required_capability_3: record.properties.key_required_capability_3?.rich_text?.[0]?.text?.content || '',
      key_required_capability_4: record.properties.key_required_capability_4?.rich_text?.[0]?.text?.content || '',
      key_required_capability_5: record.properties.key_required_capability_5?.rich_text?.[0]?.text?.content || '',
      e_p_for_c_1: record.properties.e_p_for_c_1?.rich_text?.[0]?.text?.content || '',
      e_p_for_c_2: record.properties.e_p_for_c_2?.rich_text?.[0]?.text?.content || '',
      e_p_for_c_3: record.properties.e_p_for_c_3?.rich_text?.[0]?.text?.content || '',
      e_p_for_c_4: record.properties.e_p_for_c_4?.rich_text?.[0]?.text?.content || '',
      e_p_for_c_5: record.properties.e_p_for_c_5?.rich_text?.[0]?.text?.content || '',
      input_e_p_for_c_1: record.properties.input_e_p_for_c_1?.rich_text?.[0]?.text?.content || '',
      input_e_p_for_c_2: record.properties.input_e_p_for_c_2?.rich_text?.[0]?.text?.content || '',
      input_e_p_for_c_3: record.properties.input_e_p_for_c_3?.rich_text?.[0]?.text?.content || '',
      input_e_p_for_c_4: record.properties.input_e_p_for_c_4?.rich_text?.[0]?.text?.content || '',
      input_e_p_for_c_5: record.properties.input_e_p_for_c_5?.rich_text?.[0]?.text?.content || '',
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