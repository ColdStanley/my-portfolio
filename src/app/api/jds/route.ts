import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET /api/jds - List all JDs for user or get stage options
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const getStageOptions = searchParams.get('get_stage_options')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Handle stage options request
    if (getStageOptions === 'true') {
      const { data, error } = await supabase
        .from('jd_records')
        .select('application_stage')
        .eq('user_id', userId)
        .not('application_stage', 'is', null)
        .neq('application_stage', '')

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch stage options' },
          { status: 500 }
        )
      }

      // Extract unique stage values and ensure we have the standard options
      const uniqueStages = [...new Set(data.map(item => item.application_stage))]
      const standardStages = ['Raw JD', 'Applied']
      const stageOptions = standardStages.filter(stage =>
        uniqueStages.includes(stage) || standardStages.includes(stage)
      )

      return NextResponse.json({
        success: true,
        stage_options: stageOptions.length > 0 ? stageOptions : standardStages
      })
    }

    // Handle regular JD list request
    const { data, error } = await supabase
      .from('jd_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch JD records' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/jds - Create new JD
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, title, company, full_job_description, application_stage, comment } = body

    if (!user_id || !title || !company) {
      return NextResponse.json(
        { error: 'user_id, title, and company are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('jd_records')
      .insert([{
        user_id,
        title,
        company,
        full_job_description: full_job_description || '',
        application_stage: application_stage || null,
        comment: comment || ''
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create JD record' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}