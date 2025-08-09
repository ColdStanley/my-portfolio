import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)


/**
 * Get user's custom prompts or return defaults from Prompt Manager
 */
async function getUserPrompts(userId: string, aiModel: string = 'deepseek') {
  try {
    // Fetch user prompts from the prompt management API
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jd2cv/prompts?user_id=${userId}&ai_model=${aiModel}`)
    
    if (!response.ok) {
      throw new Error(`Prompt API request failed: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.success) {
      return {
        keySentences: result.data.prompts.jd_key_sentences,
        keywords: result.data.prompts.jd_keywords
      }
    }

    throw new Error(result.error || 'Failed to get prompts')
  } catch (error) {
    console.error('Error fetching user prompts:', error)
    throw error
  }
}

/**
 * Call AI API based on model type
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


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jdId, userId, aiModel = 'deepseek' } = body

    if (!jdId || !userId) {
      return NextResponse.json(
        { error: 'JD ID and User ID are required' },
        { status: 400 }
      )
    }

    // Get JD record
    const { data: jdRecord, error: jdError } = await supabase
      .from('jd_records')
      .select('*')
      .eq('id', jdId)
      .eq('user_id', userId)
      .single()

    if (jdError || !jdRecord) {
      return NextResponse.json(
        { error: 'JD record not found' },
        { status: 404 }
      )
    }

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
      .eq('id', jdId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Failed to update JD record:', updateError)
      return NextResponse.json(
        { error: 'Failed to save analysis results' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        keySentences: keySentencesResult,
        keywords: keywordsResult,
        jdRecord: {
          ...jdRecord,
          jd_key_sentences: keySentencesResult,
          keywords_from_sentences: keywordsResult
        }
      }
    })

  } catch (error: any) {
    console.error('JD analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze JD', details: error.message },
      { status: 500 }
    )
  }
}