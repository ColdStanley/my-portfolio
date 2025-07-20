import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { capability, experienceInput, prompt } = await request.json()

    if (!capability || !experienceInput) {
      return NextResponse.json(
        { error: 'Missing required fields: capability, experienceInput' },
        { status: 400 }
      )
    }

    const systemMessage = `You are an expert career consultant. ${prompt || ''}

Based on the following capability requirement and the candidate's original experience/project, craft an enhanced and customized version that:

- Directly addresses the specific capability requirement
- Incorporates key phrases and technical terms from the capability description
- Expands or rewrites the original experience to better align with the capability
- Maintains truthfulness and consistency with the original input
- Uses concise, professional, and compelling language suitable for resumes or LinkedIn
- Avoids generic phrasing or vague accomplishments
- Presents the final result as structured **bullet points**, suitable for resume use

You may choose from the following frameworks to best express the enhanced experience:
- **CAR** (Challenge – Action – Result) — concise and outcome-driven
- **PAR** (Problem – Action – Result) — suitable for business/tech roles
- **SOAR** (Situation – Opportunity – Action – Result) — emphasizes influence
- **Why–What–How–Impact** — ideal for explaining the rationale and impact of a project

Select the most appropriate framework based on the content, and clearly reflect its logic in the output.

---

Capability Requirement:
${capability}

Original Experience/Project:
${experienceInput}

Please return the enhanced experience as 1–3 bullet points, clearly reflecting one of the above frameworks.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    })

    const customizedExperience = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ 
      success: true, 
      customizedExperience: customizedExperience.trim()
    })
  } catch (error: any) {
    console.error('Error generating customized experience:', error)
    return NextResponse.json(
      { error: 'Failed to generate customized experience', details: error?.message },
      { status: 500 }
    )
  }
}