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

  // Execute the agent with input
  async execute(input: string): Promise<string> {
    try {
      const chain = this.createChain()
      const response = await chain.invoke({ input })
      return response.content as string
    } catch (error) {
      console.error(`${this.constructor.name} execution error:`, error)
      throw new Error(`Agent execution failed: ${error.message}`)
    }
  }

  // Abstract method for agent-specific logic
  abstract process(input: any): Promise<any>
}