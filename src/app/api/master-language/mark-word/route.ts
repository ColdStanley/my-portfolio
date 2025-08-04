import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DatabaseHelper, isValidLanguagePair } from '../../../master-any-language-by-articles/config/databaseConfig'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { articleId, wordText, startOffset, endOffset, queryType, language, analysisMode, userNotes } = await req.json()
    
    if (!articleId || !wordText || startOffset === undefined || endOffset === undefined || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Determine language pair based on language parameter
    const languagePair = language === 'english' ? 'chinese-english' : 'chinese-french'
    
    if (!isValidLanguagePair(languagePair)) {
      return NextResponse.json({ error: 'Invalid language pair' }, { status: 400 })
    }

    const tableName = DatabaseHelper.getArticlesTable(languagePair)
    
    // Create new analysis record
    const newRecord = {
      id: uuidv4(),
      selected_text: wordText,
      context_sentence: '',
      analysis: '',
      analysis_mode: analysisMode || 'mark',
      user_notes: userNotes || '',
      ai_notes: '',
      start_offset: startOffset,
      end_offset: endOffset,
      query_type: queryType || 'manual_mark',
      created_at: new Date().toISOString()
    }

    // Get current article to append to existing records
    const { data: currentArticle, error: fetchError } = await supabase
      .from(tableName)
      .select('analysis_records')
      .eq('id', articleId)
      .single()

    if (fetchError) {
      console.error('Error fetching current article:', fetchError)
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Append new record to existing records
    const currentRecords = currentArticle.analysis_records || []
    const updatedRecords = [...currentRecords, newRecord]

    // Update with new records array
    const { data, error } = await supabase
      .from(tableName)
      .update({
        analysis_records: updatedRecords,
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId)
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

    return NextResponse.json({ 
      success: true, 
      record: newRecord,
      article: data 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}