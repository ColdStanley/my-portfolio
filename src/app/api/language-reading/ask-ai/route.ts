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

    // Call DeepSeek API with stream support
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
        max_tokens: 1000,
        stream: true
      }),
    })

    if (!response.ok) {
      throw new Error('DeepSeek API error')
    }

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader()
          if (!reader) {
            controller.close()
            return
          }

          let buffer = ''
          
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              // Send final message to indicate completion
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
              break
            }

            buffer += new TextDecoder().decode(value)
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  
                  if (content) {
                    // Send the content chunk
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                  continue
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream processing failed' })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Ask AI error:', error)
    return NextResponse.json({ error: 'AI服务暂时不可用，请稍后重试' }, { status: 500 })
  }
}