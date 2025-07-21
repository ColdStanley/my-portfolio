import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { id, type, notes } = await req.json()
    
    if (!id || !type || notes === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const table = type === 'word' ? 'english_reading_word_queries' : 'english_reading_sentence_queries'
    
    const { error } = await supabase
      .from(table)
      .update({ user_notes: notes })
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}