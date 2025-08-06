import { create } from 'zustand'

export interface Article {
  id: string
  title: string
  content: string
  source_language: string
  native_language: string
  created_at: string
  updated_at: string
}

export interface Query {
  id: string
  article_id: string
  selected_text: string | null
  query_type: 'quick' | 'standard' | 'deep' | 'ask_ai'
  user_question?: string
  ai_response: string
  text_position?: {
    start: number
    end: number
    highlight_id: string
  }
  created_at: string
}

export interface PromptTemplates {
  quick: string
  standard: string
  deep: string
  ask_ai: string
}

export interface PromptTemplatesByLanguagePair {
  [languagePairKey: string]: PromptTemplates
}

interface ReadLinguaState {
  // Tab management
  activeTab: 'dashboard' | 'learning'
  setActiveTab: (tab: 'dashboard' | 'learning') => void
  
  // Articles
  articles: Article[]
  setArticles: (articles: Article[]) => void
  selectedArticle: Article | null
  setSelectedArticle: (article: Article | null) => void
  
  // Queries
  queries: Query[]
  setQueries: (queries: Query[]) => void
  addQuery: (query: Query) => void
  removeQuery: (queryId: string) => void
  
  // AI Model
  selectedAiModel: 'deepseek' | 'openai'
  setSelectedAiModel: (model: 'deepseek' | 'openai') => void
  
  // Prompt Templates by Language Pair
  promptTemplatesByLanguagePair: PromptTemplatesByLanguagePair
  getCurrentPromptTemplates: () => PromptTemplates
  setPromptTemplate: (type: keyof PromptTemplates, template: string) => void
  resetPromptTemplates: () => void
  
  // UI states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  showQueryPanel: boolean
  setShowQueryPanel: (show: boolean) => void
  selectedQuery: Query | null
  setSelectedQuery: (query: Query | null) => void
  showPromptManager: boolean
  setShowPromptManager: (show: boolean) => void
}

// Helper function to get language pair key
const getLanguagePairKey = (sourceLanguage: string, nativeLanguage: string): string => {
  return `${sourceLanguage}-${nativeLanguage}`
}

