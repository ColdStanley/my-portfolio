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
    const supabase = createRouteHandlerClient({ cookies })
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notion_api_key, tasks_db_id, strategy_db_id, plan_db_id } = body

    if (!notion_api_key) {
      return NextResponse.json({ error: 'Notion API key is required' }, { status: 400 })
    }

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
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving user notion config:', error)
      return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
    }

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