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
      .maybeSingle() // Use maybeSingle instead of single to handle no records

    if (error) {
      console.error('Database error in sentence-queries GET:', {
        error,
        articleId,
        tableName: ARTICLES_TABLE
      })
      return NextResponse.json({ 
        error: 'Failed to fetch learning records',
        details: error.message 
      }, { status: 500 })
    }

    // If no article found, return empty array
    if (!data) {
      console.log('No article found with ID:', articleId)
      return NextResponse.json([])
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
      updated_at: new Date(sentence.timestamp || Date.now()).toISOString(),
      // Include analysis dimensions for frontend restoration
      words: sentence.words || [],
      phrases: sentence.phrases || [],
      grammar: sentence.grammar || [],
      others: sentence.others || []
    }))
    return NextResponse.json(sentences)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create new sentence learning record
// PATCH: Save analysis query to existing sentence
export async function PATCH(req: NextRequest) {
  try {
    const { 
      articleId, 
      sentenceId,
      dimension,
      query,
      response,
      prompt
    } = await req.json()

    if (!articleId || !sentenceId || !dimension || !query || !response) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current learning records
    const { data: currentData, error: fetchError } = await supabase
      .from(ARTICLES_TABLE)
      .select('learning_records')
      .eq('id', articleId)
      .maybeSingle()

    if (fetchError) {
      console.error('Database fetch error in PATCH:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch current data' }, { status: 500 })
    }

    if (!currentData) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const currentRecords = currentData?.learning_records || { sentences: [] }
    
    // Find the target sentence
    const sentenceIndex = currentRecords.sentences.findIndex((s: any) => 
      (typeof s.id === 'string' ? parseInt(s.id) : s.id) === parseInt(sentenceId)
    )
    
    if (sentenceIndex === -1) {
      return NextResponse.json({ error: 'Sentence not found' }, { status: 404 })
    }

    // Create new analysis item
    const newAnalysisItem = {
      id: Date.now().toString(),
      query,
      response,
      prompt,
      isStreaming: false,
      timestamp: Date.now()
    }

    // Add to the appropriate dimension array
    const sentence = currentRecords.sentences[sentenceIndex]
    if (!sentence[dimension]) {
      sentence[dimension] = []
    }
    sentence[dimension].push(newAnalysisItem)

    // Update database
    const { error: updateError } = await supabase
      .from(ARTICLES_TABLE)
      .update({ learning_records: currentRecords })
      .eq('id', articleId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: newAnalysisItem
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
      .maybeSingle()

    if (fetchError) {
      console.error('Database fetch error in POST:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch current data' }, { status: 500 })
    }

    let currentRecords = currentData?.learning_records || { sentences: [] }

    // If article doesn't exist, create it first
    if (!currentData) {
      const { error: insertError } = await supabase
        .from(ARTICLES_TABLE)
        .insert({ 
          id: parseInt(articleId),
          learning_records: { sentences: [] },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Failed to create article in POST:', insertError)
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
      }
      
      currentRecords = { sentences: [] }
    }

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

// DELETE: Remove sentence learning record or specific analysis item
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')
    const sentenceId = searchParams.get('sentenceId')
    const dimension = searchParams.get('dimension')
    const itemId = searchParams.get('itemId')

    console.log('DELETE request params:', { articleId, sentenceId, dimension, itemId })

    if (!articleId || !sentenceId) {
      return NextResponse.json({ error: 'Missing articleId or sentenceId' }, { status: 400 })
    }

    // Get current learning records
    const { data: currentData, error: fetchError } = await supabase
      .from(ARTICLES_TABLE)
      .select('learning_records')
      .eq('id', articleId)
      .maybeSingle()

    if (fetchError) {
      console.error('Database fetch error in DELETE:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch current data' }, { status: 500 })
    }

    // If no article found, return success (nothing to delete)
    if (!currentData) {
      console.log('No article found with ID:', articleId, 'for deletion')
      return NextResponse.json({ success: true })
    }

    const currentRecords = currentData?.learning_records || { sentences: [] }
    
    // If dimension and itemId are provided, delete specific analysis item
    if (dimension && itemId) {
      console.log('Deleting analysis item:', { dimension, itemId, sentenceId })
      
      // Find the target sentence
      const sentenceIndex = currentRecords.sentences.findIndex((s: any) => 
        (typeof s.id === 'string' ? parseInt(s.id) : s.id) === parseInt(sentenceId)
      )
      
      if (sentenceIndex === -1) {
        return NextResponse.json({ error: 'Sentence not found' }, { status: 404 })
      }

      // Remove the specific analysis item from the dimension array
      const sentence = currentRecords.sentences[sentenceIndex]
      if (sentence[dimension]) {
        sentence[dimension] = sentence[dimension].filter((item: any) => item.id !== itemId)
        console.log(`Removed item ${itemId} from ${dimension}. Remaining items:`, sentence[dimension].length)
      }

      const updatedRecords = {
        ...currentRecords,
        sentences: [...currentRecords.sentences]
      }

      // Update database
      const { error: updateError } = await supabase
        .from(ARTICLES_TABLE)
        .update({ learning_records: updatedRecords })
        .eq('id', articleId)

      if (updateError) {
        console.error('Database update error:', updateError)
        return NextResponse.json({ error: 'Failed to delete analysis item' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    } else {
      // Delete entire sentence (original functionality)
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
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}