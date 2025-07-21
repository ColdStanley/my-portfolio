import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { getDatabaseConfig } from '@/lib/getUserNotionConfig'

export async function GET(request: NextRequest) {
  try {
    console.log('Test Notion Config: Starting test...')
    
    // 获取用户的Notion配置
    const { config, user, error } = await getDatabaseConfig('tasks')
    
    if (error || !config) {
      return NextResponse.json({ 
        success: false,
        error: error || 'No Notion configuration found',
        step: 'configuration'
      })
    }

    console.log('Test Notion Config: Testing API key and database access...')
    
    const notion = new Client({
      auth: config.notion_api_key,
    })

    // 测试1: 验证API key是否有效
    try {
      await notion.users.me()
      console.log('Test Notion Config: API key is valid')
    } catch (apiError) {
      console.error('Test Notion Config: API key test failed:', apiError)
      return NextResponse.json({
        success: false,
        error: 'Invalid Notion API key',
        details: apiError instanceof Error ? apiError.message : 'Unknown error',
        step: 'api_key'
      })
    }

    // 测试2: 验证数据库是否存在且可访问
    try {
      const databaseInfo = await notion.databases.retrieve({
        database_id: config.database_id
      })
      
      console.log('Test Notion Config: Database accessible:', databaseInfo.title)
      
      // 测试3: 验证数据库属性
      const properties = databaseInfo.properties as any
      const requiredProps = ['title', 'status', 'start_date', 'end_date']
      const missingProps = requiredProps.filter(prop => !properties[prop])
      
      if (missingProps.length > 0) {
        return NextResponse.json({
          success: false,
          error: `Database is missing required properties: ${missingProps.join(', ')}`,
          step: 'database_schema',
          availableProperties: Object.keys(properties)
        })
      }

      // 测试4: 尝试查询少量数据
      const queryResult = await notion.databases.query({
        database_id: config.database_id,
        page_size: 1
      })

      console.log('Test Notion Config: Database query successful')

      return NextResponse.json({
        success: true,
        message: 'Notion configuration is working correctly',
        details: {
          databaseTitle: databaseInfo.title,
          recordCount: queryResult.results.length,
          availableProperties: Object.keys(properties)
        }
      })

    } catch (dbError) {
      console.error('Test Notion Config: Database test failed:', dbError)
      
      if (dbError instanceof Error) {
        if (dbError.message.includes('not_found')) {
          return NextResponse.json({
            success: false,
            error: 'Database not found. Please check your database ID.',
            step: 'database_access'
          })
        }
        
        if (dbError.message.includes('restricted_resource')) {
          return NextResponse.json({
            success: false,
            error: 'Access denied to database. Please ensure your Notion integration has access to this database.',
            step: 'database_permissions'
          })
        }
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to access database',
        details: dbError instanceof Error ? dbError.message : 'Unknown error',
        step: 'database_access'
      })
    }

  } catch (error) {
    console.error('Test Notion Config: General error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      step: 'general'
    }, { status: 500 })
  }
}