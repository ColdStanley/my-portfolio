// Dynamic Prompt Generator based on Native and Target Languages
import { LanguageConfig, SupportedLanguage, getLanguageName } from '../config/languageConfig'

export interface PromptTemplates {
  wordAnalysis: string
  phraseAnalysis: string
  grammarAnalysis: string
}

// Get prompt templates based on native language
export function getPromptTemplates(config: LanguageConfig): PromptTemplates {
  const { native, target } = config
  const targetLangName = getLanguageName(target, native)
  const nativeLangName = getLanguageName(native, native)
  
  switch (native) {
    case 'chinese':
      return {
        wordAnalysis: `请用简洁易懂的方式解释这个${targetLangName}单词 "{word}" 在句子 "{sentence}" 中的意思和用法，请使用Markdown格式回答。

请按照以下结构回答，并确保每一项都非常简短、清晰：

**词性和含义**
• 词性：[动词/名词/形容词等]
• 中文解释：[1句话，告诉我这个词在句中是什么意思]

**用法说明**
• 语法作用：[最多2句话，说明它在语法上起什么作用]

**例句示范**
• ${targetLangName}例句：[1个简单例句]
• 中文翻译：[对应翻译]

不要添加过多术语或语法细节。风格要温和、简洁，适合${targetLangName}初学者阅读。`,

        phraseAnalysis: `请你帮助我学习下面这句${targetLangName}中的重要词组。  
我的${targetLangName}水平是初学者，所以请你讲解得简单、清晰，避免用太复杂的语法术语或长难句。

句子是：  
"{sentence}"

请你找出其中2–4个最有代表性的${targetLangName}**词组（2词以上）**，然后按以下结构逐个解释：

1. 词组原文（如：${target === 'french' ? 'passer maître dans...' : 'example phrase'}）
2. 中文意思（用一句话简单解释）
3. 用法说明（最多两句话，说明它在句中做什么，不要太术语化）
4. 简单例句（3个简单的${targetLangName}句子 + 中文翻译）
5. 联想记忆建议（可选，给出记忆方法或小贴士）

请按以上格式分别列出每个词组的讲解。`,

        grammarAnalysis: `请用适合${targetLangName}初学者的方式，分析这句话的语法结构：

"{sentence}"

请按照以下结构回答，每一项都要简洁清晰，不要使用太多专业术语：

1. 这句话的整体结构是什么？  
   → 分成几个部分？（比如主句 / 从句 / 插入语等）

2. 这句话用了哪些时态？  
   → 每个时态表示什么时间概念？为什么用它？

3. 表达的逻辑关系是什么？  
   → 是让步？假设？对比？因果？

4. 每部分各自说了什么？  
   → 用通俗中文逐句解释

5. 有哪些${targetLangName}初学者常犯的错误？  
   → 这句话中哪些地方容易误解或误用？

请不要解释词汇、不要展示太难的语法规则，只关注整个句子"怎么组织"的逻辑。`
      }



    default:
      // Fallback to Chinese (only supported native language)
      return getPromptTemplates({ ...config, native: 'chinese' })
  }
}

// Generate specific prompt for word analysis
export function generateWordPrompt(config: LanguageConfig, word: string, sentence: string): string {
  const templates = getPromptTemplates(config)
  return templates.wordAnalysis
    .replace(/\{word\}/g, word)
    .replace(/\{sentence\}/g, sentence)
}

// Generate specific prompt for phrase analysis
export function generatePhrasePrompt(config: LanguageConfig, sentence: string): string {
  const templates = getPromptTemplates(config)
  return templates.phraseAnalysis
    .replace(/\{sentence\}/g, sentence)
}

// Generate specific prompt for grammar analysis
export function generateGrammarPrompt(config: LanguageConfig, sentence: string): string {
  const templates = getPromptTemplates(config)
  return templates.grammarAnalysis
    .replace(/\{sentence\}/g, sentence)
}