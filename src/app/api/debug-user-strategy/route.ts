import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { getDatabaseConfig } from '@/lib/getUserNotionConfig'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG USER STRATEGY ACCESS ===')
    
    // 检查用户的Strategy数据库配置
    const { config: strategyConfig, user, error } = await getDatabaseConfig('strategy')
    
    console.log('User:', user?.email)
    console.log('Config result:', {
      hasConfig: !!strategyConfig,
      error,
      databaseId: strategyConfig?.database_id
    })
    
    if (error || !strategyConfig) {
      return NextResponse.json({
        debug: 'config_error',
        user: user?.email,
        error,
        isDeveloper: user?.email === 'stanleyhiu.96@gmail.com'
      })
    }
    
    // 测试Notion API连接
    const notion = new Client({
      auth: strategyConfig.notion_api_key,
    })
    
    try {
      // 测试数据库访问
      const databaseInfo = await notion.databases.retrieve({
        database_id: strategyConfig.database_id
      })
      
      console.log('Database access successful')
      
      // 测试创建权限 - 尝试查询数据库结构
      const properties = databaseInfo.properties as any
      const statusOptions = properties.status?.select?.options?.map((opt: any) => opt.name) || []
      const priorityOptions = properties.priority_quadrant?.select?.options?.map((opt: any) => opt.name) || []
      
      return NextResponse.json({
        debug: 'success',
        user: user?.email,
        isDeveloper: user?.email === 'stanleyhiu.96@gmail.com',
        database: {
          title: databaseInfo.title[0]?.plain_text || 'Untitled',
          id: strategyConfig.database_id,
          properties: Object.keys(databaseInfo.properties || {}),
          statusOptions,
          priorityOptions
        }
      })
      
    } catch (notionError: any) {
      console.error('Notion API error:', notionError)
      return NextResponse.json({
        debug: 'notion_error',
        user: user?.email,
        isDeveloper: user?.email === 'stanleyhiu.96@gmail.com',
        error: {
          code: notionError.code,
          message: notionError.message,
          status: notionError.status
        },
        database_id: strategyConfig.database_id
      })
    }
    
  } catch (error) {
    console.error('Debug user strategy error:', error)
    return NextResponse.json({
      debug: 'exception',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}