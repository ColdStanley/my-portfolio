import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ARTICLES_TABLE = 'chinese_french_articles'

// GET: Retrieve learning records for an article
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({ error: 'Missing articleId' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from(ARTICLES_TABLE)
      .select('learning_records')
      .eq('id', articleId)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch learning records' }, { status: 500 })
    }

    // Return sentences array from learning_records, mapped to expected format
    const learningRecords = data?.learning_records || { sentences: [] }
    const sentences = (learningRecords.sentences || []).map((sentence: any) => ({
      id: parseInt(sentence.id) || Date.now(), // Convert string ID to number
      sentence_text: sentence.text || '',
      translation: sentence.translation || '',
      analysis: sentence.analysis || '',
      start_offset: sentence.startOffset || 0,
      end_offset: sentence.endOffset || 0,
      query_type: 'sentence_analysis',
      user_notes: sentence.user_notes || '',
      ai_notes: sentence.ai_notes || '',
      created_at: new Date(sentence.timestamp || Date.now()).toISOString(),
      updated_at: new Date(sentence.timestamp || Date.now()).toISOString()
    }))
    return NextResponse.json(sentences)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create new sentence learning record
export async function POST(req: NextRequest) {
  try {
    const { 
      articleId, 
      sentenceText, 
      startOffset, 
      endOffset
    } = await req.json()

    if (!articleId || !sentenceText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current learning records
    const { data: currentData, error: fetchError } = await supabase
      .from(ARTICLES_TABLE)
      .select('learning_records')
      .eq('id', articleId)
      .single()

    if (fetchError) {
      console.error('Database fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch current data' }, { status: 500 })
    }

    const currentRecords = currentData?.learning_records || { sentences: [] }
    const sentenceId = Date.now() // Use number ID for consistency

    // Create new sentence record
    const newSentence = {
      id: sentenceId,
      text: sentenceText,
      startOffset: startOffset || 0,
      endOffset: endOffset || sentenceText.length,
      timestamp: Date.now(),
      words: [],
      phrases: [],
      grammar: [],
      others: []
    }

    // Add to sentences array
    const updatedRecords = {
      ...currentRecords,
      sentences: [...(currentRecords.sentences || []), newSentence]
    }

    // Update database
    const { error: updateError } = await supabase
      .from(ARTICLES_TABLE)
      .update({ learning_records: updatedRecords })
      .eq('id', articleId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ error: 'Failed to save sentence record' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: sentenceId, // Already a number
        sentence_text: sentenceText,
        start_offset: startOffset || 0,
        end_offset: endOffset || sentenceText.length
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Remove sentence learning record
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')
    const sentenceId = searchParams.get('sentenceId')

    if (!articleId || !sentenceId) {
      return NextResponse.json({ error: 'Missing articleId or sentenceId' }, { status: 400 })
    }

    // Get current learning records
    const { data: currentData, error: fetchError } = await supabase
      .from(ARTICLES_TABLE)
      .select('learning_records')
      .eq('id', articleId)
      .single()

    if (fetchError) {
      console.error('Database fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch current data' }, { status: 500 })
    }

    const currentRecords = currentData?.learning_records || { sentences: [] }
    
    // Remove sentence from array (normalize IDs for comparison)
    const targetId = parseInt(sentenceId)
    const updatedRecords = {
      ...currentRecords,
      sentences: (currentRecords.sentences || []).filter((s: any) => {
        const currentId = typeof s.id === 'string' ? parseInt(s.id) : s.id
        return currentId !== targetId
      })
    }
    
    console.log('Deleting sentence with ID:', targetId, 'Found sentences:', currentRecords.sentences?.length || 0)

    // Update database
    const { error: updateError } = await supabase
      .from(ARTICLES_TABLE)
      .update({ learning_records: updatedRecords })
      .eq('id', articleId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ error: 'Failed to delete sentence record' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}