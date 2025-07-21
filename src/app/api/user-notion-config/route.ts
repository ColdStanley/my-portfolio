import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 查询用户的Notion配置
    const { data, error } = await supabase
      .from('user_notion_configs')
      .select('notion_api_key, tasks_db_id, strategy_db_id, plan_db_id')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user notion config:', error)
      return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 })
    }

    return NextResponse.json({ 
      data: data || null,
      hasConfig: !!data
    })

  } catch (error) {
    console.error('Error in user notion config GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('User Notion Config POST: Starting request...')
    const supabase = createRouteHandlerClient({ cookies })
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('User Notion Config POST: Auth check:', { 
      hasUser: !!user, 
      authError: authError?.message,
      userId: user?.id 
    })
    
    if (authError || !user) {
      console.log('User Notion Config POST: Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notion_api_key, tasks_db_id, strategy_db_id, plan_db_id } = body
    
    console.log('User Notion Config POST: Request body:', { 
      hasApiKey: !!notion_api_key,
      hasTasksDbId: !!tasks_db_id,
      hasStrategyDbId: !!strategy_db_id,
      hasPlanDbId: !!plan_db_id
    })

    if (!notion_api_key) {
      return NextResponse.json({ error: 'Notion API key is required' }, { status: 400 })
    }

    // 先检查表是否存在
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_notion_configs')
      .select('count', { count: 'exact', head: true })

    if (tableError) {
      console.error('User Notion Config POST: Table check failed:', {
        code: tableError.code,
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint
      })
      return NextResponse.json({ 
        error: `Database table error: ${tableError.message}`,
        details: 'The user_notion_configs table may not exist or have incorrect permissions'
      }, { status: 500 })
    }

    console.log('User Notion Config POST: Table exists, proceeding with upsert...')

    // 尝试更新或插入配置
    const { data, error } = await supabase
      .from('user_notion_configs')
      .upsert({
        user_id: user.id,
        notion_api_key,
        tasks_db_id: tasks_db_id || null,
        strategy_db_id: strategy_db_id || null,
        plan_db_id: plan_db_id || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('User Notion Config POST: Upsert failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      let errorMessage = 'Failed to save configuration'
      if (error.code === '42P01') {
        errorMessage = 'Database table user_notion_configs does not exist'
      } else if (error.code === '42501') {
        errorMessage = 'Insufficient permissions to access user_notion_configs table'
      } else {
        errorMessage = `Database error: ${error.message}`
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }

    console.log('User Notion Config POST: Successfully saved config')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notion configuration saved successfully',
      data: {
        notion_api_key: data.notion_api_key,
        tasks_db_id: data.tasks_db_id,
        strategy_db_id: data.strategy_db_id,
        plan_db_id: data.plan_db_id
      }
    })

  } catch (error) {
    console.error('Error in user notion config POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 删除用户的Notion配置
    const { error } = await supabase
      .from('user_notion_configs')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting user notion config:', error)
      return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notion configuration deleted successfully'
    })

  } catch (error) {
    console.error('Error in user notion config DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}