// Default prompt templates for each supported language pair (42 combinations)
const DEFAULT_PROMPT_TEMPLATES_MAP: PromptTemplatesByLanguagePair = {
  // ======= ENGLISH Learning =======
  // English-Chinese (keep existing templates)
  'english-chinese': {
    quick: '简明扼要的方式讲解 "{text}" in {nativeLang}. 通过英文例句的方式来讲解。（不要开场白，直接讲内容）',
    standard: '通过例句的方式讲解"{text}"，以便我能理解和掌握，确保我能灵活运用。 （不要开场白，直接讲内容）',
    deep: '深度讲解一下"{text}"，以便我能彻底的完全的掌握。你可以从以下几个方面（当然也可以更多其他你认为重要的方面）：经典例句，使用场景，句子结构，语法点，甚至小测试。（不要开场白，直接讲内容）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'english-french': {
    quick: 'Expliquez brièvement l\'anglais "{text}" en français avec des exemples pratiques. (Allez directement au contenu)',
    standard: 'Expliquez l\'anglais "{text}" avec des exemples pour que je puisse comprendre et l\'utiliser de manière flexible. (Allez directement au contenu)',
    deep: 'Expliquez en profondeur l\'anglais "{text}" pour que je puisse le maîtriser complètement. Couvrez : exemples classiques, contextes d\'utilisation, structure grammaticale, points de grammaire. (Allez directement au contenu)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'english-japanese': {
    quick: '英語の「{text}」を日本語で実用的な例文とともに簡潔に説明してください。（前置きなしで直接内容へ）',
    standard: '英語の「{text}」を例文を通じて説明し、理解して柔軟に使えるようにしてください。（前置きなしで直接内容へ）',
    deep: '英語の「{text}」を完全にマスターできるよう深く説明してください。以下を含めて：代表的な例文、使用場面、文法構造、文法ポイント、クイズまで。（前置きなしで直接内容へ）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'english-korean': {
    quick: '영어 "{text}"를 간단명료하게 실용적인 예문과 함께 한국어로 설명해 주세요. (서론 없이 바로 내용으로)',
    standard: '영어 "{text}"를 예문을 통해 설명해서 제가 이해하고 유연하게 사용할 수 있도록 해주세요. (서론 없이 바로 내용으로)',
    deep: '영어 "{text}"를 완전히 마스터할 수 있도록 깊이 있게 설명해 주세요. 다음을 포함해서: 경전 예문, 사용 맥락, 문법 구조, 문법 포인트, 심지어 퀴즈까지. (서론 없이 바로 내용으로)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'english-russian': {
    quick: 'Кратко объясните английское "{text}" на русском языке с практическими примерами. (Сразу к содержанию)',
    standard: 'Объясните английское "{text}" с примерами, чтобы я мог понять и гибко использовать. (Сразу к содержанию)',
    deep: 'Подробно объясните английское "{text}", чтобы я мог полностью овладеть им. Включите: классические примеры, контексты использования, грамматическую структуру, грамматические моменты. (Сразу к содержанию)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'english-spanish': {
    quick: 'Explica brevemente el inglés "{text}" en español con ejemplos prácticos. (Ve directo al contenido)',
    standard: 'Explica el inglés "{text}" con ejemplos para que pueda entender y usar de manera flexible. (Ve directo al contenido)',
    deep: 'Explica en profundidad el inglés "{text}" para que pueda dominarlo completamente. Incluye: ejemplos clásicos, contextos de uso, estructura gramatical, puntos gramaticales. (Ve directo al contenido)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'english-arabic': {
    quick: 'اشرح الإنجليزية "{text}" بإيجاز باللغة العربية مع أمثلة عملية. (اذهب مباشرة إلى المحتوى)',
    standard: 'اشرح الإنجليزية "{text}" بأمثلة حتى أتمكن من الفهم والاستخدام بمرونة. (اذهب مباشرة إلى المحتوى)',
    deep: 'اشرح الإنجليزية "{text}" بعمق حتى أتمكن من إتقانها تماماً. شمل: أمثلة كلاسيكية، سياقات الاستخدام، البنية النحوية، النقاط النحوية. (اذهب مباشرة إلى المحتوى)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },

  // ======= FRENCH Learning =======
  'french-chinese': {
    quick: '简明扼要的方式用中文讲解法语 "{text}"，通过法语例句的方式来讲解。（不要开场白，直接讲内容）',
    standard: '通过例句的方式讲解法语"{text}"，以便我能理解和掌握，确保我能灵活运用。 （不要开场白，直接讲内容）',
    deep: '深度讲解一下法语"{text}"，以便我能彻底的完全的掌握。你可以从以下几个方面：法语例句，使用场景，语法结构，语法点，甚至小测试。（不要开场白，直接讲内容）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'french-english': {
    quick: 'Briefly explain French "{text}" in English with practical examples. (Go straight to the content)',
    standard: 'Explain French "{text}" with examples so I can understand and use it flexibly. (Go straight to the content)',
    deep: 'Explain French "{text}" in depth so I can master it completely. Cover: classic examples, usage contexts, grammatical structure, grammar points, even quizzes. (Go straight to the content)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'french-japanese': {
    quick: 'フランス語の「{text}」を日本語で実用的な例文とともに簡潔に説明してください。（前置きなしで直接内容へ）',
    standard: 'フランス語の「{text}」を例文を通じて説明し、理解して柔軟に使えるようにしてください。（前置きなしで直接内容へ）',
    deep: 'フランス語の「{text}」を完全にマスターできるよう深く説明してください。以下を含めて：代表的な例文、使用場面、文法構造、文法ポイント、クイズまで。（前置きなしで直接内容へ）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'french-korean': {
    quick: '프랑스어 "{text}"를 간단명료하게 실용적인 예문과 함께 한국어로 설명해 주세요. (서론 없이 바로 내용으로)',
    standard: '프랑스어 "{text}"를 예문을 통해 설명해서 제가 이해하고 유연하게 사용할 수 있도록 해주세요. (서론 없이 바로 내용으로)',
    deep: '프랑스어 "{text}"를 완전히 마스터할 수 있도록 깊이 있게 설명해 주세요. 다음을 포함해서: 경전 예문, 사용 맥락, 문법 구조, 문법 포인트. (서론 없이 바로 내용으로)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'french-russian': {
    quick: 'Кратко объясните французское "{text}" на русском языке с практическими примерами. (Сразу к содержанию)',
    standard: 'Объясните французское "{text}" с примерами, чтобы я мог понять и гибко использовать. (Сразу к содержанию)',
    deep: 'Подробно объясните французское "{text}", чтобы я мог полностью овладеть им. Включите: классические примеры, контексты использования, грамматическую структуру. (Сразу к содержанию)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'french-spanish': {
    quick: 'Explica brevemente el francés "{text}" en español con ejemplos prácticos. (Ve directo al contenido)',
    standard: 'Explica el francés "{text}" con ejemplos para que pueda entender y usar de manera flexible. (Ve directo al contenido)',
    deep: 'Explica en profundidad el francés "{text}" para que pueda dominarlo completamente. Incluye: ejemplos clásicos, contextos de uso, estructura gramatical. (Ve directo al contenido)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'french-arabic': {
    quick: 'اشرح الفرنسية "{text}" بإيجاز باللغة العربية مع أمثلة عملية. (اذهب مباشرة إلى المحتوى)',
    standard: 'اشرح الفرنسية "{text}" بأمثلة حتى أتمكن من الفهم والاستخدام بمرونة. (اذهب مباشرة إلى المحتوى)',
    deep: 'اشرح الفرنسية "{text}" بعمق حتى أتمكن من إتقانها تماماً. شمل: أمثلة كلاسيكية، سياقات الاستخدام، البنية النحوية. (اذهب مباشرة إلى المحتوى)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },

  // ======= JAPANESE Learning =======
  'japanese-chinese': {
    quick: '简明扼要的方式用中文讲解日语 "{text}"，通过日语例句的方式来讲解。（不要开场白，直接讲内容）',
    standard: '通过例句的方式讲解日语"{text}"，以便我能理解和掌握，确保我能灵活运用。 （不要开场白，直接讲内容）',
    deep: '深度讲解一下日语"{text}"，以便我能彻底的完全的掌握。你可以从以下几个方面：日语例句，使用场景，语法结构，语法点，甚至小测试。（不要开场白，直接讲内容）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'japanese-english': {
    quick: 'Briefly explain Japanese "{text}" in English with practical examples. (Go straight to the content)',
    standard: 'Explain Japanese "{text}" with examples so I can understand and use it flexibly. (Go straight to the content)',
    deep: 'Explain Japanese "{text}" in depth so I can master it completely. Cover: classic examples, usage contexts, grammatical structure, grammar points, even quizzes. (Go straight to the content)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'japanese-japanese': {
    quick: '日本語の「{text}」を日本語で実用的な例文とともに簡潔に説明してください。（前置きなしで直接内容へ）',
    standard: '日本語の「{text}」を例文を通じて説明し、理解して柔軟に使えるようにしてください。（前置きなしで直接内容へ）',
    deep: '日本語の「{text}」を完全にマスターできるよう深く説明してください。以下を含めて：代表的な例文、使用場面、文法構造、文法ポイント、クイズまで。（前置きなしで直接内容へ）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'japanese-french': {
    quick: 'Expliquez brièvement le japonais "{text}" en français avec des exemples pratiques. (Allez directement au contenu)',
    standard: 'Expliquez le japonais "{text}" avec des exemples pour que je puisse comprendre et l\'utiliser de manière flexible. (Allez directement au contenu)',
    deep: 'Expliquez en profondeur le japonais "{text}" pour que je puisse le maîtriser complètement. Couvrez : exemples classiques, contextes d\'utilisation, structure grammaticale. (Allez directement au contenu)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'japanese-korean': {
    quick: '일본어 "{text}"를 간단명료하게 실용적인 예문과 함께 한국어로 설명해 주세요. (서론 없이 바로 내용으로)',
    standard: '일본어 "{text}"를 예문을 통해 설명해서 제가 이해하고 유연하게 사용할 수 있도록 해주세요. (서론 없이 바로 내용으로)',
    deep: '일본어 "{text}"를 완전히 마스터할 수 있도록 깊이 있게 설명해 주세요. 다음을 포함해서: 경전 예문, 사용 맥락, 문법 구조, 문법 포인트. (서론 없이 바로 내용으로)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'japanese-russian': {
    quick: 'Кратко объясните японское "{text}" на русском языке с практическими примерами. (Сразу к содержанию)',
    standard: 'Объясните японское "{text}" с примерами, чтобы я мог понять и гибко использовать. (Сразу к содержанию)',
    deep: 'Подробно объясните японское "{text}", чтобы я мог полностью овладеть им. Включите: классические примеры, контексты использования, грамматическую структуру. (Сразу к содержанию)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'japanese-spanish': {
    quick: 'Explica brevemente el japonés "{text}" en español con ejemplos prácticos. (Ve directo al contenido)',
    standard: 'Explica el japonés "{text}" con ejemplos para que pueda entender y usar de manera flexible. (Ve directo al contenido)',
    deep: 'Explica en profundidad el japonés "{text}" para que pueda dominarlo completamente. Incluye: ejemplos clásicos, contextos de uso, estructura gramatical. (Ve directo al contenido)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'japanese-arabic': {
    quick: 'اشرح اليابانية "{text}" بإيجاز باللغة العربية مع أمثلة عملية. (اذهب مباشرة إلى المحتوى)',
    standard: 'اشرح اليابانية "{text}" بأمثلة حتى أتمكن من الفهم والاستخدام بمرونة. (اذهب مباشرة إلى المحتوى)',
    deep: 'اشرح اليابانية "{text}" بعمق حتى أتمكن من إتقانها تماماً. شمل: أمثلة كلاسيكية، سياقات الاستخدام، البنية النحوية. (اذهب مباشرة إلى المحتوى)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },

  // ======= KOREAN Learning =======
  'korean-chinese': {
    quick: '简明扼要的方式用中文讲解韩语 "{text}"，通过韩语例句的方式来讲解。（不要开场白，直接讲内容）',
    standard: '通过例句的方式讲解韩语"{text}"，以便我能理解和掌握，确保我能灵活运用。 （不要开场白，直接讲内容）',
    deep: '深度讲解一下韩语"{text}"，以便我能彻底的完全的掌握。你可以从以下几个方面：韩语例句，使用场景，语法结构，语法点，甚至小测试。（不要开场白，直接讲内容）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'korean-english': {
    quick: 'Briefly explain Korean "{text}" in English with practical examples. (Go straight to the content)',
    standard: 'Explain Korean "{text}" with examples so I can understand and use it flexibly. (Go straight to the content)',
    deep: 'Explain Korean "{text}" in depth so I can master it completely. Cover: classic examples, usage contexts, grammatical structure, grammar points, even quizzes. (Go straight to the content)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'korean-japanese': {
    quick: '韓国語の「{text}」を日本語で実用的な例文とともに簡潔に説明してください。（前置きなしで直接内容へ）',
    standard: '韓国語の「{text}」を例文を通じて説明し、理解して柔軟に使えるようにしてください。（前置きなしで直接内容へ）',
    deep: '韓国語の「{text}」を完全にマスターできるよう深く説明してください。以下を含めて：代表的な例文、使用場面、文法構造、文法ポイント、クイズまで。（前置きなしで直接内容へ）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'korean-french': {
    quick: 'Expliquez brièvement le coréen "{text}" en français avec des exemples pratiques. (Allez directement au contenu)',
    standard: 'Expliquez le coréen "{text}" avec des exemples pour que je puisse comprendre et l\'utiliser de manière flexible. (Allez directement au contenu)',
    deep: 'Expliquez en profondeur le coréen "{text}" pour que je puisse le maîtriser complètement. Couvrez : exemples classiques, contextes d\'utilisation, structure grammaticale. (Allez directement au contenu)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'korean-russian': {
    quick: 'Кратко объясните корейское "{text}" на русском языке с практическими примерами. (Сразу к содержанию)',
    standard: 'Объясните корейское "{text}" с примерами, чтобы я мог понять и гибко использовать. (Сразу к содержанию)',
    deep: 'Подробно объясните корейское "{text}", чтобы я мог полностью овладеть им. Включите: классические примеры, контексты использования, грамматическую структуру. (Сразу к содержанию)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'korean-spanish': {
    quick: 'Explica brevemente el coreano "{text}" en español con ejemplos prácticos. (Ve directo al contenido)',
    standard: 'Explica el coreano "{text}" con ejemplos para que pueda entender y usar de manera flexible. (Ve directo al contenido)',
    deep: 'Explica en profundidad el coreano "{text}" para que pueda dominarlo completamente. Incluye: ejemplos clásicos, contextos de uso, estructura gramatical. (Ve directo al contenido)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'korean-arabic': {
    quick: 'اشرح الكورية "{text}" بإيجاز باللغة العربية مع أمثلة عملية. (اذهب مباشرة إلى المحتوى)',
    standard: 'اشرح الكورية "{text}" بأمثلة حتى أتمكن من الفهم والاستخدام بمرونة. (اذهب مباشرة إلى المحتوى)',
    deep: 'اشرح الكورية "{text}" بعمق حتى أتمكن من إتقانها تماماً. شمل: أمثلة كلاسيكية، سياقات الاستخدام، البنية النحوية. (اذهب مباشرة إلى المحتوى)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },

  // ======= RUSSIAN Learning =======
  'russian-chinese': {
    quick: '简明扼要的方式用中文讲解俄语 "{text}"，通过俄语例句的方式来讲解。（不要开场白，直接讲内容）',
    standard: '通过例句的方式讲解俄语"{text}"，以便我能理解和掌握，确保我能灵活运用。 （不要开场白，直接讲内容）',
    deep: '深度讲解一下俄语"{text}"，以便我能彻底的完全的掌握。你可以从以下几个方面：俄语例句，使用场景，语法结构，语法点，甚至小测试。（不要开场白，直接讲内容）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'russian-english': {
    quick: 'Briefly explain Russian "{text}" in English with practical examples. (Go straight to the content)',
    standard: 'Explain Russian "{text}" with examples so I can understand and use it flexibly. (Go straight to the content)',
    deep: 'Explain Russian "{text}" in depth so I can master it completely. Cover: classic examples, usage contexts, grammatical structure, grammar points, even quizzes. (Go straight to the content)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'russian-japanese': {
    quick: 'ロシア語の「{text}」を日本語で実用的な例文とともに簡潔に説明してください。（前置きなしで直接内容へ）',
    standard: 'ロシア語の「{text}」を例文を通じて説明し、理解して柔軟に使えるようにしてください。（前置きなしで直接内容へ）',
    deep: 'ロシア語の「{text}」を完全にマスターできるよう深く説明してください。以下を含めて：代表的な例文、使用場面、文法構造、文法ポイント、クイズまで。（前置きなしで直接内容へ）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'russian-french': {
    quick: 'Expliquez brièvement le russe "{text}" en français avec des exemples pratiques. (Allez directement au contenu)',
    standard: 'Expliquez le russe "{text}" avec des exemples pour que je puisse comprendre et l\'utiliser de manière flexible. (Allez directement au contenu)',
    deep: 'Expliquez en profondeur le russe "{text}" pour que je puisse le maîtriser complètement. Couvrez : exemples classiques, contextes d\'utilisation, structure grammaticale. (Allez directement au contenu)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'russian-korean': {
    quick: '러시아어 "{text}"를 간단명료하게 실용적인 예문과 함께 한국어로 설명해 주세요. (서론 없이 바로 내용으로)',
    standard: '러시아어 "{text}"를 예문을 통해 설명해서 제가 이해하고 유연하게 사용할 수 있도록 해주세요. (서론 없이 바로 내용으로)',
    deep: '러시아어 "{text}"를 완전히 마스터할 수 있도록 깊이 있게 설명해 주세요. 다음을 포함해서: 경전 예문, 사용 맥락, 문법 구조, 문법 포인트. (서론 없이 바로 내용으로)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'russian-spanish': {
    quick: 'Explica brevemente el ruso "{text}" en español con ejemplos prácticos. (Ve directo al contenido)',
    standard: 'Explica el ruso "{text}" con ejemplos para que pueda entender y usar de manera flexible. (Ve directo al contenido)',
    deep: 'Explica en profundidad el ruso "{text}" para que pueda dominarlo completamente. Incluye: ejemplos clásicos, contextos de uso, estructura gramatical. (Ve directo al contenido)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'russian-arabic': {
    quick: 'اشرح الروسية "{text}" بإيجاز باللغة العربية مع أمثلة عملية. (اذهب مباشرة إلى المحتوى)',
    standard: 'اشرح الروسية "{text}" بأمثلة حتى أتمكن من الفهم والاستخدام بمرونة. (اذهب مباشرة إلى المحتوى)',
    deep: 'اشرح الروسية "{text}" بعمق حتى أتمكن من إتقانها تماماً. شمل: أمثلة كلاسيكية، سياقات الاستخدام، البنية النحوية. (اذهب مباشرة إلى المحتوى)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },

  // ======= SPANISH Learning =======
  'spanish-chinese': {
    quick: '简明扼要的方式用中文讲解西班牙语 "{text}"，通过西班牙语例句的方式来讲解。（不要开场白，直接讲内容）',
    standard: '通过例句的方式讲解西班牙语"{text}"，以便我能理解和掌握，确保我能灵活运用。 （不要开场白，直接讲内容）',
    deep: '深度讲解一下西班牙语"{text}"，以便我能彻底的完全的掌握。你可以从以下几个方面：西班牙语例句，使用场景，语法结构，语法点，甚至小测试。（不要开场白，直接讲内容）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'spanish-english': {
    quick: 'Briefly explain Spanish "{text}" in English with practical examples. (Go straight to the content)',
    standard: 'Explain Spanish "{text}" with examples so I can understand and use it flexibly. (Go straight to the content)',
    deep: 'Explain Spanish "{text}" in depth so I can master it completely. Cover: classic examples, usage contexts, grammatical structure, grammar points, even quizzes. (Go straight to the content)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'spanish-japanese': {
    quick: 'スペイン語の「{text}」を日本語で実用的な例文とともに簡潔に説明してください。（前置きなしで直接内容へ）',
    standard: 'スペイン語の「{text}」を例文を通じて説明し、理解して柔軟に使えるようにしてください。（前置きなしで直接内容へ）',
    deep: 'スペイン語の「{text}」を完全にマスターできるよう深く説明してください。以下を含めて：代表的な例文、使用場面、文法構造、文法ポイント、クイズまで。（前置きなしで直接内容へ）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'spanish-french': {
    quick: 'Expliquez brièvement l\'espagnol "{text}" en français avec des exemples pratiques. (Allez directement au contenu)',
    standard: 'Expliquez l\'espagnol "{text}" avec des exemples pour que je puisse comprendre et l\'utiliser de manière flexible. (Allez directement au contenu)',
    deep: 'Expliquez en profondeur l\'espagnol "{text}" pour que je puisse le maîtriser complètement. Couvrez : exemples classiques, contextes d\'utilisation, structure grammaticale. (Allez directement au contenu)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'spanish-korean': {
    quick: '스페인어 "{text}"를 간단명료하게 실용적인 예문과 함께 한국어로 설명해 주세요. (서론 없이 바로 내용으로)',
    standard: '스페인어 "{text}"를 예문을 통해 설명해서 제가 이해하고 유연하게 사용할 수 있도록 해주세요. (서론 없이 바로 내용으로)',
    deep: '스페인어 "{text}"를 완전히 마스터할 수 있도록 깊이 있게 설명해 주세요. 다음을 포함해서: 경전 예문, 사용 맥락, 문법 구조, 문법 포인트. (서론 없이 바로 내용으로)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'spanish-russian': {
    quick: 'Кратко объясните испанское "{text}" на русском языке с практическими примерами. (Сразу к содержанию)',
    standard: 'Объясните испанское "{text}" с примерами, чтобы я мог понять и гибко использовать. (Сразу к содержанию)',
    deep: 'Подробно объясните испанское "{text}", чтобы я мог полностью овладеть им. Включите: классические примеры, контексты использования, грамматическую структуру. (Сразу к содержанию)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'spanish-arabic': {
    quick: 'اشرح الإسبانية "{text}" بإيجاز باللغة العربية مع أمثلة عملية. (اذهب مباشرة إلى المحتوى)',
    standard: 'اشرح الإسبانية "{text}" بأمثلة حتى أتمكن من الفهم والاستخدام بمرونة. (اذهب مباشرة إلى المحتوى)',
    deep: 'اشرح الإسبانية "{text}" بعمق حتى أتمكن من إتقانها تماماً. شمل: أمثلة كلاسيكية، سياقات الاستخدام، البنية النحوية. (اذهب مباشرة إلى المحتوى)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },

  // ======= ARABIC Learning =======
  'arabic-chinese': {
    quick: '简明扼要的方式用中文讲解阿拉伯语 "{text}"，通过阿拉伯语例句的方式来讲解。（不要开场白，直接讲内容）',
    standard: '通过例句的方式讲解阿拉伯语"{text}"，以便我能理解和掌握，确保我能灵活运用。 （不要开场白，直接讲内容）',
    deep: '深度讲解一下阿拉伯语"{text}"，以便我能彻底的完全的掌握。你可以从以下几个方面：阿拉伯语例句，使用场景，语法结构，语法点，甚至小测试。（不要开场白，直接讲内容）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'arabic-english': {
    quick: 'Briefly explain Arabic "{text}" in English with practical examples. (Go straight to the content)',
    standard: 'Explain Arabic "{text}" with examples so I can understand and use it flexibly. (Go straight to the content)',
    deep: 'Explain Arabic "{text}" in depth so I can master it completely. Cover: classic examples, usage contexts, grammatical structure, grammar points, even quizzes. (Go straight to the content)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'arabic-japanese': {
    quick: 'アラビア語の「{text}」を日本語で実用的な例文とともに簡潔に説明してください。（前置きなしで直接内容へ）',
    standard: 'アラビア語の「{text}」を例文を通じて説明し、理解して柔軟に使えるようにしてください。（前置きなしで直接内容へ）',
    deep: 'アラビア語の「{text}」を完全にマスターできるよう深く説明してください。以下を含めて：代表的な例文、使用場面、文法構造、文法ポイント、クイズまで。（前置きなしで直接内容へ）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'arabic-french': {
    quick: 'Expliquez brièvement l\'arabe "{text}" en français avec des exemples pratiques. (Allez directement au contenu)',
    standard: 'Expliquez l\'arabe "{text}" avec des exemples pour que je puisse comprendre et l\'utiliser de manière flexible. (Allez directement au contenu)',
    deep: 'Expliquez en profondeur l\'arabe "{text}" pour que je puisse le maîtriser complètement. Couvrez : exemples classiques, contextes d\'utilisation, structure grammaticale. (Allez directement au contenu)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'arabic-korean': {
    quick: '아랍어 "{text}"를 간단명료하게 실용적인 예문과 함께 한국어로 설명해 주세요. (서론 없이 바로 내용으로)',
    standard: '아랍어 "{text}"를 예문을 통해 설명해서 제가 이해하고 유연하게 사용할 수 있도록 해주세요. (서론 없이 바로 내용으로)',
    deep: '아랍어 "{text}"를 완전히 마스터할 수 있도록 깊이 있게 설명해 주세요. 다음을 포함해서: 경전 예문, 사용 맥락, 문법 구조, 문법 포인트. (서론 없이 바로 내용으로)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'arabic-russian': {
    quick: 'Кратко объясните арабское "{text}" на русском языке с практическими примерами. (Сразу к содержанию)',
    standard: 'Объясните арабское "{text}" с примерами, чтобы я мог понять и гибко использовать. (Сразу к содержанию)',
    deep: 'Подробно объясните арабское "{text}", чтобы я мог полностью овладеть им. Включите: классические примеры, контексты использования, грамматическую структуру. (Сразу к содержанию)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'arabic-spanish': {
    quick: 'Explica brevemente el árabe "{text}" en español con ejemplos prácticos. (Ve directo al contenido)',
    standard: 'Explica el árabe "{text}" con ejemplos para que pueda entender y usar de manera flexible. (Ve directo al contenido)',
    deep: 'Explica en profundidad el árabe "{text}" para que pueda dominarlo completamente. Incluye: ejemplos clásicos, contextos de uso, estructura gramatical. (Ve directo al contenido)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },

  // ======= CHINESE Learning =======
  'chinese-english': {
    quick: 'Briefly explain Chinese "{text}" in English with practical examples. (Go straight to the content)',
    standard: 'Explain Chinese "{text}" with examples so I can understand and use it flexibly. (Go straight to the content)',
    deep: 'Explain Chinese "{text}" in depth so I can master it completely. Cover: classic examples, usage contexts, grammatical structure, grammar points, even quizzes. (Go straight to the content)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'chinese-french': {
    quick: 'Expliquez brièvement le chinois "{text}" en français avec des exemples pratiques. (Allez directement au contenu)',
    standard: 'Expliquez le chinois "{text}" avec des exemples pour que je puisse comprendre et l\'utiliser de manière flexible. (Allez directement au contenu)',
    deep: 'Expliquez en profondeur le chinois "{text}" pour que je puisse le maîtriser complètement. Couvrez : exemples classiques, contextes d\'utilisation, structure grammaticale, points de grammaire. (Allez directement au contenu)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'chinese-japanese': {
    quick: '中国語の「{text}」を日本語で実用的な例文とともに簡潔に説明してください。（前置きなしで直接内容へ）',
    standard: '中国語の「{text}」を例文を通じて説明し、理解して柔軟に使えるようにしてください。（前置きなしで直接内容へ）',
    deep: '中国語の「{text}」を完全にマスターできるよう深く説明してください。以下を含めて：代表的な例文、使用場面、文法構造、文法ポイント、クイズまで。（前置きなしで直接内容へ）',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'chinese-korean': {
    quick: '중국어 "{text}"를 간단명료하게 실용적인 예문과 함께 한국어로 설명해 주세요. (서론 없이 바로 내용으로)',
    standard: '중국어 "{text}"를 예문을 통해 설명해서 제가 이해하고 유연하게 사용할 수 있도록 해주세요. (서론 없이 바로 내용으로)',
    deep: '중국어 "{text}"를 완전히 마스터할 수 있도록 깊이 있게 설명해 주세요. 다음을 포함해서: 경전 예문, 사용 맥락, 문법 구조, 문법 포인트, 심지어 퀴즈까지. (서론 없이 바로 내용으로)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'chinese-russian': {
    quick: 'Кратко объясните китайское "{text}" на русском языке с практическими примерами. (Сразу к содержанию)',
    standard: 'Объясните китайское "{text}" с примерами, чтобы я мог понять и гибко использовать. (Сразу к содержанию)',
    deep: 'Подробно объясните китайское "{text}", чтобы я мог полностью овладеть им. Включите: классические примеры, контексты использования, грамматическую структуру, грамматические моменты. (Сразу к содержанию)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'chinese-spanish': {
    quick: 'Explica brevemente el chino "{text}" en español con ejemplos prácticos. (Ve directo al contenido)',
    standard: 'Explica el chino "{text}" con ejemplos para que pueda entender y usar de manera flexible. (Ve directo al contenido)',
    deep: 'Explica en profundidad el chino "{text}" para que pueda dominarlo completamente. Incluye: ejemplos clásicos, contextos de uso, estructura gramatical, puntos gramaticales, incluso cuestionarios. (Ve directo al contenido)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'chinese-arabic': {
    quick: 'اشرح النص الصيني "{text}" باختصار باللغة العربية مع أمثلة عملية. (ادخل إلى المحتوى مباشرة)',
    standard: 'اشرح النص الصيني "{text}" بالأمثلة حتى أتمكن من فهمه واستخدامه بمرونة. (ادخل إلى المحتوى مباشرة)',
    deep: 'اشرح النص الصيني "{text}" بعمق حتى أتمكن من إتقانه تماماً. قم بتغطية: الأمثلة الكلاسيكية، سياقات الاستخدام، التركيب النحوي، النقاط النحوية، حتى الاختبارات. (ادخل إلى المحتوى مباشرة)',
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  }
}

// LocalStorage key for prompt templates by language pair
const PROMPT_STORAGE_KEY = 'readlingua_prompt_templates_by_language_pair'

// Load prompt templates by language pair from localStorage
const loadPromptTemplatesByLanguagePairFromStorage = (): PromptTemplatesByLanguagePair => {
  if (typeof window === 'undefined') return DEFAULT_PROMPT_TEMPLATES_MAP
  
  try {
    const stored = localStorage.getItem(PROMPT_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with defaults to ensure all language pairs have templates
      const merged = { ...DEFAULT_PROMPT_TEMPLATES_MAP }
      Object.keys(parsed).forEach(key => {
        if (merged[key]) {
          merged[key] = { ...merged[key], ...parsed[key] }
        }
      })
      return merged
    }
  } catch (error) {
    console.warn('Failed to load prompt templates from localStorage:', error)
  }
  
  return DEFAULT_PROMPT_TEMPLATES_MAP
}

// Save prompt templates by language pair to localStorage
const savePromptTemplatesByLanguagePairToStorage = (templates: PromptTemplatesByLanguagePair) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(templates))
  } catch (error) {
    console.warn('Failed to save prompt templates to localStorage:', error)
  }
}

export const useReadLinguaStore = create<ReadLinguaState>((set) => ({
  // Tab management
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Articles
  articles: [],
  setArticles: (articles) => set({ articles }),
  selectedArticle: null,
  setSelectedArticle: (article) => set((state) => ({ 
    selectedArticle: article,
    // Clear queries and selectedQuery when switching articles
    queries: [],
    selectedQuery: null
  })),
  
  // Queries
  queries: [],
  setQueries: (queries) => set({ queries }),
  addQuery: (query) => set((state) => ({ queries: [...state.queries, query] })),
  removeQuery: (queryId) => set((state) => ({ 
    queries: state.queries.filter(q => q.id !== queryId),
    selectedQuery: state.selectedQuery?.id === queryId ? null : state.selectedQuery
  })),
  
  // AI Model
  selectedAiModel: 'deepseek',
  setSelectedAiModel: (model) => set({ selectedAiModel: model }),
  
  // Prompt Templates by Language Pair
  promptTemplatesByLanguagePair: loadPromptTemplatesByLanguagePairFromStorage(),
  
  getCurrentPromptTemplates: () => {
    const state = useReadLinguaStore.getState()
    if (!state.selectedArticle) {
      // Return default english-chinese if no article selected
      return state.promptTemplatesByLanguagePair['english-chinese'] || DEFAULT_PROMPT_TEMPLATES_MAP['english-chinese']
    }
    
    const languagePairKey = getLanguagePairKey(
      state.selectedArticle.source_language,
      state.selectedArticle.native_language
    )
    
    return state.promptTemplatesByLanguagePair[languagePairKey] || DEFAULT_PROMPT_TEMPLATES_MAP[languagePairKey] || DEFAULT_PROMPT_TEMPLATES_MAP['english-chinese']
  },
  
  setPromptTemplate: (type, template) => set((state) => {
    if (!state.selectedArticle) return state
    
    const languagePairKey = getLanguagePairKey(
      state.selectedArticle.source_language,
      state.selectedArticle.native_language
    )
    
    const newTemplatesByLanguagePair = {
      ...state.promptTemplatesByLanguagePair,
      [languagePairKey]: {
        ...state.promptTemplatesByLanguagePair[languagePairKey],
        [type]: template
      }
    }
    
    // Save to localStorage whenever templates are updated
    savePromptTemplatesByLanguagePairToStorage(newTemplatesByLanguagePair)
    return { promptTemplatesByLanguagePair: newTemplatesByLanguagePair }
  }),
  
  resetPromptTemplates: () => set((state) => {
    if (!state.selectedArticle) return state
    
    const languagePairKey = getLanguagePairKey(
      state.selectedArticle.source_language,
      state.selectedArticle.native_language
    )
    
    const newTemplatesByLanguagePair = {
      ...state.promptTemplatesByLanguagePair,
      [languagePairKey]: DEFAULT_PROMPT_TEMPLATES_MAP[languagePairKey]
    }
    
    // Save to localStorage
    savePromptTemplatesByLanguagePairToStorage(newTemplatesByLanguagePair)
    return { promptTemplatesByLanguagePair: newTemplatesByLanguagePair }
  }),
  
  // UI states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  showQueryPanel: false,
  setShowQueryPanel: (show) => set({ showQueryPanel: show }),
  selectedQuery: null,
  setSelectedQuery: (query) => set({ selectedQuery: query }),
  showPromptManager: false,
  setShowPromptManager: (show) => set({ showPromptManager: show }),
}))