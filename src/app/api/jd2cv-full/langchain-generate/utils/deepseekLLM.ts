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

// Helper function to invoke LLM with error handling
export async function invokeDeepSeek(
  prompt: string,
  temperature: number = 0.1,
  maxTokens: number = 4000
): Promise<string> {
  try {
    const llm = createDeepSeekLLM(temperature, maxTokens)
    const response = await llm.invoke(prompt)
    return response.content as string
  } catch (error) {
    console.error('DeepSeek LLM error:', error)

    // Fallback to direct fetch if LangChain fails
    console.log('Falling back to direct API call...')
    return await fallbackDeepSeekCall(prompt, temperature, maxTokens)
  }
}

// Fallback implementation using direct fetch
async function fallbackDeepSeekCall(
  prompt: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
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
      return data.choices[0].message.content
    } else {
      throw new Error('Invalid response format from DeepSeek API')
    }
  } catch (error) {
    console.error('Fallback DeepSeek API call failed:', error)
    throw new Error(`All DeepSeek API calls failed: ${error.message}`)
  }
}