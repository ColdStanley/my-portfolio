/**
 * SwiftApply AI Service - Real AI calls based on JD2CV Full architecture
 * Supports streaming DeepSeek and OpenAI API calls
 */

export interface AIResponse {
  content: string
  tokens: {
    prompt: number
    completion: number
    total: number
  }
}

// Primary DeepSeek streaming function for SwiftApply
export async function invokeSwiftApplyStream(
  prompt: string,
  onChunk: (chunk: string) => void,
  temperature: number = 0.1,
  maxTokens: number = 4000,
  model: 'deepseek' | 'openai' = 'deepseek'
): Promise<AIResponse> {
  if (model === 'openai') {
    return await invokeOpenAIStream(prompt, onChunk, temperature, maxTokens)
  }

  return await invokeDeepSeekStream(prompt, onChunk, temperature, maxTokens)
}

// DeepSeek streaming implementation (primary)
async function invokeDeepSeekStream(
  prompt: string,
  onChunk: (chunk: string) => void,
  temperature: number = 0.1,
  maxTokens: number = 4000
): Promise<AIResponse> {
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
      console.warn('DeepSeek streaming failed, trying fallback')
      return await invokeDeepSeekFallback(prompt, temperature, maxTokens)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      console.warn('No stream reader available, trying fallback')
      return await invokeDeepSeekFallback(prompt, temperature, maxTokens)
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

              // Handle streaming content
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
    console.warn('DeepSeek streaming error, trying fallback:', error)
    return await invokeDeepSeekFallback(prompt, temperature, maxTokens)
  }
}

// OpenAI streaming implementation (backup)
async function invokeOpenAIStream(
  prompt: string,
  onChunk: (chunk: string) => void,
  temperature: number = 0.7,
  maxTokens: number = 4000
): Promise<AIResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume strategist. Generate high-quality, tailored resume content that matches job requirements.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        stream: true
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No stream reader available')
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

              if (parsed.usage) {
                tokens = {
                  prompt: parsed.usage.prompt_tokens || 0,
                  completion: parsed.usage.completion_tokens || 0,
                  total: parsed.usage.total_tokens || 0
                }
              }
            } catch (parseError) {
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
    console.error('OpenAI streaming error:', error)
    throw new Error(`OpenAI API failed: ${error.message}`)
  }
}

// DeepSeek non-streaming fallback
async function invokeDeepSeekFallback(
  prompt: string,
  temperature: number,
  maxTokens: number
): Promise<AIResponse> {
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
    console.error('DeepSeek fallback API call failed:', error)
    throw new Error(`All DeepSeek API calls failed: ${error.message}`)
  }
}

// JSON parsing helper for LLM responses - Using JD2CV Full's proven method
export function parseAIJsonResponse(content: string): any {
  const cleaned = content.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '')

  try {
    const data = JSON.parse(cleaned)

    if (!data || typeof data !== 'object') {
      throw new Error('AI returned non-object payload')
    }

    return data
  } catch (error) {
    console.error('SwiftApply failed to parse AI response:', error)
    console.warn('Raw AI response preview:', cleaned.slice(0, 200))
    throw new Error('AI returned invalid JSON response')
  }
}