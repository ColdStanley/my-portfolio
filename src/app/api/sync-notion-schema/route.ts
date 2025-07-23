import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getDatabaseTemplate, replaceRelationPlaceholders } from '@/lib/notionSchemaTemplates'

// 同步用户的Notion数据库schema到黄金标准
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. 获取用户Notion配置
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('notion_api_key, notion_tasks_db_id, notion_plan_db_id, notion_strategy_db_id')
      .eq('user_id', user.id)
      .single()

    if (!profile?.notion_api_key) {
      return NextResponse.json({ error: 'Notion API key not configured' }, { status: 400 })
    }

    if (!profile.notion_tasks_db_id || !profile.notion_plan_db_id || !profile.notion_strategy_db_id) {
      return NextResponse.json({ error: 'Database IDs not configured' }, { status: 400 })
    }

    const userDbIds = {
      tasks: profile.notion_tasks_db_id,
      plan: profile.notion_plan_db_id,
      strategy: profile.notion_strategy_db_id
    }

    // 3. 同步三个数据库
    const syncResults = []
    const dbTypes: Array<'tasks' | 'plan' | 'strategy'> = ['tasks', 'plan', 'strategy']

    for (const dbType of dbTypes) {
      try {
        // 获取标准模板
        const template = getDatabaseTemplate(dbType)
        // 替换relation字段的database_id
        const finalTemplate = replaceRelationPlaceholders(template, userDbIds)

        // 调用Notion API更新数据库schema
        const dbId = userDbIds[dbType]
        const syncResult = await syncDatabaseSchema(profile.notion_api_key, dbId, finalTemplate)
        
        syncResults.push({
          database: dbType,
          success: true,
          message: `${template.name} database synced successfully`
        })
      } catch (error) {
        console.error(`Failed to sync ${dbType} database:`, error)
        syncResults.push({
          database: dbType,
          success: false,
          message: `Failed to sync ${dbType}: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }

    // 4. 返回同步结果
    const allSuccess = syncResults.every(result => result.success)
    
    return NextResponse.json({
      success: allSuccess,
      results: syncResults,
      message: allSuccess 
        ? 'All databases synced successfully!' 
        : 'Some databases failed to sync. Please check the details.'
    })

  } catch (error) {
    console.error('Schema sync error:', error)
    return NextResponse.json({ 
      error: 'Failed to sync database schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 同步单个数据库schema的核心函数
async function syncDatabaseSchema(apiKey: string, databaseId: string, template: any) {
  const url = `https://api.notion.com/v1/databases/${databaseId}`
  
  // 构建Notion API请求体
  const requestBody = {
    properties: template.properties
  }

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Notion API error: ${errorData.message || response.statusText}`)
  }

  return await response.json()
}