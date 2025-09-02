import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// DeepSeek client (compatible with OpenAI API)
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
})

// Model configurations for AI Card Studio
const MODEL_CONFIGS = {
  deepseek: {
    client: deepseek,
    model: 'deepseek-chat',
    name: 'DeepSeek'
  },
  openai: {
    client: openai,
    model: 'gpt-4o-mini',
    name: 'OpenAI GPT-4'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      prompt,
      model = 'deepseek', // Default to DeepSeek for cost efficiency
      stream = true
    } = body

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Get model configuration
    const modelConfig = MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS] || MODEL_CONFIGS.deepseek

    // Call AI API with streaming
    const completion = await modelConfig.client.chat.completions.create({
      model: modelConfig.model,
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant specialized for AI Card Studio. Provide clear, accurate, and useful responses for card-based workflows. Follow the user's instructions precisely and format responses appropriately for card content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      stream: stream,
    })

    if (!stream) {
      // Non-streaming response
      return NextResponse.json({
        content: completion.choices[0]?.message?.content || '',
        model: modelConfig.name
      })
    }

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder()
    const streamResponse = new ReadableStream({
      async start(controller) {
        let isControllerClosed = false
        
        const safeEnqueue = (data: Uint8Array) => {
          try {
            if (!isControllerClosed) {
              controller.enqueue(data)
            }
          } catch (error) {
            console.error('Controller enqueue error:', error)
            isControllerClosed = true
          }
        }
        
        const safeClose = () => {
          try {
            if (!isControllerClosed) {
              controller.close()
              isControllerClosed = true
            }
          } catch (error) {
            console.error('Controller close error:', error)
            isControllerClosed = true
          }
        }
        
        try {
          for await (const chunk of completion) {
            if (isControllerClosed) break
            
            const content = chunk.choices[0]?.delta?.content || ''
            
            if (content && !isControllerClosed) {
              // Send chunk to client in OpenAI format
              const data = {
                choices: [{
                  delta: {
                    content: content
                  }
                }]
              }
              
              safeEnqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
            }
          }
          
          // Send completion signal
          if (!isControllerClosed) {
            safeEnqueue(encoder.encode(`data: [DONE]\n\n`))
          }
          
          safeClose()
          
        } catch (error) {
          console.error('AI Card Studio Generation error:', error)
          
          if (!isControllerClosed) {
            const errorData = {
              error: {
                message: 'Failed to generate content for AI Card Studio',
                type: 'api_error'
              }
            }
            safeEnqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`))
          }
          
          safeClose()
        }
      }
    })

    return new Response(streamResponse, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('AI Card Studio API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process AI Card Studio generation request' 
    }, { status: 500 })
  }
}