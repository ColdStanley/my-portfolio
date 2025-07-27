import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { articleId, sentenceText, analysis, startOffset, endOffset, language, contentType } = await req.json()
    
    if (!articleId || !sentenceText || !analysis || startOffset === undefined || endOffset === undefined || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save analysis to database
    const { data, error } = await supabase
      .from('english_reading_sentence_queries')
      .insert([{
        article_id: articleId,
        sentence_text: sentenceText,
        translation: '', // Not used for phrase/word analysis
        analysis: analysis,
        start_offset: startOffset,
        end_offset: endOffset,
        query_type: 'ai_query',
        content_type: contentType || 'phrase_analysis',
        language: language
      }])
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}