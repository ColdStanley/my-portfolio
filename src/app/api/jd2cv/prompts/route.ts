import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Default prompts for different AI models and types - Based on JD2CV 1.0
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

Focus on the most critical skills, technologies, and competencies mentioned in the key sentences. Use only plain text formatting without markdown symbols, asterisks, or dashes.`,

    cv_optimization: `Here is my work experience. Evaluate which group from {jd_keywords} best matches this experience (no need to explain the evaluation). Then rewrite the experience targeting that group as 3 concise, resume-ready bullet points. Each bullet must start with a strong action verb, include specific numbers, and reflect the chosen group's focus (e.g. Partnership Development). Do not use explicit frameworks like CAR or STAR in formatting—output must be plain text resume bullets only. Use numbered points, plain text format only. Do not use any markdown formatting including asterisks (*), dashes (-), bold, italics, or any special characters for formatting.Do not include any introductory text or labels—only return the 3 numbered bullet points.

Work Experience:
{experience}

Keywords Groups:
{jd_keywords}`
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

Focus on the most critical skills, technologies, and competencies mentioned in the key sentences. Use only plain text formatting without markdown symbols, asterisks, or dashes.`,

    cv_optimization: `You are an expert career consultant. Based on the following capability requirement and the candidate's original experience/project, craft an enhanced and customized version that:
- Directly addresses the specific capability requirement
- Incorporates key phrases and technical terms from the capability description
- Expands or rewrites the original experience to better align with the capability
- Maintains truthfulness and consistency with the original input
- Uses concise, professional, and compelling language suitable for resumes or LinkedIn
- Avoids generic phrasing or vague accomplishments
- **CRITICAL: Preserve all company names, project names, website URLs, and brand names EXACTLY as written in the original text. Do not modify, abbreviate, or rewrite these proper nouns.**
- Presents the final result as structured **bullet points**, suitable for resume use

You may choose from the following frameworks to best express the enhanced experience:
- **CAR** (Challenge – Action – Result) — concise and outcome-driven
- **PAR** (Problem – Action – Result) — suitable for business/tech roles
- **SOAR** (Situation – Opportunity – Action – Result) — emphasizes influence
- **Why–What–How–Impact** — ideal for explaining the rationale and impact of a project

Select the most appropriate framework based on the content, and clearly reflect its logic in the output.
---
Capability Requirement:
{jd_keywords}

Original Experience/Project:
{experience_content}

Please return the enhanced experience as 1–3 bullet points, clearly reflecting one of the above frameworks.`
  }
}

/**
 * GET: Retrieve user's prompts for a specific model
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const aiModel = searchParams.get('ai_model') || 'deepseek'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user's custom prompts
    const { data: userPrompts, error } = await supabase
      .from('user_prompts')
      .select('prompt_type, prompt_content')
      .eq('user_id', userId)
      .eq('ai_model', aiModel)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching user prompts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user prompts' },
        { status: 500 }
      )
    }

    // Merge with defaults
    const modelDefaults = DEFAULT_PROMPTS[aiModel as keyof typeof DEFAULT_PROMPTS] || DEFAULT_PROMPTS.deepseek
    const result = {
      jd_key_sentences: modelDefaults.jd_key_sentences,
      jd_keywords: modelDefaults.jd_keywords,
      cv_optimization: modelDefaults.cv_optimization
    }

    // Override with user's custom prompts
    userPrompts?.forEach(prompt => {
      if (prompt.prompt_type && prompt.prompt_content) {
        result[prompt.prompt_type as keyof typeof result] = prompt.prompt_content
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ai_model: aiModel,
        prompts: result,
        defaults: modelDefaults,
        has_customizations: (userPrompts?.length || 0) > 0
      }
    })

  } catch (error: any) {
    console.error('GET prompts error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT: Update or create a user's prompt
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, aiModel, promptType, promptContent } = body

    if (!userId || !aiModel || !promptType || !promptContent) {
      return NextResponse.json(
        { error: 'User ID, AI model, prompt type, and prompt content are required' },
        { status: 400 }
      )
    }

    // Validate prompt type
    const validPromptTypes = ['jd_key_sentences', 'jd_keywords', 'cv_optimization']
    if (!validPromptTypes.includes(promptType)) {
      return NextResponse.json(
        { error: 'Invalid prompt type' },
        { status: 400 }
      )
    }

    // Validate AI model
    const validModels = ['deepseek', 'openai']
    if (!validModels.includes(aiModel)) {
      return NextResponse.json(
        { error: 'Invalid AI model' },
        { status: 400 }
      )
    }

    // Upsert prompt
    const { data, error } = await supabase
      .from('user_prompts')
      .upsert([{
        user_id: userId,
        ai_model: aiModel,
        prompt_type: promptType,
        prompt_content: promptContent,
        is_active: true
      }], {
        onConflict: 'user_id,prompt_type,ai_model'
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting prompt:', error)
      return NextResponse.json(
        { error: 'Failed to save prompt' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Prompt saved successfully'
    })

  } catch (error: any) {
    console.error('PUT prompts error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE: Reset a prompt to default (delete custom prompt)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const aiModel = searchParams.get('ai_model')
    const promptType = searchParams.get('prompt_type')

    if (!userId || !aiModel || !promptType) {
      return NextResponse.json(
        { error: 'User ID, AI model, and prompt type are required' },
        { status: 400 }
      )
    }

    // Delete the custom prompt (will fall back to default)
    const { error } = await supabase
      .from('user_prompts')
      .delete()
      .eq('user_id', userId)
      .eq('ai_model', aiModel)
      .eq('prompt_type', promptType)

    if (error) {
      console.error('Error deleting prompt:', error)
      return NextResponse.json(
        { error: 'Failed to reset prompt' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt reset to default successfully'
    })

  } catch (error: any) {
    console.error('DELETE prompts error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}