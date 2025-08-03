import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

// Unified professional experience database ID
const getDatabaseId = (): string => {
  return process.env.NOTION_PROFESSIONALEXPERIENCE_DB_ID || ''
}

// Property name mapping for unified table (no company prefixes)
const getPropertyNames = () => ({
  experience: 'experience',
  title: 'title',
  keywords: 'keywords',
  role_group: 'role_group',
  target_role: 'target_role',
  time: 'time',
  work_or_project: 'work_or_project',
  comment: 'comment',
  company: 'company'
})

// Extract text from Notion rich text property
const extractText = (richText: any): string => {
  if (!richText || !Array.isArray(richText)) return ''
  return richText.map((item: any) => item.plain_text || '').join('')
}

// Extract select value from Notion select property
const extractSelect = (select: any): string => {
  return select?.name || ''
}

// Extract multi-select values from Notion multi-select property
const extractMultiSelect = (multiSelect: any): string[] => {
  if (!multiSelect || !Array.isArray(multiSelect)) return []
  return multiSelect.map((item: any) => item.name || '').filter(Boolean)
}

// GET: Fetch all experience records for a company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const company = searchParams.get('company')
    
    if (!company) {
      return NextResponse.json(
        { error: 'Company parameter is required' },
        { status: 400 }
      )
    }
    
    console.log(`Fetching data for company: ${company}`)
    const databaseId = getDatabaseId()
    console.log(`Database ID: ${databaseId}`)
    
    if (!databaseId) {
      console.error('Database ID not found')
      return NextResponse.json(
        { error: 'Database ID not found' },
        { status: 400 }
      )
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'company',
        select: {
          equals: company
        }
      },
      sorts: [
        {
          property: 'company',
          direction: 'ascending'
        }
      ]
    })

    // Debug: log all property names in the first record
    if (response.results.length > 0) {
      const firstRecord = response.results[0] as any
      console.log(`Available properties in ${company} database:`, Object.keys(firstRecord.properties))
    }

    const propertyNames = getPropertyNames()
    
    const records = response.results.map((page: any) => {
      const properties = page.properties
      console.log(`Processing page ${page.id}, properties:`, Object.keys(properties))
      
      const record = {
        id: page.id,
        title: extractSelect(properties[propertyNames.title]?.select),
        experience: extractText(properties[propertyNames.experience]?.rich_text),
        keywords: extractMultiSelect(properties[propertyNames.keywords]?.multi_select),
        role_group: extractSelect(properties[propertyNames.role_group]?.select),
        target_role: extractSelect(properties[propertyNames.target_role]?.select),
        time: extractText(properties[propertyNames.time]?.rich_text),
        work_or_project: extractSelect(properties[propertyNames.work_or_project]?.select) as 'work' | 'project',
        comment: extractText(properties[propertyNames.comment]?.rich_text)
      }
      
      console.log(`Processed record:`, record)
      return record
    })

    console.log(`Returning ${records.length} records for ${company}`)
    return NextResponse.json({ success: true, records })
  } catch (error) {
    console.error('Error fetching experience records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch experience records' },
      { status: 500 }
    )
  }
}

// POST: Create a new experience record
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const company = searchParams.get('company')
    
    if (!company) {
      return NextResponse.json(
        { error: 'Company parameter is required' },
        { status: 400 }
      )
    }
    
    const databaseId = getDatabaseId()
    
    if (!databaseId) {
      return NextResponse.json(
        { error: 'Database ID not found' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, experience, keywords, role_group, target_role, time, work_or_project, comment } = body
    
    const propertyNames = getPropertyNames()
    
    const properties: any = {}
    
    // Set company field (required for unified table)
    properties[propertyNames.company] = {
      select: { name: company }
    }
    
    // Add other properties
    if (experience) {
      properties[propertyNames.experience] = {
        rich_text: [{ text: { content: experience } }]
      }
    }
    
    if (title) {
      properties[propertyNames.title] = {
        select: { name: title }
      }
    }
    
    
    if (keywords && Array.isArray(keywords)) {
      properties[propertyNames.keywords] = {
        multi_select: keywords.map(keyword => ({ name: keyword }))
      }
    }
    
    if (role_group) {
      properties[propertyNames.role_group] = {
        select: { name: role_group }
      }
    }
    
    if (target_role) {
      properties[propertyNames.target_role] = {
        select: { name: target_role }
      }
    }
    
    if (time) {
      properties[propertyNames.time] = {
        rich_text: [{ text: { content: time } }]
      }
    }
    
    if (work_or_project) {
      properties[propertyNames.work_or_project] = {
        select: { name: work_or_project }
      }
    }
    
    if (comment) {
      properties[propertyNames.comment] = {
        rich_text: [{ text: { content: comment } }]
      }
    }

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties
    })

    return NextResponse.json({ success: true, id: response.id })
  } catch (error) {
    console.error('Error creating experience record:', error)
    return NextResponse.json(
      { error: 'Failed to create experience record' },
      { status: 500 }
    )
  }
}

// PUT: Update an existing experience record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('PUT request received with body:', JSON.stringify(body, null, 2))
    
    const { id, title, experience, keywords, role_group, target_role, time, work_or_project, comment } = body
    
    if (!id) {
      console.log('PUT request missing ID')
      return NextResponse.json(
        { error: 'Record ID is required for update' },
        { status: 400 }
      )
    }
    
    console.log('PUT request updating record ID:', id)
    
    const propertyNames = getPropertyNames()
    
    const properties: any = {}
    
    // Update properties
    if (experience !== undefined) {
      properties[propertyNames.experience] = {
        rich_text: [{ text: { content: experience || '' } }]
      }
    }
    
    if (title !== undefined) {
      properties[propertyNames.title] = {
        select: title ? { name: title } : null
      }
    }
    
    
    if (keywords !== undefined && Array.isArray(keywords)) {
      properties[propertyNames.keywords] = {
        multi_select: keywords.map(keyword => ({ name: keyword }))
      }
    }
    
    if (role_group !== undefined) {
      properties[propertyNames.role_group] = {
        select: role_group ? { name: role_group } : null
      }
    }
    
    if (target_role !== undefined) {
      properties[propertyNames.target_role] = {
        select: target_role ? { name: target_role } : null
      }
    }
    
    if (time !== undefined) {
      properties[propertyNames.time] = {
        rich_text: [{ text: { content: time || '' } }]
      }
    }
    
    if (work_or_project !== undefined) {
      properties[propertyNames.work_or_project] = {
        select: work_or_project ? { name: work_or_project } : null
      }
    }
    
    if (comment !== undefined) {
      properties[propertyNames.comment] = {
        rich_text: [{ text: { content: comment || '' } }]
      }
    }

    console.log('Properties to update:', JSON.stringify(properties, null, 2))
    
    const notionResponse = await notion.pages.update({
      page_id: id,
      properties
    })
    
    console.log('Notion update response:', JSON.stringify(notionResponse, null, 2))
    console.log('PUT request successful for record ID:', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating experience record:', error)
    console.error('Error details:', error instanceof Error ? error.message : error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Failed to update experience record',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// DELETE: Delete an experience record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Record ID is required for deletion' },
        { status: 400 }
      )
    }

    await notion.pages.update({
      page_id: id,
      archived: true
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting experience record:', error)
    return NextResponse.json(
      { error: 'Failed to delete experience record' },
      { status: 500 }
    )
  }
}