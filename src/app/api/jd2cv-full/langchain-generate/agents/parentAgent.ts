import { BaseAgent } from './baseAgent'
import { invokeDeepSeek, invokeDeepSeekStream } from '../utils/deepseekLLM'

// Helper function to fetch prompt from Notion
async function fetchPromptFromNotion(project: string, agent: string): Promise<string> {
  console.log(`[ParentAgent] 🔄 Fetching prompt from Notion: ${project}:${agent}`)

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/prompt-manager-notion?project=${project}&agent=${agent}`)

  if (!response.ok) {
    console.error(`[ParentAgent] ❌ Failed to fetch prompt: ${response.status}`)
    throw new Error(`Failed to fetch prompt for ${project}:${agent} - ${response.status}`)
  }

  const data = await response.json()
  console.log(`[ParentAgent] ✅ Successfully fetched prompt (version: ${data.version})`)
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
    console.log(`[ParentAgent] 🚀 Initializing Parent Agent`)
    this.systemPrompt = await fetchPromptFromNotion('JD2CV_Full', 'Parent')

    // Replace the VALID_ROLES placeholder if it exists in the prompt
    const originalLength = this.systemPrompt.length
    this.systemPrompt = this.systemPrompt.replace('${VALID_ROLES}', VALID_ROLES.join(', '))

    if (this.systemPrompt.length !== originalLength) {
      console.log(`[ParentAgent] 🔄 Replaced VALID_ROLES placeholder with ${VALID_ROLES.length} roles`)
    }
    console.log(`[ParentAgent] ✅ Initialization complete, prompt length: ${this.systemPrompt.length}`)
  }

  async process(jd: { title: string; full_job_description: string }, onStreamChunk?: (chunk: string) => void): Promise<ParentAgentOutput> {
    console.log(`[ParentAgent] 🔄 Processing JD: ${jd.title}`)

    // Ensure prompt is loaded
    if (!this.systemPrompt) {
      console.log(`[ParentAgent] ⚠️ Prompt not loaded, initializing...`)
      await this.initialize()
    }

    const input = `Job Title: ${jd.title}\nJob Description:\n${jd.full_job_description}\n`
    console.log(`[ParentAgent] 📤 Sending to DeepSeek, input length: ${input.length}`)

    try {
      // Use streaming if callback provided, otherwise use regular DeepSeek
      const result = onStreamChunk
        ? await invokeDeepSeekStream(
            `${this.systemPrompt}\n\n${input}`,
            (chunk: string) => {
              console.log(`[ParentAgent] 📝 Streaming chunk: ${chunk.slice(0, 30)}...`)
              onStreamChunk(chunk)
            },
            0.15,
            2200
          )
        : await invokeDeepSeek(
            `${this.systemPrompt}\n\n${input}`,
            0.15,
            2200
          )
      console.log(`[ParentAgent] 📥 DeepSeek response received, tokens: ${JSON.stringify(result.tokens)}`)

      const parsed = this.parseResponse(result.content)
      console.log(`[ParentAgent] 🔄 Parsed response: ${parsed.classification}, ${parsed.focus_points?.length || 0} focus points, ${parsed.keywords?.length || 0} keywords`)

      const classification = this.sanitiseClassification(parsed.classification, jd)
      console.log(`[ParentAgent] ✅ Final classification: ${classification}`)

      return {
        classification,
        focusPoints: parsed.focus_points,
        keywords: parsed.keywords,
        keySentences: parsed.key_sentences,
        tokens: result.tokens
      }
    } catch (error) {
      console.error('[ParentAgent] ❌ LangChain execution error:', error)
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
export async function parentAgent(
  jd: { title: string; full_job_description: string },
  onStreamChunk?: (chunk: string) => void
): Promise<ParentAgentOutput> {
  console.log(`[ParentAgent] 🎯 Starting Parent Agent workflow for: ${jd.title}`)
  const agent = new ParentAgent()
  await agent.initialize()
  const result = await agent.process(jd, onStreamChunk)
  console.log(`[ParentAgent] 🏁 Parent Agent workflow completed successfully`)
  return result
}
