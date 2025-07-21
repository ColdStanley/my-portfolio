import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export interface UserNotionConfig {
  notion_api_key: string
  tasks_db_id?: string
  strategy_db_id?: string
  plan_db_id?: string
}

export interface NotionConfigResult {
  config: UserNotionConfig | null
  user: any
  error?: string
}

/**
 * 获取当前用户的Notion配置
 * 包含fallback逻辑：如果用户没有配置，使用环境变量
 */
export async function getUserNotionConfig(): Promise<NotionConfigResult> {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { 
        config: null, 
        user: null, 
        error: 'User not authenticated' 
      }
    }

    // 查询用户的Notion配置
    const { data: userConfig, error: configError } = await supabase
      .from('user_notion_configs')
      .select('notion_api_key, tasks_db_id, strategy_db_id, plan_db_id')
      .eq('user_id', user.id)
      .single()

    // 如果用户有配置，使用用户配置
    if (!configError && userConfig) {
      return {
        config: userConfig,
        user
      }
    }

    // Fallback: 使用环境变量（保证开发者使用不受影响）
    const fallbackConfig: UserNotionConfig = {
      notion_api_key: process.env.NOTION_API_KEY || '',
      tasks_db_id: process.env.NOTION_Tasks_DB_ID || '',
      strategy_db_id: process.env.NOTION_Strategy_DB_ID || '',
      plan_db_id: process.env.NOTION_Plan_DB_ID || ''
    }

    // 检查fallback配置是否有效
    if (!fallbackConfig.notion_api_key) {
      return {
        config: null,
        user,
        error: 'No Notion configuration found. Please configure your Notion integration.'
      }
    }

    return {
      config: fallbackConfig,
      user
    }

  } catch (error) {
    console.error('Error getting user notion config:', error)
    return {
      config: null,
      user: null,
      error: 'Failed to get Notion configuration'
    }
  }
}

/**
 * 获取特定数据库的配置
 */
export async function getDatabaseConfig(dbType: 'tasks' | 'strategy' | 'plan') {
  const { config, user, error } = await getUserNotionConfig()
  
  if (error || !config) {
    return { config: null, user, error }
  }

  const dbIdField = `${dbType}_db_id` as keyof UserNotionConfig
  const dbId = config[dbIdField] as string

  if (!dbId) {
    return {
      config: null,
      user,
      error: `${dbType.charAt(0).toUpperCase() + dbType.slice(1)} database not configured`
    }
  }

  return {
    config: {
      notion_api_key: config.notion_api_key,
      database_id: dbId
    },
    user,
    error: undefined
  }
}