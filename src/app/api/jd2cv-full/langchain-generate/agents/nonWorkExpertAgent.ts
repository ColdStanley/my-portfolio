import { invokeDeepSeek } from '../utils/deepseekLLM'

// Non-Work Expert Agent - Profile, Skills, Education, Projects Customization
export async function nonWorkExpertAgent(
  jd: { title: string; full_job_description: string },
  personalInfo: any
): Promise<{ content: any; tokens: { prompt: number; completion: number; total: number } }> {

  const customizationPrompt = `
You are a professional resume expert specializing in customizing Profile, Skills, Education, and Projects sections to align with specific job requirements.

JD Title: ${jd.title}
JD Description: ${jd.full_job_description}

Current Personal Information:
${JSON.stringify(personalInfo, null, 2)}

Your tasks:
1. **Profile/Summary**: Rewrite summary bullets to align with JD language and requirements
2. **Technical Skills**: Filter, prioritize, and reorder skills based on JD relevance
3. **Languages**: Keep relevant languages, prioritize those mentioned in JD
4. **Education**: Highlight most relevant education/courses for this role
5. **Certificates**: Prioritize certificates relevant to the JD
6. **Custom Modules**: Adapt any custom sections to be more relevant

Guidelines:
- Maintain authenticity - don't add skills/experience not originally present
- Use JD keywords naturally in summary/descriptions
- Prioritize most relevant items first
- Keep the same JSON structure
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
        return { content: performBasicCustomization(personalInfo, jd), tokens: result.tokens }
      }

    } catch (parseError) {
      console.warn('Non-Work Expert: Failed to parse LLM response as JSON')
      return { content: performBasicCustomization(personalInfo, jd), tokens: result.tokens }
    }

  } catch (error) {
    console.error('Non-Work Expert Agent error:', error)
    return { content: performBasicCustomization(personalInfo, jd), tokens: { prompt: 0, completion: 0, total: 0 } }
  }
}

// Fallback function for basic customization
function performBasicCustomization(personalInfo: any, jd: { title: string; full_job_description: string }) {
  const customizedInfo = { ...personalInfo }
  const jdText = (jd.title + ' ' + jd.full_job_description).toLowerCase()

  // Customize summary if it exists
  if (customizedInfo.summary && customizedInfo.summary.length > 0) {
    customizedInfo.summary = customizedInfo.summary.map((item: string) => {
      if (jdText.includes('ai') || jdText.includes('artificial intelligence')) {
        return item.replace(/technology/gi, 'AI technology').replace(/solutions/gi, 'AI-driven solutions')
      }
      if (jdText.includes('sales')) {
        return item.replace(/delivered/gi, 'sold').replace(/built/gi, 'developed and sold')
      }
      return item
    })
  }

  // Prioritize technical skills based on JD
  if (customizedInfo.technicalSkills && customizedInfo.technicalSkills.length > 0) {
    const prioritizedSkills = [...customizedInfo.technicalSkills]

    // Move relevant skills to front
    const relevantSkills = prioritizedSkills.filter(skill => {
      const skillLower = skill.toLowerCase()
      return jdText.includes(skillLower) ||
             (jdText.includes('python') && skillLower.includes('python')) ||
             (jdText.includes('javascript') && skillLower.includes('javascript')) ||
             (jdText.includes('ai') && (skillLower.includes('ai') || skillLower.includes('machine learning')))
    })

    const otherSkills = prioritizedSkills.filter(skill => !relevantSkills.includes(skill))
    customizedInfo.technicalSkills = [...relevantSkills, ...otherSkills]
  }

  return customizedInfo
}