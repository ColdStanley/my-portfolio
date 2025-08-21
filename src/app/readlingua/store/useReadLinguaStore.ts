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

export interface QuizQuestion {
  id: string
  question: string
  answer: string
  explanation: string
  originalQuery: Query
  userAnswer?: string
  isCorrect?: boolean
  isAnswered: boolean
}

export interface AITooltip {
  id: string
  selectedText: string
  queryType: string
  aiResponse: string
  isLoading: boolean
  hasError: boolean
  position: { x: number, y: number }
  userQuestion?: string
  createdAt: number
}

export interface SelectedEmailContent {
  id: string
  content: string
  type: 'query_response' | 'ai_response' | 'user_query'
  source: 'query_history'
  timestamp: string
  queryId?: string
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
  
  // Quiz
  fillInQuestions: QuizQuestion[]
  dictationQuestions: QuizQuestion[]
  setFillInQuestions: (questions: QuizQuestion[]) => void
  setDictationQuestions: (questions: QuizQuestion[]) => void
  currentQuizIndex: number
  setCurrentQuizIndex: (index: number) => void
  isGeneratingQuiz: boolean
  setIsGeneratingQuiz: (generating: boolean) => void
  quizMode: 'fill-in' | 'dictation'
  setQuizMode: (mode: 'fill-in' | 'dictation') => void
  generateQuizQuestions: () => void
  generateDictationQuestions: () => void
  submitQuizAnswer: (index: number, answer: string) => void
  getCurrentQuestions: () => QuizQuestion[]
  
  // AI Tooltips
  aiTooltips: AITooltip[]
  addAITooltip: (tooltip: Omit<AITooltip, 'id' | 'createdAt'>) => string
  updateAITooltip: (id: string, updates: Partial<AITooltip>) => void
  removeAITooltip: (id: string) => void
  clearAllTooltips: () => void
  
