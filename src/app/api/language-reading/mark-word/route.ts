import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { articleId, wordText, startOffset, endOffset, queryType, language } = await req.json()
    
    if (!articleId || !wordText || startOffset === undefined || endOffset === undefined || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save to database without AI analysis
    const { data, error } = await supabase
      .from('english_reading_word_queries')
      .insert([{
        article_id: articleId,
        word_text: wordText,
        definition: null,
        part_of_speech: null,
        root_form: null,
        examples: [],
        example_translation: null,
        start_offset: startOffset,
        end_offset: endOffset,
        query_type: queryType || 'manual_mark',
        user_notes: '',
        language: language
      }])
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        error: 'Failed to save mark', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}