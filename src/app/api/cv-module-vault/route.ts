import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const CV_MODULE_VAULT_DB_ID = process.env.NOTION_CV_MODULE_VAULT_DB_ID

if (!CV_MODULE_VAULT_DB_ID) {
  console.error('Missing NOTION_CV_MODULE_VAULT_DB_ID environment variable')
}

function extractNotionFiles(files: any[]): any[] {
  if (!files || !Array.isArray(files)) return []
  
  return files.map(file => ({
    name: file.name || 'Untitled',
    url: file.external?.url || file.file?.url || '',
    type: file.type || 'file'
  })).filter(file => file.url)
}

function extractTextContent(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return ''
  
  return richText.map(block => block.plain_text || '').join('')
}

function extractDateValue(date: any): string {
  if (!date?.start) return ''
  
  let result = date.start
  if (date.end) {
    result += ` - ${date.end}`
  }
  
  return result
}

function extractSelectValue(select: any): string {
  return select?.name || ''
}

function extractTitleContent(title: any[]): string {
  if (!title || !Array.isArray(title)) return ''
  
  return title.map(block => block.plain_text || '').join('')
}

export async function GET(request: NextRequest) {
  try {
    if (!CV_MODULE_VAULT_DB_ID) {
      return NextResponse.json({ 
        error: 'CV Module Vault database ID not configured' 
      }, { status: 500 })
    }

    const response = await notion.databases.query({
      database_id: CV_MODULE_VAULT_DB_ID,
      page_size: 100,
    })

    const data = response.results.map((page: any) => {
      const properties = page.properties

      return {
        id: page.id,
        firm: extractTitleContent(properties.firm?.title),
        responsibilities_text: extractTextContent(properties.responsibilities_text?.rich_text),
        responsibilities_summary: extractTextContent(properties.responsibilities_summary?.rich_text),
        responsibilities_mindmap: extractNotionFiles(properties.responsibilities_mindmap?.files),
        achievements_text: extractTextContent(properties.achievements_text?.rich_text),
        achievements_summary: extractTextContent(properties.achievements_summary?.rich_text),
        achievements_mindmap: extractNotionFiles(properties.achievements_mindmap?.files),
        position_group: extractSelectValue(properties.position_group?.select),
        cv_component: extractSelectValue(properties.cv_component?.select),
        status: extractSelectValue(properties.status?.select),
        time: extractDateValue(properties.time?.date),
      }
    })

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Error fetching CV Module Vault data:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to fetch data: ${error.message}` 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'An unknown error occurred' 
    }, { status: 500 })
  }
}