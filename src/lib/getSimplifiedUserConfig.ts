import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export interface UserProfile {
  user_id: string
  role: 'user' | 'admin'
  notion_api_key?: string
  notion_tasks_db_id?: string
  notion_strategy_db_id?: string
  notion_plan_db_id?: string
}

export interface NotionConfigResult {
  config: {
    notion_api_key: string
    database_id: string
  } | null
  user: any
  error?: string
}

/**
 * 简化版用户配置获取
 * 统一处理开发者fallback和普通用户配置
 */
export async function getUserProfile(): Promise<{ profile: UserProfile | null; user: any; error?: string }> {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { 
        profile: null, 
        user: null, 
        error: 'User not authenticated' 
      }
    }

    // 查询用户档案
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user profile:', profileError)
      return {
        profile: null,
        user,
        error: 'Failed to fetch user profile'
      }
    }

    // 如果没有档案记录，创建默认档案
    if (!profile) {
      const defaultProfile = {
        user_id: user.id,
        role: user.email === 'stanleytonight@hotmail.com' ? 'admin' as const : 'user' as const
      }

      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert(defaultProfile)
        .select()
        .single()

      if (createError) {
        console.error('Error creating user profile:', createError)
        return {
          profile: null,
          user,
          error: 'Failed to create user profile'
        }
      }

      return { profile: newProfile, user }
    }

    return { profile, user }

  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return {
      profile: null,
      user: null,
      error: 'Failed to get user profile'
    }
  }
}

/**
 * 获取特定数据库的Notion配置
 * 支持开发者环境变量fallback
 */
export async function getNotionDatabaseConfig(dbType: 'tasks' | 'strategy' | 'plan'): Promise<NotionConfigResult> {
  const { profile, user, error } = await getUserProfile()
  
  if (error || !user) {
    return { config: null, user: null, error: error || 'User not authenticated' }
  }

  // 开发者环境变量fallback
  if (profile?.role === 'admin' && process.env.NOTION_API_KEY) {
    const envDbId = process.env[`NOTION_${dbType.toUpperCase()}_DB_ID`] || 
                   process.env[`NOTION_${dbType === 'strategy' ? 'STRATEGY' : dbType === 'plan' ? 'Plan' : 'Tasks'}_DB_ID`]
    
    if (envDbId) {
      return {
        config: {
          notion_api_key: process.env.NOTION_API_KEY,
          database_id: envDbId
        },
        user
      }
    }
  }

  // 普通用户或管理员无环境变量时，使用档案配置
  if (!profile) {
    return {
      config: null,
      user,
      error: 'User profile not found'
    }
  }

  const apiKey = profile.notion_api_key
  const dbId = profile[`notion_${dbType}_db_id` as keyof UserProfile] as string

  if (!apiKey) {
    return {
      config: null,
      user,
      error: 'Notion API key not configured'
    }
  }

  if (!dbId) {
    return {
      config: null,
      user,
      error: `${dbType.charAt(0).toUpperCase() + dbType.slice(1)} database not configured`
    }
  }

  return {
    config: {
      notion_api_key: apiKey,
      database_id: dbId
    },
    user
  }
}