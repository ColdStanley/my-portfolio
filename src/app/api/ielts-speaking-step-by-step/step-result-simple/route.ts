import { NextResponse } from 'next/server'
import { supabase } from '@/app/readlingua/utils/supabaseClient'

export async function PUT(request: Request) {
  console.log('=== Simple PUT /step-result API called ===')
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    const { userId, part, step, result } = body
    
    if (!userId || !part || !step || !result) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: userId, part, step, result' },
        { status: 400 }
      )
    }

    console.log('Fetching existing session...')
    
    // 首先获取现有数据
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
    
    // 合并步骤结果
    const currentResults = existingData?.step_results || {}
    const updatedResults = {
      ...currentResults,
      [step.toString()]: {
        content: result.content,
        timestamp: result.timestamp || new Date().toISOString(),
        prompt: result.prompt,
        // Support additional fields for different step types
        ...(result.duration && { duration: result.duration }),
        ...(result.voice_practice && { voice_practice: result.voice_practice }),
        ...(result.practice_count && { practice_count: result.practice_count }),
        ...(result.band_level && { band_level: result.band_level }) // Step 7 optimization level
      }
    }

    console.log('Updated step results:', updatedResults)
    
    const newCurrentStep = Math.max(
      existingData?.current_step || 1,
      parseInt(step) + 1
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
        is_completed: false
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

    console.log('Success! Data saved:', data)
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}