import { NextResponse } from 'next/server'
import { supabase } from '@/app/readlingua/utils/supabaseClient'

export async function PUT(request: Request) {
  console.log('=== Voice Practice API called ===')
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    const { userId, part, transcript, duration, practiceCount } = body
    
    if (!userId || !part || !transcript) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: userId, part, transcript' },
        { status: 400 }
      )
    }

    console.log('Fetching existing session...')
    
    // 获取现有数据
    const { data: existingData, error: fetchError } = await supabase
      .from('ielts_step_sessions')
      .select('step_results, current_step')
      .eq('user_id', userId)
      .eq('part', part)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Fetch error', details: fetchError.message },
        { status: 500 }
      )
    }

    console.log('Existing data:', existingData)
    
    // 合并步骤结果 - Step 5 语音练习
    const currentResults = existingData?.step_results || {}
    const updatedResults = {
      ...currentResults,
      '5': {
        content: transcript,
        timestamp: new Date().toISOString(),
        duration,
        practice_count: practiceCount || 1,
        voice_practice: true
      }
    }

    console.log('Updated step results:', updatedResults)
    
    const newCurrentStep = Math.max(
      existingData?.current_step || 1,
      6 // Step 5 完成后进入 Step 6
    )

    console.log('New current step:', newCurrentStep)

    // 使用 upsert 插入或更新
    const { data, error } = await supabase
      .from('ielts_step_sessions')
      .upsert({
        user_id: userId,
        part: part,
        current_step: newCurrentStep,
        step_results: updatedResults,
        is_completed: newCurrentStep >= 8 // 7步完成后才算完成（为Step 8预留）
      }, {
        onConflict: 'user_id,part'  // 指定唯一约束字段
      })
      .select()

    if (error) {
      console.error('Supabase upsert error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    console.log('Success! Voice practice saved:', data)
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}