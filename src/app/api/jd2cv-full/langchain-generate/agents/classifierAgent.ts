import { invokeDeepSeek, invokeDeepSeekStream } from '../utils/deepseekLLM'
import { fetchPromptFromNotion } from '../utils/promptFetcher'

export interface ClassificationResult {
  roleType: string
  keywords: string[]
  insights: string[]
  tokens: { prompt: number; completion: number; total: number }
}

const PROJECT = 'JD2CV_Full'
const PROMPT_AGENT = 'Classifier'

export async function classifierAgent(
  jd: { title: string; full_job_description: string },
  onStreamChunk?: (chunk: string) => void
): Promise<ClassificationResult> {
  const promptTemplate = await fetchPromptFromNotion(PROJECT, PROMPT_AGENT, 'ClassifierAgent')
  const roleTypesRaw = await fetchPromptFromNotion(PROJECT, 'Classifier Role Types', 'ClassifierAgent')

  // Parse role types array
  let roleTypesList: string
  try {
    const roleTypesArray = JSON.parse(roleTypesRaw)
    if (!Array.isArray(roleTypesArray)) {
      throw new Error('Role types data is not an array')
    }
    roleTypesList = roleTypesArray.join(', ')
  } catch (error) {
    console.error('ClassifierAgent failed to parse role types:', error)
    throw new Error('Invalid role types data format')
  }

  const filledPrompt = promptTemplate
    .replace(/\$\{jd\.title\}/g, jd.title)
    .replace(/\$\{jd\.full_job_description\}/g, jd.full_job_description)
    .replace(/\$\{roleTypesList\}/g, roleTypesList)

  const result = onStreamChunk
    ? await invokeDeepSeekStream(filledPrompt, onStreamChunk, 0.1, 1800)
    : await invokeDeepSeek(filledPrompt, 0.1, 1800)

  const parsed = parseClassifierResponse(result.content)

  return {
    roleType: parsed.role_type,
    keywords: parsed.keywords,
    insights: parsed.insights,
    tokens: result.tokens
  }
}

type ClassifierPayload = {
  role_type: string
  keywords: string[]
  insights: string[]
}

function parseClassifierResponse(content: string): ClassifierPayload {
  const cleaned = content.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '')

  try {
    const data = JSON.parse(cleaned)

    if (!data || typeof data !== 'object') {
      throw new Error('Classifier returned non-object payload')
    }

    if (typeof data.role_type !== 'string' || !data.role_type) {
      throw new Error('Classifier payload missing role_type')
    }

    if (!Array.isArray(data.keywords)) {
      throw new Error('Classifier payload missing keywords array')
    }

    if (!Array.isArray(data.insights)) {
      throw new Error('Classifier payload missing insights array')
    }

    return {
      role_type: data.role_type.trim(),
      keywords: data.keywords.map((k: any) => String(k).trim()).filter(Boolean),
      insights: data.insights.map((i: any) => String(i).trim()).filter(Boolean)
    }
  } catch (error) {
    console.error('ClassifierAgent failed to parse response:', error)
    console.error('ClassifierAgent raw content preview:', cleaned.slice(0, 200))
    throw new Error('ClassifierAgent returned invalid JSON payload')
  }
}
