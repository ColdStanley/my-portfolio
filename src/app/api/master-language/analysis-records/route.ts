import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DatabaseHelper, isValidLanguagePair } from '../../../master-any-language-by-articles/config/databaseConfig'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST: Add new analysis record to article
export async function POST(req: NextRequest) {
  try {
    const { 
      articleId, 
      languagePair,
      selectedText, 
      contextSentence, 
      analysis, 
      analysisMode, 
      userNotes,
      aiNotes,
      startOffset, 
      endOffset, 
      queryType 
    } = await req.json()
    
    if (!articleId || !languagePair || !selectedText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate language pair
    if (!isValidLanguagePair(languagePair)) {
      return NextResponse.json({ error: 'Invalid language pair' }, { status: 400 })
    }

    // Support both chinese-english and chinese-french
    if (languagePair !== 'chinese-english' && languagePair !== 'chinese-french') {
      return NextResponse.json({ error: 'Only chinese-english and chinese-french are supported' }, { status: 400 })
    }

    const tableName = DatabaseHelper.getArticlesTable(languagePair)
    
    // Create new analysis record
    const newRecord = {
      id: uuidv4(),
      selected_text: selectedText,
      context_sentence: contextSentence || '',
      analysis: analysis || '',
      analysis_mode: analysisMode || 'simple',
      user_notes: userNotes || '',
      ai_notes: aiNotes || '',
      start_offset: startOffset || 0,
      end_offset: endOffset || selectedText.length,
      query_type: queryType || 'ai_query',
      created_at: new Date().toISOString()
    }

    // First get the current article to append to existing records
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
      return NextResponse.json({ error: 'Failed to add analysis record' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      record: newRecord,
      article: data 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: Retrieve all analysis records for an article
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')
    const languagePair = searchParams.get('languagePair')

    if (!articleId || !languagePair) {
      return NextResponse.json({ error: 'Missing articleId or languagePair' }, { status: 400 })
    }

    // Validate language pair
    if (!isValidLanguagePair(languagePair)) {
      return NextResponse.json({ error: 'Invalid language pair' }, { status: 400 })
    }

    // Support both chinese-english and chinese-french
    if (languagePair !== 'chinese-english' && languagePair !== 'chinese-french') {
      return NextResponse.json({ error: 'Only chinese-english and chinese-french are supported' }, { status: 400 })
    }

    const tableName = DatabaseHelper.getArticlesTable(languagePair)

    const { data, error } = await supabase
      .from(tableName)
      .select('analysis_records')
      .eq('id', articleId)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      records: data.analysis_records || [] 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Remove specific analysis record from article
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')
    const recordId = searchParams.get('recordId')
    const languagePair = searchParams.get('languagePair')

    if (!articleId || !recordId || !languagePair) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Validate language pair
    if (!isValidLanguagePair(languagePair)) {
      return NextResponse.json({ error: 'Invalid language pair' }, { status: 400 })
    }

    // Support both chinese-english and chinese-french
    if (languagePair !== 'chinese-english' && languagePair !== 'chinese-french') {
      return NextResponse.json({ error: 'Only chinese-english and chinese-french are supported' }, { status: 400 })
    }

    const tableName = DatabaseHelper.getArticlesTable(languagePair)

    // First get current records
    const { data: currentArticle, error: fetchError } = await supabase
      .from(tableName)
      .select('analysis_records')
      .eq('id', articleId)
      .single()

    if (fetchError) {
      console.error('Error fetching current article:', fetchError)
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Filter out the record with matching id
    const currentRecords = currentArticle.analysis_records || []
    const filteredRecords = currentRecords.filter((record: any) => record.id !== recordId)

    // Update with filtered records
    const { data, error } = await supabase
      .from(tableName)
      .update({
        analysis_records: filteredRecords,
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId)
      .select('analysis_records')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete analysis record' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      records: data.analysis_records || [] 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}