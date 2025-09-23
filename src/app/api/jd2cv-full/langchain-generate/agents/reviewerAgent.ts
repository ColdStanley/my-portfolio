import { invokeDeepSeek, invokeDeepSeekStream } from '../utils/deepseekLLM'
import { fetchPromptFromNotion } from '../utils/promptFetcher'
import type { ClassificationResult } from './classifierAgent'

// Robust JSON parsing function that handles LLM responses with extra text
function parseJsonFromLLMResponse(content: string): any {
  const raw = content.trim()
  const withoutCodeBlocks = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

  const candidates: string[] = []
  let depth = 0
  let startIndex: number | null = null

  for (let i = 0; i < withoutCodeBlocks.length; i++) {
    const char = withoutCodeBlocks[i]
    if (char === '{') {
      if (depth === 0) {
        startIndex = i
      }
      depth += 1
    } else if (char === '}') {
      depth -= 1
      if (depth === 0 && startIndex != null) {
        candidates.push(withoutCodeBlocks.slice(startIndex, i + 1))
        startIndex = null
      }
    }
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object' && 'workExperience' in parsed && 'personalInfo' in parsed) {
        return parsed
      }
    } catch (error) {
      continue
    }
  }

  console.warn('Failed to parse JSON from LLM response. Preview:', withoutCodeBlocks.slice(0, 200) + '...')
  throw new Error('ReviewerAgent expected JSON but did not receive a valid payload')
}

// Reviewer Agent - Work Experience Review Only (Profile Preserved)
export async function reviewerAgent(input: {
  workExperience: string;
  personalInfo: any;
  originalPersonalInfo: any;
  jd: { title: string; full_job_description: string };
  classification: ClassificationResult;
  onStreamChunk?: (chunk: string) => void; // Optional streaming callback
}): Promise<{ personalInfo: any; workExperience: string; tokens: { prompt: number; completion: number; total: number } }> {

  console.log(`[ReviewerAgent] 🎯 Starting Reviewer Agent for: ${input.jd.title} (Profile-Optimizing Mode)`)
  console.log(`[ReviewerAgent] 📋 Role Type: ${input.classification.roleType}`)
  console.log(`[ReviewerAgent] 👤 Profile Enhancement: Technical skills and custom modules will be optimized`)

  const { workExperience, personalInfo, originalPersonalInfo, jd, classification, onStreamChunk } = input

  const insightSummary = classification.insights.length
    ? classification.insights.slice(0, 5).map((point, idx) => `${idx + 1}. ${point}`).join('\n')
    : 'No additional insights provided.'

  const keywordList = classification.keywords.length
    ? classification.keywords.slice(0, 10).join(', ')
    : 'N/A'

  console.log(`[ReviewerAgent] 🔢 Variables prepared: ${classification.insights.length} insights, ${classification.keywords.length} keywords`)
  console.log(`[ReviewerAgent] 📄 Work experience length: ${workExperience.length}`)

  try {
    // Fetch prompt template and profile data from Notion
    const promptTemplate = await fetchPromptFromNotion('JD2CV_Full', 'Reviewer', 'ReviewerAgent')
    const profileDataRaw = await fetchPromptFromNotion('JD2CV_Full', 'Profile', 'ReviewerAgent')

    // Parse profile data
    let profileData: any
    try {
      const profileParsed = JSON.parse(profileDataRaw)
      if (!profileParsed || !profileParsed['jd2cv-v2-personal-info']) {
        throw new Error('Profile data missing jd2cv-v2-personal-info')
      }
      profileData = profileParsed['jd2cv-v2-personal-info']
    } catch (error) {
      console.error('ReviewerAgent failed to parse profile data:', error)
      throw new Error('Invalid profile data format')
    }

    // Replace variables in the prompt template for profile optimization
    console.log(`[ReviewerAgent] 🔄 Preparing profile optimization prompt`)
    const reviewPrompt = promptTemplate
      .replace(/\$\{classifier\.role_type\}/g, classification.roleType)
      .replace(/\$\{classifier\.keywords\}/g, classification.keywords.join(', '))
      .replace(/\$\{classifier\.insights\}/g, classification.insights.join('\n'))
      .replace(/\$\{JSON\.stringify\(personalInfo, null, 2\)\}/g, JSON.stringify(profileData, null, 2))
      .replace(/\$\{workExperience\}/g, workExperience)

    console.log(`[ReviewerAgent] 📤 Sending profile for optimization, prompt length: ${reviewPrompt.length}`)

    // Use streaming if callback provided, otherwise use regular DeepSeek
    const result = onStreamChunk
      ? await invokeDeepSeekStream(
          reviewPrompt,
          onStreamChunk,
          0.2,
          5000
        )
      : await invokeDeepSeek(reviewPrompt, 0.2, 5000)

    console.log(`[ReviewerAgent] 📥 Profile optimization completed, tokens: ${JSON.stringify(result.tokens)}`)

    console.log(`[ReviewerAgent] 🔄 Parsing profile optimization response`)
    const reviewResult = parseJsonFromLLMResponse(result.content)

    if (!reviewResult.personalInfo) {
      console.error('[ReviewerAgent] ❌ No personalInfo in response payload')
      throw new Error('Invalid response structure - missing personalInfo')
    }

    if (!reviewResult.workExperience) {
      console.error('[ReviewerAgent] ❌ No workExperience in response payload')
      throw new Error('Invalid response structure - missing workExperience')
    }

    console.log(`[ReviewerAgent] ✅ Reviewer Agent completed successfully`)
    console.log(`[ReviewerAgent] 📊 Final result: optimized profile and preserved workExperience (length: ${reviewResult.workExperience.length})`)

    return {
      personalInfo: reviewResult.personalInfo,
      workExperience: reviewResult.workExperience,
      tokens: result.tokens
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[ReviewerAgent] ❌ Reviewer Agent error for JD "${jd.title}": ${message}`)
    throw error
  }
}
