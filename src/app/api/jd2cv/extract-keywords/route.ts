import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createOpenAIClient } from '@/utils/modelConfig'

export async function POST(request: NextRequest) {
  try {
    const { text, type, model = 'deepseek', keywordCount = 3 } = await request.json()

    if (!text || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: text, type' },
        { status: 400 }
      )
    }

    // Define model-specific prompts for different content types
    const gptPrompts = {
      capability: `Extract exactly ${keywordCount} key professional keywords from the following capability description. Focus on:
- Technical skills and tools
- Business competencies 
- Industry-specific terms
- Actionable capabilities

CRITICAL: Return exactly ${keywordCount} keywords, no more, no less.

Return only a JSON array of exactly ${keywordCount} keywords, prioritizing compound terms over single words.

Capability: ${text}`,

      experience: `Extract exactly ${keywordCount} key professional keywords directly from the following experience description. Focus on:
- Technical skills and technologies used
- Business achievements and outcomes
- Industry domains and contexts
- Specific methodologies or frameworks
- Quantifiable results and metrics
- **Company names, project names, brand names, and website URLs (especially those with specific domains like .com)**
- **Abbreviations and acronyms in uppercase (like NCS, IBM, etc.)**

CRITICAL: Return only words or phrases that appear EXACTLY as written in the original text. Do not create new words or summarize - only extract existing words/phrases from the text.

Pay special attention to proper nouns including company names, project names, and website domains that should be preserved as important professional identifiers.

Return only a JSON array of exactly ${keywordCount} keywords that exist in the original text, prioritizing compound terms, specific achievements, and proper nouns.

Experience: ${text}`,

      generated: `Extract ${keywordCount} key professional keywords directly from the following generated resume content. Focus on:
- Technical skills and tools mentioned
- Business outcomes and achievements  
- Industry-specific terminology
- Measurable results and impact
- Professional competencies demonstrated
- **Company names, project names, brand names, and website URLs (especially those with specific domains like .com)**
- **Abbreviations and acronyms in uppercase (like NCS, IBM, etc.)**

CRITICAL: Return only words or phrases that appear EXACTLY as written in the original text. Do not create new words or summarize - only extract existing words/phrases from the text.

Pay special attention to proper nouns including company names, project names, and website domains that should be preserved as important professional identifiers.

Return only a JSON array of exactly ${keywordCount} keywords that exist in the original text, prioritizing compound terms, achievement-focused keywords, and proper nouns.

Generated Content: ${text}`
    }

    const deepseekPrompts = {
      capability: `The following is the most important capability requirement I extracted from a job description I want to apply for. I need you to find exactly ${keywordCount} core keywords from the original text.

Please focus on:
- Technical skills and tools
- Business competencies
- Industry-specific terms
- Actionable capabilities

**CRITICAL REQUIREMENT**: You must return exactly ${keywordCount} keywords, no more and no less.

Return only a JSON array containing exactly ${keywordCount} keywords, prioritizing compound terms over single words.

Capability requirement: ${text}`,

      experience: `Extract ${keywordCount} key professional keywords directly from the following experience description. Focus on:
- Technical skills and technologies used
- Business achievements and outcomes
- Industry domains and contexts
- Specific methodologies or frameworks
- Quantifiable results and metrics
- **Company names, project names, brand names, and website URLs (especially those with specific domains like .com)**
- **Abbreviations and acronyms in uppercase (like NCS, IBM, etc.)**

CRITICAL: Return only words or phrases that appear EXACTLY as written in the original text. Do not create new words or summarize - only extract existing words/phrases from the text.

Pay special attention to proper nouns including company names, project names, and website domains that should be preserved as important professional identifiers.

Return only a JSON array of exactly ${keywordCount} keywords that exist in the original text, prioritizing compound terms, specific achievements, and proper nouns.

Experience: ${text}`,

      generated: `Extract ${keywordCount} key professional keywords directly from the following generated resume content. Focus on:
- Technical skills and tools mentioned
- Business outcomes and achievements  
- Industry-specific terminology
- Measurable results and impact
- Professional competencies demonstrated
- **Company names, project names, brand names, and website URLs (especially those with specific domains like .com)**
- **Abbreviations and acronyms in uppercase (like NCS, IBM, etc.)**

CRITICAL: Return only words or phrases that appear EXACTLY as written in the original text. Do not create new words or summarize - only extract existing words/phrases from the text.

Pay special attention to proper nouns including company names, project names, and website domains that should be preserved as important professional identifiers.

Return only a JSON array of exactly ${keywordCount} keywords that exist in the original text, prioritizing compound terms, achievement-focused keywords, and proper nouns.

Generated Content: ${text}`
    }

    const gptSystemMessage = `You are an expert resume and career development analyst specializing in keyword extraction for professional content.

Extract relevant professional keywords that would be valuable for:
- ATS (Applicant Tracking System) optimization
- Professional skill identification
- Career development tracking
- Job matching and recommendations

Guidelines:
- Prioritize compound terms (e.g., "project management", "data analysis") over single words
- Include technical skills, business competencies, and industry terms
- Avoid generic words like "the", "and", "experience", "skills"
- Focus on specific, measurable, and actionable terms
- Include both hard skills (technical) and soft skills (leadership, communication) when relevant
- Use title case formatting for all keywords (e.g., "Market Adoption" not "market adoption")

Return ONLY a valid JSON array of strings, no additional text or formatting.`

    const deepseekSystemMessage = `You are an expert resume and career development analyst specializing in keyword extraction for professional content.

Extract relevant professional keywords that would be valuable for:
- ATS (Applicant Tracking System) optimization
- Professional skill identification
- Career development tracking
- Job matching and recommendations

Guidelines:
- Prioritize compound terms (e.g., "project management", "data analysis") over single words
- Include technical skills, business competencies, and industry terms
- Avoid generic words like "the", "and", "experience", "skills"
- Focus on specific, measurable, and actionable terms
- Include both hard skills (technical) and soft skills (leadership, communication) when relevant
- Use title case formatting for all keywords (e.g., "Market Adoption" not "market adoption")

Return ONLY a valid JSON array of strings, no additional text or formatting. STRICTLY FORBIDDEN: Do not include "\`\`\`json", "\`\`\`", "json", or any code block markers in your response. Your response must start directly with [ and end with ].`

    // Select prompts based on model
    const prompts = model === 'deepseek' ? deepseekPrompts : gptPrompts
    const systemMessage = model === 'deepseek' ? deepseekSystemMessage : gptSystemMessage
    const userPrompt = prompts[type as keyof typeof prompts]
    
    if (!userPrompt) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: capability, experience, generated' },
        { status: 400 }
      )
    }

    // Create OpenAI client based on selected model
    const { config, modelName } = createOpenAIClient(model as 'gpt-4' | 'deepseek')
    const openai = new OpenAI(config)

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.3, // Lower temperature for more consistent results
    })

    const response = completion.choices[0]?.message?.content || ''
    
    try {
      // Parse the JSON response
      const keywords = JSON.parse(response)
      
      // Validate that it's an array
      if (!Array.isArray(keywords)) {
        throw new Error('Response is not an array')
      }
      
      // Clean and validate keywords
      let cleanKeywords = keywords
        .filter(keyword => typeof keyword === 'string' && keyword.trim().length > 0)
        .map(keyword => keyword.trim())
        .slice(0, keywordCount) // Limit to requested count for all types
      
      // Ensure exact count for all types
      // If we have too few keywords, pad with generic terms (shouldn't happen with good prompts)
      while (cleanKeywords.length < keywordCount) {
        cleanKeywords.push(`Keyword ${cleanKeywords.length + 1}`)
      }
      // Ensure exact count
      cleanKeywords = cleanKeywords.slice(0, keywordCount)
      
      return NextResponse.json({ 
        success: true, 
        keywords: cleanKeywords 
      })
      
    } catch (parseError) {
      console.error('Failed to parse LLM response:', response)
      
      // Fallback: try to extract keywords from non-JSON response
      let fallbackKeywords = response
        .split(/[,\n]/)
        .map(k => k.trim().replace(/^[-•]\s*/, '').replace(/["\[\]]/g, ''))
        .filter(k => k.length > 0 && !k.match(/^(keywords?|extracted?|here|are|the)$/i))
        .slice(0, keywordCount)
      
      // Ensure exact count in fallback too for all types
      while (fallbackKeywords.length < keywordCount) {
        fallbackKeywords.push(`Keyword ${fallbackKeywords.length + 1}`)
      }
      fallbackKeywords = fallbackKeywords.slice(0, keywordCount)
      
      if (fallbackKeywords.length > 0) {
        return NextResponse.json({ 
          success: true, 
          keywords: fallbackKeywords 
        })
      }
      
      return NextResponse.json({
        error: 'Failed to extract keywords from text',
        details: 'LLM response could not be parsed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error extracting keywords:', error)
    return NextResponse.json(
      { error: 'Failed to extract keywords' },
      { status: 500 }
    )
  }
}