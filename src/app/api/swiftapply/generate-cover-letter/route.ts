import { NextRequest, NextResponse } from 'next/server'
import { invokeSwiftApplyStream } from '@/lib/swiftapply/aiService'

const hasOpenAI = Boolean(process.env.OPENAI_API_KEY)
const hasDeepseek = Boolean(process.env.DEEPSEEK_API_KEY)

type Provider = 'openai' | 'deepseek'

const MODEL_BY_PROVIDER: Record<Provider, string> = {
  openai: 'gpt-4',
  deepseek: 'deepseek-chat'
}

function resolveProvider(preferred: Provider): Provider | null {
  const searchOrder: Provider[] = preferred === 'openai'
    ? ['openai', 'deepseek']
    : ['deepseek', 'openai']

  for (const provider of searchOrder) {
    if ((provider === 'openai' && hasOpenAI) || (provider === 'deepseek' && hasDeepseek)) {
      return provider
    }
  }

  return null
}

interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin?: string
  website?: string
  summary?: string[]
  technicalSkills?: string[]
  languages?: string[]
  education?: Array<{
    degree: string
    institution: string
    year: string
    gpa?: string
  }>
  certificates?: string[]
}

interface GenerateCoverLetterRequest {
  personalInfo: PersonalInfo
  jobTitle: string
  jobDescription: string
  tailoredExperience: string
  aiModel?: 'openai' | 'deepseek'
}

const DEFAULT_PROMPT = `### Requirements
1. Structure the cover letter in **3–4 short paragraphs**:
   - **Opening**: Express interest in the position and introduce yourself.
   - **Body (1–2 paragraphs)**: Match applicant's skills and experiences with the job's key requirements. Use measurable achievements where possible.
   - **Closing**: Reaffirm enthusiasm, mention availability for interview, polite sign-off.
2. Keep tone **professional, confident, and concise** (approx. 250–350 words).
3. Do **not** repeat the resume word-for-word; instead, highlight the most relevant skills/achievements.
4. Directly address the company (if mentioned in job description).
5. Output only the **main body content** - do not include salutation (Dear...) or closing signature (Sincerely...).

### Output Format
Main body paragraphs only (no "Dear..." salutation, no "Sincerely..." closing).

### Job Information
Position: {job_title}
Job Description: {job_description}

### Personal Information
{personal_info}

### Tailored Experience (Resume Content)
{tailored_experience}

Based on the above information, generate a professional cover letter for this position.`

// Data injection function
function injectDataIntoPrompt(
  personalInfo: PersonalInfo,
  jobTitle: string,
  jobDescription: string,
  tailoredExperience: string
): string {
  const personalInfoText = [
    `Name: ${personalInfo.fullName}`,
    `Email: ${personalInfo.email}`,
    personalInfo.phone ? `Phone: ${personalInfo.phone}` : '',
    personalInfo.location ? `Location: ${personalInfo.location}` : '',
    personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : '',
    personalInfo.website ? `Website: ${personalInfo.website}` : ''
  ].filter(Boolean).join('\n')

  return DEFAULT_PROMPT
    .replace('{job_title}', jobTitle)
    .replace('{job_description}', jobDescription)
    .replace('{personal_info}', personalInfoText)
    .replace('{tailored_experience}', tailoredExperience)
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCoverLetterRequest = await request.json()
    const {
      personalInfo,
      jobTitle,
      jobDescription,
      tailoredExperience,
      aiModel = 'deepseek'
    } = body

    // Basic validation
    if (!personalInfo?.fullName || !personalInfo?.email) {
      return NextResponse.json(
        { success: false, error: 'Personal information (name and email) is required' },
        { status: 400 }
      )
    }

    if (!jobTitle?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Job title is required' },
        { status: 400 }
      )
    }

    if (!jobDescription?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Job description is required' },
        { status: 400 }
      )
    }

    if (!tailoredExperience?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tailored experience content is required' },
        { status: 400 }
      )
    }

    // Inject data into prompt
    const processedPrompt = injectDataIntoPrompt(
      personalInfo,
      jobTitle,
      jobDescription,
      tailoredExperience
    )

    const resolvedProvider = resolveProvider(aiModel === 'openai' ? 'openai' : 'deepseek')

    if (!resolvedProvider) {
      return NextResponse.json({
        success: false,
        error: 'AI configuration missing. Set DEEPSEEK_API_KEY or OPENAI_API_KEY to enable cover letter generation.'
      }, { status: 500 })
    }

    const provider = resolvedProvider
    const modelName = MODEL_BY_PROVIDER[provider]
    const temperature = provider === 'openai' ? 0.7 : 0.2

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        const send = (payload: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
        }

        try {
          let streamedContent = ''

          const response = await invokeSwiftApplyStream(
            processedPrompt,
            (chunk) => {
              if (!chunk) return
              streamedContent += chunk
              send({
                type: 'content_chunk',
                chunk,
                fullContent: streamedContent
              })
            },
            temperature,
            1200,
            provider
          )

          const finalContent = (response.content || streamedContent || '').trim()

          if (!streamedContent && finalContent) {
            send({
              type: 'content_chunk',
              chunk: finalContent,
              fullContent: finalContent
            })
          }

          if (!finalContent) {
            throw new Error('No content generated from AI model')
          }

          send({
            type: 'complete',
            coverLetter: finalContent,
            provider,
            model: modelName,
            tokens: response.tokens
          })

        } catch (error) {
          console.error('Cover Letter generation error:', error)
          send({
            type: 'error',
            error: (error as Error).message || 'Failed to generate cover letter'
          })
        } finally {
          send({ type: 'done' })
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    })

  } catch (error: any) {
    console.error('Cover Letter generation error:', error)
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to generate cover letter'
    }, { status: 500 })
  }
}
