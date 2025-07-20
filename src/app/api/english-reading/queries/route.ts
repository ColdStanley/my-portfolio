import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')
    const type = searchParams.get('type')

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    if (type === 'word') {
      const { data, error } = await supabase
        .from('english_reading_word_queries')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to fetch word queries' }, { status: 500 })
      }

      return NextResponse.json(data || [])
    } else if (type === 'sentence') {
      const { data, error } = await supabase
        .from('english_reading_sentence_queries')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to fetch sentence queries' }, { status: 500 })
      }

      return NextResponse.json(data || [])
    } else {
      return NextResponse.json({ error: 'Type must be "word" or "sentence"' }, { status: 400 })
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type are required' }, { status: 400 })
    }

    const table = type === 'word' ? 'english_reading_word_queries' : 'english_reading_sentence_queries'
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete query' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}