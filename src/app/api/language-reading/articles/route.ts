import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const language = searchParams.get('language') || 'english'

    if (!id) {
      return NextResponse.json({ error: 'Missing article id' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('english_reading_articles')
      .select('*')
      .eq('id', id)
      .or(`language.eq.${language},language.is.null`)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Ensure article has language field for backward compatibility
    const articleWithLanguage = {
      ...data,
      language: data.language || 'english'
    }

    return NextResponse.json(articleWithLanguage)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, title, language } = await req.json()
    
    if (!content || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('english_reading_articles')
      .insert([{
        content: content.trim(),
        title: title?.trim() || 'Untitled',
        language: language
      }])
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save article' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}