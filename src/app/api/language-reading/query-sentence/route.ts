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
    return `请深度分析这个法语句子："${sentenceText}"

    请提供：
    1. 中文翻译
    2. 全面的语言学分析（用中文讲解，需要时可引用法语原文）

    分析格式要求：
    - 使用清晰的标题和分段
    - 重点内容加粗显示
    - 适当使用项目符号
    - 引用原文时使用引号

    以JSON格式返回：
    {
      "translation": "中文翻译",
      "analysis": "## 语法结构分析\n\n- **主语**：...\n- **谓语**：...\n- **宾语**：...\n- **修饰成分**：...\n\n## 语义层次分析\n\n- **核心语义**：...\n- **隐含意义**：...\n- **语义关系**：...\n\n## 逻辑结构分析\n\n- **逻辑主体**：...\n- **逻辑关系**：...\n- **论证方式**：...\n\n## 句子重构与拆解\n\n- **主句**：...\n- **从句**：...\n- **简化版本**：...\n- **扩展可能**：...\n\n## 语境分析\n\n这个句子表达了...，常用于...场合。\n\n## 学习要点\n\n- **关键语法**：...\n- **常见搭配**：...\n- **注意事项**：..."
    }`
  } else {
    // English prompt
    return `请深度分析这个英语句子："${sentenceText}"

    请提供：
    1. 中文翻译
    2. 全面的语言学分析（用中文讲解，需要时可引用英语原文）

    分析格式要求：
    - 使用清晰的标题和分段
    - 重点内容加粗显示
    - 适当使用项目符号
    - 引用原文时使用引号

    以JSON格式返回：
    {
      "translation": "中文翻译",
      "analysis": "## 语法结构分析\n\n- **主语**：...\n- **谓语**：...\n- **宾语**：...\n- **修饰成分**：...\n\n## 语义层次分析\n\n- **核心语义**：...\n- **隐含意义**：...\n- **语义关系**：...\n\n## 逻辑结构分析\n\n- **逻辑主体**：...\n- **逻辑关系**：...\n- **论证方式**：...\n\n## 句子重构与拆解\n\n- **主句**：...\n- **从句**：...\n- **简化版本**：...\n- **扩展可能**：...\n\n## 语境分析\n\n这个句子表达了...，常用于...场合。\n\n## 学习要点\n\n- **关键语法**：...\n- **常见搭配**：...\n- **注意事项**：..."
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