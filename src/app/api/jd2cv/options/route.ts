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

    // Query all records to get available titles and companies
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