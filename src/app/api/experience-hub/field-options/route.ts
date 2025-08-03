import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

// Unified professional experience database ID
const getDatabaseId = (): string => {
  return process.env.NOTION_PROFESSIONALEXPERIENCE_DB_ID || ''
}

// Property name mapping for unified table (no company prefixes)
const getPropertyNames = () => ({
  title: 'title',
  role_group: 'role_group',
  target_role: 'target_role',
  work_or_project: 'work_or_project'
})

// GET: Fetch field options for Title and Role Group
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
    
    console.log(`Fetching field options for company: ${company}`)
    const databaseId = getDatabaseId()
    console.log(`Database ID: ${databaseId}`)
    
    if (!databaseId) {
      console.error('Database ID not found')
      return NextResponse.json(
        { error: 'Database ID not found' },
        { status: 400 }
      )
    }

    // Get database schema to extract select field options
    const database = await notion.databases.retrieve({ database_id: databaseId }) as any
    const properties = database.properties
    
    const propertyNames = getPropertyNames()
    
    // Extract title options
    let titleOptions: string[] = []
    if (properties[propertyNames.title] && properties[propertyNames.title].type === 'select') {
      titleOptions = properties[propertyNames.title].select.options.map((option: any) => option.name)
    }
    
    // Extract role_group options
    let roleGroupOptions: string[] = []
    if (properties[propertyNames.role_group] && properties[propertyNames.role_group].type === 'select') {
      roleGroupOptions = properties[propertyNames.role_group].select.options.map((option: any) => option.name)
    }
    
    // Extract target_role options
    let targetRoleOptions: string[] = []
    if (properties[propertyNames.target_role] && properties[propertyNames.target_role].type === 'select') {
      targetRoleOptions = properties[propertyNames.target_role].select.options.map((option: any) => option.name)
    }
    
    // Extract work_or_project options
    let workOrProjectOptions: string[] = []
    if (properties[propertyNames.work_or_project] && properties[propertyNames.work_or_project].type === 'select') {
      workOrProjectOptions = properties[propertyNames.work_or_project].select.options.map((option: any) => option.name)
    }

    console.log(`Title options for ${company}:`, titleOptions)
    console.log(`Role group options for ${company}:`, roleGroupOptions)
    console.log(`Target role options for ${company}:`, targetRoleOptions)
    console.log(`Work or project options for ${company}:`, workOrProjectOptions)

    return NextResponse.json({ 
      success: true, 
      title_options: titleOptions,
      role_group_options: roleGroupOptions,
      target_role_options: targetRoleOptions,
      work_or_project_options: workOrProjectOptions
    })
  } catch (error) {
    console.error('Error fetching field options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch field options' },
      { status: 500 }
    )
  }
}