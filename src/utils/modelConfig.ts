// Model configuration utility for JD2CV
export interface ModelConfig {
  baseURL?: string
  apiKey: string
  modelName: string
}

export function getModelConfig(model: 'gpt-4' | 'deepseek'): ModelConfig {
  if (model === 'deepseek') {
    return {
      baseURL: 'https://api.deepseek.com/v1',
      apiKey: process.env.DEEPSEEK_API_KEY!,
      modelName: 'deepseek-chat'
    }
  } else {
    return {
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
      modelName: 'gpt-4'
    }
  }
}

export function createOpenAIClient(model: 'gpt-4' | 'deepseek') {
  const config = getModelConfig(model)
  
  // For consistent OpenAI client creation
  const clientConfig: any = {
    apiKey: config.apiKey,
  }
  
  if (config.baseURL) {
    clientConfig.baseURL = config.baseURL
  }
  
  return {
    config: clientConfig,
    modelName: config.modelName
  }
}