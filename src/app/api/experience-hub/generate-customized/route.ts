import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { getModelConfig } from '@/utils/modelConfig'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      jdData, 
      experienceData, 
      model = 'deepseek',
      customPrompt 
    } = await request.json()

    // Validate required fields
    if (!jdData?.keywords_from_sentences) {
      return NextResponse.json(
        { success: false, error: 'Missing keywords from job description. Please generate keywords first.' },
        { status: 400 }
      )
    }

    if (!experienceData?.experience || !experienceData?.company) {
      return NextResponse.json(
        { success: false, error: 'Missing required experience data. Please check the selected experience.' },
        { status: 400 }
      )
    }

    if (!jdData?.title || !jdData?.company) {
      return NextResponse.json(
        { success: false, error: 'Missing job description title or company information.' },
        { status: 400 }
      )
    }

    // Use custom prompt if provided, otherwise use default
    const defaultPrompt = `Here is my work experience at {company}. Evaluate which group from {keywords_from_sentences} best matches this experience (no need to explain the evaluation). Then customize the work experience targeting that group using an appropriate framework (such as CAR framework: Challenge – Action – Result or STAR framework: Situation – Task – Action – Result), ensuring each numbered point contains specific numbers. Use numbered points, plain text format only. Do not use any markdown formatting including asterisks (*), dashes (-), bold, italics, or any special characters for formatting.

Work Experience:
{experience}

Keywords Groups:
{keywords_from_sentences}`

    const promptTemplate = customPrompt || defaultPrompt
    
    // Replace template variables
    const prompt = promptTemplate
      .replace(/{company}/g, experienceData.company)
      .replace(/{experience}/g, experienceData.experience)
      .replace(/{keywords_from_sentences}/g, jdData.keywords_from_sentences)

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
          content: 'You are an expert resume writer who specializes in customizing work experiences to match specific job requirements. Create compelling, quantified experience descriptions using professional frameworks. Use only plain text format without any markdown formatting, asterisks, dashes, or special characters for styling.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const customizedExperience = completion.choices[0]?.message?.content || ''

    if (!customizedExperience.trim()) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate customized experience. Please try again.' },
        { status: 500 }
      )
    }

    // Save to Notion Experience Hub database
    if (!process.env.NOTION_PROFESSIONALEXPERIENCE_DB_ID) {
      return NextResponse.json(
        { success: false, error: 'Experience database configuration missing.' },
        { status: 500 }
      )
    }

    const notionResponse = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_PROFESSIONALEXPERIENCE_DB_ID,
      },
      properties: {
        experience: {
          rich_text: [
            {
              text: {
                content: customizedExperience,
              },
            },
          ],
        },
        title: {
          select: {
            name: experienceData.title || 'Customized Experience',
          },
        },
        company: {
          select: {
            name: experienceData.company,
          },
        },
        target_role: {
          multi_select: [
            {
              name: jdData.title,
            },
          ],
        },
        time: {
          rich_text: [
            {
              text: {
                content: experienceData.time || '',
              },
            },
          ],
        },
        comment: {
          rich_text: [
            {
              text: {
                content: jdData.company || '',
              },
            },
          ],
        },
      },
    })

    return NextResponse.json({
      success: true,
      customizedExperience: customizedExperience,
      notionId: notionResponse.id
    })
  } catch (error) {
    console.error('Error generating customized experience:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate customized experience. Please try again later.' },
      { status: 500 }
    )
  }
}