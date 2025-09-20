import { BaseAgent } from './baseAgent'
import { invokeDeepSeek } from '../utils/deepseekLLM'

// Helper function to fetch prompt from Notion
async function fetchPromptFromNotion(project: string, agent: string): Promise<string> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/prompt-manager-notion?project=${project}&agent=${agent}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch prompt for ${project}:${agent} - ${response.status}`)
  }

  const data = await response.json()
  return data.promptContent
}

type ParentAgentResponse = {
  classification: string
  focus_points: string[]
  keywords: string[]
  key_sentences: string[]
}

const VALID_ROLES = [
  'Sales',
  'Business Development',
  'Technical Account Manager',
  'AI Solution',
  'Partnerships Alliance Manager',
  'Project Manager',
  'Key/Named Account Manager',
  'Customer/Client Success',
  'Solution - General'
]

// Parent Agent for Role Classification using LangChain
class ParentAgent extends BaseAgent {
  private systemPrompt: string = ''

  constructor() {
    super('', 0.1, 1500) // Initialize with empty prompt
  }

  async initialize() {
    this.systemPrompt = await fetchPromptFromNotion('JD2CV_Full', 'Parent')
    // Replace the VALID_ROLES placeholder if it exists in the prompt
    this.systemPrompt = this.systemPrompt.replace('${VALID_ROLES}', VALID_ROLES.join(', '))
  }

  async process(jd: { title: string; full_job_description: string }): Promise<ParentAgentOutput> {
    // Ensure prompt is loaded
    if (!this.systemPrompt) {
      await this.initialize()
    }

    const input = `Job Title: ${jd.title}\nJob Description:\n${jd.full_job_description}\n`

    try {
      const result = await invokeDeepSeek(
        `${this.systemPrompt}\n\n${input}`,
        0.15,
        2200
      )
      const parsed = this.parseResponse(result.content)
      const classification = this.sanitiseClassification(parsed.classification, jd)

      return {
        classification,
        focusPoints: parsed.focus_points,
        keywords: parsed.keywords,
        keySentences: parsed.key_sentences,
        tokens: result.tokens
      }
    } catch (error) {
      console.error('Parent Agent LangChain execution error:', error)
      return this.fallbackOutput(jd)
    }
  }

  private parseResponse(content: string): ParentAgentResponse {
    try {
      const cleaned = content
        .trim()
        .replace(/```json/gi, '')
        .replace(/```/g, '')
      const parsed = JSON.parse(cleaned) as Partial<ParentAgentResponse>
      return {
        classification: parsed.classification || '',
        focus_points: Array.isArray(parsed.focus_points) ? parsed.focus_points.filter(Boolean) : [],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.filter(Boolean) : [],
        key_sentences: Array.isArray(parsed.key_sentences) ? parsed.key_sentences.filter(Boolean) : []
      }
    } catch (error) {
      console.warn('Parent Agent: Failed to parse JSON response. Raw content:', content)
      return { classification: '', focus_points: [], keywords: [], key_sentences: [] }
    }
  }

  private sanitiseClassification(classification: string, jd: { title: string; full_job_description: string }): string {
    const cleaned = classification?.trim()
    if (VALID_ROLES.includes(cleaned)) {
      return cleaned
    }

    for (const role of VALID_ROLES) {
      if (cleaned.toLowerCase().includes(role.toLowerCase())) {
        return role
      }
    }

    return this.fallbackClassification(jd)
  }

  private fallbackOutput(jd: { title: string; full_job_description: string }): ParentAgentOutput {
    const classification = this.fallbackClassification(jd)
    const fallbackFocus = this.generateFallbackFocus(jd.full_job_description)

    return {
      classification,
      focusPoints: fallbackFocus.focusPoints,
      keywords: fallbackFocus.keywords,
      keySentences: fallbackFocus.keySentences,
      tokens: { prompt: 0, completion: 0, total: 0 }
    }
  }

  private fallbackClassification(jd: { title: string; full_job_description: string }): string {
    const text = (jd.title + ' ' + jd.full_job_description).toLowerCase()

    if (text.includes('sales') || text.includes('revenue') || text.includes('quota')) {
      return 'Sales'
    } else if (text.includes('business development') || text.includes('partnership') || text.includes('alliance')) {
      return 'Business Development'
    } else if (text.includes('technical account') || text.includes('tam')) {
      return 'Technical Account Manager'
    } else if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('machine learning')) {
      return 'AI Solution'
    } else if (text.includes('project') || text.includes('program') || text.includes('delivery')) {
      return 'Project Manager'
    } else if (text.includes('key account') || text.includes('named account') || text.includes('enterprise account')) {
      return 'Key/Named Account Manager'
    } else if (text.includes('customer success') || text.includes('client success') || text.includes('customer experience')) {
      return 'Customer/Client Success'
    } else if (text.includes('solution') || text.includes('architect') || text.includes('engineer') || text.includes('consultant')) {
      return 'Solution - General'
    } else {
      return 'Sales'
    }
  }

  private generateFallbackFocus(description: string) {
    const rawSentences = description.split(/\n|\.|\r|\!|\?/).map(s => s.trim())
    const filteredSentences = rawSentences.filter(sentence => {
      if (!sentence) return false
      const lower = sentence.toLowerCase()
      if (lower.length < 12) return false
      if (/(about the (job|role)|who we are|responsibilities|qualifications)/i.test(lower) && lower.split(' ').length <= 4) {
        return false
      }
      return true
    })

    const focusPoints = filteredSentences.slice(0, 3)

    const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'will', 'your', 'about', 'role', 'job', 'are', 'our', 'you', 'we'])
    const keywords = Array.from(
      new Set(
        (description.match(/[A-Za-z0-9\+#\.\-/]{3,}/g) || [])
          .map(token => token.toLowerCase())
          .filter(token => !stopWords.has(token) && token.length > 2)
      )
    ).slice(0, 10)

    return {
      focusPoints,
      keywords,
      keySentences: filteredSentences.slice(0, 2)
    }
  }
}

type ParentAgentOutput = {
  classification: string
  focusPoints: string[]
  keywords: string[]
  keySentences: string[]
  tokens: { prompt: number; completion: number; total: number }
}

// Export function interface for compatibility
export async function parentAgent(jd: { title: string; full_job_description: string }): Promise<ParentAgentOutput> {
  const agent = new ParentAgent()
  await agent.initialize()
  return await agent.process(jd)
}
