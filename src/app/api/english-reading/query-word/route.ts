import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

export async function POST(req: NextRequest) {
  try {
    const { articleId, wordText, startOffset, endOffset, queryType } = await req.json()
    
    if (!articleId || !wordText || startOffset === undefined || endOffset === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Call DeepSeek API
    const prompt = `Please provide Chinese translation and 2 English example sentences for the English word/phrase: "${wordText}". 
    
    Return in JSON format:
    {
      "definition": "Chinese translation here",
      "examples": ["English example sentence 1", "English example sentence 2"]
    }`

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
        definition: `Translation for "${wordText}"`,
        examples: [`Example with ${wordText}`, `Another example with ${wordText}`]
      }
    }

    // Save to database
    const { data, error } = await supabase
      .from('english_reading_word_queries')
      .insert([{
        article_id: articleId,
        word_text: wordText,
        definition: parsedContent.definition,
        examples: parsedContent.examples,
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