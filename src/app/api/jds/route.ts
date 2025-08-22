import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET /api/jds - List all JDs for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

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
    const { user_id, title, company, full_job_description, application_stage, role_group, firm_type, comment, match_score } = body

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
        role_group: role_group || '',
        firm_type: firm_type || '',
        comment: comment || '',
        match_score: Math.max(0, match_score || 0)
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