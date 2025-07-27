import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createOpenAIClient } from '@/utils/modelConfig'

export async function POST(request: NextRequest) {
  try {
    const { full_job_description, model = 'deepseek', sentenceCount = 5 } = await request.json()

    if (!full_job_description) {
      return NextResponse.json(
        { error: 'Missing required field: full_job_description' },
        { status: 400 }
      )
    }

    // Define model-specific prompts
    const gptPrompt = `You are an expert job description analyst. 

Based on the following job description, extract exactly ${sentenceCount} key sentences that best represent the core requirements of this position for candidate screening.

Selection criteria:
- Choose sentences that, if only these ${sentenceCount} existed, would allow candidates to understand the essential job requirements
- Prioritize sentences with technical requirements when available
- Keep original text exactly as written - do not modify or rewrite
- Choose sentences that are most valuable for candidate decision-making
- Do not select vague or overly general sentences

Job Description:
${full_job_description}

Return only a JSON array of ${sentenceCount} strings, each containing one complete sentence from the original text. Ensure sentences are copied exactly as they appear in the job description.`

    const deepseekPrompt = `You are an expert job description analyst. 

Based on the following job description, extract exactly ${sentenceCount} key sentences that best represent the core requirements of this position for candidate screening.

Selection criteria:
- Choose sentences that, if only these ${sentenceCount} existed, would allow candidates to understand the essential job requirements
- Prioritize sentences with technical requirements when available
- Keep original text exactly as written - do not modify or rewrite
- Choose sentences that are most valuable for candidate decision-making
- Do not select vague or overly general sentences

Job Description:
${full_job_description}

Return only a JSON array of ${sentenceCount} strings, each containing one complete sentence from the original text. Ensure sentences are copied exactly as they appear in the job description. STRICTLY FORBIDDEN: Do not include "\`\`\`json", "\`\`\`", "json", or any code block markers in your response. Your response must start directly with [ and end with ].`

    // Select prompt based on model
    const systemMessage = model === 'deepseek' ? deepseekPrompt : gptPrompt

    // Create OpenAI client based on selected model
    const { config, modelName } = createOpenAIClient(model as 'gpt-4' | 'deepseek')
    const openai = new OpenAI(config)

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
      ],
      max_tokens: 800,
      temperature: 0.3, // Lower temperature for more consistent results
    })

    const response = completion.choices[0]?.message?.content || ''
    
    try {
      // Parse the JSON response
      const keySentences = JSON.parse(response)
      
      // Validate that it's an array
      if (!Array.isArray(keySentences)) {
        throw new Error('Response is not an array')
      }
      
      // Clean and validate sentences
      const cleanSentences = keySentences
        .filter(sentence => typeof sentence === 'string' && sentence.trim().length > 0)
        .map(sentence => sentence.trim())
        .slice(0, sentenceCount) // Limit to requested number of sentences
      
      // Ensure we have exactly the requested number of sentences
      while (cleanSentences.length < sentenceCount) {
        cleanSentences.push('')
      }
      
      return NextResponse.json({ 
        success: true, 
        keySentences: cleanSentences.slice(0, sentenceCount)
      })
      
    } catch (parseError) {
      console.error('Failed to parse LLM response:', response)
      
      // Fallback: try to extract sentences from non-JSON response
      const fallbackSentences = response
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 20) // Filter out very short fragments
        .slice(0, sentenceCount)
      
      if (fallbackSentences.length > 0) {
        // Ensure we have exactly the requested number of sentences
        while (fallbackSentences.length < sentenceCount) {
          fallbackSentences.push('')
        }
        
        return NextResponse.json({ 
          success: true, 
          keySentences: fallbackSentences.slice(0, sentenceCount)
        })
      }
      
      return NextResponse.json({
        error: 'Failed to extract key sentences from job description',
        details: 'LLM response could not be parsed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error extracting key sentences:', error)
    return NextResponse.json(
      { error: 'Failed to extract key sentences' },
      { status: 500 }
    )
  }
}