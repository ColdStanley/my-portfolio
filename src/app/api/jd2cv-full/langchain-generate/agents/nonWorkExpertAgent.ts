import { invokeDeepSeek } from '../utils/deepseekLLM'
import type { ParentInsights } from './roleExpertAgent'

// Helper function to fetch prompt from Notion
async function fetchPromptFromNotion(project: string, agent: string): Promise<string> {
  console.log(`[NonWorkExpertAgent] 🔄 Fetching prompt from Notion: ${project}:${agent}`)

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/prompt-manager-notion?project=${project}&agent=${agent}`)

  if (!response.ok) {
    console.error(`[NonWorkExpertAgent] ❌ Failed to fetch prompt: ${response.status}`)
    throw new Error(`Failed to fetch prompt for ${project}:${agent} - ${response.status}`)
  }

  const data = await response.json()
  console.log(`[NonWorkExpertAgent] ✅ Successfully fetched prompt (version: ${data.version})`)
  return data.promptContent
}

// Non-Work Expert Agent - Profile Analysis (Read-Only)
export async function nonWorkExpertAgent(
  customizedWorkExperience: string,
  personalInfo: any,
  parentInsights: ParentInsights
): Promise<{ content: any; tokens: { prompt: number; completion: number; total: number } }> {

  console.log(`[NonWorkExpertAgent] 🎯 Starting Non-Work Expert Agent (Read-Only Mode)`)
  console.log(`[NonWorkExpertAgent] 📋 Classification: ${parentInsights.classification}`)
  console.log(`[NonWorkExpertAgent] 📄 Work experience length: ${customizedWorkExperience.length}`)
  console.log(`[NonWorkExpertAgent] 👤 Profile preserved: User input will not be modified`)

  // NonWorkExpertAgent now operates in read-only mode
  // It analyzes the personalInfo for consistency with work experience but does not modify it
  // The original personalInfo is returned unchanged to preserve user input

  const { classification, focusPoints, keywords } = parentInsights

  console.log(`[NonWorkExpertAgent] 🔢 Analysis prepared: ${focusPoints.length} focus points, ${keywords.length} keywords`)
  console.log(`[NonWorkExpertAgent] ✅ Profile analysis completed - Original profile preserved`)

  // Return original personalInfo unchanged with minimal token usage
  return {
    content: personalInfo,
    tokens: { prompt: 0, completion: 0, total: 0 }
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
