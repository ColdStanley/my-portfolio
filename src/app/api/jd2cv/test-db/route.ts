import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function GET() {
  try {
    console.log('Testing Notion database connection...')
    console.log('Database ID:', process.env.NOTION_JD2CV_DB_ID)
    console.log('API Key exists:', !!process.env.NOTION_API_KEY)

    // First, try to retrieve the database
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_JD2CV_DB_ID!,
    })

    console.log('Database retrieved successfully')
    console.log('Database properties:', Object.keys(database.properties))

    return NextResponse.json({ 
      success: true, 
      databaseId: process.env.NOTION_JD2CV_DB_ID,
      properties: Object.keys(database.properties)
    })
  } catch (error: any) {
    console.error('Error testing database:', error)
    return NextResponse.json(
      { 
        error: 'Database test failed', 
        details: error?.message,
        code: error?.code,
        status: error?.status
      },
      { status: 500 }
    )
  }
}