  // Email Selection
  selectedEmailContents: SelectedEmailContent[]
  addToEmailSelection: (content: Omit<SelectedEmailContent, 'id' | 'timestamp'>) => void
  removeFromEmailSelection: (id: string) => void
  clearEmailSelection: () => void
  showEmailPanel: boolean
  setShowEmailPanel: (show: boolean) => void
  
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
  },
  'english-french': {
    quick: `Expliquer brièvement "{text}" en français :
1- Mot : forme de base (si applicable), nature grammaticale, explication
2- Collocations/expressions : collocations ou expressions courantes
3- Exemples typiques en anglais : 2 exemples
4- Méthode d'utilisation
5- 1 Quiz sur la maîtrise de "{text}", doit être un exercice à trous, format :
Question: ...; Answer: ...; Explanation: ...
Attention, pas d'introduction, directement au contenu.`,
    standard: `Expliquer attentivement "{text}" :
1- Basic : mot, collocations, 2 exemples, explication concise
2- Advanced : points difficiles, techniques d'utilisation, contextes d'usage, oral/écrit etc., vous pouvez choisir 2-3 points à expliquer pour que je puisse comprendre et maîtriser, assurer une utilisation flexible.
3- Quiz, 1 exercice à trous sur la maîtrise de "{text}", format :
Question: ...; Answer: ...; Explanation: ...
Attention, pas d'introduction, directement au contenu.`,
    deep: `Expliquer en profondeur "{text}" pour que je puisse le maîtriser complètement :
1- Mots/expressions : mots/expressions relativement difficiles, chacun avec 1 exemple typique
2- Structure de phrase : analyser la structure de phrase de manière accessible
3- Grammaire : expliquer attentivement la grammaire impliquée de manière accessible, chaque point grammatical avec 1 exemple typique
4- Quiz, 1 exercice à trous sur la maîtrise de "{text}", format :
Question: ...; Answer: ...; Explanation: ...
Attention, pas d'introduction, directement au contenu.`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'english-japanese': {
    quick: `「{text}」を日本語で簡潔に説明：
1- 単語：原形（該当する場合は説明、該当しない場合は省略）、品詞、解釈
2- 組み合わせ/語句：よく使われる組み合わせや語句
3- 典型的な英語例文：2つ
4- 使用方法
5- 「{text}」の習得度に関するQuiz1問、必ず穴埋め問題、形式：
Question: ...; Answer: ...; Explanation: ...
注意、前置きなしで直接内容へ。`,
    standard: `「{text}」を注意深く説明：
1- Basic：単語、組み合わせ、例文2つ、簡潔な説明
2- Advanced：重要なポイント、使用技巧、使用場面、話し言葉/書き言葉など、2-3点を選んで説明し、理解して習得でき、柔軟に使用できるようにする。
3- Quiz、「{text}」の習得度に関する穴埋め問題1問、形式：
Question: ...; Answer: ...; Explanation: ...
注意、前置きなしで直接内容へ。`,
    deep: `「{text}」を完全に習得できるよう深く説明：
1- 単語/語句：比較的難しい単語/語句、それぞれに典型例文1つ
2- 文構造：分かりやすく文構造を分析
3- 文法：関連する文法を分かりやすく、注意深く説明し、各文法ポイントに典型例文1つ
4- Quiz、「{text}」の習得度に関する穴埋め問題1問、形式：
Question: ...; Answer: ...; Explanation: ...
注意、前置きなしで直接内容へ。`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'english-korean': {
    quick: `영어 "{text}"를 한국어로 간단명료하게 설명：
1- 단어：원형（해당하면 설명，해당하지 않으면 생략），품사，해석
2- 조합/어구：자주 사용하는 조합이나 어구
3- 전형적인 영어 예문：2개
4- 사용 방법
5- "{text}" 숙달 정도에 대한 Quiz 1문제，반드시 빈칸 문제，형식：
Question: ...; Answer: ...; Explanation: ...
주의，서론 없이 바로 내용으로。`,
    standard: `"{text}"를 주의깊게 설명：
1- Basic：단어，조합，예문 2개，간단명료한 설명
2- Advanced：중요 포인트，사용 기법，사용 장면，구어/문어 등등，2-3개 항목을 선택해서 설명하여 이해하고 숙달할 수 있도록，유연한 사용을 보장한다。
3- Quiz，"{text}" 숙달 정도에 대한 빈칸 문제 1문제，형식：
Question: ...; Answer: ...; Explanation: ...
주의，서론 없이 바로 내용으로。`,
    deep: `"{text}"를 완전히 숙달할 수 있도록 깊이 있게 설명：
1- 단어/어구：상대적으로 어려운 단어/어구，각각 전형적인 예문 1개씩
2- 문장 구조：알기 쉽게 문장 구조 분석
3- 문법：관련된 문법을 알기 쉽고 주의깊게 설명，각 문법 포인트에 전형적인 예문 1개씩
4- Quiz，"{text}" 숙달 정도에 대한 빈칸 문제 1문제，형식：
Question: ...; Answer: ...; Explanation: ...
주의，서론 없이 바로 내용으로。`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'english-russian': {
    quick: `Кратко объясните английское "{text}" на русском языке:
1- Слово: основная форма (если применимо), часть речи, объяснение
2- Сочетания/фразы: обычные сочетания или фразы  
3- Типичные английские примеры: 2 примера
4- Способ использования
5- 1 Quiz на владение "{text}", обязательно задание на пропуск, формат:
Question: ...; Answer: ...; Explanation: ...
Внимание, без предисловия, сразу к содержанию.`,
    standard: `Внимательно объясните "{text}":
1- Basic: слово, сочетания, 2 примера, краткое объяснение
2- Advanced: трудные моменты, техники использования, контексты использования, устная/письменная речь и т.д., можете выбрать 2-3 пункта для объяснения, чтобы я мог понять и освоить, обеспечить гибкое использование.
3- Quiz, 1 задание на пропуск для владения "{text}", формат:
Question: ...; Answer: ...; Explanation: ...
Внимание, без предисловия, сразу к содержанию.`,
    deep: `Глубоко объясните "{text}", чтобы я мог полностью освоить:
1- Слова/фразы: относительно сложные слова/фразы, каждое с 1 типичным примером
2- Структура предложения: доступно проанализировать структуру предложения
3- Грамматика: внимательно объяснить связанную грамматику доступным способом, каждый грамматический пункт с 1 типичным примером
4- Quiz, 1 задание на пропуск для владения "{text}", формат:
Question: ...; Answer: ...; Explanation: ...
Внимание, без предисловия, сразу к содержанию.`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'english-spanish': {
    quick: `Explicar brevemente "{text}" en español:
1- Palabra: forma base (si aplica), parte del habla, explicación
2- Colocaciones/frases: colocaciones o frases comunes
3- Ejemplos típicos en inglés: 2 ejemplos
4- Método de uso
5- 1 Quiz sobre el dominio de "{text}", debe ser ejercicio de llenar espacios, formato:
Question: ...; Answer: ...; Explanation: ...
Atención, sin introducción, directo al contenido.`,
    standard: `Explicar cuidadosamente "{text}":
1- Basic: palabra, colocaciones, 2 ejemplos, explicación concisa
2- Advanced: puntos difíciles, técnicas de uso, contextos de uso, oral/escrito etc., puede elegir 2-3 puntos para explicar para que pueda entender y dominar, asegurar uso flexible.
3- Quiz, 1 ejercicio de llenar espacios sobre dominio de "{text}", formato:
Question: ...; Answer: ...; Explanation: ...
Atención, sin introducción, directo al contenido.`,
    deep: `Explicar profundamente "{text}" para que pueda dominarlo completamente:
1- Palabras/frases: palabras/frases relativamente difíciles, cada una con 1 ejemplo típico
2- Estructura de oración: analizar la estructura de oración de manera accesible
3- Gramática: explicar atentamente la gramática relacionada de manera accesible, cada punto gramatical con 1 ejemplo típico
4- Quiz, 1 ejercicio de llenar espacios sobre dominio de "{text}", formato:
Question: ...; Answer: ...; Explanation: ...
Atención, sin introducción, directo al contenido.`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'english-arabic': {
    quick: `شرح موجز "{text}" بالعربية:
1- الكلمة: الشكل الأساسي (إن وجد)، نوع الكلمة، التفسير
2- التراكيب/العبارات: التراكيب أو العبارات الشائعة
3- أمثلة إنجليزية نموذجية: مثالان
4- طريقة الاستخدام  
5- اختبار واحد حول إتقان "{text}"، يجب أن يكون تمرين ملء الفراغات، التنسيق:
Question: ...; Answer: ...; Explanation: ...
تنبيه، بدون مقدمة، مباشرة إلى المحتوى.`,
    standard: `شرح "{text}" بعناية:
1- Basic: الكلمة، التراكيب، مثالان، شرح موجز
2- Advanced: النقاط الصعبة، تقنيات الاستخدام، سياقات الاستخدام، الشفهي/الكتابي إلخ، يمكنك اختيار 2-3 نقاط للشرح لكي أتمكن من الفهم والإتقان، ضمان الاستخدام المرن.
3- Quiz، تمرين ملء فراغات واحد حول إتقان "{text}"، التنسيق:
Question: ...; Answer: ...; Explanation: ...
تنبيه، بدون مقدمة، مباشرة إلى المحتوى.`,
    deep: `شرح "{text}" بعمق لكي أتمكن من إتقانه تماماً:
1- الكلمات/العبارات: كلمات/عبارات صعبة نسبياً، كل منها مع مثال نموذجي واحد
2- بنية الجملة: تحليل بنية الجملة بطريقة مفهومة
3- القواعد: شرح القواعد المتعلقة بعناية وبطريقة مفهومة، كل نقطة قواعدية مع مثال نموذجي واحد
4- Quiz، تمرين ملء فراغات واحد حول إتقان "{text}"، التنسيق:
Question: ...; Answer: ...; Explanation: ...
تنبيه، بدون مقدمة، مباشرة إلى المحتوى.`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },

  // ======= FRENCH Learning =======
  'french-chinese': {
    quick: `简明扼要用中文讲解法语 "{text}"：
1- 单词：原形（若有则讲，若无则不讲），词性，解释
2- 搭配/词组：常用搭配或者词组
3- 典型法语例句：2个
4- 使用方法
5- 1道对"{text}" 掌握情况的Quiz，必须是填空题，格式为:
Question: ...; Answer: ...; Explanation: ...
注意，不要开场白，直接讲内容。`,
    standard: `仔细讲解法语"{text}"：
1- Basic：单词、搭配，例句2个，简明扼要讲解
2- Advanced：重难点，使用技巧，使用场景，口语/写作等等，你可以选择2-3个讲解，目标是使我能理解和掌握，确保我能灵活运用。
3- Quiz，1道对"{text}" 掌握情况的填空题，格式为:
Question: ...; Answer: ...; Explanation: ...
注意，不要开场白，直接讲内容。`,
    deep: `深度讲解法语"{text}"，以便我能彻底完全掌握：
1- 单词/词组：相对较难的单词/词组，各搭配1个典型例句
2- 句子结构：通俗易懂的剖析句子结构
3- 语法：涉及的语法通俗易懂地、仔细地讲解，每个语法点搭配1个典型例句
4- Quiz，1道对"{text}" 掌握情况的填空题，格式为:
Question: ...; Answer: ...; Explanation: ...
注意，不要开场白，直接讲内容。`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'french-english': {
    quick: `Briefly explain French "{text}" in English:
1- Word: base form (if applicable), part of speech, explanation
2- Collocations/phrases: common collocations or phrases
3- Typical French examples: 2 examples
4- Usage method
5- 1 Quiz on mastery of "{text}", must be fill-in-the-blank, format:
Question: ...; Answer: ...; Explanation: ...
Note, no introduction, straight to content.`,
    standard: `Explain French "{text}" carefully:
1- Basic: word, collocations, 2 examples, concise explanation
2- Advanced: difficult points, usage techniques, usage contexts, oral/written etc., you can choose 2-3 points to explain so I can understand and master, ensure flexible usage.
3- Quiz, 1 fill-in-the-blank on mastery of "{text}", format:
Question: ...; Answer: ...; Explanation: ...
Note, no introduction, straight to content.`,
    deep: `Explain French "{text}" in depth for complete mastery:
1- Words/phrases: relatively difficult words/phrases, each with 1 typical example
2- Sentence structure: analyze sentence structure accessibly
3- Grammar: carefully explain related grammar accessibly, each grammar point with 1 typical example
4- Quiz, 1 fill-in-the-blank on mastery of "{text}", format:
Question: ...; Answer: ...; Explanation: ...
Note, no introduction, straight to content.`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'french-japanese': {
    quick: `フランス語「{text}」を日本語で簡潔に説明：
1- 単語：原形（該当する場合は説明、該当しない場合は省略）、品詞、解釈
2- 組み合わせ/語句：よく使われる組み合わせや語句
3- 典型的なフランス語例文：2つ
4- 使用方法
5- 「{text}」の習得度に関するQuiz1問、必ず穴埋め問題、形式：
Question: ...; Answer: ...; Explanation: ...
注意、前置きなしで直接内容へ。`,
    standard: `フランス語「{text}」を注意深く説明：
1- Basic：単語、組み合わせ、例文2つ、簡潔な説明
2- Advanced：重要なポイント、使用技巧、使用場面、話し言葉/書き言葉など、2-3点を選んで説明し、理解して習得でき、柔軟に使用できるようにする。
3- Quiz、「{text}」の習得度に関する穴埋め問題1問、形式：
Question: ...; Answer: ...; Explanation: ...
注意、前置きなしで直接内容へ。`,
    deep: `フランス語「{text}」を完全に習得できるよう深く説明：
1- 単語/語句：比較的難しい単語/語句、それぞれに典型例文1つ
2- 文構造：分かりやすく文構造を分析
3- 文法：関連する文法を分かりやすく、注意深く説明し、各文法ポイントに典型例文1つ
4- Quiz、「{text}」の習得度に関する穴埋め問題1問、形式：
Question: ...; Answer: ...; Explanation: ...
注意、前置きなしで直接内容へ。`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'french-korean': {
    quick: `프랑스어 "{text}"를 한국어로 간단명료하게 설명：
1- 단어：원형（해당하면 설명，해당하지 않으면 생략），품사，해석
2- 조합/어구：자주 사용하는 조합이나 어구
3- 전형적인 프랑스어 예문：2개
4- 사용 방법
5- "{text}" 숙달 정도에 대한 Quiz 1문제，반드시 빈칸 문제，형식：
Question: ...; Answer: ...; Explanation: ...
주의，서론 없이 바로 내용으로。`,
    standard: `프랑스어 "{text}"를 주의깊게 설명：
1- Basic：단어，조합，예문 2개，간단명료한 설명
2- Advanced：중요 포인트，사용 기법，사용 장면，구어/문어 등등，2-3개 항목을 선택해서 설명하여 이해하고 숙달할 수 있도록，유연한 사용을 보장한다。
3- Quiz，"{text}" 숙달 정도에 대한 빈칸 문제 1문제，형식：
Question: ...; Answer: ...; Explanation: ...
주의，서론 없이 바로 내용으로。`,
    deep: `프랑스어 "{text}"를 완전히 숙달할 수 있도록 깊이 있게 설명：
1- 단어/어구：상대적으로 어려운 단어/어구，각각 전형적인 예문 1개씩
2- 문장 구조：알기 쉽게 문장 구조 분석
3- 문법：관련된 문법을 알기 쉽고 주의깊게 설명，각 문법 포인트에 전형적인 예문 1개씩
4- Quiz，"{text}" 숙달 정도에 대한 빈칸 문제 1문제，형식：
Question: ...; Answer: ...; Explanation: ...
주의，서론 없이 바로 내용으로。`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'french-russian': {
    quick: `Кратко объясните французское "{text}" на русском языке:
1- Слово: основная форма (если применимо), часть речи, объяснение
2- Сочетания/фразы: обычные сочетания или фразы
3- Типичные французские примеры: 2 примера
4- Способ использования
5- 1 Quiz на владение "{text}", обязательно задание на пропуск, формат:
Question: ...; Answer: ...; Explanation: ...
Внимание, без предисловия, сразу к содержанию.`,
    standard: `Внимательно объясните французское "{text}":
1- Basic: слово, сочетания, 2 примера, краткое объяснение
2- Advanced: трудные моменты, техники использования, контексты использования, устная/письменная речь и т.д., можете выбрать 2-3 пункта для объяснения, чтобы я мог понять и освоить, обеспечить гибкое использование.
3- Quiz, 1 задание на пропуск для владения "{text}", формат:
Question: ...; Answer: ...; Explanation: ...
Внимание, без предисловия, сразу к содержанию.`,
    deep: `Глубоко объясните французское "{text}", чтобы я мог полностью освоить:
1- Слова/фразы: относительно сложные слова/фразы, каждое с 1 типичным примером
2- Структура предложения: доступно проанализировать структуру предложения
3- Грамматика: внимательно объяснить связанную грамматику доступным способом, каждый грамматический пункт с 1 типичным примером
4- Quiz, 1 задание на пропуск для владения "{text}", формат:
Question: ...; Answer: ...; Explanation: ...
Внимание, без предисловия, сразу к содержанию.`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'french-spanish': {
    quick: `Explicar brevemente francés "{text}" en español:
1- Palabra: forma base (si aplica), parte del habla, explicación
2- Colocaciones/frases: colocaciones o frases comunes
3- Ejemplos típicos en francés: 2 ejemplos
4- Método de uso
5- 1 Quiz sobre el dominio de "{text}", debe ser ejercicio de llenar espacios, formato:
Question: ...; Answer: ...; Explanation: ...
Atención, sin introducción, directo al contenido.`,
    standard: `Explicar cuidadosamente francés "{text}":
1- Basic: palabra, colocaciones, 2 ejemplos, explicación concisa
2- Advanced: puntos difíciles, técnicas de uso, contextos de uso, oral/escrito etc., puede elegir 2-3 puntos para explicar para que pueda entender y dominar, asegurar uso flexible.
3- Quiz, 1 ejercicio de llenar espacios sobre dominio de "{text}", formato:
Question: ...; Answer: ...; Explanation: ...
Atención, sin introducción, directo al contenido.`,
    deep: `Explicar profundamente francés "{text}" para que pueda dominarlo completamente:
1- Palabras/frases: palabras/frases relativamente difíciles, cada una con 1 ejemplo típico
2- Estructura de oración: analizar la estructura de oración de manera accesible
3- Gramática: explicar atentamente la gramática relacionada de manera accesible, cada punto gramatical con 1 ejemplo típico
4- Quiz, 1 ejercicio de llenar espacios sobre dominio de "{text}", formato:
Question: ...; Answer: ...; Explanation: ...
Atención, sin introducción, directo al contenido.`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'french-arabic': {
    quick: `شرح موجز الفرنسية "{text}" بالعربية:
1- الكلمة: الشكل الأساسي (إن وجد)، نوع الكلمة، التفسير
2- التراكيب/العبارات: التراكيب أو العبارات الشائعة
3- أمثلة فرنسية نموذجية: مثالان
4- طريقة الاستخدام
5- اختبار واحد حول إتقان "{text}"، يجب أن يكون تمرين ملء الفراغات، التنسيق:
Question: ...; Answer: ...; Explanation: ...
تنبيه، بدون مقدمة، مباشرة إلى المحتوى.`,
    standard: `شرح "{text}" الفرنسية بعناية:
1- Basic: الكلمة، التراكيب، مثالان، شرح موجز
2- Advanced: النقاط الصعبة، تقنيات الاستخدام، سياقات الاستخدام، الشفهي/الكتابي إلخ، يمكنك اختيار 2-3 نقاط للشرح لكي أتمكن من الفهم والإتقان، ضمان الاستخدام المرن.
3- Quiz، تمرين ملء فراغات واحد حول إتقان "{text}"، التنسيق:
Question: ...; Answer: ...; Explanation: ...
تنبيه، بدون مقدمة، مباشرة إلى المحتوى.`,
    deep: `شرح "{text}" الفرنسية بعمق لكي أتمكن من إتقانها تماماً:
1- الكلمات/العبارات: كلمات/عبارات صعبة نسبياً، كل منها مع مثال نموذجي واحد
2- بنية الجملة: تحليل بنية الجملة بطريقة مفهومة
3- القواعد: شرح القواعد المتعلقة بعناية وبطريقة مفهومة، كل نقطة قواعدية مع مثال نموذجي واحد
4- Quiz، تمرين ملء فراغات واحد حول إتقان "{text}"، التنسيق:
Question: ...; Answer: ...; Explanation: ...
تنبيه، بدون مقدمة، مباشرة إلى المحتوى.`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },

  // ======= JAPANESE Learning =======
  'japanese-chinese': {
    quick: `简明扼要用中文讲解日语 "{text}"：
1- 单词：原形（若有则讲，若无则不讲），词性，解释
2- 搭配/词组：常用搭配或者词组
3- 典型日语例句：2个
4- 使用方法
5- 1道对"{text}" 掌握情况的Quiz，必须是填空题，格式为:
Question: ...; Answer: ...; Explanation: ...
注意，不要开场白，直接讲内容。`,
    standard: `仔细讲解日语"{text}"：
1- Basic：单词、搭配，例句2个，简明扼要讲解
2- Advanced：重难点，使用技巧，使用场景，口语/写作等等，你可以选择2-3个讲解，目标是使我能理解和掌握，确保我能灵活运用。
3- Quiz，1道对"{text}" 掌握情况的填空题，格式为:
Question: ...; Answer: ...; Explanation: ...
注意，不要开场白，直接讲内容。`,
    deep: `深度讲解日语"{text}"，以便我能彻底完全掌握：
1- 单词/词组：相对较难的单词/词组，各搭配1个典型例句
2- 句子结构：通俗易懂的剖析句子结构
3- 语法：涉及的语法通俗易懂地、仔细地讲解，每个语法点搭配1个典型例句
4- Quiz，1道对"{text}" 掌握情况的填空题，格式为:
Question: ...; Answer: ...; Explanation: ...
注意，不要开场白，直接讲内容。`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'japanese-english': {
    quick: `Briefly explain Japanese "{text}" in English:
1- Word: base form (if applicable), part of speech, explanation
2- Collocations/phrases: common collocations or phrases
3- Typical Japanese examples: 2 examples
4- Usage method
5- 1 Quiz on mastery of "{text}", must be fill-in-the-blank, format:
Question: ...; Answer: ...; Explanation: ...
Note, no introduction, straight to content.`,
    standard: `Explain Japanese "{text}" carefully:
1- Basic: word, collocations, 2 examples, concise explanation
2- Advanced: difficult points, usage techniques, usage contexts, oral/written etc., you can choose 2-3 points to explain so I can understand and master, ensure flexible usage.
3- Quiz, 1 fill-in-the-blank on mastery of "{text}", format:
Question: ...; Answer: ...; Explanation: ...
Note, no introduction, straight to content.`,
    deep: `Explain Japanese "{text}" in depth for complete mastery:
1- Words/phrases: relatively difficult words/phrases, each with 1 typical example
2- Sentence structure: analyze sentence structure accessibly
3- Grammar: carefully explain related grammar accessibly, each grammar point with 1 typical example
4- Quiz, 1 fill-in-the-blank on mastery of "{text}", format:
Question: ...; Answer: ...; Explanation: ...
Note, no introduction, straight to content.`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'japanese-japanese': {
    quick: `日本語「{text}」を日本語で簡潔に説明：
1- 単語：原形（該当する場合は説明、該当しない場合は省略）、品詞、解釈
2- 組み合わせ/語句：よく使われる組み合わせや語句
3- 典型的な日本語例文：2つ
4- 使用方法
5- 「{text}」の習得度に関するQuiz1問、必ず穴埋め問題、形式：
Question: ...; Answer: ...; Explanation: ...
注意、前置きなしで直接内容へ。`,
    standard: `日本語「{text}」を注意深く説明：
1- Basic：単語、組み合わせ、例文2つ、簡潔な説明
2- Advanced：重要なポイント、使用技巧、使用場面、話し言葉/書き言葉など、2-3点を選んで説明し、理解して習得でき、柔軟に使用できるようにする。
3- Quiz、「{text}」の習得度に関する穴埋め問題1問、形式：
Question: ...; Answer: ...; Explanation: ...
注意、前置きなしで直接内容へ。`,
    deep: `日本語「{text}」を完全に習得できるよう深く説明：
1- 単語/語句：比較的難しい単語/語句、それぞれに典型例文1つ
2- 文構造：分かりやすく文構造を分析
3- 文法：関連する文法を分かりやすく、注意深く説明し、各文法ポイントに典型例文1つ
4- Quiz、「{text}」の習得度に関する穴埋め問題1問、形式：
Question: ...; Answer: ...; Explanation: ...
注意、前置きなしで直接内容へ。`,
    ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
  },
  'japanese-french': {
    quick: `Expliquer brièvement japonais "{text}" en français:
1- Mot: forme de base (si applicable), nature grammaticale, explication
2- Collocations/expressions: collocations ou expressions courantes
3- Exemples typiques japonais: 2 exemples
4- Méthode d'utilisation
5- 1 Quiz sur la maîtrise de "{text}", doit être un exercice à trous, format:
Question: ...; Answer: ...; Explanation: ...
Attention, pas d'introduction, directement au contenu.`,
    standard: `Expliquer attentivement japonais "{text}":
1- Basic: mot, collocations, 2 exemples, explication concise
2- Advanced: points difficiles, techniques d'utilisation, contextes d'usage, oral/écrit etc., vous pouvez choisir 2-3 points à expliquer pour que je puisse comprendre et maîtriser, assurer une utilisation flexible.
3- Quiz, 1 exercice à trous sur la maîtrise de "{text}", format:
Question: ...; Answer: ...; Explanation: ...
Attention, pas d'introduction, directement au contenu.`,
    deep: `Expliquer en profondeur japonais "{text}" pour que je puisse le maîtriser complètement:
1- Mots/expressions: mots/expressions relativement difficiles, chacun avec 1 exemple typique
2- Structure de phrase: analyser la structure de phrase de manière accessible
3- Grammaire: expliquer attentivement la grammaire impliquée de manière accessible, chaque point grammatical avec 1 exemple typique
4- Quiz, 1 exercice à trous sur la maîtrise de "{text}", format:
Question: ...; Answer: ...; Explanation: ...
Attention, pas d'introduction, directement au contenu.`,
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
  
  // Quiz
  fillInQuestions: [],
  dictationQuestions: [],
  setFillInQuestions: (questions) => set({ fillInQuestions: questions }),
  setDictationQuestions: (questions) => set({ dictationQuestions: questions }),
  currentQuizIndex: 0,
  setCurrentQuizIndex: (index) => set({ currentQuizIndex: index }),
  isGeneratingQuiz: false,
  setIsGeneratingQuiz: (generating) => set({ isGeneratingQuiz: generating }),
  quizMode: 'fill-in',
  setQuizMode: (mode) => set({ quizMode: mode }),
  
  getCurrentQuestions: () => {
    const state = useReadLinguaStore.getState()
    return state.quizMode === 'dictation' ? state.dictationQuestions : state.fillInQuestions
  },
  
  generateQuizQuestions: () => {
    const state = useReadLinguaStore.getState()
    
    if (!state.selectedArticle) return
    
    // Prevent multiple concurrent generations
    if (state.isGeneratingQuiz) return
    
    // Filter queries for quiz (exclude ask_ai, must have selected_text and ai_response)
    const quizCandidates = state.queries.filter(q => 
      q.query_type !== 'ask_ai' && 
      q.selected_text && 
      q.selected_text.trim() && 
      q.ai_response && 
      q.ai_response.trim()
    )
    
    if (quizCandidates.length === 0) return
    
    set({ isGeneratingQuiz: true, fillInQuestions: [], currentQuizIndex: 0 })
    
    try {
      // Extract quiz from existing ai_response
      const extractQuizFromResponse = (aiResponse: string) => {
        // Look for Question:, Answer:, Explanation: pattern
        const questionMatch = aiResponse.match(/Question:\s*(.+?)(?=Answer:|$)/)
        const answerMatch = aiResponse.match(/Answer:\s*(.+?)(?=Explanation:|$)/)  
        const explanationMatch = aiResponse.match(/Explanation:\s*(.+?)$/)
        
        return {
          question: questionMatch?.[1]?.trim(),
          answer: answerMatch?.[1]?.trim(), 
          explanation: explanationMatch?.[1]?.trim()
        }
      }
      
      // Process queries and extract quiz data
      const quizQuestions = quizCandidates
        .map((query, index) => {
          const quizData = extractQuizFromResponse(query.ai_response)
          
          // Only include if we found valid quiz data
          if (!quizData.question || !quizData.answer) {
            return null
          }
          
          return {
            id: `quiz-${query.id}-${index}`,
            question: quizData.question,
            answer: quizData.answer,
            explanation: quizData.explanation || '',
            originalQuery: query,
            userAnswer: undefined,
            isCorrect: undefined,
            isAnswered: false
          }
        })
        .filter(Boolean) // Remove null entries
        .sort(() => 0.5 - Math.random()) // Randomize
        .slice(0, 15) // Take up to 15 questions
      
      set({ fillInQuestions: quizQuestions })
      
    } catch (error) {
      console.error('Error processing quiz questions:', error)
    } finally {
      // Ensure isGeneratingQuiz is always reset
      set({ isGeneratingQuiz: false })
    }
  },
  
  generateDictationQuestions: () => {
    const state = useReadLinguaStore.getState()
    if (!state.selectedArticle) return
    
    // Prevent multiple concurrent generations
    if (state.isGeneratingQuiz) return
    
    // Check if article supports pronunciation (English or French)
    const supportsPronunciation = ['english', 'french'].includes(state.selectedArticle.source_language)
    if (!supportsPronunciation) return
    
    // Filter queries for dictation (exclude ask_ai, must have selected_text)
    const dictationCandidates = state.queries.filter((q: Query) => 
      q.query_type !== 'ask_ai' && 
      q.selected_text && 
      q.selected_text.trim()
    )
    
    if (dictationCandidates.length === 0) return
    
    set({ isGeneratingQuiz: true, dictationQuestions: [], currentQuizIndex: 0 })
    
    try {
      // Create dictation questions using selected_text as answer
      const dictationQuestions = dictationCandidates
        .map((query: Query, index: number) => ({
          id: `dictation-${query.id}-${index}`,
          question: `Listen and type what you hear:`, // Standard question for all dictation
          answer: query.selected_text!.trim(),
          explanation: '', // No explanation needed for dictation
          originalQuery: query,
          userAnswer: undefined,
          isCorrect: undefined,
          isAnswered: false
        }))
        .sort(() => 0.5 - Math.random()) // Randomize
        .slice(0, 15) // Take up to 15 questions
      
      set({ dictationQuestions: dictationQuestions })
      
    } catch (error) {
      console.error('Error processing dictation questions:', error)
    } finally {
      // Ensure isGeneratingQuiz is always reset
      set({ isGeneratingQuiz: false })
    }
  },
  
  submitQuizAnswer: (index, answer) => set((state) => {
    const currentQuestions = state.quizMode === 'dictation' ? state.dictationQuestions : state.fillInQuestions
    const updatedQuestions = [...currentQuestions]
    const question = updatedQuestions[index]
    
    if (question) {
      question.userAnswer = answer.trim()
      // For dictation mode, require exact match (case-insensitive)
      // For fill-in mode, use existing logic
      if (state.quizMode === 'dictation') {
        question.isCorrect = answer.trim().toLowerCase() === question.answer.toLowerCase()
      } else {
        question.isCorrect = answer.trim().toLowerCase() === question.answer.toLowerCase()
      }
      question.isAnswered = true
      
      if (state.quizMode === 'dictation') {
        return { 
          dictationQuestions: updatedQuestions,
          currentQuizIndex: Math.min(index + 1, updatedQuestions.length - 1)
        }
      } else {
        return { 
          fillInQuestions: updatedQuestions,
          currentQuizIndex: Math.min(index + 1, updatedQuestions.length - 1)
        }
      }
    }
    
    return state
  }),
  
  // AI Tooltips  
  aiTooltips: [],
  
  addAITooltip: (tooltip) => {
    const id = `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const tooltipCount = useReadLinguaStore.getState().aiTooltips.length
    
    // Simple position offset strategy
    const offsetX = (tooltipCount % 3) * 50
    const offsetY = Math.floor(tooltipCount / 3) * 50
    
    const newTooltip: AITooltip = {
      ...tooltip,
      id,
      position: {
        x: tooltip.position.x + offsetX,
        y: tooltip.position.y + offsetY
      },
      createdAt: Date.now()
    }
    
    set((state) => ({
      aiTooltips: [...state.aiTooltips, newTooltip]
    }))
    
    return id
  },
  
  updateAITooltip: (id, updates) => set((state) => ({
    aiTooltips: state.aiTooltips.map(tooltip =>
      tooltip.id === id ? { ...tooltip, ...updates } : tooltip
    )
  })),
  
  removeAITooltip: (id) => set((state) => ({
    aiTooltips: state.aiTooltips.filter(tooltip => tooltip.id !== id)
  })),
  
  clearAllTooltips: () => set({ aiTooltips: [] }),
  
  // Email Selection
  selectedEmailContents: [],
  
  addToEmailSelection: (content) => set((state) => {
    const id = `email-content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const timestamp = new Date().toISOString()
    
    const newContent: SelectedEmailContent = {
      ...content,
      id,
      timestamp
    }
    
    return { selectedEmailContents: [...state.selectedEmailContents, newContent] }
  }),
  
  removeFromEmailSelection: (id) => set((state) => ({
    selectedEmailContents: state.selectedEmailContents.filter(content => content.id !== id)
  })),
  
  clearEmailSelection: () => set({ selectedEmailContents: [] }),
  
  showEmailPanel: false,
  setShowEmailPanel: (show) => set({ showEmailPanel: show }),
  
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