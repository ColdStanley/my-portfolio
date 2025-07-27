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
        wordAnalysis: `请用简洁易懂的方式解释这个${targetLangName}单词 "{word}" 在句子 "{sentence}" 中的意思和用法。

请按照以下结构回答，并确保每一项都非常简短、清晰：

1. 中文解释（1句话，告诉我这个词在句中是什么意思）
2. 用法说明（最多2句话，说明它在语法上起什么作用）
3. 简单例句（1个${targetLangName}例句 + 中文翻译，例句不能太难）

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

    case 'english':
      return {
        wordAnalysis: `Please explain this ${targetLangName} word "{word}" in the sentence "{sentence}" in a simple and clear way.

Please follow this structure and keep each point very brief and clear:

1. English explanation (1 sentence, tell me what this word means in the sentence)
2. Usage explanation (maximum 2 sentences, explain its grammatical role)
3. Simple example (1 ${targetLangName} example sentence + English translation, keep it simple)

Don't use too many technical terms or grammar details. Keep the style gentle and concise, suitable for ${targetLangName} beginners.`,

        phraseAnalysis: `Please help me learn the important phrases in this ${targetLangName} sentence.  
I'm a ${targetLangName} beginner, so please explain it simply and clearly, avoiding complex grammar terms or long sentences.

The sentence is:  
"{sentence}"

Please find 2-4 most representative ${targetLangName} **phrases (2+ words)**, then explain each one following this structure:

1. Original phrase (e.g., ${target === 'french' ? 'passer maître dans...' : 'example phrase'})
2. English meaning (explain in one simple sentence)
3. Usage explanation (maximum 2 sentences, explain what it does in the sentence, not too technical)
4. Simple examples (3 simple ${targetLangName} sentences + English translations)
5. Memory tips (optional, provide memory methods or tips)

Please list each phrase explanation following the above format.`,

        grammarAnalysis: `Please analyze the grammar structure of this sentence in a way suitable for ${targetLangName} beginners:

"{sentence}"

Please follow this structure and keep each point concise and clear, without using too many technical terms:

1. What is the overall structure of this sentence?  
   → How many parts does it have? (e.g., main clause / subordinate clause / parenthetical, etc.)

2. What tenses are used in this sentence?  
   → What time concept does each tense represent? Why is it used?

3. What logical relationship is expressed?  
   → Is it concession? hypothesis? contrast? cause and effect?

4. What does each part say?  
   → Explain each part in plain English

5. What common mistakes do ${targetLangName} beginners make?  
   → Which parts of this sentence are easily misunderstood or misused?

Please don't explain vocabulary or show difficult grammar rules, just focus on the "organizational" logic of the entire sentence.`
      }

    case 'spanish':
      return {
        wordAnalysis: `Por favor explica esta palabra en ${targetLangName} "{word}" en la oración "{sentence}" de manera simple y clara.

Por favor sigue esta estructura y mantén cada punto muy breve y claro:

1. Explicación en español (1 oración, dime qué significa esta palabra en la oración)
2. Explicación de uso (máximo 2 oraciones, explica su papel gramatical)
3. Ejemplo simple (1 oración de ejemplo en ${targetLangName} + traducción al español, manténlo simple)

No uses demasiados términos técnicos o detalles gramaticales. Mantén el estilo suave y conciso, adecuado para principiantes de ${targetLangName}.`,

        phraseAnalysis: `Por favor ayúdame a aprender las frases importantes en esta oración en ${targetLangName}.  
Soy principiante en ${targetLangName}, así que por favor explícalo de manera simple y clara, evitando términos gramaticales complejos.

La oración es:  
"{sentence}"

Por favor encuentra 2-4 **frases más representativas en ${targetLangName} (2+ palabras)**, luego explica cada una siguiendo esta estructura:

1. Frase original (ej: ${target === 'french' ? 'passer maître dans...' : 'frase de ejemplo'})
2. Significado en español (explica en una oración simple)
3. Explicación de uso (máximo 2 oraciones, explica qué hace en la oración, no muy técnico)
4. Ejemplos simples (3 oraciones simples en ${targetLangName} + traducciones al español)
5. Consejos de memoria (opcional, proporciona métodos de memoria o consejos)

Por favor enumera cada explicación de frase siguiendo el formato anterior.`,

        grammarAnalysis: `Por favor analiza la estructura gramatical de esta oración de manera adecuada para principiantes de ${targetLangName}:

"{sentence}"

Por favor sigue esta estructura y mantén cada punto conciso y claro, sin usar demasiados términos técnicos:

1. ¿Cuál es la estructura general de esta oración?  
   → ¿Cuántas partes tiene? (ej: oración principal / oración subordinada / paréntesis, etc.)

2. ¿Qué tiempos se usan en esta oración?  
   → ¿Qué concepto de tiempo representa cada tiempo? ¿Por qué se usa?

3. ¿Qué relación lógica se expresa?  
   → ¿Es concesión? ¿hipótesis? ¿contraste? ¿causa y efecto?

4. ¿Qué dice cada parte?  
   → Explica cada parte en español simple

5. ¿Qué errores comunes cometen los principiantes de ${targetLangName}?  
   → ¿Qué partes de esta oración se malentienden o usan mal fácilmente?

No expliques vocabulario ni muestres reglas gramaticales difíciles, solo enfócate en la lógica "organizacional" de toda la oración.`
      }

    default:
      // Fallback to English
      return getPromptTemplates({ ...config, native: 'english' })
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