import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const experienceData = await request.json()
    
    // Validate required fields
    if (!experienceData.company || !experienceData.title || !experienceData.experience) {
      return NextResponse.json(
        { error: 'Company, Title and Experience are required' },
        { status: 400 }
      )
    }

    // Get user ID from request
    const userId = experienceData.user_id

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Insert new experience record
    const { data, error } = await supabase
      .from('experience_records')
      .insert([{
        user_id: userId,
        jd_id: experienceData.jd_id || null,
        company: experienceData.company,
        title: experienceData.title,
        experience: experienceData.experience,
        keywords: experienceData.keywords || [],
        role_group: experienceData.role_group || null,
        work_or_project: experienceData.work_or_project || null,
        time: experienceData.time || null,
        comment: experienceData.comment || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save experience record', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Experience record saved successfully'
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
    const company = searchParams.get('company')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('experience_records')
      .select(`
        *,
        jd_records (
          id,
          title,
          company
        )
      `)
      .eq('user_id', userId)

    // Filter by company if provided
    if (company) {
      query = query.eq('company', company)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch experience records', details: error.message },
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
    const experienceData = await request.json()
    const { id, user_id, ...updateData } = experienceData

    if (!id || !user_id) {
      return NextResponse.json(
        { error: 'Record ID and User ID are required' },
        { status: 400 }
      )
    }

    // Update experience record
    const { data, error } = await supabase
      .from('experience_records')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user_id) // Ensure user can only update their own records
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update experience record', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Experience record updated successfully'
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Record ID and User ID are required' },
        { status: 400 }
      )
    }

    // Delete experience record
    const { error } = await supabase
      .from('experience_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only delete their own records

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to delete experience record', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Experience record deleted successfully'
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}