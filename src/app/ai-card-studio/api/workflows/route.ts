import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyAuth } from '../../utils/auth'

// GET - 获取用户的所有workflows
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = getSupabaseAdmin()

    // 获取用户的workflows
    const { data: workflows, error } = await supabase
      .from('ai_card_studio_workflows')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch workflows' },
        { status: 500 }
      )
    }

    return NextResponse.json({ workflows })
  } catch (error) {
    console.error('Get workflows error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - 创建新workflow
export async function POST(request: NextRequest) {
  try {
    const { title, columns } = await request.json()
    
    // 验证用户身份
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = getSupabaseAdmin()

    // 创建workflow
    const { data, error } = await supabase
      .from('ai_card_studio_workflows')
      .insert({
        user_id: user.id,
        title: title || 'My Workflow',
        columns: columns || []
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create workflow' },
        { status: 500 }
      )
    }

    return NextResponse.json({ workflow: data })
  } catch (error) {
    console.error('Create workflow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - 清理重复工作流
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = getSupabaseAdmin()

    // 获取用户所有工作流
    const { data: workflows, error: fetchError } = await supabase
      .from('ai_card_studio_workflows')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (fetchError) {
      console.error('Fetch workflows error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch workflows' },
        { status: 500 }
      )
    }

    // 按标题分组
    const titleGroups = new Map<string, any[]>()
    workflows?.forEach(workflow => {
      const title = workflow.title
      if (!titleGroups.has(title)) {
        titleGroups.set(title, [])
      }
      titleGroups.get(title)!.push(workflow)
    })

    let deletedCount = 0
    // 删除重复工作流，保留最新的
    for (const [title, workflowGroup] of titleGroups.entries()) {
      if (workflowGroup.length > 1) {
        // 保留第一个（最新的），删除其他
        const toDelete = workflowGroup.slice(1)
        
        for (const workflow of toDelete) {
          const { error: deleteError } = await supabase
            .from('ai_card_studio_workflows')
            .delete()
            .eq('id', workflow.id)
            .eq('user_id', user.id)

          if (!deleteError) {
            deletedCount++
          }
        }
      }
    }

    return NextResponse.json({ 
      message: `Cleaned up ${deletedCount} duplicate workflows`,
      deletedCount 
    })
  } catch (error) {
    console.error('Cleanup workflows error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}