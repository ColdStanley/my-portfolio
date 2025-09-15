import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { createDeepSeekLLM } from '../utils/deepseekLLM'

// Base Agent class for all our specialized agents
export abstract class BaseAgent {
  protected llm: any
  protected systemPrompt: string

  constructor(systemPrompt: string, temperature: number = 0.1, maxTokens: number = 4000) {
    this.llm = createDeepSeekLLM(temperature, maxTokens)
    this.systemPrompt = systemPrompt
  }

  // Create prompt template with system message
  protected createPromptTemplate(): ChatPromptTemplate {
    return ChatPromptTemplate.fromMessages([
      ['system', this.systemPrompt],
      ['human', '{input}']
    ])
  }

  // Create a runnable chain
  protected createChain(): RunnableSequence<any, any> {
    const prompt = this.createPromptTemplate()
    return prompt.pipe(this.llm)
  }

  // Execute the agent with input and return token usage
  async execute(input: string): Promise<{ content: string; tokens: { prompt: number; completion: number; total: number } }> {
    try {
      const chain = this.createChain()
      const response = await chain.invoke({ input })

      // Extract token usage from response if available
      const tokens = {
        prompt: (response as any).response_metadata?.tokenUsage?.promptTokens || 0,
        completion: (response as any).response_metadata?.tokenUsage?.completionTokens || 0,
        total: (response as any).response_metadata?.tokenUsage?.totalTokens || 0
      }

      return {
        content: response.content as string,
        tokens
      }
    } catch (error) {
      console.error(`${this.constructor.name} execution error:`, error)
      throw new Error(`Agent execution failed: ${error.message}`)
    }
  }

  // Abstract method for agent-specific logic
  abstract process(input: any): Promise<any>
}