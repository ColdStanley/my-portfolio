import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateDynamicPrompt, getResponseFormat, type DynamicPromptConfig } from '@/utils/modelConfig'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

export async function POST(req: NextRequest) {
  try {
    const { articleId, sentenceText, startOffset, endOffset, queryType, language, analysisMode } = await req.json()
    
    if (!articleId || !sentenceText || startOffset === undefined || endOffset === undefined || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use dynamic prompt generation
    const promptConfig: DynamicPromptConfig = {
      learningLanguage: language,
      nativeLanguage: 'chinese', // Fixed as Chinese native language
      analysisMode: analysisMode || 'simple', // Default to simple analysis
      contentType: 'sentence'
    }

    const dynamicPrompt = generateDynamicPrompt(
      sentenceText, 
      sentenceText, // For sentences, context is the sentence itself
      promptConfig
    )
    
    const responseFormat = getResponseFormat(language)
    
    // For simple analysis mode, use Markdown format; otherwise use JSON
    let fullPrompt: string
    let requestBody: any
    
    if (analysisMode === 'simple') {
      fullPrompt = `${dynamicPrompt}\n\nPlease respond with both translation and analysis in the following JSON structure:\n{\n  "translation": "翻译内容",\n  "analysis": "使用上述Markdown格式的分析内容"\n}`
      requestBody = {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: fullPrompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }
    } else {
      fullPrompt = `${dynamicPrompt}\n\n${responseFormat}\n\nPlease respond in JSON format with "translation" and "analysis" fields.`
      requestBody = {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: fullPrompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }
    }

    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
          analysis: "## 语法结构分析\n\n主语、谓语、宾语等成分待分析\n\n## 语义层次分析\n\n- **核心语义**：待解析\n- **隐含意义**：需进一步分析\n\n## 逻辑结构分析\n\n- **逻辑关系**：待确定\n\n## 句子重构与拆解\n\n- **句子结构**：需要详细分解\n\n## 注意事项\n\n- 请重新尝试查询以获得完整分析\n- 如果问题持续，请检查网络连接"
        }
      } else {
        parsedContent = {
          translation: `"${sentenceText}"的中文翻译`,
          analysis: "## 语法结构分析\n\n主语、谓语、宾语等成分待分析\n\n## 语义层次分析\n\n- **核心语义**：待解析\n- **隐含意义**：需进一步分析\n\n## 逻辑结构分析\n\n- **逻辑关系**：待确定\n\n## 句子重构与拆解\n\n- **句子结构**：需要详细分解\n\n## 注意事项\n\n- 请重新尝试查询以获得完整分析\n- 如果问题持续，请检查网络连接"
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
        language: language,
        analysis_mode: analysisMode || 'simple'
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