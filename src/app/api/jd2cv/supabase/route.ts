import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const jdData = await request.json()
    
    // Validate required fields
    if (!jdData.title || !jdData.company) {
      return NextResponse.json(
        { error: 'Title and Company are required' },
        { status: 400 }
      )
    }

    // Get user ID from request
    const userId = jdData.user_id

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Insert new JD record
    const { data, error } = await supabase
      .from('jd_records')
      .insert([{
        user_id: userId,
        title: jdData.title,
        company: jdData.company,
        full_job_description: jdData.full_job_description || ''
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save JD record', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'JD record saved successfully'
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

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
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch JD records', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const jdData = await request.json()
    
    // Validate required fields
    if (!jdData.record_id || !jdData.title || !jdData.company) {
      return NextResponse.json(
        { error: 'Record ID, Title and Company are required' },
        { status: 400 }
      )
    }

    // Get user ID from request
    const userId = jdData.user_id

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update existing JD record
    const { data, error } = await supabase
      .from('jd_records')
      .update({
        title: jdData.title,
        company: jdData.company,
        full_job_description: jdData.full_job_description || '',
        jd_key_sentences: jdData.jd_key_sentences || '',
        keywords_from_sentences: jdData.keywords_from_sentences || '',
        application_stage: jdData.application_stage || '',
        role_group: jdData.role_group || '',
        firm_type: jdData.firm_type || '',
        comment: jdData.comment || '',
        match_score: Math.max(1, jdData.match_score || 1),
        cv_pdf_url: jdData.cv_pdf_url || '',
        cv_pdf_filename: jdData.cv_pdf_filename || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', jdData.record_id)
      .eq('user_id', userId) // Ensure user can only update their own records
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update JD record', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'JD record updated successfully'
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}