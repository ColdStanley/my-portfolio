import { ChatOpenAI } from '@langchain/openai'

// DeepSeek LLM Configuration using LangChain
export function createDeepSeekLLM(temperature: number = 0.1, maxTokens: number = 4000) {
  return new ChatOpenAI({
    model: 'deepseek-chat',
    temperature: temperature,
    maxTokens: maxTokens,
    apiKey: process.env.DEEPSEEK_API_KEY,
    configuration: {
      baseURL: 'https://api.deepseek.com/v1'
    }
  })
}

// Helper function to invoke LLM with error handling and token tracking
export async function invokeDeepSeek(
  prompt: string,
  temperature: number = 0.1,
  maxTokens: number = 4000
): Promise<{ content: string; tokens: { prompt: number; completion: number; total: number } }> {
  try {
    const llm = createDeepSeekLLM(temperature, maxTokens)
    const response = await llm.invoke(prompt)

    // Extract token usage from response if available
    const tokens = {
      prompt: (response as any).response_metadata?.tokenUsage?.promptTokens || 0,
      completion: (response as any).response_metadata?.tokenUsage?.completionTokens || 0,
      total: (response as any).response_metadata?.tokenUsage?.totalTokens || 0
    }

    return {
      content: response.content as string,
      tokens
    }
  } catch (error) {
    console.error('DeepSeek LLM error:', error)

    // Fallback to direct fetch if LangChain fails
    return await fallbackDeepSeekCall(prompt, temperature, maxTokens)
  }
}

// Fallback implementation using direct fetch
async function fallbackDeepSeekCall(
  prompt: string,
  temperature: number,
  maxTokens: number
): Promise<{ content: string; tokens: { prompt: number; completion: number; total: number } }> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature,
        max_tokens: maxTokens
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.choices && data.choices[0] && data.choices[0].message) {
      // Extract token usage from response
      const tokens = {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0
      }

      return {
        content: data.choices[0].message.content,
        tokens
      }
    } else {
      throw new Error('Invalid response format from DeepSeek API')
    }
  } catch (error) {
    console.error('Fallback DeepSeek API call failed:', error)
    throw new Error(`All DeepSeek API calls failed: ${error.message}`)
  }
}

// Streaming DeepSeek LLM function with incremental content delivery
export async function invokeDeepSeekStream(
  prompt: string,
  onChunk: (chunk: string) => void,
  temperature: number = 0.1,
  maxTokens: number = 4000
): Promise<{ content: string; tokens: { prompt: number; completion: number; total: number } }> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature,
        max_tokens: maxTokens,
        stream: true // Enable streaming
      })
    })

    if (!response.ok) {
      console.warn('DeepSeek streaming failed, falling back to non-streaming')
      return await invokeDeepSeek(prompt, temperature, maxTokens)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      console.warn('No stream reader available, falling back to non-streaming')
      return await invokeDeepSeek(prompt, temperature, maxTokens)
    }

    const decoder = new TextDecoder()
    let fullContent = ''
    let tokens = { prompt: 0, completion: 0, total: 0 }

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()

            if (data === '[DONE]') {
              break
            }

            try {
              const parsed = JSON.parse(data)

              if (parsed.choices?.[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content
                fullContent += content
                onChunk(content)
              }

              // Extract token usage from final chunk
              if (parsed.usage) {
                tokens = {
                  prompt: parsed.usage.prompt_tokens || 0,
                  completion: parsed.usage.completion_tokens || 0,
                  total: parsed.usage.total_tokens || 0
                }
              }
            } catch (parseError) {
              // Ignore individual parsing errors, continue streaming
              continue
            }
          }
        }
      }

      return {
        content: fullContent,
        tokens
      }
    } finally {
      reader.releaseLock()
    }

  } catch (error) {
    console.warn('DeepSeek streaming error, falling back to non-streaming:', error)
    // Graceful fallback to existing non-streaming function
    return await invokeDeepSeek(prompt, temperature, maxTokens)
  }
}