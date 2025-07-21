import { NextRequest, NextResponse } from 'next/server'
import { getUserNotionConfig, getDatabaseConfig } from '@/lib/getUserNotionConfig'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG DEVELOPER PLAN API ===')
    
    // 检查用户基本配置
    const { config: baseConfig, user, error: baseError } = await getUserNotionConfig()
    
    console.log('Base config result:')
    console.log('- User email:', user?.email)
    console.log('- Has config:', !!baseConfig)
    console.log('- Base error:', baseError)
    console.log('- Config plan_db_id:', baseConfig?.plan_db_id)
    
    // 检查Plan数据库配置
    const { config: planConfig, error: planError } = await getDatabaseConfig('plan')
    
    console.log('Plan config result:')
    console.log('- Plan config:', planConfig)
    console.log('- Plan error:', planError)
    
    // 检查Tasks数据库配置
    const { config: tasksConfig, error: tasksError } = await getDatabaseConfig('tasks')
    
    console.log('Tasks config result:')
    console.log('- Tasks config:', tasksConfig)
    console.log('- Tasks error:', tasksError)
    
    return NextResponse.json({
      debug: 'developer_plan_debug',
      user: user?.email,
      isDeveloper: user?.email === 'stanleyhiu.96@gmail.com',
      baseConfig: baseConfig ? {
        has_api_key: !!baseConfig.notion_api_key,
        plan_db_id: baseConfig.plan_db_id,
        tasks_db_id: baseConfig.tasks_db_id,
        strategy_db_id: baseConfig.strategy_db_id
      } : null,
      baseError,
      planConfig: planConfig ? {
        has_api_key: !!planConfig.notion_api_key,
        database_id: planConfig.database_id
      } : null,
      planError,
      tasksConfig: tasksConfig ? {
        has_api_key: !!tasksConfig.notion_api_key,
        database_id: tasksConfig.database_id
      } : null,
      tasksError,
      env_vars: {
        has_notion_api_key: !!process.env.NOTION_API_KEY,
        has_plan_db_id: !!process.env.NOTION_Plan_DB_ID,
        has_tasks_db_id: !!process.env.NOTION_Tasks_DB_ID
      }
    })
    
  } catch (error) {
    console.error('Debug developer plan error:', error)
    return NextResponse.json({
      debug: 'exception',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}