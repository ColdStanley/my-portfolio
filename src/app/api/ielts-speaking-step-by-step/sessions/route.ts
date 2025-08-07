import { NextResponse } from 'next/server'
import { supabase } from '@/app/readlingua/utils/supabaseClient'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const part = searchParams.get('part')

    if (!userId || !part) {
      return NextResponse.json(
        { error: 'Missing userId or part parameter' },
        { status: 400 }
      )
    }

    // 获取用户指定part的会话数据
    const { data, error } = await supabase
      .from('ielts_step_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('part', part)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // 如果没有数据，返回默认结构
    if (!data) {
      return NextResponse.json({
        user_id: userId,
        part,
        current_step: 1,
        step_results: {},
        is_completed: false
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, part, currentStep, stepResults, isCompleted } = body

    if (!userId || !part) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, part' },
        { status: 400 }
      )
    }

    // 使用 upsert 插入或更新数据
    const { data, error } = await supabase
      .from('ielts_step_sessions')
      .upsert({
        user_id: userId,
        part,
        current_step: currentStep || 1,
        step_results: stepResults || {},
        is_completed: isCompleted || false
      }, {
        onConflict: 'user_id,part'  // 指定唯一约束字段
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase upsert error:', error)
      return NextResponse.json(
        { error: 'Failed to save session' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}