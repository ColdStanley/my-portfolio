import { invokeDeepSeek, invokeDeepSeekStream } from '../utils/deepseekLLM'
import { fetchPromptFromNotion } from '../utils/promptFetcher'
import type { ClassificationResult } from './classifierAgent'

const PROJECT = 'JD2CV_Full'
const PROMPT_AGENT = 'Experience Generator'
const TEMPLATE_AGENT = 'Experience Generator Template'

interface ExperienceGeneratorResult {
  workExperience: string
  tokens: { prompt: number; completion: number; total: number }
}

type TemplateMap = Record<string, string>

export async function experienceGeneratorAgent(
  classification: ClassificationResult,
  onStreamChunk?: (chunk: string) => void
): Promise<ExperienceGeneratorResult> {
  const promptTemplate = await fetchPromptFromNotion(PROJECT, PROMPT_AGENT, 'ExperienceGeneratorAgent')
  const templateMap = await loadTemplateMap()

  const roleKey = normaliseRoleKey(classification.roleType)
  let templateForRole = templateMap[roleKey]
  if (!templateForRole) {
    const fallback = templateMap['Default'] || templateMap['General']
    if (fallback) {
      console.warn(`ExperienceGeneratorAgent falling back to default template for role "${classification.roleType}"`)
      templateForRole = fallback
    }
  }

  if (!templateForRole) {
    throw new Error(`ExperienceGeneratorAgent could not find template for role "${classification.roleType}"`)
  }

  const filledPrompt = promptTemplate
    .replace(/\$\{classifier\.role_type\}/g, classification.roleType)
    .replace(/\$\{classifier\.keywords\}/g, classification.keywords.join(', '))
    .replace(/\$\{classifier\.insights\}/g, classification.insights.join('\n'))
    .replace(/\$\{template\.content\}/g, templateForRole)

  const result = onStreamChunk
    ? await invokeDeepSeekStream(filledPrompt, onStreamChunk, 0.2, 5200)
    : await invokeDeepSeek(filledPrompt, 0.2, 5200)

  const workExperience = extractWorkExperience(result.content)

  return {
    workExperience,
    tokens: result.tokens
  }
}

async function loadTemplateMap(): Promise<TemplateMap> {
  const raw = await fetchPromptFromNotion(PROJECT, TEMPLATE_AGENT, 'ExperienceGeneratorAgent')

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Template payload is not an object')
    }
    return parsed as TemplateMap
  } catch (error) {
    console.error('ExperienceGeneratorAgent failed to parse template map:', error)
    throw new Error('Experience Generator Template must be valid JSON object')
  }
}

function extractWorkExperience(content: string): string {
  const cleaned = content.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '')

  try {
    const parsed = JSON.parse(cleaned)
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Experience generator payload is not an object')
    }

    if (typeof parsed.workExperience !== 'string' || !parsed.workExperience.trim()) {
      throw new Error('Experience generator payload missing workExperience string')
    }

    return parsed.workExperience.trim()
  } catch (error) {
    console.error('ExperienceGeneratorAgent failed to parse response:', error)
    console.error('ExperienceGeneratorAgent raw content preview:', cleaned.slice(0, 200))
    throw new Error('ExperienceGeneratorAgent returned invalid JSON payload')
  }
}

function normaliseRoleKey(roleType: string) {
  return roleType.trim()
}
