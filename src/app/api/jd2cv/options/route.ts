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

    // Extract unique titles and companies
    allRecords.results.forEach((record: any) => {
      const title = record.properties.title?.title?.[0]?.text?.content
      const company = record.properties.company?.rich_text?.[0]?.text?.content

      if (title) titles.add(title)
      if (company) companies.add(company)
    })

    return NextResponse.json({
      titles: Array.from(titles).sort(),
      companies: Array.from(companies).sort()
    })
  } catch (error: any) {
    console.error('Error fetching options from Notion database:', error)
    return NextResponse.json(
      { error: 'Failed to fetch options', details: error?.message },
      { status: 500 }
    )
  }
}