import { NextRequest, NextResponse } from 'next/server'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

// Generate context info for user's custom prompt
const generateContextInfo = (queryData: any, language: string) => {
  if (queryData.type === 'word') {
    return `关于这个${language === 'french' ? '法语' : '英语'}单词的基本信息：
单词：${queryData.word_text}
释义：${queryData.definition}
词性：${queryData.part_of_speech}
例句：${queryData.examples?.[0] || '无'}
${queryData.root_form && queryData.root_form !== queryData.word_text ? `原形：${queryData.root_form}` : ''}`
  } else {
    return `关于这个${language === 'french' ? '法语' : '英语'}句子的基本信息：
句子：${queryData.sentence_text}
翻译：${queryData.translation}
分析：${queryData.analysis}`
  }
}

export async function POST(req: NextRequest) {
  try {
    const { queryData, language, userPrompt } = await req.json()
    
    if (!queryData || !language || !userPrompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'DeepSeek API key not configured' }, { status: 500 })
    }

    const contextInfo = generateContextInfo(queryData, language)
    const fullPrompt = `${contextInfo}

用户问题：${userPrompt}

请用中文回答，便于中文学习者理解。`

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: fullPrompt }],
        temperature: 0.7,
        max_tokens: 1000
      }),
    })

    if (!response.ok) {
      throw new Error('DeepSeek API error')
    }

    const result = await response.json()
    const aiResponse = result.choices?.[0]?.message?.content || 'AI回复获取失败，请重试。'

    return NextResponse.json({ 
      response: aiResponse,
      success: true 
    })

  } catch (error) {
    console.error('Ask AI error:', error)
    return NextResponse.json({ error: 'AI服务暂时不可用，请稍后重试' }, { status: 500 })
  }
}