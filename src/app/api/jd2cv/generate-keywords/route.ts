import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { getModelConfig } from '@/utils/modelConfig'

export async function POST(request: NextRequest) {
  try {
    const { key_sentences, title, model = 'deepseek', customPrompt } = await request.json()
    
    if (!key_sentences) {
      return NextResponse.json(
        { success: false, error: 'Key sentences are required' },
        { status: 400 }
      )
    }

    // Use custom prompt if provided, otherwise use default
    const defaultPrompt = `Based on the following 10 key sentences extracted from a job description and the job title, identify the most important 3 groups of keywords (3 keywords per group) that represent the core competencies and requirements for this role.

Job Title: {title}

Key Sentences:
{key_sentences}

Please provide exactly 3 groups of keywords, with each group containing exactly 3 related keywords. Format as plain text only:

Group 1: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Group 2: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Group 3: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Focus on the most critical skills, technologies, and competencies mentioned in the key sentences. Use only plain text formatting without markdown symbols, asterisks, or dashes.`

    const promptTemplate = customPrompt || defaultPrompt
    
    // Replace template variables
    const prompt = promptTemplate
      .replace(/{title}/g, title || 'Not specified')
      .replace(/{key_sentences}/g, key_sentences)

    const config = getModelConfig(model)
    const openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    })
    
    const completion = await openai.chat.completions.create({
      model: config.modelName,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing job requirements and extracting the most relevant keywords and competencies. Create 3 thematic groups of 3 keywords each that capture the essence of the role.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    })

    const keywords = completion.choices[0]?.message?.content || ''

    return NextResponse.json({
      success: true,
      keywords: keywords
    })
  } catch (error) {
    console.error('Error generating keywords:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate keywords' },
      { status: 500 }
    )
  }
}