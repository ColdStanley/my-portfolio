import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DatabaseHelper, isValidLanguagePair } from '../../../master-any-language-by-articles/config/databaseConfig'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const languagePair = searchParams.get('languagePair') || searchParams.get('language') || 'chinese-english'

    if (!id) {
      return NextResponse.json({ error: 'Missing article id' }, { status: 400 })
    }

    // Validate language pair
    if (!isValidLanguagePair(languagePair)) {
      return NextResponse.json({ error: 'Invalid language pair' }, { status: 400 })
    }

    // Get the appropriate table name
    const tableName = DatabaseHelper.getArticlesTable(languagePair)

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, title, languagePair, backgroundImageUrl } = await req.json()
    
    if (!content || !languagePair) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate language pair
    if (!isValidLanguagePair(languagePair)) {
      return NextResponse.json({ error: 'Invalid language pair' }, { status: 400 })
    }

    // Get the appropriate table name
    const tableName = DatabaseHelper.getArticlesTable(languagePair)

    const { data, error } = await supabase
      .from(tableName)
      .insert([{
        content: content.trim(),
        title: title?.trim() || 'Untitled',
        background_image_url: backgroundImageUrl || null
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