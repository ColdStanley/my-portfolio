import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
})

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

interface JDInfo {
  title: string
  company: string
  description: string
}

interface GenerateCoverLetterRequest {
  personalInfo: PersonalInfo
  jdInfo: JDInfo
  tailoredExperience: string
  userPrompt: string
  aiModel: 'openai' | 'deepseek'
}

const DEFAULT_PROMPT = `### Requirements
1. Structure the cover letter in **3–4 short paragraphs**:
   - **Opening**: Express interest in the position and introduce yourself.
   - **Body (1–2 paragraphs)**: Match applicant's skills and experiences with the job's key requirements. Use measurable achievements where possible.
   - **Closing**: Reaffirm enthusiasm, mention availability for interview, polite sign-off.
2. Keep tone **professional, confident, and concise** (approx. 250–350 words).
3. Do **not** repeat the resume word-for-word; instead, highlight the most relevant skills/achievements.
4. Directly address the company (use the company name).
5. Output only the **main body content** - do not include salutation (Dear...) or closing signature (Sincerely...).

### Output Format
Main body paragraphs only (no "Dear..." salutation, no "Sincerely..." closing).

### Job Information
{jd_info}

### Personal Information
{personal_info}

### Tailored Experience (Resume Content)
{tailored_experience}

Based on the above information, generate a professional cover letter for this position.`

// Data injection function with fixed placeholders
function injectDataIntoPrompt(
  userPrompt: string, 
  personalInfo: PersonalInfo, 
  jdInfo: JDInfo, 
  tailoredExperience: string
): string {
  const jdInfoText = `Position: ${jdInfo.title}\nCompany: ${jdInfo.company}\nJob Description: ${jdInfo.description}`
  
  const personalInfoText = [
    `Name: ${personalInfo.fullName}`,
    `Email: ${personalInfo.email}`,
    personalInfo.phone ? `Phone: ${personalInfo.phone}` : '',
    personalInfo.location ? `Location: ${personalInfo.location}` : '',
    personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : '',
    personalInfo.website ? `Website: ${personalInfo.website}` : ''
  ].filter(Boolean).join('\n')

  return userPrompt
    .replace('{jd_info}', jdInfoText)
    .replace('{personal_info}', personalInfoText)
    .replace('{tailored_experience}', tailoredExperience)
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCoverLetterRequest = await request.json()
    const { personalInfo, jdInfo, tailoredExperience, userPrompt, aiModel = 'deepseek' } = body

    // Basic validation
    if (!personalInfo?.fullName || !personalInfo?.email) {
      return NextResponse.json(
        { success: false, error: 'Personal information (name and email) is required' },
        { status: 400 }
      )
    }

    if (!jdInfo?.title || !jdInfo?.company || !jdInfo?.description) {
      return NextResponse.json(
        { success: false, error: 'Job information (title, company, description) is required' },
        { status: 400 }
      )
    }

    if (!tailoredExperience) {
      return NextResponse.json(
        { success: false, error: 'Tailored experience content is required' },
        { status: 400 }
      )
    }

    // Use default prompt if user prompt is empty
    const finalPrompt = userPrompt.trim() || DEFAULT_PROMPT

    // Inject data into prompt using fixed placeholders
    const processedPrompt = injectDataIntoPrompt(
      finalPrompt,
      personalInfo,
      jdInfo,
      tailoredExperience
    )

    // Select AI model
    const aiClient = aiModel === 'openai' ? openai : deepseek
    const modelName = aiModel === 'openai' ? 'gpt-4' : 'deepseek-chat'

    // Generate cover letter
    const completion = await aiClient.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume and cover letter writer. Generate high-quality, personalized cover letters that effectively match candidates with job requirements.'
        },
        {
          role: 'user',
          content: processedPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })

    const coverLetter = completion.choices[0]?.message?.content

    if (!coverLetter) {
      throw new Error('No content generated from AI model')
    }

    return NextResponse.json({
      success: true,
      coverLetter: coverLetter.trim(),
      usage: {
        tokens: completion.usage?.total_tokens || 0,
        model: modelName
      }
    })

  } catch (error: any) {
    console.error('Cover Letter generation error:', error)
    
    // Handle specific API errors
    if (error.code === 'insufficient_quota') {
      return NextResponse.json({
        success: false,
        error: 'API quota exceeded. Please try again later or contact support.'
      }, { status: 429 })
    }

    if (error.code === 'model_not_found') {
      return NextResponse.json({
        success: false,
        error: 'AI model temporarily unavailable. Please try with a different model.'
      }, { status: 503 })
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate cover letter'
    }, { status: 500 })
  }
}