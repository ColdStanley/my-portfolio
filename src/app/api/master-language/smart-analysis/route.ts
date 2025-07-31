import { NextRequest, NextResponse } from 'next/server'
import { generateDynamicPrompt, getResponseFormat, type DynamicPromptConfig } from '@/utils/modelConfig'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

type AnalysisMode = 'simple' | 'deep' | 'grammar' | 'ask-ai'

export async function POST(req: NextRequest) {
  try {
    const { mode, selectedText, contextSentence, language, nativeLanguage, articleId, userPrompt } = await req.json()

    if (!mode || !selectedText || !language || !nativeLanguage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['simple', 'deep', 'grammar', 'ask-ai'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid analysis mode' }, { status: 400 })
    }

    // Handle ask-ai mode differently
    let fullPrompt: string
    
    if (mode === 'ask-ai') {
      // For ask-ai mode, use user's custom prompt
      if (!userPrompt) {
        return NextResponse.json({ error: 'userPrompt is required for ask-ai mode' }, { status: 400 })
      }
      
      // Create context info
      const contextInfo = `关于选中内容的基本信息：
文本：${selectedText}
${contextSentence && contextSentence !== selectedText ? `句子：${contextSentence}` : ''}

用户问题：${userPrompt}

请用中文回答，便于中文学习者理解。`
      
      fullPrompt = contextInfo
    } else {
      // Use dynamic prompt generation for standard modes
      const promptConfig: DynamicPromptConfig = {
        learningLanguage: language,   // Language being learned (for content analysis)
        nativeLanguage: nativeLanguage,  // Native language (for prompt template)
        analysisMode: mode as 'simple' | 'deep' | 'grammar',
        contentType: 'word' // Default to word analysis for smart tooltip
      }

      const dynamicPrompt = generateDynamicPrompt(
        selectedText, 
        contextSentence || selectedText, 
        promptConfig
      )
      
      const responseFormat = getResponseFormat(nativeLanguage)
      fullPrompt = `${dynamicPrompt}\n\n${responseFormat}`
    }

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
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
              stream: true
            }),
          })

          if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status}`)
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No response body')
          }

          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                
                if (data === '[DONE]') {
                  controller.enqueue(`data: [DONE]\n\n`)
                  break
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ''
                  
                  if (content) {
                    controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`)
                  }
                } catch (e) {
                  continue
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(`data: ${JSON.stringify({ 
            content: '分析失败，请重试。',
            error: true 
          })}\n\n`)
          controller.enqueue(`data: [DONE]\n\n`)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}