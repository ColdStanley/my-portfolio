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
    const language = searchParams.get('language') || 'english'

    if (!articleId) {
      return NextResponse.json({ error: 'Missing articleId parameter' }, { status: 400 })
    }

    // If type is specified, return only that type (original behavior)
    if (type) {
      const table = type === 'word' ? 'english_reading_word_queries' : 'english_reading_sentence_queries'
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('article_id', articleId)
        .or(`language.eq.${language},language.is.null`)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to fetch queries' }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    // If no type specified, return both word and sentence queries (for mobile view)
    const [wordQueriesResult, sentenceQueriesResult] = await Promise.all([
      supabase
        .from('english_reading_word_queries')
        .select('*')
        .eq('article_id', articleId)
        .or(`language.eq.${language},language.is.null`)
        .order('created_at', { ascending: true }),
      supabase
        .from('english_reading_sentence_queries')
        .select('*')
        .eq('article_id', articleId)
        .or(`language.eq.${language},language.is.null`)
        .order('created_at', { ascending: true })
    ])

    if (wordQueriesResult.error) {
      console.error('Word queries database error:', wordQueriesResult.error)
      return NextResponse.json({ error: 'Failed to fetch word queries' }, { status: 500 })
    }

    if (sentenceQueriesResult.error) {
      console.error('Sentence queries database error:', sentenceQueriesResult.error)
      return NextResponse.json({ error: 'Failed to fetch sentence queries' }, { status: 500 })
    }

    return NextResponse.json({
      wordQueries: wordQueriesResult.data,
      sentenceQueries: sentenceQueriesResult.data
    })
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
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
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