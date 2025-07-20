import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, company, full_job_description, prompt } = await request.json()

    if (!title || !company || !full_job_description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company, full_job_description' },
        { status: 400 }
      )
    }

    const systemMessage = `You are an expert career consultant. ${prompt || ''}

Based on the following job description, identify exactly 5 key **required capabilities** that are:

- Specific and measurable, not vague or generic
- Closely aligned with the responsibilities and qualifications listed
- Described using precise terminology from the job description
- Focused on actionable competencies (e.g., technical tools, decision-making, strategic thinking)
- Avoid overlapping capabilities or generic business terms

Job Details:
- Title: ${title}
- Company: ${company}
- Job Description: ${full_job_description}

Return the 5 key capabilities in a numbered list format, each with:
- A short capability name (max 8 words)
- A 1–2 sentence explanation of what this capability entails in the context of this role`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
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
    
    const capabilities = sections.slice(0, 5).map(section => {
      // Remove the number prefix and clean up
      return section.replace(/^\d+\.\s*/, '').trim()
    })

    // Ensure we have exactly 5 capabilities
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