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

// GET - Fetch queries for an article
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('article_id')
    const userId = searchParams.get('user_id')

    if (!articleId || !userId) {
      return NextResponse.json({ error: 'Article ID and User ID required' }, { status: 400 })
    }

    // Normalize user ID
    const finalUserId = normalizeUserId(userId)

    const { data: queries, error } = await supabase
      .from('readlingua_queries')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_id', finalUserId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ queries })
  } catch (error) {
    console.error('Error fetching queries:', error)
    return NextResponse.json({ error: 'Failed to fetch queries' }, { status: 500 })
  }
}

// POST - Create new query
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      article_id, 
      user_id, 
      selected_text, 
      query_type, 
      user_question, 
      ai_response, 
      text_position 
    } = body

    if (!article_id || !user_id || !query_type || !ai_response) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Normalize user ID
    const finalUserId = normalizeUserId(user_id)

    const { data: query, error } = await supabase
      .from('readlingua_queries')
      .insert({
        article_id,
        user_id: finalUserId,
        selected_text,
        query_type,
        user_question,
        ai_response,
        text_position
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ query }, { status: 201 })
  } catch (error) {
    console.error('Error creating query:', error)
    return NextResponse.json({ error: 'Failed to create query' }, { status: 500 })
  }
}

// DELETE - Delete query
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (!id || !userId) {
      return NextResponse.json({ error: 'Query ID and User ID required' }, { status: 400 })
    }

    // Normalize user ID
    const finalUserId = normalizeUserId(userId)

    const { error } = await supabase
      .from('readlingua_queries')
      .delete()
      .eq('id', id)
      .eq('user_id', finalUserId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting query:', error)
    return NextResponse.json({ error: 'Failed to delete query' }, { status: 500 })
  }
}