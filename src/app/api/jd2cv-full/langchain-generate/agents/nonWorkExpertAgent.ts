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

// Non-Work Expert Agent - Profile, Skills, Education, Projects Customization
export async function nonWorkExpertAgent(
  customizedWorkExperience: string,
  personalInfo: any,
  parentInsights: ParentInsights
): Promise<{ content: any; tokens: { prompt: number; completion: number; total: number } }> {

  const { classification, focusPoints, keywords } = parentInsights

  const focusSection = focusPoints.length
    ? focusPoints.map(point => `- ${point}`).join('\n')
    : '- Follow the tone established in work experience.'

  const keywordSection = keywords.length
    ? keywords.map(k => `- ${k}`).join('\n')
    : '- Maintain the most relevant skills already present.'

  try {
    // Fetch prompt template from Notion
    const promptTemplate = await fetchPromptFromNotion('JD2CV_Full', 'NonWorkExpert')

    // Replace variables in the prompt template
    const customizationPrompt = promptTemplate
      .replace(/\$\{customizedWorkExperience\}/g, customizedWorkExperience)
      .replace(/\$\{classification\}/g, classification)
      .replace(/\$\{focusSection\}/g, focusSection)
      .replace(/\$\{keywordSection\}/g, keywordSection)
      .replace(/\$\{JSON\.stringify\(personalInfo, null, 2\)\}/g, JSON.stringify(personalInfo, null, 2))

    // Use DeepSeek LLM for personal info customization
    const result = await invokeDeepSeek(customizationPrompt, 0.25, 3500)

    try {
      // Try to parse the LLM response as JSON
      const customizedInfo = JSON.parse(result.content.trim())

      // Validate required fields exist
      const requiredFields = ['fullName', 'email', 'phone', 'location', 'linkedin', 'website', 'summary', 'technicalSkills', 'languages', 'education', 'certificates', 'customModules', 'format']
      const hasAllFields = requiredFields.every(field => field in customizedInfo)

      if (hasAllFields) {
        return { content: customizedInfo, tokens: result.tokens }
      } else {
        console.error('Non-Work Expert: Response missing required fields')
        throw new Error('Response missing required fields')
      }

    } catch (parseError) {
      console.error('Non-Work Expert: Failed to parse LLM response as JSON', parseError)
      throw parseError
    }

  } catch (error) {
    console.error('Non-Work Expert Agent error:', error)
    // In test phase, throw error instead of fallback
    throw error
  }
}

// Fallback function for basic customization based on work experience
function performBasicCustomization(personalInfo: any, customizedWorkExperience: string) {
  const customizedInfo = { ...personalInfo }
  const workExpText = customizedWorkExperience.toLowerCase()

  // Customize summary if it exists - match work experience terminology
  if (customizedInfo.summary && customizedInfo.summary.length > 0) {
    customizedInfo.summary = customizedInfo.summary.map((item: string) => {
      if (workExpText.includes('ai') || workExpText.includes('artificial intelligence')) {
        return item.replace(/technology/gi, 'AI technology').replace(/solutions/gi, 'AI-driven solutions')
      }
      if (workExpText.includes('client') || workExpText.includes('customer')) {
        return item.replace(/user/gi, 'client').replace(/customer/gi, 'client')
      }
      return item
    })
  }

  // Prioritize technical skills based on work experience mentions
  if (customizedInfo.technicalSkills && customizedInfo.technicalSkills.length > 0) {
    const prioritizedSkills = [...customizedInfo.technicalSkills]

    // Move skills mentioned in work experience to front
    const relevantSkills = prioritizedSkills.filter(skill => {
      const skillLower = skill.toLowerCase()
      return workExpText.includes(skillLower)
    })

    const otherSkills = prioritizedSkills.filter(skill => !relevantSkills.includes(skill))
    customizedInfo.technicalSkills = [...relevantSkills, ...otherSkills]
  }

  return customizedInfo
}
