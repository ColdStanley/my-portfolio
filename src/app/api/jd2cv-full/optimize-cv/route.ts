import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Get user's custom CV optimization prompt from Prompt Manager
 */
async function getUserCVPrompt(userId: string, aiModel: string = 'deepseek'): Promise<string> {
  try {
    // Fetch user prompts from the prompt management API
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jd2cv-full/prompts?user_id=${userId}&ai_model=${aiModel}`)
    
    if (!response.ok) {
      throw new Error(`Prompt API request failed: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.success) {
      return result.data.prompts.cv_optimization
    }

    throw new Error(result.error || 'Failed to get CV optimization prompt')
  } catch (error) {
    console.error('Error fetching user CV prompt:', error)
    throw error
  }
}

/**
 * Call AI API based on model type
 */
async function callAI(prompt: string, aiModel: string = 'deepseek') {
  try {
    if (aiModel === 'openai') {
      return await callOpenAI(prompt)
    } else {
      // Default to DeepSeek
      return await callDeepSeek(prompt)
    }
  } catch (error) {
    console.error('AI API error:', error)
    throw new Error('Failed to optimize experience with AI')
  }
}

/**
 * Call OpenAI API for CV optimization
 */
async function callOpenAI(prompt: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content?.trim() || ''
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

/**
 * Call DeepSeek API for CV optimization
 */
async function callDeepSeek(prompt: string) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content?.trim() || ''
  } catch (error) {
    console.error('DeepSeek API error:', error)
    throw error
  }
}

/**
 * Format keywords for prompt
 */
function formatKeywords(keywords: string | { [key: string]: string[] }): string {
  // If keywords is already a string, return directly
  if (typeof keywords === 'string') {
    return keywords
  }
  
  // Handle object format (legacy support)
  const formatted: string[] = []
  Object.entries(keywords).forEach(([group, keywordList]) => {
    formatted.push(`${group}: ${keywordList.join(', ')}`)
  })
  
  return formatted.join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { experienceId, jdKeywords, userId, aiModel = 'deepseek' } = body

    if (!experienceId || !jdKeywords || !userId) {
      return NextResponse.json(
        { error: 'Experience ID, JD keywords, and User ID are required' },
        { status: 400 }
      )
    }

    // Get experience record
    const { data: experienceRecord, error: expError } = await supabase
      .from('experience_records')
      .select('*')
      .eq('id', experienceId)
      .eq('user_id', userId)
      .single()

    if (expError || !experienceRecord) {
      return NextResponse.json(
        { error: 'Experience record not found' },
        { status: 404 }
      )
    }

    // Get user's CV optimization prompt
    const prompt = await getUserCVPrompt(userId, aiModel)

    // Format keywords for the prompt
    const formattedKeywords = formatKeywords(jdKeywords)

    // Replace placeholders in prompt
    const optimizationPrompt = prompt
      .replace('{jd_keywords}', formattedKeywords)
      .replace('{experience}', experienceRecord.experience || '')

    // Call AI for optimization
    const optimizedContent = await callAI(optimizationPrompt, aiModel)

    if (!optimizedContent) {
      return NextResponse.json(
        { error: 'Failed to generate optimized content' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        originalExperience: experienceRecord,
        optimizedContent,
        jdKeywords
      }
    })

  } catch (error: any) {
    console.error('CV optimization error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize CV experience', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Save optimized experience as new record
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      originalExperienceId, 
      optimizedContent, 
      userKeywords, 
      userId,
      jdId,
      jdTitle,
      jdCompany
    } = body

    if (!originalExperienceId || !optimizedContent || !userId) {
      return NextResponse.json(
        { error: 'Original experience ID, optimized content, and User ID are required' },
        { status: 400 }
      )
    }

    // Get original experience record
    const { data: originalExp, error: origError } = await supabase
      .from('experience_records')
      .select('*')
      .eq('id', originalExperienceId)
      .eq('user_id', userId)
      .single()

    if (origError || !originalExp) {
      return NextResponse.json(
        { error: 'Original experience record not found' },
        { status: 404 }
      )
    }

    // Create new optimized experience record
    const { data: newRecord, error: insertError } = await supabase
      .from('experience_records')
      .insert([{
        user_id: userId,
        jd_id: jdId || null,
        company: originalExp.company,
        title: originalExp.title,
        experience: optimizedContent,
        keywords: userKeywords || [],
        role_group: originalExp.role_group,
        work_or_project: originalExp.work_or_project,
        time: originalExp.time,
        comment: jdTitle && jdCompany ? `${jdCompany} - ${jdTitle}` : null
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Failed to save optimized experience:', insertError)
      return NextResponse.json(
        { error: 'Failed to save optimized experience' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newRecord,
      message: 'Optimized experience saved successfully'
    })

  } catch (error: any) {
    console.error('Save optimized experience error:', error)
    return NextResponse.json(
      { error: 'Failed to save optimized experience', details: error.message },
      { status: 500 }
    )
  }
}