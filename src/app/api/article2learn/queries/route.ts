import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizeUserId(userId: string): string {
  return userId || 'anonymous'
}

// GET - 获取文章的查询历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('article_id')
    const userId = searchParams.get('user_id')

    if (!articleId || !userId) {
      return NextResponse.json(
        { error: 'Article ID and User ID required' },
        { status: 400 }
      )
    }

    const finalUserId = normalizeUserId(userId)

    const { data: queries, error } = await supabase
      .from('article2learn_queries')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_id', finalUserId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ queries })
  } catch (error) {
    console.error('Error fetching queries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queries' },
      { status: 500 }
    )
  }
}

// POST - 创建或更新查询记录（去重：同一文章+同一词汇+同一查询方式只保留最新）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      article_id,
      user_id,
      selected_text,
      prompt_type,
      prompt_label,
      ai_response,
      article_language,
      mother_tongue,
    } = body

    if (
      !article_id ||
      !user_id ||
      !selected_text ||
      !prompt_type ||
      !prompt_label ||
      !ai_response ||
      !article_language ||
      !mother_tongue
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const finalUserId = normalizeUserId(user_id)

    // 检查是否已存在相同的查询（同一文章+同一词汇+同一查询方式）
    const { data: existingQuery } = await supabase
      .from('article2learn_queries')
      .select('id')
      .eq('article_id', article_id)
      .eq('user_id', finalUserId)
      .eq('selected_text', selected_text)
      .eq('prompt_type', prompt_type)
      .single()

    let query

    if (existingQuery) {
      // 更新现有记录
      const { data, error } = await supabase
        .from('article2learn_queries')
        .update({
          prompt_label,
          ai_response,
          article_language,
          mother_tongue,
          created_at: new Date().toISOString(), // 更新时间为当前时间
        })
        .eq('id', existingQuery.id)
        .select()
        .single()

      if (error) throw error
      query = data
    } else {
      // 创建新记录
      const { data, error } = await supabase
        .from('article2learn_queries')
        .insert({
          article_id,
          user_id: finalUserId,
          selected_text,
          prompt_type,
          prompt_label,
          ai_response,
          article_language,
          mother_tongue,
        })
        .select()
        .single()

      if (error) throw error
      query = data
    }

    return NextResponse.json({ query }, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating query:', error)
    return NextResponse.json(
      { error: 'Failed to create/update query' },
      { status: 500 }
    )
  }
}

// DELETE - 删除查询记录
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Query ID and User ID required' },
        { status: 400 }
      )
    }

    const finalUserId = normalizeUserId(userId)

    const { error } = await supabase
      .from('article2learn_queries')
      .delete()
      .eq('id', id)
      .eq('user_id', finalUserId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting query:', error)
    return NextResponse.json(
      { error: 'Failed to delete query' },
      { status: 500 }
    )
  }
}
