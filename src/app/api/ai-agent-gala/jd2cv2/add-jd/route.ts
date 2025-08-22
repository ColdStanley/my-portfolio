import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// POST /api/ai-agent-gala/jd2cv2/add-jd - Create new JD record for JD2CV 2.0
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, title, company, full_job_description } = body

    if (!user_id || !title || !company || !full_job_description) {
      return NextResponse.json(
        { error: 'user_id, title, company, and full_job_description are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('jd_records')
      .insert([{
        user_id,
        title,
        company,
        full_job_description,
        application_stage: 'JD2CV 2.0 Generated',
        role_group: '',
        firm_type: '',
        comment: 'Generated via JD2CV 2.0 AI Agent',
        match_score: 0
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
      data,
      id: data.id
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}