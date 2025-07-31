import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { id, type, aiNotes, language = 'english' } = await req.json()
    
    console.log('API received data:', { id, type, language, aiNotesLength: aiNotes?.length })
    
    if (!id || !type || typeof aiNotes !== 'string') {
      console.error('Missing required fields:', { id, type, aiNotesType: typeof aiNotes })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Both English and French use the same tables, differentiated by language column
    const tablePrefix = 'english_reading'
    const table = type === 'word' ? `${tablePrefix}_word_queries` : `${tablePrefix}_sentence_queries`
    
    console.log('Updating table:', table, 'with id:', id)
    
    const { data, error } = await supabase
      .from(table)
      .update({ ai_notes: aiNotes })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    console.log('Save successful, updated data:', data)
    return NextResponse.json({ data, success: true })

  } catch (error) {
    console.error('Save AI notes error:', error)
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 })
  }
}