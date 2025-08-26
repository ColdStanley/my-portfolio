import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface RouteContext {
  params: {
    id: string
  }
}

// PUT /api/jds/[id] - Update JD field
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { user_id, field, value } = body

    console.log('PUT /api/jds/[id] received:', { id, user_id, field, value })

    if (!user_id || !field) {
      console.log('Missing required fields:', { user_id, field })
      return NextResponse.json(
        { error: 'user_id and field are required' },
        { status: 400 }
      )
    }

    // Prepare update object
    const updateData: any = {
      [field]: value,
      updated_at: new Date().toISOString()
    }

    // Validate match_score if present
    if (field === 'match_score') {
      updateData.match_score = Math.max(0, Number(value) || 0)
    }

    console.log('About to update with data:', updateData)
    console.log('Update conditions:', { id, user_id })

    const { data, error } = await supabase
      .from('jd_records')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single()

    console.log('Supabase update result:', { data, error })

    if (error) {
      console.error('Supabase error details:', error)
      return NextResponse.json(
        { error: `Failed to update JD record: ${error.message}` },
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

// DELETE /api/jds/[id] - Delete JD
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('jd_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to delete JD record' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}