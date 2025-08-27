import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Get user's custom CV optimization prompt
 * 复制自 optimize-cv 的逻辑，避免内部HTTP调用
 */
async function getUserCVPrompt(userId: string, aiModel: string = 'deepseek'): Promise<string> {
  try {
    // 直接查询数据库，避免HTTP调用
    const { data: promptData, error } = await supabase
      .from('jd2cv_prompts')
      .select('*')
      .eq('user_id', userId)
      .eq('ai_model', aiModel)
      .single()

    if (error || !promptData) {
      // 返回默认CV优化prompt
      return `You are an expert resume optimization specialist. Using the provided job description keywords, optimize the following work experience to better align with the job requirements.

Guidelines:
1. Incorporate relevant keywords naturally into the experience description
2. Emphasize achievements and quantifiable results
3. Use action verbs that align with job requirements
4. Maintain authenticity - don't fabricate experiences
5. Keep the writing concise and impactful
6. Format as bullet points starting with action verbs

Job Description Keywords:
{jd_keywords}

Original Experience:
{experience}

Please provide an optimized version of this experience that incorporates relevant keywords while maintaining accuracy and professionalism:`
    }

    return promptData.cv_optimization
  } catch (error) {
    console.error('Error fetching user CV prompt:', error)
    // 返回默认prompt作为fallback
    return `You are an expert resume optimization specialist. Using the provided job description keywords, optimize the following work experience to better align with the job requirements.

Guidelines:
1. Incorporate relevant keywords naturally into the experience description
2. Emphasize achievements and quantifiable results
3. Use action verbs that align with job requirements
4. Maintain authenticity - don't fabricate experiences
5. Keep the writing concise and impactful
6. Format as bullet points starting with action verbs

Job Description Keywords:
{jd_keywords}

Original Experience:
{experience}

Please provide an optimized version of this experience that incorporates relevant keywords while maintaining accuracy and professionalism:`
  }
}

/**
 * Call AI API based on model type
 * 复制自 optimize-cv 的逻辑
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
 * 复制自 optimize-cv 的逻辑
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
 * 复制自 optimize-cv 的逻辑
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
 * 复制自 optimize-cv 的逻辑
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

// 批量优化单个experience的核心逻辑
async function optimizeSingleExperience(experience: any, jdKeywords: string, userId: string, aiModel: string = 'deepseek') {
  try {
    // Get user's CV optimization prompt
    const prompt = await getUserCVPrompt(userId, aiModel)

    // Format keywords for the prompt
    const formattedKeywords = formatKeywords(jdKeywords)

    // Replace placeholders in prompt
    const optimizationPrompt = prompt
      .replace('{jd_keywords}', formattedKeywords)
      .replace('{experience}', experience.experience || '')

    // Call AI for optimization
    const optimizedContent = await callAI(optimizationPrompt, aiModel)

    if (!optimizedContent) {
      throw new Error('Failed to generate optimized content')
    }

    return {
      success: true,
      experienceId: experience.id,
      originalExperience: experience,
      optimizedContent,
      jdKeywords: formattedKeywords
    }
  } catch (error: any) {
    return {
      success: false,
      experienceId: experience.id,
      error: error.message
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { experienceIds, jdKeywords, userId, aiModel = 'deepseek' } = body

    if (!experienceIds || !Array.isArray(experienceIds) || experienceIds.length === 0) {
      return NextResponse.json(
        { error: 'Experience IDs array is required' },
        { status: 400 }
      )
    }

    if (!jdKeywords || !userId) {
      return NextResponse.json(
        { error: 'JD keywords and User ID are required' },
        { status: 400 }
      )
    }

    // Get all experience records
    const { data: experiences, error: expError } = await supabase
      .from('experience_records')
      .select('*')
      .in('id', experienceIds)
      .eq('user_id', userId)

    if (expError || !experiences || experiences.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch experience records or no experiences found' },
        { status: 404 }
      )
    }

    // 批量优化所有experience - 并行处理优化
    
    const optimizationPromises = experiences.map(async (experience) => {
      return await optimizeSingleExperience(experience, jdKeywords, userId, aiModel)
    })
    
    // 并行执行所有优化任务
    const results = await Promise.all(optimizationPromises)

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Batch optimization completed: ${successCount} succeeded, ${failureCount} failed`,
      results,
      summary: {
        total: experiences.length,
        succeeded: successCount,
        failed: failureCount
      }
    })

  } catch (error: any) {
    console.error('❌ [Batch Optimize CV] API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process batch CV optimization', details: error.message },
      { status: 500 }
    )
  }
}