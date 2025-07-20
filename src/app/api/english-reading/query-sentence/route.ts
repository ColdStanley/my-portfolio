import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

export async function POST(req: NextRequest) {
  try {
    const { articleId, sentenceText, startOffset, endOffset, queryType } = await req.json()
    
    if (!articleId || !sentenceText || startOffset === undefined || endOffset === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Call DeepSeek API
    const prompt = `Please provide Chinese translation and detailed grammar analysis for this English sentence: "${sentenceText}"
    
    Return in JSON format:
    {
      "translation": "Chinese translation here",
      "analysis": "Natural language explanation of sentence structure, grammar points, and key phrases in Chinese"
    }
    
    The analysis should be a natural language paragraph explaining the grammar, not a data structure.`

    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      throw new Error('DeepSeek API error')
    }

    const result = await res.json()
    const content = result.choices?.[0]?.message?.content || ''
    
    // Extract JSON from response
    let parsedContent
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
      const jsonText = jsonMatch ? jsonMatch[1] : content.trim()
      parsedContent = JSON.parse(jsonText)
    } catch {
      parsedContent = {
        translation: `Translation for the sentence`,
        analysis: `Grammar and structure analysis for the sentence`
      }
    }

    // Save to database
    const { data, error } = await supabase
      .from('english_reading_sentence_queries')
      .insert([{
        article_id: articleId,
        sentence_text: sentenceText,
        translation: parsedContent.translation,
        analysis: parsedContent.analysis,
        start_offset: startOffset,
        end_offset: endOffset,
        query_type: queryType || 'ai_query',
      }])
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save query' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}