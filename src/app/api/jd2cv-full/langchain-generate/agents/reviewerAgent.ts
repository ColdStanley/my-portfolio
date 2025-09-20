import { invokeDeepSeek } from '../utils/deepseekLLM'
import type { ParentInsights } from './roleExpertAgent'

// Helper function to fetch prompt from Notion
async function fetchPromptFromNotion(project: string, agent: string): Promise<string> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/prompt-manager-notion?project=${project}&agent=${agent}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch prompt for ${project}:${agent} - ${response.status}`)
  }

  const data = await response.json()
  return data.promptContent
}

// Reviewer Agent - Style Unification and Final Formatting
export async function reviewerAgent(input: {
  workExperience: string;
  personalInfo: any;
  originalPersonalInfo: any;
  jd: { title: string; full_job_description: string };
  parentInsights: ParentInsights;
}): Promise<{ personalInfo: any; workExperience: string; tokens: { prompt: number; completion: number; total: number } }> {

  const { workExperience, personalInfo, originalPersonalInfo, jd, parentInsights } = input

  const focusSummary = parentInsights.focusPoints.length
    ? parentInsights.focusPoints.map((point, idx) => `${idx + 1}. ${point}`).join('\n')
    : 'No additional focus points provided.'

  const keywordList = parentInsights.keywords.length
    ? parentInsights.keywords.join(', ')
    : 'N/A'

  try {
    // Fetch prompt template from Notion
    const promptTemplate = await fetchPromptFromNotion('JD2CV_Full', 'Reviewer')

    // Replace variables in the prompt template
    const reviewPrompt = promptTemplate
      .replace(/\$\{jd\.title\}/g, jd.title)
      .replace(/\$\{jd\.full_job_description\}/g, jd.full_job_description)
      .replace(/\$\{parentInsights\.classification\}/g, parentInsights.classification)
      .replace(/\$\{focusSummary\}/g, focusSummary)
      .replace(/\$\{keywordList\}/g, keywordList)
      .replace(/\$\{workExperience\}/g, workExperience)
      .replace(/\$\{JSON\.stringify\(personalInfo, null, 2\)\}/g, JSON.stringify(personalInfo, null, 2))

    // Use DeepSeek LLM for final review and unification
    const result = await invokeDeepSeek(reviewPrompt, 0.2, 5000)

    try {
      // Try to parse the LLM response as JSON
      const reviewResult = JSON.parse(result.content.trim())

      if (reviewResult.personalInfo && reviewResult.workExperience) {
        // Validate and ensure critical fields are preserved
        const finalPersonalInfo = {
          ...reviewResult.personalInfo,
          fullName: originalPersonalInfo.fullName || reviewResult.personalInfo.fullName,
          email: originalPersonalInfo.email || reviewResult.personalInfo.email,
          phone: originalPersonalInfo.phone || reviewResult.personalInfo.phone,
          format: originalPersonalInfo.format || reviewResult.personalInfo.format || 'A4'
        }

        return {
          personalInfo: finalPersonalInfo,
          workExperience: reviewResult.workExperience,
          tokens: result.tokens
        }
      } else {
        console.error('Reviewer Agent: Invalid response structure')
        throw new Error('Invalid response structure')
      }

    } catch (parseError) {
      console.error('Reviewer Agent: Failed to parse LLM response as JSON', parseError)
      throw parseError
    }

  } catch (error) {
    console.error('Reviewer Agent error:', error)
    // In test phase, throw error instead of fallback
    throw error
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
