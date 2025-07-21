import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile, getNotionDatabaseConfig } from '@/lib/getSimplifiedUserConfig'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG DEVELOPER PLAN API ===')
    
    // 检查用户基本配置
    const { profile, user, error: baseError } = await getUserProfile()
    
    console.log('Base config result:')
    console.log('- User email:', user?.email)
    console.log('- Has config:', !!baseConfig)
    console.log('- Base error:', baseError)
    console.log('- Config plan_db_id:', baseConfig?.plan_db_id)
    
    // 检查Plan数据库配置
    const { config: planConfig, error: planError } = await getNotionDatabaseConfig('plan')
    
    console.log('Plan config result:')
    console.log('- Plan config:', planConfig)
    console.log('- Plan error:', planError)
    
    // 检查Tasks数据库配置
    const { config: tasksConfig, error: tasksError } = await getNotionDatabaseConfig('tasks')
    
    console.log('Tasks config result:')
    console.log('- Tasks config:', tasksConfig)
    console.log('- Tasks error:', tasksError)
    
    return NextResponse.json({
      debug: 'developer_plan_debug',
      user: user?.email,
      isDeveloper: process.env.DEVELOPER_EMAILS?.split(',').includes(user?.email || '') || user?.email === 'stanleytonight@hotmail.com',
      baseConfig: profile ? {
        has_api_key: !!profile.notion_api_key,
        plan_db_id: profile.notion_plan_db_id,
        tasks_db_id: profile.notion_tasks_db_id,
        strategy_db_id: profile.notion_strategy_db_id
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