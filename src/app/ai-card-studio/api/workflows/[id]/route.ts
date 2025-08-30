import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyAuth } from '../../../utils/auth'

// GET - 获取特定workflow
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()
    
    // 验证用户身份
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 获取workflow
    const { data: workflow, error } = await supabase
      .from('ai_card_studio_workflows')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // 确保只能访问自己的workflow
      .single()

    if (error || !workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error('Get workflow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - 更新workflow
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { title, columns } = await request.json()
    const supabase = getSupabaseAdmin()
    
    // 验证用户身份
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 更新workflow
    const { data, error } = await supabase
      .from('ai_card_studio_workflows')
      .update({
        title,
        columns,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // 确保只能更新自己的workflow
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update workflow' },
        { status: 500 }
      )
    }

    return NextResponse.json({ workflow: data })
  } catch (error) {
    console.error('Update workflow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - 删除workflow
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()
    
    // 验证用户身份
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 删除workflow
    const { error } = await supabase
      .from('ai_card_studio_workflows')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // 确保只能删除自己的workflow

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete workflow' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Workflow deleted successfully' })
  } catch (error) {
    console.error('Delete workflow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}