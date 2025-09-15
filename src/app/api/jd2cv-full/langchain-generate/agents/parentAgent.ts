import { BaseAgent } from './baseAgent'

// Parent Agent for Role Classification using LangChain
class ParentAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `
You are an expert job role classifier. Your task is to analyze job descriptions and classify them into ONE of these 9 specific role categories:

1. Sales
2. Business Development
3. Technical Account Manager
4. AI Solution
5. Partnerships Alliance Manager
6. Project Manager
7. Key/Named Account Manager
8. Customer/Client Success
9. Solution - General

Guidelines:
- Focus on the primary responsibilities, required skills, and key focus areas
- Consider the job title and main duties described
- If multiple categories could apply, choose the most dominant one
- Respond with ONLY the exact role category name (no explanations)

Examples:
- "Account Executive" → "Sales"
- "Partnership Manager" → "Partnerships Alliance Manager"
- "Customer Success Manager" → "Customer/Client Success"
- "Solution Architect" → "Solution - General"
- "Solutions Engineer" → "Solution - General"
`
    super(systemPrompt, 0.1, 1000)
  }

  async process(jd: { title: string; full_job_description: string }): Promise<{ classification: string; tokens: { prompt: number; completion: number; total: number } }> {
    const input = `
Job Title: ${jd.title}
Job Description: ${jd.full_job_description}

Classify this job into one of the 8 categories.
`

    try {
      const result = await this.execute(input)

      // Validate the response
      const validRoles = [
        'Sales', 'Business Development', 'Technical Account Manager',
        'AI Solution', 'Partnerships Alliance Manager', 'Project Manager',
        'Key/Named Account Manager', 'Customer/Client Success', 'Solution - General'
      ]

      const cleanedClassification = result.content.trim()
      if (validRoles.includes(cleanedClassification)) {
        return { classification: cleanedClassification, tokens: result.tokens }
      }

      // Try partial matching
      for (const role of validRoles) {
        if (cleanedClassification.toLowerCase().includes(role.toLowerCase())) {
          return { classification: role, tokens: result.tokens }
        }
      }

      console.warn('Parent Agent: Invalid classification response:', cleanedClassification)
      return { classification: this.fallbackClassification(jd), tokens: result.tokens }

    } catch (error) {
      console.error('Parent Agent LangChain execution error:', error)
      return { classification: this.fallbackClassification(jd), tokens: { prompt: 0, completion: 0, total: 0 } }
    }
  }

  // Fallback classification using keywords
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
      return 'Sales' // Default fallback
    }
  }
}

// Export function interface for compatibility
export async function parentAgent(jd: { title: string; full_job_description: string }): Promise<{ classification: string; tokens: { prompt: number; completion: number; total: number } }> {
  const agent = new ParentAgent()
  return await agent.process(jd)
}