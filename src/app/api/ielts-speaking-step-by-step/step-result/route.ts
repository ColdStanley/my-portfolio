import { NextResponse } from 'next/server'
import { supabase } from '@/app/readlingua/utils/supabaseClient'

export async function PUT(request: Request) {
  console.log('=== PUT /step-result API called ===')
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    const { userId, part, step, result } = body
    
    console.log('Parsed values:', { 
      userId: typeof userId + ':' + userId, 
      part: typeof part + ':' + part, 
      step: typeof step + ':' + step, 
      result: typeof result + ':' + JSON.stringify(result).substring(0, 100) 
    })

    if (!userId || !part || !step || !result) {
      console.log('Missing fields validation failed')
      return NextResponse.json(
        { error: 'Missing required fields: userId, part, step, result' },
        { status: 400 }
      )
    }
    
    console.log('About to query Supabase...')

    // 首先获取当前会话数据
    const { data: existingSession, error: fetchError } = await supabase
      .from('ielts_step_sessions')
      .select('step_results, current_step')
      .eq('user_id', userId)
      .eq('part', part)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Fetch session error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch existing session', details: fetchError.message },
        { status: 500 }
      )
    }

    // 合并新的步骤结果
    const currentResults = existingSession?.step_results || {}
    const updatedResults = {
      ...currentResults,
      [step.toString()]: {
        content: result.content,
        timestamp: result.timestamp || new Date().toISOString(),
        prompt: result.prompt
      }
    }

    // 更新当前步骤（如果新步骤更大）
    const currentStep = Math.max(
      existingSession?.current_step || 1,
      parseInt(step) + 1
    )

    // 更新数据库
    const { data, error } = await supabase
      .from('ielts_step_sessions')
      .upsert({
        user_id: userId,
        part,
        current_step: currentStep,
        step_results: updatedResults,
        is_completed: currentStep > 4 // 假设4个步骤完成
      })
      .select()
      .single()

    if (error) {
      console.error('Update step result error:', error)
      return NextResponse.json(
        { error: 'Failed to update step result', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}