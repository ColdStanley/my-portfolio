import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET: Search/fetch Monster job records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'user_id is required'
      }, { status: 400 })
    }

    console.log('🔍 Fetching Monster JD records for user:', userId)

    // Fetch user's Monster job records
    const { data, error } = await supabase
      .from('jd_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase fetch error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch Monster job records',
        details: error.message
      }, { status: 500 })
    }

    console.log(`✅ Successfully fetched ${data.length} Monster job records`)

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error: any) {
    console.error('❌ Monster API GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

// POST: Save new Monster job record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      user_id, 
      title, 
      company, 
      full_job_description, 
      original_url 
    } = body

    // Validate required fields
    if (!user_id || !title || !company) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: user_id, title, company'
      }, { status: 400 })
    }

    console.log('📤 Saving Monster job to Supabase:', {
      user_id,
      title,
      company,
      description_length: full_job_description?.length || 0
    })

    // Check if record already exists
    const { data: existingRecords, error: searchError } = await supabase
      .from('jd_records')
      .select('id, title, company')
      .eq('user_id', user_id)
      .ilike('title', title)
      .ilike('company', company)
      .limit(1)

    if (searchError) {
      console.error('❌ Error checking existing records:', searchError)
    }

    if (existingRecords && existingRecords.length > 0) {
      console.log('⚠️ Monster job already exists:', existingRecords[0])
      return NextResponse.json({
        success: true,
        exists: true,
        data: existingRecords[0],
        message: 'Job record already exists in database'
      })
    }

    // Create new record
    const insertData = {
      user_id,
      title: title.trim(),
      company: company.trim(),
      full_job_description: full_job_description?.trim() || '',
      application_stage: null,
      role_group: null,
      firm_type: null,
      comment: original_url || null
    }

    const { data, error } = await supabase
      .from('jd_records')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase insert error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to save Monster job record',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Monster job successfully saved to Supabase:', data.id)

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Monster job record saved successfully'
    })

  } catch (error: any) {
    console.error('❌ Monster API POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

// PUT: Update existing Monster job record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, user_id, title, company, full_job_description, original_url } = body

    if (!id || !user_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: id, user_id'
      }, { status: 400 })
    }

    console.log('🔄 Updating Monster job record:', id)

    const updateData = {
      title: title?.trim(),
      company: company?.trim(),
      full_job_description: full_job_description?.trim(),
      comment: original_url,
      updated_at: new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    const { data, error } = await supabase
      .from('jd_records')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase update error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update Monster job record',
        details: error.message
      }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Monster job record not found or access denied'
      }, { status: 404 })
    }

    console.log('✅ Monster job record updated successfully:', data.id)

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Monster job record updated successfully'
    })

  } catch (error: any) {
    console.error('❌ Monster API PUT error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

// DELETE: Remove Monster job record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (!id || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: id, user_id'
      }, { status: 400 })
    }

    console.log('🗑️ Deleting Monster job record:', id)

    const { data, error } = await supabase
      .from('jd_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()

    if (error) {
      console.error('❌ Supabase delete error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete Monster job record',
        details: error.message
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Monster job record not found or access denied'
      }, { status: 404 })
    }

    console.log('✅ Monster job record deleted successfully:', id)

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Monster job record deleted successfully'
    })

  } catch (error: any) {
    console.error('❌ Monster API DELETE error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}