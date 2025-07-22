import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

// Language-specific prompts
const getWordAnalysisPrompt = (wordText: string, language: string) => {
  if (language === 'french') {
    return `请分析这个法语单词/短语："${wordText}"

    请提供：
    1. 中文释义/翻译
    2. 词性（名词、动词、形容词等，用中文说明）
    3. 原形（如果适用，例如："mangé" -> "manger"）
    4. 性别（阳性/阴性，如果适用）
    5. 一个使用该词的法语例句
    6. 例句的中文翻译
    7. 动词变位信息（如果是动词，用中文解释；如果不是动词，请留空""）

    以JSON格式返回：
    {
      "definition": "中文释义/翻译",
      "partOfSpeech": "词性（中文）",
      "rootForm": "原形",
      "gender": "阳性/阴性/中性",
      "example": "包含${wordText}的法语例句",
      "exampleTranslation": "例句的中文翻译",
      "conjugationInfo": "动词变位信息（中文解释），非动词留空"
    }

    重要：例句必须包含确切的单词/短语"${wordText}"。`
  } else {
    // English prompt
    return `Analyze the English word/phrase: "${wordText}"

    Please provide:
    1. Chinese definition/translation
    2. Part of speech (noun, verb, adjective, etc.)
    3. Root form (if applicable, e.g., "ran" -> "run")
    4. ONE example sentence using this word
    5. Chinese translation of the example sentence

    Return in JSON format:
    {
      "definition": "中文释义",
      "partOfSpeech": "词性",
      "rootForm": "原型",
      "example": "English example sentence with ${wordText}",
      "exampleTranslation": "例句的中文翻译"
    }

    Important: The example sentence must contain the exact word/phrase "${wordText}".`
  }
}

export async function POST(req: NextRequest) {
  try {
    const { articleId, wordText, startOffset, endOffset, queryType, language } = await req.json()
    
    if (!articleId || !wordText || startOffset === undefined || endOffset === undefined || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Call DeepSeek API
    const prompt = getWordAnalysisPrompt(wordText, language)

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
          definition: `Traduction de "${wordText}"`,
          partOfSpeech: "inconnu",
          rootForm: wordText,
          gender: "neutre",
          example: `Phrase d'exemple avec ${wordText}.`,
          exampleTranslation: `包含 ${wordText} 的法语例句翻译`,
          conjugationInfo: null
        }
      } else {
        parsedContent = {
          definition: `Translation for "${wordText}"`,
          partOfSpeech: "unknown",
          rootForm: wordText,
          example: `Example sentence with ${wordText}.`,
          exampleTranslation: `包含 ${wordText} 的例句翻译`
        }
      }
    }

    // Save to database
    const insertData: any = {
      article_id: articleId,
      word_text: wordText,
      definition: parsedContent.definition,
      part_of_speech: parsedContent.partOfSpeech,
      root_form: parsedContent.rootForm,
      examples: [parsedContent.example], // Keep as array for compatibility
      example_translation: parsedContent.exampleTranslation,
      start_offset: startOffset,
      end_offset: endOffset,
      query_type: queryType || 'ai_query',
      language: language
    }

    // Add French-specific fields
    if (language === 'french') {
      insertData.gender = parsedContent.gender
      insertData.conjugation_info = parsedContent.conjugationInfo
    }

    const { data, error } = await supabase
      .from('english_reading_word_queries')
      .insert([insertData])
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