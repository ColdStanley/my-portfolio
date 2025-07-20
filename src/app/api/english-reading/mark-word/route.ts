import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { articleId, wordText, startOffset, endOffset, queryType } = await req.json()
    
    if (!articleId || !wordText || startOffset === undefined || endOffset === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save to database - manual mark doesn't need AI processing
    const { data, error } = await supabase
      .from('english_reading_word_queries')
      .insert([{
        article_id: articleId,
        word_text: wordText,
        definition: '', // Empty for manual marks
        examples: [], // Empty array for manual marks
        start_offset: startOffset,
        end_offset: endOffset,
        query_type: queryType || 'manual_mark',
        user_notes: 'Click to add your notes...'
      }])
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save mark' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}