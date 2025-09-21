import { invokeDeepSeek, invokeDeepSeekStream } from '../utils/deepseekLLM'
import type { ParentInsights } from './roleExpertAgent'

// Robust JSON parsing function that handles LLM responses with extra text
function parseJsonFromLLMResponse(content: string): any {
  try {
    // Remove common prefixes that LLMs often add
    const prefixesToRemove = [
      'Of course.',
      'Sure!',
      'Here is',
      'Here\'s',
      'Certainly.',
      'Absolutely.',
      'I\'ll help you',
      'Here you go',
    ]

    let cleaned = content.trim()

    // Remove common prefixes (case insensitive)
    for (const prefix of prefixesToRemove) {
      const regex = new RegExp(`^${prefix}\\s*`, 'i')
      cleaned = cleaned.replace(regex, '')
    }

    // Remove markdown code blocks
    cleaned = cleaned
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()

    // Try to find JSON content between braces
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleaned = jsonMatch[0]
    }

    // Parse the cleaned content
    return JSON.parse(cleaned)
  } catch (error) {
    console.warn('Failed to parse JSON from LLM response:', error)
    console.warn('Original content:', content.slice(0, 200) + '...')
    throw error
  }
}

// Helper function to fetch prompt from Notion
async function fetchPromptFromNotion(project: string, agent: string): Promise<string> {
  console.log(`[ReviewerAgent] 🔄 Fetching prompt from Notion: ${project}:${agent}`)

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/prompt-manager-notion?project=${project}&agent=${agent}`)

  if (!response.ok) {
    console.error(`[ReviewerAgent] ❌ Failed to fetch prompt: ${response.status}`)
    throw new Error(`Failed to fetch prompt for ${project}:${agent} - ${response.status}`)
  }

  const data = await response.json()
  console.log(`[ReviewerAgent] ✅ Successfully fetched prompt (version: ${data.version})`)
  return data.promptContent
}

// Reviewer Agent - Work Experience Review Only (Profile Preserved)
export async function reviewerAgent(input: {
  workExperience: string;
  personalInfo: any;
  originalPersonalInfo: any;
  jd: { title: string; full_job_description: string };
  parentInsights: ParentInsights;
  onStreamChunk?: (chunk: string) => void; // Optional streaming callback
}): Promise<{ personalInfo: any; workExperience: string; tokens: { prompt: number; completion: number; total: number } }> {

  console.log(`[ReviewerAgent] 🎯 Starting Reviewer Agent for: ${input.jd.title} (Profile-Preserving Mode)`)
  console.log(`[ReviewerAgent] 📋 Classification: ${input.parentInsights.classification}`)
  console.log(`[ReviewerAgent] 👤 Profile Protection: User profile will not be modified`)

  const { workExperience, personalInfo, originalPersonalInfo, jd, parentInsights, onStreamChunk } = input

  const focusSummary = parentInsights.focusPoints.length
    ? parentInsights.focusPoints.map((point, idx) => `${idx + 1}. ${point}`).join('\n')
    : 'No additional focus points provided.'

  const keywordList = parentInsights.keywords.length
    ? parentInsights.keywords.join(', ')
    : 'N/A'

  console.log(`[ReviewerAgent] 🔢 Variables prepared: ${parentInsights.focusPoints.length} focus points, ${parentInsights.keywords.length} keywords`)
  console.log(`[ReviewerAgent] 📄 Work experience length: ${workExperience.length}`)

  try {
    // Fetch prompt template from Notion for work experience review only
    const promptTemplate = await fetchPromptFromNotion('JD2CV_Full', 'Reviewer')

    // Replace variables in the prompt template - focus only on work experience review
    console.log(`[ReviewerAgent] 🔄 Preparing work experience review prompt`)
    const reviewPrompt = promptTemplate
      .replace(/\$\{jd\.title\}/g, jd.title)
      .replace(/\$\{jd\.full_job_description\}/g, jd.full_job_description)
      .replace(/\$\{parentInsights\.classification\}/g, parentInsights.classification)
      .replace(/\$\{focusSummary\}/g, focusSummary)
      .replace(/\$\{keywordList\}/g, keywordList)
      .replace(/\$\{workExperience\}/g, workExperience)
      .replace(/\$\{JSON\.stringify\(personalInfo, null, 2\)\}/g, JSON.stringify(personalInfo, null, 2))

    console.log(`[ReviewerAgent] 📤 Sending work experience for review, prompt length: ${reviewPrompt.length}`)

    // Use streaming if callback provided, otherwise use regular DeepSeek
    const result = onStreamChunk
      ? await invokeDeepSeekStream(
          reviewPrompt,
          (chunk: string) => {
            console.log(`[ReviewerAgent] 📝 Streaming chunk: ${chunk.slice(0, 50)}...`)
            onStreamChunk(chunk)
          },
          0.2,
          5000
        )
      : await invokeDeepSeek(reviewPrompt, 0.2, 5000)

    console.log(`[ReviewerAgent] 📥 Work experience review completed, tokens: ${JSON.stringify(result.tokens)}`)

    try {
      // Try to parse the LLM response as JSON using robust parser
      console.log(`[ReviewerAgent] 🔄 Parsing work experience review response`)
      const reviewResult = parseJsonFromLLMResponse(result.content)

      if (reviewResult.workExperience) {
        console.log(`[ReviewerAgent] ✅ Reviewer Agent completed successfully`)
        console.log(`[ReviewerAgent] 📊 Final result: original profile preserved, workExperience reviewed (length: ${reviewResult.workExperience.length})`)

        // Return original personalInfo unchanged, only reviewed work experience
        return {
          personalInfo: originalPersonalInfo, // Always use original profile data
          workExperience: reviewResult.workExperience,
          tokens: result.tokens
        }
      } else {
        console.error('[ReviewerAgent] ❌ No work experience in response')
        throw new Error('Invalid response structure - missing work experience')
      }

    } catch (parseError) {
      console.error('[ReviewerAgent] ❌ Failed to parse work experience review response', parseError)
      // Fallback: return original data if parsing fails
      return {
        personalInfo: originalPersonalInfo,
        workExperience: workExperience,
        tokens: result.tokens
      }
    }

  } catch (error) {
    console.error('[ReviewerAgent] ❌ Reviewer Agent error:', error)
    // Fallback: return original data if anything fails
    return {
      personalInfo: originalPersonalInfo,
      workExperience: workExperience,
      tokens: { prompt: 0, completion: 0, total: 0 }
    }
  }
}

// Fallback function for basic review
function performBasicReview(personalInfo: any, workExperience: string, originalPersonalInfo: any) {
  const reviewedPersonalInfo = { ...personalInfo }

  // Remove duplicate skills
  if (reviewedPersonalInfo.technicalSkills) {
    reviewedPersonalInfo.technicalSkills = [...new Set(reviewedPersonalInfo.technicalSkills)]
  }

  // Remove duplicate languages
  if (reviewedPersonalInfo.languages) {
    reviewedPersonalInfo.languages = [...new Set(reviewedPersonalInfo.languages)]
  }

  // Remove duplicate certificates
  if (reviewedPersonalInfo.certificates) {
    reviewedPersonalInfo.certificates = [...new Set(reviewedPersonalInfo.certificates)]
  }

  // Ensure required fields from original are preserved
  reviewedPersonalInfo.fullName = originalPersonalInfo.fullName || reviewedPersonalInfo.fullName
  reviewedPersonalInfo.email = originalPersonalInfo.email || reviewedPersonalInfo.email
  reviewedPersonalInfo.phone = originalPersonalInfo.phone || reviewedPersonalInfo.phone
  reviewedPersonalInfo.format = originalPersonalInfo.format || reviewedPersonalInfo.format || 'A4'

  // Validate structure matches localStorage requirements
  const requiredFields = [
    'fullName', 'email', 'phone', 'location', 'linkedin', 'website',
    'summary', 'technicalSkills', 'languages', 'education', 'certificates', 'customModules', 'format'
  ]

  requiredFields.forEach(field => {
    if (!(field in reviewedPersonalInfo)) {
      reviewedPersonalInfo[field] = originalPersonalInfo[field] || (Array.isArray(originalPersonalInfo[field]) ? [] : '')
    }
  })

  return {
    personalInfo: reviewedPersonalInfo,
    workExperience: workExperience
  }
}
