import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Get user's custom prompts or return defaults from Prompt Manager
 * 复制自 analyze-jd 的逻辑，避免内部HTTP调用
 */
async function getUserPrompts(userId: string, aiModel: string = 'deepseek') {
  try {
    // 直接查询数据库，避免HTTP调用
    const { data: promptData, error } = await supabase
      .from('jd2cv_prompts')
      .select('*')
      .eq('user_id', userId)
      .eq('ai_model', aiModel)
      .single()

    if (error || !promptData) {
      // 返回默认prompts
      return {
        keySentences: `Extract the most important key sentences from this job description that candidates should focus on when tailoring their resume. Focus on:\n\n1. Required technical skills and technologies\n2. Years of experience requirements\n3. Key responsibilities and duties\n4. Required qualifications and certifications\n5. Industry or domain knowledge\n6. Soft skills and competencies\n\nJob Title: {title}\nJob Description:\n{full_job_description}\n\nPlease provide 8-12 key sentences that capture the essence of what this role requires.`,
        keywords: `From these key sentences extracted from a job description, identify and extract specific keywords and phrases that are most important for resume optimization. Focus on:\n\n1. Technical skills, tools, and technologies\n2. Programming languages and frameworks\n3. Industry-specific terms and methodologies\n4. Certifications and qualifications\n5. Action verbs and measurable achievements\n6. Years of experience mentioned\n\nKey Sentences from Job Description:\n{key_sentences}\n\nJob Title: {title}\n\nPlease organize the keywords into 3 groups and provide 15-20 keywords total. Format as:\n\nGroup 1: Technical Skills\n1. keyword1\n2. keyword2\n...\n\nGroup 2: Experience & Qualifications\n1. keyword1\n2. keyword2\n...\n\nGroup 3: Responsibilities & Actions\n1. keyword1\n2. keyword2\n...`
      }
    }

    return {
      keySentences: promptData.jd_key_sentences,
      keywords: promptData.jd_keywords
    }
  } catch (error) {
    console.error('Error fetching user prompts:', error)
    // 返回默认prompts作为fallback
    return {
      keySentences: `Extract the most important key sentences from this job description that candidates should focus on when tailoring their resume. Focus on:\n\n1. Required technical skills and technologies\n2. Years of experience requirements\n3. Key responsibilities and duties\n4. Required qualifications and certifications\n5. Industry or domain knowledge\n6. Soft skills and competencies\n\nJob Title: {title}\nJob Description:\n{full_job_description}\n\nPlease provide 8-12 key sentences that capture the essence of what this role requires.`,
      keywords: `From these key sentences extracted from a job description, identify and extract specific keywords and phrases that are most important for resume optimization. Focus on:\n\n1. Technical skills, tools, and technologies\n2. Programming languages and frameworks\n3. Industry-specific terms and methodologies\n4. Certifications and qualifications\n5. Action verbs and measurable achievements\n6. Years of experience mentioned\n\nKey Sentences from Job Description:\n{key_sentences}\n\nJob Title: {title}\n\nPlease organize the keywords into 3 groups and provide 15-20 keywords total. Format as:\n\nGroup 1: Technical Skills\n1. keyword1\n2. keyword2\n...\n\nGroup 2: Experience & Qualifications\n1. keyword1\n2. keyword2\n...\n\nGroup 3: Responsibilities & Actions\n1. keyword1\n2. keyword2\n...`
    }
  }
}

/**
 * Call AI API based on model type
 * 复制自 analyze-jd 的逻辑
 */
async function callAI(prompt: string, aiModel: string = 'deepseek', temperature: number = 0.3) {
  try {
    if (aiModel === 'openai') {
      return await callOpenAI(prompt, temperature)
    } else {
      // Default to DeepSeek
      return await callDeepSeek(prompt, temperature)
    }
  } catch (error) {
    console.error('AI API error:', error)
    throw new Error('Failed to analyze with AI')
  }
}

/**
 * Call OpenAI API for text analysis
 * 复制自 analyze-jd 的逻辑
 */
async function callOpenAI(prompt: string, temperature: number = 0.3) {
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
        temperature,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

/**
 * Call DeepSeek API for text analysis
 * 复制自 analyze-jd 的逻辑
 */
async function callDeepSeek(prompt: string, temperature: number = 0.3) {
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
        temperature,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('DeepSeek API error:', error)
    throw error
  }
}

// 批量分析JD的核心逻辑
async function analyzeSingleJD(jdRecord: any, userId: string, aiModel: string = 'deepseek') {
  try {
    // Get user prompts
    const prompts = await getUserPrompts(userId, aiModel)

    // Step 1: Extract key sentences
    const keySentencesPrompt = prompts.keySentences
      .replace('{full_job_description}', jdRecord.full_job_description || '')
      .replace('{title}', jdRecord.title || '')
    
    const keySentencesResult = await callAI(keySentencesPrompt, aiModel)

    // Step 2: Extract keywords from key sentences  
    const keywordsPrompt = prompts.keywords
      .replace('{key_sentences}', keySentencesResult)
      .replace('{title}', jdRecord.title || '')
    
    const keywordsResult = await callAI(keywordsPrompt, aiModel)

    // Step 3: Update JD record with analysis results
    const { error: updateError } = await supabase
      .from('jd_records')
      .update({
        jd_key_sentences: keySentencesResult,
        keywords_from_sentences: keywordsResult
      })
      .eq('id', jdRecord.id)
      .eq('user_id', userId)

    if (updateError) {
      throw new Error('Failed to save analysis results')
    }

    return {
      success: true,
      jdId: jdRecord.id,
      keySentences: keySentencesResult,
      keywords: keywordsResult
    }
  } catch (error: any) {
    return {
      success: false,
      jdId: jdRecord.id,
      error: error.message
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jdIds, userId, aiModel = 'deepseek' } = body

    if (!jdIds || !Array.isArray(jdIds) || jdIds.length === 0) {
      return NextResponse.json(
        { error: 'JD IDs array is required' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get all JD records
    const { data: jdRecords, error: jdError } = await supabase
      .from('jd_records')
      .select('*')
      .in('id', jdIds)
      .eq('user_id', userId)

    if (jdError || !jdRecords || jdRecords.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch JD records or no JDs found' },
        { status: 404 }
      )
    }

    // 批量分析所有JD
    const results = []
    for (const jdRecord of jdRecords) {
      console.log(`🔄 [Batch Analyze JD] Processing ${jdRecord.title}`)
      const result = await analyzeSingleJD(jdRecord, userId, aiModel)
      results.push(result)
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Batch analysis completed: ${successCount} succeeded, ${failureCount} failed`,
      results,
      summary: {
        total: jdRecords.length,
        succeeded: successCount,
        failed: failureCount
      }
    })

  } catch (error: any) {
    console.error('❌ [Batch Analyze JD] API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process batch JD analysis', details: error.message },
      { status: 500 }
    )
  }
}