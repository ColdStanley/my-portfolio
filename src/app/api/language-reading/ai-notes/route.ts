import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')
    const language = searchParams.get('language')

    if (!articleId || !language) {
      return NextResponse.json(
        { error: 'Missing articleId or language parameter' },
        { status: 400 }
      )
    }

    console.log('Fetching AI notes for:', { articleId, language })

    // Fetch word queries with AI notes
    const { data: wordQueries, error: wordError } = await supabase
      .from('english_reading_word_queries')
      .select('id, word_text, ai_notes, created_at')
      .eq('article_id', articleId)
      .eq('language', language)
      .not('ai_notes', 'is', null)
      .order('created_at', { ascending: true })

    if (wordError) {
      console.error('Error fetching word queries:', wordError)
      return NextResponse.json(
        { error: 'Failed to fetch word queries', details: wordError.message },
        { status: 500 }
      )
    }

    // Fetch sentence queries with AI notes
    const { data: sentenceQueries, error: sentenceError } = await supabase
      .from('english_reading_sentence_queries')
      .select('id, sentence_text, ai_notes, created_at')
      .eq('article_id', articleId)
      .eq('language', language)
      .not('ai_notes', 'is', null)
      .order('created_at', { ascending: true })

    if (sentenceError) {
      console.error('Error fetching sentence queries:', sentenceError)
      return NextResponse.json(
        { error: 'Failed to fetch sentence queries', details: sentenceError.message },
        { status: 500 }
      )
    }

    console.log('AI notes fetched successfully:', {
      wordQueries: wordQueries?.length || 0,
      sentenceQueries: sentenceQueries?.length || 0
    })

    return NextResponse.json({
      wordQueries: wordQueries || [],
      sentenceQueries: sentenceQueries || []
    })

  } catch (error) {
    console.error('AI notes fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}