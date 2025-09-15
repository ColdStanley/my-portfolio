import { invokeDeepSeek } from '../utils/deepseekLLM'

// Reviewer Agent - Style Unification and Final Formatting
export async function reviewerAgent(input: {
  workExperience: string;
  personalInfo: any;
  originalPersonalInfo: any;
  jd: { title: string; full_job_description: string };
}): Promise<{ personalInfo: any; workExperience: string }> {

  const { workExperience, personalInfo, originalPersonalInfo, jd } = input

  const reviewPrompt = `
You are a senior resume reviewer and quality assurance expert. Your task is to ensure the customized resume maintains consistency, removes redundancy, and follows ATS-friendly formatting.

Job Description: ${jd.title} - ${jd.full_job_description}

Customized Work Experience:
${workExperience}

Customized Personal Info:
${JSON.stringify(personalInfo, null, 2)}

Your review tasks:
1. **Style Unification**: Ensure consistent tone and language throughout all sections
2. **Redundancy Removal**: Remove duplicate skills, achievements, or keywords
3. **ATS Optimization**: Ensure keywords are naturally integrated and action verbs are strong
4. **Structure Validation**: Maintain the exact JSON structure for personal info
5. **Quality Check**: Verify all claims are backed by measurable outcomes

Guidelines:
- Maintain authenticity - don't add fake achievements
- Keep the same number of bullet points in work experience
- Ensure technical skills list has no duplicates
- Use consistent verb tenses and writing style
- Prioritize most relevant content first

Return a JSON object with this exact structure:
{
  "personalInfo": { /* refined personal info with same structure */ },
  "workExperience": "refined work experience text"
}

Output only valid JSON, no explanations or extra text.
`

  try {
    // Use DeepSeek LLM for final review and unification
    const reviewResponse = await invokeDeepSeek(reviewPrompt, 0.2, 5000)

    try {
      // Try to parse the LLM response as JSON
      const reviewResult = JSON.parse(reviewResponse.trim())

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
          workExperience: reviewResult.workExperience
        }
      } else {
        console.warn('Reviewer Agent: Invalid response structure')
        return performBasicReview(personalInfo, workExperience, originalPersonalInfo)
      }

    } catch (parseError) {
      console.warn('Reviewer Agent: Failed to parse LLM response as JSON')
      return performBasicReview(personalInfo, workExperience, originalPersonalInfo)
    }

  } catch (error) {
    console.error('Reviewer Agent error:', error)
    return performBasicReview(personalInfo, workExperience, originalPersonalInfo)
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