import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// DeepSeek client (默认 AI 引擎)
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { selected_text, prompt_template } = body

    if (!selected_text || !prompt_template) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 替换 prompt 模板中的占位符
    const finalPrompt = prompt_template.replace(/\{text\}/g, selected_text)

    // 调用 DeepSeek API（流式）
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful language learning assistant. Be clear, accurate, and educational.',
        },
        {
          role: 'user',
          content: finalPrompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
      stream: true,
    })

    // 创建流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let isControllerClosed = false

        const safeEnqueue = (data: Uint8Array) => {
          try {
            if (!isControllerClosed) {
              controller.enqueue(data)
            }
          } catch (error) {
            isControllerClosed = true
          }
        }

        const safeClose = () => {
          try {
            if (!isControllerClosed) {
              controller.close()
              isControllerClosed = true
            }
          } catch {
            isControllerClosed = true
          }
        }

        try {
          let fullResponse = ''

          for await (const chunk of completion) {
            if (isControllerClosed) break

            const content = chunk.choices[0]?.delta?.content || ''

            if (content && !isControllerClosed) {
              fullResponse += content

              const data = {
                type: 'chunk',
                content: content,
              }

              safeEnqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
            }
          }

          if (!isControllerClosed) {
            const completionData = {
              type: 'complete',
              full_response: fullResponse.trim(),
            }

            safeEnqueue(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`))
          }

          safeClose()
        } catch (error) {
          console.error('Streaming error:', error)

          if (!isControllerClosed) {
            const errorData = {
              type: 'error',
              error: 'Failed to process AI query',
            }
            safeEnqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`))
          }

          safeClose()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error calling DeepSeek:', error)
    return NextResponse.json(
      { error: 'Failed to process AI query' },
      { status: 500 }
    )
  }
}
