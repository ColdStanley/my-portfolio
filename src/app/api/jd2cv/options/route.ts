import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NOTION_JD2CV_DB_ID) {
      console.error('NOTION_JD2CV_DB_ID not found in environment variables')
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      )
    }

    // Get database schema to fetch current select options
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_JD2CV_DB_ID,
    })

    // Extract current select options from database schema
    const applicationStages: string[] = []
    const roleGroups: string[] = []
    const firmTypes: string[] = []

    const properties = database.properties as any

    // Get application_stage options
    if (properties.application_stage?.select?.options) {
      properties.application_stage.select.options.forEach((option: any) => {
        if (option.name) {
          applicationStages.push(option.name)
        }
      })
    }

    // Get role_group options
    if (properties.role_group?.select?.options) {
      properties.role_group.select.options.forEach((option: any) => {
        if (option.name) {
          roleGroups.push(option.name)
        }
      })
    }

    // Get firm_type options
    if (properties.firm_type?.select?.options) {
      properties.firm_type.select.options.forEach((option: any) => {
        if (option.name) {
          firmTypes.push(option.name)
        }
      })
    }

    // Query all records to get available titles and companies (still needed for combinations)
    const allRecords = await notion.databases.query({
      database_id: process.env.NOTION_JD2CV_DB_ID,
    })

    const titles = new Set<string>()
    const companies = new Set<string>()
    const combinations: Record<string, Set<string>> = {}
    const reverseCombinations: Record<string, Set<string>> = {}

    // Extract unique titles, companies and their combinations
    allRecords.results.forEach((record: any) => {
      const title = record.properties.title?.title?.[0]?.text?.content
      const company = record.properties.company?.rich_text?.[0]?.text?.content

      if (title && company) {
        titles.add(title)
        companies.add(company)
        
        // Build title -> companies mapping
        if (!combinations[title]) {
          combinations[title] = new Set()
        }
        combinations[title].add(company)
        
        // Build company -> titles mapping
        if (!reverseCombinations[company]) {
          reverseCombinations[company] = new Set()
        }
        reverseCombinations[company].add(title)
      }
    })

    // Convert Sets to sorted arrays
    const combinationsArray: Record<string, string[]> = {}
    const reverseCombinationsArray: Record<string, string[]> = {}
    
    Object.keys(combinations).forEach(title => {
      combinationsArray[title] = Array.from(combinations[title]).sort()
    })
    
    Object.keys(reverseCombinations).forEach(company => {
      reverseCombinationsArray[company] = Array.from(reverseCombinations[company]).sort()
    })

    return NextResponse.json({
      titles: Array.from(titles).sort(),
      companies: Array.from(companies).sort(),
      applicationStages: applicationStages, // Keep Notion's original order
      roleGroups: roleGroups, // Keep Notion's original order
      firmTypes: firmTypes, // Keep Notion's original order
      combinations: combinationsArray,
      reverseCombinations: reverseCombinationsArray
    })
  } catch (error: any) {
    console.error('Error fetching options from Notion database:', error)
    return NextResponse.json(
      { error: 'Failed to fetch options', details: error?.message },
      { status: 500 }
    )
  }
}