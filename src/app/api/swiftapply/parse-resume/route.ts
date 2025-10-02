import { NextRequest, NextResponse } from 'next/server'
import { PROMPT_PARSE_PERSONAL_INFO } from '@/lib/swiftapply/prompts'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

export async function POST(req: NextRequest) {
  try {
    // 接收纯文本简历（而非文件）
    const { resumeText } = await req.json()

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'No resume text provided' }, { status: 400 })
    }

    console.log('[Parse Resume] 1. Received resume text, length:', resumeText.length)

    if (resumeText.length < 50) {
      return NextResponse.json({ error: 'Resume text too short' }, { status: 400 })
    }

    if (resumeText.length > 20000) {
      return NextResponse.json({ error: 'Resume text too long (max 20000 characters)' }, { status: 400 })
    }

    // DeepSeek - Parse text to PersonalInfo JSON
    console.log('[Parse Resume] 2. Starting DeepSeek JSON parsing...')

    const deepseekPrompt = PROMPT_PARSE_PERSONAL_INFO.replace('{resumeText}', resumeText)

    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: deepseekPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    })

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text()
      console.error('[Parse Resume] DeepSeek API error:', errorText)
      return NextResponse.json({ error: 'Failed to parse resume with AI' }, { status: 500 })
    }

    const deepseekJson = await deepseekResponse.json()
    const personalInfo = JSON.parse(deepseekJson.choices[0].message.content)

    console.log('[Parse Resume] 3. DeepSeek parsed PersonalInfo:', {
      fullName: personalInfo.fullName,
      email: personalInfo.email,
      hasEducation: personalInfo.education?.length > 0,
      hasSkills: personalInfo.technicalSkills?.length > 0
    })

    // Validate required fields
    if (!personalInfo.fullName || !personalInfo.email) {
      return NextResponse.json({
        error: 'Failed to extract required information (name or email) from resume'
      }, { status: 400 })
    }

    console.log('[Parse Resume] 4. Success - returning parsed data')

    return NextResponse.json({
      success: true,
      data: {
        personalInfo,
        resumeText
      }
    })

  } catch (error: any) {
    console.error('[Parse Resume] Error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to parse resume'
    }, { status: 500 })
  }
}
