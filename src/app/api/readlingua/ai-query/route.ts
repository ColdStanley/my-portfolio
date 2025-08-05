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

// Query type prompts
const QUERY_PROMPTS = {
  quick: (text: string, nativeLang: string, sourceLang: string) => 
    `Provide a quick, concise explanation of "${text}" in ${nativeLang}. Focus on basic meaning and pronunciation if relevant. Keep it under 100 words.`,
  
  standard: (text: string, nativeLang: string, sourceLang: string) => 
    `Provide a comprehensive explanation of "${text}" in ${nativeLang}. Include:
    1. Meaning and translation
    2. Grammar structure (if applicable)
    3. Usage examples
    4. Common contexts
    Keep it informative but accessible.`,
    
  deep: (text: string, nativeLang: string, sourceLang: string) => 
    `Provide an in-depth analysis of "${text}" in ${nativeLang}. Include:
    1. Detailed meaning and nuances
    2. Etymology or origin
    3. Grammar and syntax analysis
    4. Cultural context and usage
    5. Similar expressions or alternatives
    6. Advanced usage examples
    Be thorough and educational.`,
    
  ask_ai: (text: string, question: string, nativeLang: string, sourceLang: string) => 
    `Context: "${text}" (${sourceLang} text)
    User question: ${question}
    Please answer the user's question about this text in ${nativeLang}. Be helpful and detailed.`
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'French',
  ja: 'Japanese',
  es: 'Spanish',
  de: 'German',
  zh: 'Chinese',
}

// Model configurations
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
    console.log('🤖 AI Query API called')
    const body = await request.json()
    console.log('📝 Request body:', body)
    
    const { 
      selected_text, 
      query_type, 
      user_question, 
      source_language, 
      native_language,
      ai_model = 'deepseek', // Default to DeepSeek
      custom_prompt_template // Custom prompt from frontend
    } = body

    // Check API keys
    console.log('🗝️ API Keys check:', {
      openai: !!process.env.OPENAI_API_KEY,
      deepseek: !!process.env.DEEPSEEK_API_KEY,
      selectedModel: ai_model
    })

    if (!selected_text && query_type !== 'ask_ai') {
      return NextResponse.json({ error: 'Selected text required' }, { status: 400 })
    }

    if (!query_type || !source_language || !native_language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (query_type === 'ask_ai' && !user_question) {
      return NextResponse.json({ error: 'User question required for Ask AI' }, { status: 400 })
    }

    // Get model configuration
    const modelConfig = MODEL_CONFIGS[ai_model as keyof typeof MODEL_CONFIGS] || MODEL_CONFIGS.deepseek

    // Get language names
    const sourceLangName = LANGUAGE_NAMES[source_language] || source_language
    const nativeLangName = LANGUAGE_NAMES[native_language] || native_language

    // Generate prompt based on query type - use custom template if provided
    let prompt: string
    if (custom_prompt_template) {
      // Replace placeholders in custom template
      prompt = custom_prompt_template
        .replace(/\{text\}/g, selected_text || '')
        .replace(/\{nativeLang\}/g, nativeLangName)
        .replace(/\{sourceLang\}/g, sourceLangName)
        .replace(/\{question\}/g, user_question || '')
    } else {
      // Use default prompts
      if (query_type === 'ask_ai') {
        prompt = QUERY_PROMPTS.ask_ai(selected_text || '', user_question, nativeLangName, sourceLangName)
      } else {
        prompt = QUERY_PROMPTS[query_type as keyof typeof QUERY_PROMPTS](selected_text, nativeLangName, sourceLangName)
      }
    }

    console.log('🔍 Calling AI with model:', modelConfig.name)
    console.log('📋 Final prompt:', prompt)

    // Call AI API (DeepSeek or OpenAI)
    const completion = await modelConfig.client.chat.completions.create({
      model: modelConfig.model,
      messages: [
        {
          role: "system",
          content: `You are a helpful language learning assistant. Always respond in ${nativeLangName} unless specifically asked otherwise. Be clear, accurate, and educational.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: query_type === 'quick' ? 200 : query_type === 'deep' ? 800 : 500,
      temperature: 0.7,
    })

    console.log('✅ AI response received')

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    return NextResponse.json({ 
      ai_response: aiResponse.trim(),
      query_type,
      selected_text,
      user_question: query_type === 'ask_ai' ? user_question : undefined,
      ai_model: ai_model,
      model_name: modelConfig.name
    })

  } catch (error) {
    console.error(`Error calling ${error.name || 'AI'}:`, error)
    return NextResponse.json({ error: 'Failed to process AI query' }, { status: 500 })
  }
}