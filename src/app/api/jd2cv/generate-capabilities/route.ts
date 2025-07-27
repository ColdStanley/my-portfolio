import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createOpenAIClient } from '@/utils/modelConfig'

export async function POST(request: NextRequest) {
  try {
    const { title, company, full_job_description, keySentences, categoryCount = 5, model = 'deepseek' } = await request.json()

    if (!title || !company || !full_job_description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company, full_job_description' },
        { status: 400 }
      )
    }

    if (!keySentences || !Array.isArray(keySentences) || keySentences.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty keySentences array' },
        { status: 400 }
      )
    }

    // Define model-specific prompts
    const keySentencesText = keySentences.map((sentence, index) => `${index + 1}. ${sentence}`).join('\n')
    
    const gptPrompt = `You are an expert career consultant.

Based on the following key sentences extracted from a job description, categorize them into exactly ${categoryCount} distinct capability categories.

Job Details:
- Title: ${title}
- Company: ${company}

Key Sentences from Job Description:
${keySentencesText}

Your task:
1. Analyze these key sentences and group them into ${categoryCount} logical capability categories
2. Create a clear category title for each group (max 8 words)
3. List the relevant sentences under each category

Return the ${categoryCount} capability categories in this format:

1. Category Title (max 8 words)
   • [Copy the full text of the first sentence that belongs to this category]
   • [Copy the full text of the second sentence that belongs to this category]
   • [Copy the full text of additional sentences that belong to this category]

2. Category Title (max 8 words)
   • [Copy the full text of sentences that belong to this category]
   • [Continue for all sentences in this category]

(Continue this format for all ${categoryCount} categories)

Important: Each sentence should be assigned to exactly one category. Copy the complete original sentence text, not sentence numbers. Ensure all sentences are categorized.`

    const deepseekPrompt = `You are an expert career consultant.

Based on the following key sentences extracted from a job description, categorize them into exactly ${categoryCount} distinct capability categories.

Job Details:
- Title: ${title}
- Company: ${company}

Key Sentences from Job Description:
${keySentencesText}

Your task:
1. Analyze these key sentences and group them into ${categoryCount} logical capability categories
2. Create a clear category title for each group (max 8 words)
3. List the relevant sentences under each category

Return the ${categoryCount} capability categories in this format:

1. Category Title (max 8 words)
   • [Copy the full text of the first sentence that belongs to this category]
   • [Copy the full text of the second sentence that belongs to this category]
   • [Copy the full text of additional sentences that belong to this category]

2. Category Title (max 8 words)
   • [Copy the full text of sentences that belong to this category]
   • [Continue for all sentences in this category]

(Continue this format for all ${categoryCount} categories)

Important: Each sentence should be assigned to exactly one category. Copy the complete original sentence text, not sentence numbers. Ensure all sentences are categorized. Do not use asterisks (*) or any markdown formatting in category names.`

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
      max_tokens: 1000,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || ''
    
    // Split by numbered list items (1., 2., 3., etc.)
    const sections = response.split(/\n(?=\d+\.\s)/).filter(section => section.trim().length > 0)
    
    const capabilities = sections.slice(0, categoryCount).map(section => {
      // Remove the number prefix and clean up
      return section.replace(/^\d+\.\s*/, '').trim()
    })

    // Ensure we have exactly the requested number of capabilities
    while (capabilities.length < categoryCount) {
      capabilities.push('')
    }

    // Fill remaining slots (up to 5) with empty strings for UI consistency
    while (capabilities.length < 5) {
      capabilities.push('')
    }

    return NextResponse.json({ 
      success: true, 
      capabilities: capabilities.slice(0, 5) 
    })
  } catch (error) {
    console.error('Error generating capabilities:', error)
    return NextResponse.json(
      { error: 'Failed to generate capabilities' },
      { status: 500 }
    )
  }
}