import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { selectedText, notes, language } = await req.json()

    if (!selectedText || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find the most recent word query for this text
    const { data, error } = await supabase
      .from('english_reading_word_queries')
      .update({ user_notes: notes })
      .eq('word_text', selectedText)
      .or(`language.eq.${language},language.is.null`)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}