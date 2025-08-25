import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Keep user_id as string for both authenticated and anonymous users
function normalizeUserId(userId: string): string {
  return userId || 'anonymous'
}

// GET - Fetch user articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Normalize user ID
    const finalUserId = normalizeUserId(userId)

    const { data: articles, error } = await supabase
      .from('readlingua_articles')
      .select('*')
      .eq('user_id', finalUserId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

// POST - Create new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { user_id, title, content, source_language, native_language } = body

    if (!user_id || !title || !content || !source_language || !native_language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Normalize user ID
    const finalUserId = normalizeUserId(user_id)
    const { data: article, error } = await supabase
      .from('readlingua_articles')
      .insert({
        user_id: finalUserId,
        title,
        content,
        source_language,
        native_language
      })
      .select()
      .single()

    if (error) {
      throw error
    }
    return NextResponse.json({ article }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating article:', error)
    return NextResponse.json({ 
      error: 'Failed to create article',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update article
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, user_id, title, content, source_language, native_language } = body

    if (!id || !user_id) {
      return NextResponse.json({ error: 'Article ID and User ID required' }, { status: 400 })
    }

    const { data: article, error } = await supabase
      .from('readlingua_articles')
      .update({
        title,
        content,
        source_language,
        native_language,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

// DELETE - Delete article
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (!id || !userId) {
      return NextResponse.json({ error: 'Article ID and User ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('readlingua_articles')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}