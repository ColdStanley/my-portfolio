import { NextRequest, NextResponse } from 'next/server'
import { PROMPT_GENERATE_TEMPLATES } from '@/lib/swiftapply/prompts'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

export async function POST(req: NextRequest) {
  try {
    const { resumeText, targetRole } = await req.json()

    if (!resumeText || !targetRole) {
      return NextResponse.json({
        error: 'Missing required fields: resumeText and targetRole'
      }, { status: 400 })
    }

    console.log('[Generate Templates] 1. Generating templates for role:', targetRole)
    console.log('[Generate Templates] 2. Resume text length:', resumeText.length)

    // DeepSeek - Generate ExperienceTemplate[]
    const prompt = PROMPT_GENERATE_TEMPLATES
      .replace('{resumeText}', resumeText)
      .replace(/{targetRole}/g, targetRole)

    const response = await fetch('https://api.deepseek.com/chat/completions', {
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
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 3000
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Generate Templates] DeepSeek API error:', errorText)
      return NextResponse.json({
        error: 'Failed to generate templates with AI'
      }, { status: 500 })
    }

    const json = await response.json()
    const rawContent = json.choices[0].message.content

    console.log('[Generate Templates] 3. Raw AI response:', rawContent)

    let templates
    try {
      const parsed = JSON.parse(rawContent)

      // Handle 3 formats: array, single object, or object with templates key
      if (Array.isArray(parsed)) {
        // Format 1: Direct array
        templates = parsed
      } else if (parsed.templates && Array.isArray(parsed.templates)) {
        // Format 2: Object with templates key
        templates = parsed.templates
      } else if (parsed.id && parsed.title && parsed.content) {
        // Format 3: Single template object - wrap in array
        templates = [parsed]
      } else {
        templates = []
      }
    } catch (parseError) {
      console.error('[Generate Templates] JSON parse error:', parseError)
      return NextResponse.json({
        error: 'AI returned invalid JSON format'
      }, { status: 500 })
    }

    // Ensure each template has a unique ID
    templates = templates.map((t: any, index: number) => ({
      ...t,
      id: t.id || `${Date.now()}-${index}`,
      targetRole: t.targetRole || targetRole
    }))

    console.log('[Generate Templates] 4. Generated', templates.length, 'templates')
    console.log('[Generate Templates] 5. Template titles:', templates.map((t: any) => t.title))

    return NextResponse.json({
      success: true,
      data: { templates }
    })

  } catch (error: any) {
    console.error('[Generate Templates] Error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to generate templates'
    }, { status: 500 })
  }
}
