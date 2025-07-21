import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { getDatabaseConfig } from '@/lib/getUserNotionConfig'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG NOTION API CALL ===')
    
    const { searchParams } = new URL(request.url)
    const dbType = searchParams.get('type') || 'strategy' // strategy, plan, tasks
    
    const { config, user, error } = await getDatabaseConfig(dbType as any)
    
    if (error || !config) {
      return NextResponse.json({ 
        debug: 'config_error',
        dbType,
        error,
        user: user?.email
      })
    }
    
    console.log(`Testing ${dbType} API call for user:`, user?.email)
    console.log(`Database ID:`, config.database_id)
    
    const notion = new Client({
      auth: config.notion_api_key,
    })
    
    try {
      // 测试数据库检索
      console.log('Testing database retrieve...')
      const databaseInfo = await notion.databases.retrieve({
        database_id: config.database_id
      })
      
      console.log('Database retrieve success:', databaseInfo.title)
      
      // 测试数据库查询
      console.log('Testing database query...')
      const queryResponse = await notion.databases.query({
        database_id: config.database_id,
        page_size: 5
      })
      
      console.log('Database query success, pages:', queryResponse.results.length)
      
      return NextResponse.json({
        debug: 'success',
        dbType,
        user: user?.email,
        database: {
          title: databaseInfo.title[0]?.plain_text || 'Untitled',
          id: config.database_id,
          pages_count: queryResponse.results.length,
          properties: Object.keys(databaseInfo.properties || {})
        }
      })
      
    } catch (notionError: any) {
      console.error('Notion API Error:', notionError)
      
      return NextResponse.json({
        debug: 'notion_api_error',
        dbType,
        user: user?.email,
        database_id: config.database_id,
        notion_error: {
          code: notionError.code,
          message: notionError.message,
          status: notionError.status,
          body: notionError.body
        }
      })
    }
    
  } catch (error) {
    console.error('Debug notion call error:', error)
    return NextResponse.json({
      debug: 'exception',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}