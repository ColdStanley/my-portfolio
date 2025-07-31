import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { getModelConfig } from '@/utils/modelConfig'

export async function POST(request: NextRequest) {
  try {
    const { full_job_description, title, model = 'deepseek', customPrompt } = await request.json()
    
    if (!full_job_description) {
      return NextResponse.json(
        { success: false, error: 'Job description is required' },
        { status: 400 }
      )
    }

    // Use custom prompt if provided, otherwise use default
    const defaultPrompt = `Analyze the following job description and extract the 10 most important sentences that define the core responsibilities, requirements, and expectations for this role.

Focus on:
- Key technical skills and qualifications
- Primary job responsibilities
- Important experience requirements
- Critical performance expectations
- Essential competencies

Job Title: {title}

Job Description:
{full_job_description}

Please provide exactly 10 sentences from the original job description text, ranked by importance (1 being most important). Format as a simple numbered list using plain text only:

1. [First sentence]
2. [Second sentence]
3. [Third sentence]
...

Do not use JSON, markdown formatting, or any special characters. Use only plain text with simple numbering.`

    const promptTemplate = customPrompt || defaultPrompt
    
    // Replace template variables
    const prompt = promptTemplate
      .replace(/{title}/g, title || 'Not specified')
      .replace(/{full_job_description}/g, full_job_description)

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
          content: 'You are an expert at analyzing job descriptions and identifying the most critical requirements. Extract exactly 10 key sentences from the provided job description, maintaining the original wording.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    })

    const keySentences = completion.choices[0]?.message?.content || ''

    return NextResponse.json({
      success: true,
      keySentences: keySentences
    })
  } catch (error) {
    console.error('Error generating key sentences:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate key sentences' },
      { status: 500 }
    )
  }
}