import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError && profileError.code === 'PGRST116') {
      // 创建默认档案
      const defaultProfile = {
        user_id: user.id,
        role: user.email === 'stanleytonight@hotmail.com' ? 'admin' : 'user'
      }

      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert(defaultProfile)
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }

      return NextResponse.json({ data: newProfile })
    }

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ data: profile })

  } catch (error) {
    console.error('Error in user profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      notion_api_key,
      notion_tasks_db_id,
      notion_strategy_db_id,
      notion_plan_db_id
    } = body

    // 更新或插入用户档案
    const { data: profile, error: upsertError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        notion_api_key,
        notion_tasks_db_id,
        notion_strategy_db_id,
        notion_plan_db_id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Error updating profile:', upsertError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ data: profile })

  } catch (error) {
    console.error('Error in user profile update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in user profile deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}