import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DatabaseHelper, isValidLanguagePair } from '../../../../master-any-language-by-articles/config/databaseConfig'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const languagePair = searchParams.get('languagePair') || searchParams.get('language') || 'chinese-english'

    // Validate language pair
    if (!isValidLanguagePair(languagePair)) {
      return NextResponse.json({ error: 'Invalid language pair' }, { status: 400 })
    }

    // Get the appropriate table name
    const tableName = DatabaseHelper.getArticlesTable(languagePair)

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}