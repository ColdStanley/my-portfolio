import { NextRequest, NextResponse } from 'next/server'
import { getDatabaseConfig } from '@/lib/getUserNotionConfig'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG STRATEGY API ===')
    
    // 检查用户配置
    const { config: strategyConfig, user, error } = await getDatabaseConfig('strategy')
    
    console.log('User:', user?.email)
    console.log('Strategy config:', strategyConfig)
    console.log('Error:', error)
    
    if (error || !strategyConfig) {
      return NextResponse.json({ 
        debug: 'strategy_config_error',
        user: user?.email,
        error: error,
        config: strategyConfig
      }, { status: 200 })
    }
    
    // 检查Plan配置
    const { config: planConfig, error: planError } = await getDatabaseConfig('plan')
    console.log('Plan config:', planConfig)
    console.log('Plan error:', planError)
    
    return NextResponse.json({
      debug: 'success',
      user: user?.email,
      strategyConfig: {
        has_api_key: !!strategyConfig.notion_api_key,
        has_database_id: !!strategyConfig.database_id,
        database_id: strategyConfig.database_id
      },
      planConfig: planConfig ? {
        has_api_key: !!planConfig.notion_api_key,
        has_database_id: !!planConfig.database_id,
        database_id: planConfig.database_id
      } : null,
      planError
    })
    
  } catch (error) {
    console.error('Debug strategy error:', error)
    return NextResponse.json({
      debug: 'exception',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 200 })
  }
}