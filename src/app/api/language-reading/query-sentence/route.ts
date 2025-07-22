import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

// Language-specific prompts
const getSentenceAnalysisPrompt = (sentenceText: string, language: string) => {
  if (language === 'french') {
    return `请分析这个法语句子："${sentenceText}"

    请提供：
    1. 中文翻译
    2. 语法和语境分析（用中文讲解，需要时可引用法语原文）

    以JSON格式返回：
    {
      "translation": "中文翻译",
      "analysis": "用中文进行的语法和语境分析，必要时引用法语原文"
    }`
  } else {
    // English prompt
    return `Analyze the English sentence: "${sentenceText}"

    Please provide:
    1. Chinese translation of the sentence
    2. Grammatical and contextual analysis

    Return in JSON format:
    {
      "translation": "中文翻译",
      "analysis": "grammatical and contextual analysis in English"
    }`
  }
}

export async function POST(req: NextRequest) {
  try {
    const { articleId, sentenceText, startOffset, endOffset, queryType, language } = await req.json()
    
    if (!articleId || !sentenceText || startOffset === undefined || endOffset === undefined || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Call DeepSeek API
    const prompt = getSentenceAnalysisPrompt(sentenceText, language)

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
        response_format: { type: "json_object" }
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
      parsedContent = JSON.parse(content)
    } catch {
      // Fallback based on language
      if (language === 'french') {
        parsedContent = {
          translation: `Traduction de "${sentenceText}"`,
          analysis: "Analyse grammaticale et contextuelle de cette phrase française."
        }
      } else {
        parsedContent = {
          translation: `Translation of "${sentenceText}"`,
          analysis: "Grammatical and contextual analysis of this English sentence."
        }
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
        language: language
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