// 优化：语言模板懒加载管理器
// 将大量模板从Store中分离，按需加载

export interface PromptTemplates {
  quick: string
  standard: string
  deep: string
  ask_ai: string
}

export interface PromptTemplatesByLanguagePair {
  [languagePairKey: string]: PromptTemplates
}

// 基础模板 (仅加载最常用的)
const BASE_TEMPLATES: PromptTemplatesByLanguagePair = {
  'english-chinese': {
    quick: `简明扼要讲解 "{text}" in 中文：
1- 单词：原形（若有则讲，若无则不讲），词性，解释
2- 搭配/词组：常用搭配或者词组
3- 典型英文例句：2个
4- 使用方法
5- 1道对"{text}" 掌握情况的Quiz，必须是填空题，格式为:
Question: ...; Answer: ...; Explanation: ...
注意，不要开场白，直接讲内容。`,
    standard: `仔细讲解"{text}"：
1- Basic：单词、搭配，例句2个，简明扼要讲解
2- Advanced：重难点，使用技巧，使用场景，口语/写作等等，你可以选择2-3个讲解，目标是使我能理解和掌握，确保我能灵活运用。 
3- Quiz，1道对"{text}" 掌握情况的填空题，格式为:
Question: ...; Answer: ...; Explanation: ...
注意，不要开场白，直接讲内容。`,
    deep: `深度讲解一下"{text}"，以便我能彻底的完全的掌握：
1- 单词/词组：相对较难的单词/词组，各搭配1个典型例句
2- 句子结构：通俗易懂的剖析句子结构
3- 语法：涉及的语法通俗易懂地、仔细地讲解，每个语法点搭配1个典型
4- Quiz，1道对"{text}" 掌握情况的填空题，格式为:
Question: ...; Answer: ...; Explanation: ...
注意，不要开场白，直接讲内容。`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  }
}

// 模板缓存
const templateCache = new Map<string, PromptTemplates>()

// 生成语言对key
const getLanguagePairKey = (sourceLanguage: string, nativeLanguage: string): string => {
  return `${sourceLanguage}-${nativeLanguage}`
}

// 动态生成模板 (懒加载)
const generateTemplateForLanguagePair = (sourceLanguage: string, nativeLanguage: string): PromptTemplates => {
  // 基于语言类型生成对应模板
  const languageInstructions: Record<string, string> = {
    chinese: '用中文讲解',
    english: 'Explain in English',
    french: 'Expliquer en français',
    japanese: '日本語で説明',
    korean: '한국어로 설명',
    spanish: 'Explicar en español',
    russian: 'Объяснить на русском',
    arabic: 'اشرح بالعربية'
  }

  const nativeInstruction = languageInstructions[nativeLanguage] || `Explain in ${nativeLanguage}`
  const sourceText = sourceLanguage.charAt(0).toUpperCase() + sourceLanguage.slice(1)

  return {
    quick: `${nativeInstruction} "${text}" briefly with practical examples. (Go straight to content)`,
    standard: `${nativeInstruction} "${text}" with examples so I can understand and use flexibly. (Go straight to content)`,
    deep: `${nativeInstruction} "${text}" in depth for complete mastery. Include: examples, usage contexts, grammar. (Go straight to content)`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  }
}

// 获取模板的主要API
export const getPromptTemplates = (sourceLanguage: string, nativeLanguage: string): PromptTemplates => {
  const languagePairKey = getLanguagePairKey(sourceLanguage, nativeLanguage)
  
  // 1. 检查缓存
  if (templateCache.has(languagePairKey)) {
    return templateCache.get(languagePairKey)!
  }

  // 2. 检查基础模板
  if (BASE_TEMPLATES[languagePairKey]) {
    templateCache.set(languagePairKey, BASE_TEMPLATES[languagePairKey])
    return BASE_TEMPLATES[languagePairKey]
  }

  // 3. 动态生成并缓存
  const generatedTemplate = generateTemplateForLanguagePair(sourceLanguage, nativeLanguage)
  templateCache.set(languagePairKey, generatedTemplate)
  
  return generatedTemplate
}

// LocalStorage操作 - 防抖版本
let saveTimeout: NodeJS.Timeout | null = null
const STORAGE_KEY = 'readlingua_prompt_templates_by_language_pair'

export const loadCustomTemplatesFromStorage = (): PromptTemplatesByLanguagePair => {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.warn('Failed to load custom templates from localStorage:', error)
    return {}
  }
}

// 防抖保存到localStorage
export const saveCustomTemplatesToStorage = (templates: PromptTemplatesByLanguagePair) => {
  if (typeof window === 'undefined') return

  // 清除之前的定时器
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  // 300ms防抖
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
    } catch (error) {
      console.warn('Failed to save custom templates to localStorage:', error)
    }
  }, 300)
}

// 更新特定语言对的模板
export const updateTemplateForLanguagePair = (
  sourceLanguage: string, 
  nativeLanguage: string, 
  type: keyof PromptTemplates, 
  template: string
) => {
  const languagePairKey = getLanguagePairKey(sourceLanguage, nativeLanguage)
  
  // 获取当前模板
  let currentTemplates = getPromptTemplates(sourceLanguage, nativeLanguage)
  
  // 更新模板
  const updatedTemplates = {
    ...currentTemplates,
    [type]: template
  }
  
  // 更新缓存
  templateCache.set(languagePairKey, updatedTemplates)
  
  // 保存自定义模板到localStorage
  const customTemplates = loadCustomTemplatesFromStorage()
  customTemplates[languagePairKey] = updatedTemplates
  saveCustomTemplatesToStorage(customTemplates)
  
  return updatedTemplates
}

// 重置模板到默认状态
export const resetTemplateForLanguagePair = (sourceLanguage: string, nativeLanguage: string) => {
  const languagePairKey = getLanguagePairKey(sourceLanguage, nativeLanguage)
  
  // 从缓存中删除
  templateCache.delete(languagePairKey)
  
  // 从localStorage中删除自定义模板
  const customTemplates = loadCustomTemplatesFromStorage()
  delete customTemplates[languagePairKey]
  saveCustomTemplatesToStorage(customTemplates)
  
  // 重新获取默认模板
  return getPromptTemplates(sourceLanguage, nativeLanguage)
}

// 初始化 - 加载自定义模板到缓存
export const initializeTemplateManager = () => {
  const customTemplates = loadCustomTemplatesFromStorage()
  
  // 将localStorage中的自定义模板加载到缓存
  Object.entries(customTemplates).forEach(([key, templates]) => {
    templateCache.set(key, templates)
  })
}