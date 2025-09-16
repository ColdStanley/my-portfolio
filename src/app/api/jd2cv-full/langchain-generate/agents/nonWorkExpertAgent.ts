import { invokeDeepSeek } from '../utils/deepseekLLM'

// Non-Work Expert Agent - Profile, Skills, Education, Projects Customization
export async function nonWorkExpertAgent(
  customizedWorkExperience: string,
  personalInfo: any
): Promise<{ content: any; tokens: { prompt: number; completion: number; total: number } }> {

  const customizationPrompt = `
You are a professional resume expert specializing in customizing Profile, Skills, Education, and Projects sections to align with the work experience style and terminology.

Customized Work Experience Content:
${customizedWorkExperience}

Current Personal Information:
${JSON.stringify(personalInfo, null, 2)}

Your tasks:
1. **Profile/Summary**: Adjust summary bullets to match the language style and terminology used in the work experience above
2. **Technical Skills**: Prioritize and reorder skills that are mentioned or implied in the work experience content
3. **Languages**: Keep relevant languages, prioritize those that align with the work experience context
4. **Education**: Highlight education/courses that complement the work experience narrative
5. **Certificates**: Prioritize certificates that support the work experience claims
6. **Custom Modules**: Adapt any custom sections to maintain consistency with work experience tone

STRICT Guidelines:
- NEVER add skills, languages, education, or certificates not originally present in the personal information
- Only reorder, rephrase, or prioritize existing content
- Match the professional tone and terminology style from the work experience
- Keep the exact same JSON structure
- Ensure all output fits the existing localStorage format

Return the customized personal information in the exact same JSON structure as provided above. Output only valid JSON, no explanations or extra text.
`

  try {
    // Use DeepSeek LLM for personal info customization
    const result = await invokeDeepSeek(customizationPrompt, 0.3, 4000)

    try {
      // Try to parse the LLM response as JSON
      const customizedInfo = JSON.parse(result.content.trim())

      // Validate required fields exist
      const requiredFields = ['fullName', 'email', 'phone', 'location', 'linkedin', 'website', 'summary', 'technicalSkills', 'languages', 'education', 'certificates', 'customModules', 'format']
      const hasAllFields = requiredFields.every(field => field in customizedInfo)

      if (hasAllFields) {
        return { content: customizedInfo, tokens: result.tokens }
      } else {
        console.warn('Non-Work Expert: Response missing required fields')
        return { content: performBasicCustomization(personalInfo, customizedWorkExperience), tokens: result.tokens }
      }

    } catch (parseError) {
      console.warn('Non-Work Expert: Failed to parse LLM response as JSON')
      return { content: performBasicCustomization(personalInfo, customizedWorkExperience), tokens: result.tokens }
    }

  } catch (error) {
    console.error('Non-Work Expert Agent error:', error)
    return { content: performBasicCustomization(personalInfo, customizedWorkExperience), tokens: { prompt: 0, completion: 0, total: 0 } }
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