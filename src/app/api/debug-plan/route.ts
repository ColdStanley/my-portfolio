import { NextRequest, NextResponse } from 'next/server'
import { getDatabaseConfig } from '@/lib/getUserNotionConfig'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG PLAN API ===')
    
    // 检查用户配置
    const { config: planConfig, user, error } = await getDatabaseConfig('plan')
    
    console.log('User:', user?.email)
    console.log('Plan config:', planConfig)
    console.log('Error:', error)
    
    if (error || !planConfig) {
      return NextResponse.json({ 
        debug: 'plan_config_error',
        user: user?.email,
        error: error,
        config: planConfig
      }, { status: 200 })
    }
    
    // 检查Tasks配置
    const { config: tasksConfig, error: tasksError } = await getDatabaseConfig('tasks')
    console.log('Tasks config:', tasksConfig)
    console.log('Tasks error:', tasksError)
    
    return NextResponse.json({
      debug: 'success',
      user: user?.email,
      planConfig: {
        has_api_key: !!planConfig.notion_api_key,
        has_database_id: !!planConfig.database_id,
        database_id: planConfig.database_id
      },
      tasksConfig: tasksConfig ? {
        has_api_key: !!tasksConfig.notion_api_key,
        has_database_id: !!tasksConfig.database_id,
        database_id: tasksConfig.database_id
      } : null,
      tasksError
    })
    
  } catch (error) {
    console.error('Debug plan error:', error)
    return NextResponse.json({
      debug: 'exception',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 200 })
  }
}