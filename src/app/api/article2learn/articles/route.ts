import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizeUserId(userId: string): string {
  return userId || 'anonymous'
}

// GET - 获取用户文章列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const finalUserId = normalizeUserId(userId)

    const { data: articles, error } = await supabase
      .from('article2learn_articles')
      .select('*')
      .eq('user_id', finalUserId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

// POST - 创建文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, title, content, article_language, mother_tongue } = body

    if (!user_id || !title || !content || !article_language || !mother_tongue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const finalUserId = normalizeUserId(user_id)

    const { data: article, error } = await supabase
      .from('article2learn_articles')
      .insert({
        user_id: finalUserId,
        title,
        content,
        article_language,
        mother_tongue,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ article }, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}

// DELETE - 删除文章
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Article ID and User ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('article2learn_articles')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}
