import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)


/**
 * Default prompts for different AI models
 */
const DEFAULT_PROMPTS = {
  deepseek: {
    jd_key_sentences: `Analyze the following job description and extract the 10 most important sentences that define the core responsibilities, requirements, and expectations for this role.

Focus on:
- Key technical skills and qualifications
- Primary job responsibilities
- Important experience requirements
- Critical performance expectations
- Essential competencies

Job Title: {title}

Job Description:
{full_job_description}

Please provide exactly 10 sentences from the original job description text, ranked by importance (1 being most important). Format as a simple numbered list using plain text only:

1. [First sentence]
2. [Second sentence]
3. [Third sentence]
...

Do not use JSON, markdown formatting, or any special characters. Use only plain text with simple numbering.`,

    jd_keywords: `Based on the following 10 key sentences extracted from a job description and the job title, identify the most important 3 groups of keywords (3 keywords per group) that represent the core competencies and requirements for this role.

Job Title: {title}

Key Sentences:
{key_sentences}

Please provide exactly 3 groups of keywords, with each group containing exactly 3 related keywords. Format as plain text only:

Group 1: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Group 2: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Group 3: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Focus on the most critical skills, technologies, and competencies mentioned in the key sentences. Use only plain text formatting without markdown symbols, asterisks, or dashes.`
  },
  openai: {
    jd_key_sentences: `Analyze the following job description and extract the 10 most important sentences that define the core responsibilities, requirements, and expectations for this role.

Focus on:
- Key technical skills and qualifications
- Primary job responsibilities
- Important experience requirements
- Critical performance expectations
- Essential competencies

Job Title: {title}

Job Description:
{full_job_description}

Please provide exactly 10 sentences from the original job description text, ranked by importance (1 being most important). Format as a simple numbered list using plain text only:

1. [First sentence]
2. [Second sentence]
3. [Third sentence]
...

Do not use JSON, markdown formatting, or any special characters. Use only plain text with simple numbering.`,

    jd_keywords: `Based on the following 10 key sentences extracted from a job description and the job title, identify the most important 3 groups of keywords (3 keywords per group) that represent the core competencies and requirements for this role.

Job Title: {title}

Key Sentences:
{key_sentences}

Please provide exactly 3 groups of keywords, with each group containing exactly 3 related keywords. Format as plain text only:

Group 1: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Group 2: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Group 3: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Focus on the most critical skills, technologies, and competencies mentioned in the key sentences. Use only plain text formatting without markdown symbols, asterisks, or dashes.`
  }
}

/**
 * Get user's custom prompts or return defaults
 */
async function getUserPrompts(userId: string, aiModel: string = 'deepseek') {
  try {
    // Get user's custom prompts directly from database
    const { data: userPrompts, error } = await supabase
      .from('user_prompts')
      .select('prompt_type, prompt_content')
      .eq('user_id', userId)
      .eq('ai_model', aiModel)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching user prompts:', error)
    }

    // Merge with defaults
    const modelDefaults = DEFAULT_PROMPTS[aiModel as keyof typeof DEFAULT_PROMPTS] || DEFAULT_PROMPTS.deepseek
    const result = {
      keySentences: modelDefaults.jd_key_sentences,
      keywords: modelDefaults.jd_keywords
    }

    // Override with user's custom prompts if available
    userPrompts?.forEach(prompt => {
      if (prompt.prompt_type === 'jd_key_sentences' && prompt.prompt_content) {
        result.keySentences = prompt.prompt_content
      } else if (prompt.prompt_type === 'jd_keywords' && prompt.prompt_content) {
        result.keywords = prompt.prompt_content
      }
    })

    return result
  } catch (error) {
    console.error('Error fetching user prompts:', error)
    // Return defaults if database query fails
    const modelDefaults = DEFAULT_PROMPTS[aiModel as keyof typeof DEFAULT_PROMPTS] || DEFAULT_PROMPTS.deepseek
    return {
      keySentences: modelDefaults.jd_key_sentences,
      keywords: modelDefaults.jd_keywords
    }
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