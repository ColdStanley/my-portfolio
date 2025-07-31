// Model configuration utility for JD2CV and Language Reading
export interface ModelConfig {
  baseURL?: string
  apiKey: string
  modelName: string
}

export interface DynamicPromptConfig {
  learningLanguage: string  // Language being learned (for content analysis)
  nativeLanguage: string    // Native language (for prompt template)
  analysisMode: 'mark' | 'simple' | 'deep' | 'grammar' | 'ask-ai'
  contentType: 'word' | 'sentence'
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

// Dynamic prompt generation based on language and analysis mode
export function generateDynamicPrompt(
  selectedText: string,
  contextSentence: string,
  config: DynamicPromptConfig
): string {
  const { learningLanguage, nativeLanguage, analysisMode, contentType } = config
  
  // Language-specific base instructions
  const languageInstructions = {
    english: {
      word: "Analyze this English word/phrase",
      sentence: "Analyze this English sentence",
      contextIntro: "Context sentence:"
    },
    french: {
      word: "Analysez ce mot/expression français(e)",
      sentence: "Analysez cette phrase française", 
      contextIntro: "Phrase de contexte:"
    },
    spanish: {
      word: "Analiza esta palabra/frase en español",
      sentence: "Analiza esta oración en español",
      contextIntro: "Oración de contexto:"
    },
    german: {
      word: "Analysiere dieses deutsche Wort/diese Phrase",
      sentence: "Analysiere diesen deutschen Satz",
      contextIntro: "Kontext-Satz:"
    },
    chinese: {
      word: "分析这个中文词汇/短语",
      sentence: "分析这个中文句子",
      contextIntro: "语境句子："
    }
  }

  const langConfig = languageInstructions[learningLanguage as keyof typeof languageInstructions] || languageInstructions.english

  // Base prompt with selected text and context
  let basePrompt = `${langConfig[contentType]}: "${selectedText}"\n\n`
  if (contextSentence && contextSentence !== selectedText) {
    basePrompt += `${langConfig.contextIntro} "${contextSentence}"\n\n`
  }

  // Analysis mode specific prompts (use native language for prompt template)
  switch (analysisMode) {
    case 'simple':
      return basePrompt + getPromptConfig(nativeLanguage, 'simple')
    
    case 'deep':
      return basePrompt + getPromptConfig(nativeLanguage, 'deep')
    
    case 'grammar':
      return basePrompt + getPromptConfig(nativeLanguage, 'grammar')
    
    case 'mark':
      // Mark mode doesn't use AI analysis, return empty prompt
      return ''
    
    default:
      return basePrompt + getPromptConfig(nativeLanguage, 'simple')
  }
}

function getSimpleAnalysisPrompt(language: string): string {
  const prompts = {
    english: `Please provide a clear and concise analysis including:
1. Definition and meaning
2. Part of speech
3. Common usage examples
4. Any important notes about usage

Keep the response focused and practical for language learners.`,
    
    french: `Veuillez fournir une analyse claire et concise incluant:
1. Définition et signification
2. Classe grammaticale
3. Exemples d'usage courants
4. Notes importantes sur l'utilisation

Gardez la réponse focalisée et pratique pour les apprenants.`,
    
    spanish: `Por favor proporciona un análisis claro y conciso incluyendo:
1. Definición y significado
2. Categoría gramatical
3. Ejemplos de uso comunes
4. Notas importantes sobre el uso

Mantén la respuesta enfocada y práctica para estudiantes.`,
    
    german: `Bitte geben Sie eine klare und prägnante Analyse an, einschließlich:
1. Definition und Bedeutung
2. Wortart
3. Häufige Verwendungsbeispiele
4. Wichtige Hinweise zur Verwendung

Halten Sie die Antwort fokussiert und praktisch für Lernende.`,
    
    chinese: `请用简洁易懂的方式解释，使用Markdown格式回答。

请按照以下结构回答，确保每一项都非常简短、清晰：

**词性和含义**
• 词性：[动词/名词/形容词等]
• 中文解释：[1句话，告诉我这个词的意思]

**用法说明**
• 语法作用：[最多2句话，说明它在语法上起什么作用]

**例句示范**
• 英文例句：[1个简单例句]
• 中文翻译：[对应翻译]

不要添加过多术语或语法细节。风格要温和、简洁，适合英语初学者阅读。`
  }
  
  return prompts[language as keyof typeof prompts] || prompts.english
}

function getDeepAnalysisPrompt(language: string): string {
  const prompts = {
    english: `Please provide an in-depth comparative analysis including:
1. Detailed definition with nuances
2. Etymology and word formation
3. Multiple example sentences in different contexts
4. Comparison with similar words or expressions
5. Usage in formal vs informal situations
6. Cultural or regional variations if applicable

Focus on helping learners understand flexible usage through comparison and rich examples.`,
    
    french: `Veuillez fournir une analyse comparative approfondie incluant:
1. Définition détaillée avec nuances
2. Étymologie et formation du mot
3. Multiples phrases d'exemple dans différents contextes
4. Comparaison avec des mots ou expressions similaires
5. Usage dans des situations formelles vs informelles
6. Variations culturelles ou régionales si applicable

Concentrez-vous sur aider les apprenants à comprendre l'usage flexible grâce à la comparaison et aux exemples riches.`,
    
    spanish: `Por favor proporciona un análisis comparativo profundo incluyendo:
1. Definición detallada con matices
2. Etimología y formación de palabras
3. Múltiples oraciones de ejemplo en diferentes contextos
4. Comparación con palabras o expresiones similares
5. Uso en situaciones formales vs informales
6. Variaciones culturales o regionales si es aplicable

Enfócate en ayudar a los estudiantes a entender el uso flexible a través de comparación y ejemplos ricos.`,
    
    german: `Bitte geben Sie eine ausführliche vergleichende Analyse an, einschließlich:
1. Detaillierte Definition mit Nuancen
2. Etymologie und Wortbildung
3. Mehrere Beispielsätze in verschiedenen Kontexten
4. Vergleich mit ähnlichen Wörtern oder Ausdrücken
5. Verwendung in formellen vs informellen Situationen
6. Kulturelle oder regionale Variationen falls zutreffend

Fokussieren Sie darauf, Lernenden zu helfen, flexible Verwendung durch Vergleich und reiche Beispiele zu verstehen.`,
    
    chinese: `通过对比、例句的方式讲解，以便我能灵活运用。请用以下格式输出：

**词性含义：** [词性] - [中文意思]

**使用场景：**
[场景1]：[英文例句] ([中文翻译])
[场景2]：[英文例句] ([中文翻译])

**常用搭配：**
[搭配1]：[英文例句] ([中文翻译])
[搭配2]：[英文例句] ([中文翻译])

**重要提示：**
[知识点1]
[对比易混淆词汇]
[与其他词差异]

要求：直接输出格式化文本，简明扼要，不要开场白。`
  }
  
  return prompts[language as keyof typeof prompts] || prompts.english
}

function getGrammarAnalysisPrompt(language: string): string {
  const prompts = {
    english: `Please provide a structured grammar analysis including:
1. **Grammar Category**: Detailed part of speech and function
2. **Structure Analysis**: How it fits in sentence structure
3. **Grammar Rules**: Key rules governing its usage
4. **Example Sentences**: 3-4 sentences demonstrating usage with simple explanations
5. **Common Mistakes**: What learners often get wrong
6. **Mini Tests**: 2 simple practice questions

Format your response with clear sections and bullet points for easy learning.`,
    
    french: `Veuillez fournir une analyse grammaticale structurée incluant:
1. **Catégorie Grammaticale**: Classe de mots détaillée et fonction
2. **Analyse Structurelle**: Comment cela s'intègre dans la structure de phrase
3. **Règles Grammaticales**: Règles clés régissant son usage
4. **Phrases d'Exemple**: 3-4 phrases démontrant l'usage avec explications simples
5. **Erreurs Courantes**: Ce que les apprenants font souvent mal
6. **Mini Tests**: 2 questions pratiques simples

Formatez votre réponse avec des sections claires et des puces pour un apprentissage facile.`,
    
    spanish: `Por favor proporciona un análisis gramatical estructurado incluyendo:
1. **Categoría Gramatical**: Clase de palabra detallada y función
2. **Análisis Estructural**: Cómo se integra en la estructura oracional
3. **Reglas Gramaticales**: Reglas clave que rigen su uso
4. **Oraciones de Ejemplo**: 3-4 oraciones demostrando uso con explicaciones simples
5. **Errores Comunes**: Lo que los estudiantes suelen hacer mal
6. **Mini Pruebas**: 2 preguntas práticas simples

Formatea tu respuesta con secciones claras y viñetas para facilitar el aprendizaje.`,
    
    german: `Bitte geben Sie eine strukturierte Grammatikanalyse an, einschließlich:
1. **Grammatikkategorie**: Detaillierte Wortart und Funktion
2. **Strukturanalyse**: Wie es in die Satzstruktur passt
3. **Grammatikregeln**: Schlüsselregeln für die Verwendung
4. **Beispielsätze**: 3-4 Sätze zur Demonstration mit einfachen Erklärungen
5. **Häufige Fehler**: Was Lernende oft falsch machen
6. **Mini-Tests**: 2 einfache Übungsfragen

Formatieren Sie Ihre Antwort mit klaren Abschnitten und Aufzählungen für einfaches Lernen.`,
    
    chinese: `结构化讲解语法，并提供例句（配以简单讲解），最后2个小测试。请用以下格式输出：

**时态语态：** [分析内容]

**句子结构：** [主干、成分分析]

**主从句：** [主/从句分析]

**逻辑关系：** [逻辑连接分析]

**特殊结构：** [特殊语法点]

**关键要点：**
• [要点1]
• [要点2]

**例句解析：**
[例句1] ([翻译]) - [语法解析]
[例句2] ([翻译]) - [语法解析]

要求：直接输出格式化文本，简明扼要，不要开场白。`
  }
  
  return prompts[language as keyof typeof prompts] || prompts.english
}

// Get language-specific response formatting guidelines
export function getResponseFormat(language: string): string {
  const formats = {
    english: "Please respond in English with clear, educational content suitable for language learners.",
    french: "Veuillez répondre en français avec un contenu clair et éducatif adapté aux apprenants.",
    spanish: "Por favor responde en español con contenido claro y educativo adecuado para estudiantes.",
    german: "Bitte antworten Sie auf Deutsch mit klarem, lehrreichem Inhalt für Lernende.",
    chinese: "请用中文回答，内容清晰且适合语言学习者。"
  }
  
  return formats[language as keyof typeof formats] || formats.english
}

// Prompt management functions for runtime editing
const promptStorage = new Map<string, string>()

export function getPromptConfig(language: string, mode: 'simple' | 'deep' | 'grammar'): string {
  const key = `${language}-${mode}`
  
  // Return stored prompt if exists, otherwise return default
  if (promptStorage.has(key)) {
    return promptStorage.get(key)!
  }
  
  // Return default prompt based on mode
  switch (mode) {
    case 'simple':
      return getSimpleAnalysisPrompt(language)
    case 'deep':
      return getDeepAnalysisPrompt(language)
    case 'grammar':
      return getGrammarAnalysisPrompt(language)
    default:
      return getSimpleAnalysisPrompt(language)
  }
}

export async function updatePromptConfig(language: string, mode: 'simple' | 'deep' | 'grammar', prompt: string): Promise<void> {
  const key = `${language}-${mode}`
  promptStorage.set(key, prompt)
  
  // In a real implementation, you might want to persist this to a database
  // For now, we'll just store in memory
  console.log(`Updated prompt for ${key}:`, prompt)
}