import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const language = searchParams.get('language') || 'english'

    const { data, error } = await supabase
      .from('english_reading_articles')
      .select('*')
      .or(`language.eq.${language},language.is.null`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
    }

    // Ensure all articles have language field set for backward compatibility
    const articlesWithLanguage = data.map(article => ({
      ...article,
      language: article.language || 'english'
    }))

    return NextResponse.json(articlesWithLanguage)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}