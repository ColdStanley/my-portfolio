'use client'

import React, { useState, useRef } from 'react'
import { Language, getUITexts } from '../config/uiText'
import AnimatedButton from './AnimatedButton'
import { playText } from '../utils/tts'

interface SentenceQuery {
  id: number
  sentence_text: string
  translation: string
  analysis: string
  start_offset: number
  end_offset: number
  query_type?: string
  user_notes?: string
  ai_notes?: string
  language?: string
}

interface FrenchSentenceCardProps {
  query: SentenceQuery
  language: Language
  articleId: number
  onDelete: (id: number) => void
  onScrollToHighlight: (query: SentenceQuery) => void
  onAskAI: (query: SentenceQuery) => void
}

type TabType = 'words' | 'phrases' | 'grammar' | 'test'

interface WordQuery {
  id: string
  word: string
  response: string
  isStreaming: boolean
  timestamp: number
}

export default function FrenchSentenceCard({ 
  query, 
  language, 
  articleId,
  onDelete, 
  onScrollToHighlight, 
  onAskAI 
}: FrenchSentenceCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('words')
  const [wordQueries, setWordQueries] = useState<WordQuery[]>([])
  const [wordInput, setWordInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [playingText, setPlayingText] = useState<string | null>(null)
  const [phrasesAnalysis, setPhrasesAnalysis] = useState('')
  const [isLoadingPhrases, setIsLoadingPhrases] = useState(false)
  const [grammarAnalysis, setGrammarAnalysis] = useState('')
  const [isLoadingGrammar, setIsLoadingGrammar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const uiTexts = getUITexts(language)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Check if mobile on mount
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle TTS playback
  const handleSpeak = async (text: string) => {
    if (playingText === text) return // Already playing this text
    
    try {
      setPlayingText(text)
      await playText(text, language, 0.8)
    } catch (error) {
      console.error('TTS failed:', error)
    } finally {
      setPlayingText(null)
    }
  }

  // Parse markdown-like formatting in text
  const parseMarkdown = (text: string) => {
    // Handle markdown headers (### text) - remove the # symbols
    let processedText = text.replace(/^(#{1,3})\s+(.+)$/gm, '$2')
    
    // Handle **bold** text
    const boldRegex = /\*\*(.*?)\*\*/g
    // Handle *italic* text
    const italicRegex = /\*(.*?)\*/g
    
    // Split text by bold markers first
    const parts = processedText.split(boldRegex)
    const elements: (string | JSX.Element)[] = []
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text or italic
        const regularText = parts[i]
        const italicParts = regularText.split(italicRegex)
        
        for (let j = 0; j < italicParts.length; j++) {
          if (j % 2 === 0) {
            // Regular text
            if (italicParts[j]) {
              elements.push(italicParts[j])
            }
          } else {
            // Italic text
            elements.push(
              <em key={`italic-${i}-${j}`} className="italic">
                {italicParts[j]}
              </em>
            )
          }
        }
      } else {
        // Bold text
        elements.push(
          <strong key={`bold-${i}`} className="font-semibold">
            {parts[i]}
          </strong>
        )
      }
    }
    
    return elements.length === 1 && typeof elements[0] === 'string' 
      ? elements[0] 
      : <span>{elements}</span>
  }

  // Format AI response with structured styling and add pronunciation buttons only to example sentences
  const formatAIResponse = (response: string) => {
    const lines = response.split('\n').filter(line => line.trim())
    const elements: JSX.Element[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Check for numbered sections (1. 2. 3.) or markdown headers (### 1.) - format the AI's own titles
      if (line.match(/^(#{1,3}\s*)?[1-5]\.\s/)) {
        // This is a title line from AI, format it as a card
        elements.push(
          <div key={i} className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-300 mb-3">
            <div className="text-sm font-semibold text-purple-800 mb-2">
              {parseMarkdown(line)}
            </div>
          </div>
        )
      } else if (line.includes('→') || line.includes('翻译:') || line.includes('翻译：')) {
        // Translation lines - special styling
        elements.push(
          <div key={i} className="text-xs text-gray-600 italic pl-4 border-l-2 border-gray-200 mb-2">
            {parseMarkdown(line)}
          </div>
        )
      } else if (line.length > 0) {
        // Regular content - check if it should be part of the previous card
        if (elements.length > 0 && elements[elements.length - 1].props.className.includes('bg-purple-50')) {
          // Add content to the last card
          const lastCard = elements[elements.length - 1]
          
          // Check if this is the third section (example sentence section)
          const cardText = lastCard.props?.children?.[0]?.props?.children
          const isThirdSection = (typeof cardText === 'string' && cardText.startsWith('3.')) || 
                                (Array.isArray(cardText) && cardText[0] && cardText[0].toString().startsWith('3.')) ||
                                false
          
          
          elements[elements.length - 1] = (
            <div key={lastCard.key} className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-300 mb-3">
              {lastCard.props.children}
              <div className="text-sm text-gray-700 leading-relaxed">
                {isThirdSection ? addExampleSentencePronunciation(parseMarkdown(line), `card-${i}`) : parseMarkdown(line)}
              </div>
            </div>
          )
        } else {
          // Standalone content
          elements.push(
            <div key={i} className="text-sm text-gray-700 mb-2 leading-relaxed">
              {parseMarkdown(line)}
            </div>
          )
        }
      }
    }
    
    return elements.length > 0 ? elements : (
      <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
        {parseMarkdown(response)}
      </div>
    )
  }

  // Add pronunciation button only to example sentences (used in section 3)
  const addExampleSentencePronunciation = (content: string | JSX.Element, keyPrefix: string) => {
    if (typeof content === 'string') {
      // Simple logic: find text that starts with letter and ends with . ! ?
      const parts = []
      let remaining = content
      let partIndex = 0
      
      // Find all sentences that start with letter and end with . ! ?
      const sentencePattern = /([a-zA-Z][^.!?]*[.!?])/g
      let match
      let lastIndex = 0
      
      while ((match = sentencePattern.exec(content)) !== null) {
        // Add text before the sentence
        if (match.index > lastIndex) {
          parts.push(
            <span key={`${keyPrefix}-text-${partIndex++}`}>
              {content.substring(lastIndex, match.index)}
            </span>
          )
        }
        
        const sentence = match[1]
        const cleanSentence = sentence.replace(/^[""]|[""]$/g, '').trim() // Remove quotes
        
        // Add sentence with speaker button
        parts.push(
          <span key={`${keyPrefix}-sentence-${partIndex++}`} className="inline-flex items-center gap-1">
            <span>{sentence}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSpeak(cleanSentence)
              }}
              disabled={playingText === cleanSentence}
              className="text-purple-400 hover:text-purple-600 hover:bg-purple-50 p-0.5 rounded-full transition-all duration-200 disabled:opacity-50 ml-1"
              title={`播放例句: ${cleanSentence}`}
            >
              {playingText === cleanSentence ? (
                <div className="animate-spin rounded-full h-2.5 w-2.5 border-b border-purple-500"></div>
              ) : (
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </span>
        )
        
        lastIndex = match.index + match[0].length
      }
      
      // Add remaining text after last sentence
      if (lastIndex < content.length) {
        parts.push(
          <span key={`${keyPrefix}-text-${partIndex++}`}>
            {content.substring(lastIndex)}
          </span>
        )
      }
      
      return parts.length > 0 ? <span>{parts}</span> : content
    } else {
      // JSX element - return as is
      return content
    }
  }

  // Handle word query submission
  const handleWordQuery = async (word: string) => {
    if (!word.trim() || isLoading) return
    
    // Check if word already exists
    const existingQuery = wordQueries.find(q => q.word.toLowerCase() === word.trim().toLowerCase())
    if (existingQuery) {
      setWordInput('')
      return
    }

    const queryId = Date.now().toString()
    const newQuery: WordQuery = {
      id: queryId,
      word: word.trim(),
      response: '',
      isStreaming: true,
      timestamp: Date.now()
    }

    // Add new query to the top of the list
    setWordQueries(prev => [newQuery, ...prev])
    setWordInput('')
    setIsLoading(true)

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      console.log('Making API request with data:', {
        queryData: query,
        language: language,
        userPrompt: `请用简洁易懂的方式解释这个法语单词 "${word}" 在句子 "${query.sentence_text}" 中的意思和用法。`
      })
      
      const response = await fetch('/api/language-reading/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryData: query,
          language: language,
          userPrompt: `请用简洁易懂的方式解释这个法语单词 "${word}" 在句子 "${query.sentence_text}" 中的意思和用法。

请按照以下结构回答，并确保每一项都非常简短、清晰：

1. 中文解释（1句话，告诉我这个词在句中是什么意思）
2. 用法说明（最多2句话，说明它在语法上起什么作用）
3. 简单例句（2个法语例句 + 中文翻译，例句不能太难，若例句含有有价值的词组或者语法，也简单讲解一下）

不要添加过多术语或语法细节。风格要温和、简洁，适合法语初学者阅读。`
        }),
        signal: abortControllerRef.current.signal
      })

      console.log('Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`API request failed: ${response.status} ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulatedResponse = ''

      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]') {
              break
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.content
              
              if (content) {
                accumulatedResponse += content
                console.log('Received content chunk:', content)
                
                // Update the streaming query
                setWordQueries(prev => 
                  prev.map(q => 
                    q.id === queryId 
                      ? { ...q, response: accumulatedResponse }
                      : q
                  )
                )
              }
            } catch (e) {
              console.log('Failed to parse data:', data, e)
              continue
            }
          }
        }
      }

      // Mark streaming as complete
      setWordQueries(prev => 
        prev.map(q => 
          q.id === queryId 
            ? { ...q, isStreaming: false }
            : q
        )
      )

      // Save word query to database
      if (accumulatedResponse) {
        try {
          await fetch('/api/language-reading/save-phrase-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articleId: articleId,
              sentenceText: `${query.sentence_text}::word::${word.trim()}`, // Format for mobile compatibility
              analysis: accumulatedResponse,
              startOffset: query.start_offset,
              endOffset: query.end_offset,
              language: language,
              contentType: 'word_query'
            })
          })
        } catch (saveError) {
          console.error('Failed to save word query:', saveError)
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted, remove the query
        setWordQueries(prev => prev.filter(q => q.id !== queryId))
      } else {
        console.error('Word query failed:', error)
        // Update with error message
        setWordQueries(prev => 
          prev.map(q => 
            q.id === queryId 
              ? { ...q, response: '查询失败，请重试', isStreaming: false }
              : q
          )
        )
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleWordInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleWordQuery(wordInput)
  }

  // Handle word click in highlighted sentence
  const handleWordClick = (word: string) => {
    // Switch to words tab
    setActiveTab('words')
    
    // Find existing word query
    const existingQuery = wordQueries.find(q => q.word.toLowerCase() === word.toLowerCase())
    if (existingQuery) {
      // Scroll to existing word query (optional: add visual feedback)
      setTimeout(() => {
        const wordElement = document.querySelector(`[data-word-id="${existingQuery.id}"]`)
        if (wordElement) {
          wordElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Add brief highlight effect
          const element = wordElement as HTMLElement
          element.style.boxShadow = '0 0 10px rgba(147, 51, 234, 0.3)'
          setTimeout(() => {
            element.style.boxShadow = ''
          }, 1000)
        }
      }, 100)
    } else {
      // Query the word if not already queried
      handleWordQuery(word)
    }
  }

  // Render sentence with highlighted words
  const renderHighlightedSentence = () => {
    const sentenceText = query.sentence_text
    if (!wordQueries.length) {
      return sentenceText
    }

    // Create a list of words that have been queried
    const queriedWords = wordQueries.map(q => q.word.toLowerCase())
    
    // Split sentence into words while preserving spaces and punctuation
    const tokens = sentenceText.split(/(\s+|[.,!?;:()'"«»\-])/g)
    
    return tokens.map((token, index) => {
      const cleanToken = token.replace(/[.,!?;:()'"«»\-]/g, '').toLowerCase()
      
      // Check if this token (word) has been queried
      if (queriedWords.includes(cleanToken) && cleanToken.length > 0) {
        return (
          <mark
            key={index}
            className="inline-block px-2 py-1 rounded-lg bg-purple-100/20 text-purple-800 backdrop-blur-xs shadow-sm transition-all duration-200 ease-in-out hover:bg-purple-200/30 hover:shadow-md hover:scale-[1.005] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              handleWordClick(cleanToken)
            }}
            title={`点击查看 "${cleanToken}" 的解释`}
          >
            {token}
          </mark>
        )
      }
      
      return token
    })
  }

  // Load existing data on mount
  React.useEffect(() => {
    const loadExistingData = async () => {
      try {
        // Load phrase analysis for this specific sentence
        const phrasesResponse = await fetch(`/api/language-reading/queries?articleId=${articleId}&type=sentence&contentType=phrase_analysis&language=${language}&sentenceId=${query.id}`)
        if (phrasesResponse.ok) {
          const phrasesData = await phrasesResponse.json()
          if (phrasesData && phrasesData.length > 0) {
            setPhrasesAnalysis(phrasesData[0].analysis)
          }
        }

        // Load grammar analysis for this specific sentence
        const grammarResponse = await fetch(`/api/language-reading/queries?articleId=${articleId}&type=sentence&contentType=grammar_analysis&language=${language}&sentenceId=${query.id}`)
        if (grammarResponse.ok) {
          const grammarData = await grammarResponse.json()
          if (grammarData && grammarData.length > 0) {
            setGrammarAnalysis(grammarData[0].analysis)
          }
        }

        // Load word queries for this specific sentence
        const wordsResponse = await fetch(`/api/language-reading/queries?articleId=${articleId}&type=sentence&contentType=word_query&language=${language}&sentenceId=${query.id}`)
        if (wordsResponse.ok) {
          const wordsData = await wordsResponse.json()
          if (wordsData && wordsData.length > 0) {
            const savedWordQueries = wordsData.map((item: any) => {
              // Extract word from formatted sentence_text (for mobile compatibility)
              let word = item.sentence_text
              
              // Check if it's the new mobile format: "sentence::word::actualword"
              const wordMatch = item.sentence_text.match(/::word::(.+)$/)
              if (wordMatch) {
                word = wordMatch[1]
              }
              
              return {
                id: item.id.toString(),
                word: word,
                response: item.analysis,
                isStreaming: false,
                timestamp: new Date(item.created_at).getTime()
              }
            })
            setWordQueries(savedWordQueries)
          }
        }
      } catch (error) {
        console.error('Failed to load existing data:', error)
      }
    }
    
    loadExistingData()
  }, [query.id, articleId, language])

  // Handle phrases analysis
  const handleAnalyzePhrases = async () => {
    if (isLoadingPhrases) return
    
    setIsLoadingPhrases(true)
    setPhrasesAnalysis('')

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/language-reading/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryData: query,
          language: language,
          userPrompt: `请你帮助我学习下面这句法语中的重要词组。  
我的法语水平是初学者，所以请你讲解得简单、清晰，避免用太复杂的语法术语或长难句。

句子是：  
"${query.sentence_text}"

请你找出其中2–4个最有代表性的法语**词组（2词以上）**，然后按以下结构逐个解释：

1. 词组原文（如：passer maître dans...）
2. 中文意思（用一句话简单解释）
3. 用法说明（最多两句话，说明它在句中做什么，不要太术语化）
4. 简单例句（3个简单的法语句子 + 中文翻译）
5. 联想记忆建议（可选，给出记忆方法或小贴士）

请按以上格式分别列出每个词组的讲解。`
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulatedResponse = ''
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]') {
              break
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.content
              
              if (content) {
                accumulatedResponse += content
                setPhrasesAnalysis(accumulatedResponse)
              }
            } catch (e) {
              continue
            }
          }
        }
      }

      // Save to database after successful analysis
      if (accumulatedResponse) {
        try {
          await fetch('/api/language-reading/save-phrase-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articleId: articleId,
              sentenceText: query.sentence_text,
              analysis: accumulatedResponse,
              startOffset: query.start_offset,
              endOffset: query.end_offset,
              language: language,
              contentType: 'phrase_analysis'
            })
          })
        } catch (saveError) {
          console.error('Failed to save phrase analysis:', saveError)
          // Continue even if save fails - user still sees the analysis
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted
        setPhrasesAnalysis('')
      } else {
        console.error('Phrases analysis failed:', error)
        setPhrasesAnalysis('分析失败，请重试')
      }
    } finally {
      setIsLoadingPhrases(false)
      abortControllerRef.current = null
    }
  }

  // Handle grammar analysis
  const handleAnalyzeGrammar = async () => {
    if (isLoadingGrammar) return
    
    setIsLoadingGrammar(true)
    setGrammarAnalysis('')

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/language-reading/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryData: query,
          language: language,
          userPrompt: `请用适合法语初学者的方式，分析这句话的语法结构：

"${query.sentence_text}"

请按照以下结构回答，每一项都要简洁清晰，不要使用太多专业术语：

1. 这句话的整体结构是什么？  
   → 分成几个部分？（比如主句 / 从句 / 插入语等）

2. 这句话用了哪些时态？  
   → 每个时态表示什么时间概念？为什么用它？

3. 表达的逻辑关系是什么？  
   → 是让步？假设？对比？因果？

4. 每部分各自说了什么？  
   → 用通俗中文逐句解释

5. 有哪些法语初学者常犯的错误？  
   → 这句话中哪些地方容易误解或误用？

请不要解释词汇、不要展示太难的语法规则，只关注整个句子"怎么组织"的逻辑。`
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulatedResponse = ''
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]') {
              break
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.content
              
              if (content) {
                accumulatedResponse += content
                setGrammarAnalysis(accumulatedResponse)
              }
            } catch (e) {
              continue
            }
          }
        }
      }

      // Save to database after successful analysis
      if (accumulatedResponse) {
        try {
          await fetch('/api/language-reading/save-phrase-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articleId: articleId,
              sentenceText: query.sentence_text,
              analysis: accumulatedResponse,
              startOffset: query.start_offset,
              endOffset: query.end_offset,
              language: language,
              contentType: 'grammar_analysis'
            })
          })
        } catch (saveError) {
          console.error('Failed to save grammar analysis:', saveError)
          // Continue even if save fails - user still sees the analysis
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted
        setGrammarAnalysis('')
      } else {
        console.error('Grammar analysis failed:', error)
        setGrammarAnalysis('分析失败，请重试')
      }
    } finally {
      setIsLoadingGrammar(false)
      abortControllerRef.current = null
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'words':
        return (
          <div className="space-y-3">
            {/* Word input search box */}
            <form onSubmit={handleWordInputSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value)}
                  placeholder="输入要询问的单词..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!wordInput.trim() || isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700 disabled:text-gray-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Word queries cards */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {wordQueries.map((wordQuery) => (
                <div
                  key={wordQuery.id}
                  data-word-id={wordQuery.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-purple-800">
                      {wordQuery.word}
                    </span>
                    <button
                      onClick={() => handleSpeak(wordQuery.word)}
                      disabled={playingText === wordQuery.word}
                      className="text-purple-500 hover:text-purple-700 hover:bg-purple-50 p-1 rounded-full transition-all duration-200 disabled:opacity-50"
                      title={`播放: ${wordQuery.word}`}
                    >
                      {playingText === wordQuery.word ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-500"></div>
                      ) : (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    {wordQuery.isStreaming && (
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-500 mr-1"></div>
                        回复中...
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {wordQuery.response && (
                      <div className="formatted-response">
                        {formatAIResponse(wordQuery.response)}
                        {wordQuery.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse"></span>
                        )}
                      </div>
                    )}
                    {!wordQuery.response && wordQuery.isStreaming && (
                      <div className="flex items-center text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500 mr-2"></div>
                        AI正在思考...
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {wordQueries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">输入单词来向AI提问</p>
                </div>
              )}
            </div>
          </div>
        )
      
      case 'phrases':
        return (
          <div className="space-y-3">
            {/* Analyze button */}
            <div className="flex justify-center">
              <button
                onClick={handleAnalyzePhrases}
                disabled={isLoadingPhrases}
                className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isLoadingPhrases ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                    分析中...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    分析词组
                  </>
                )}
              </button>
            </div>

            {/* Phrases analysis result */}
            {phrasesAnalysis && (
              <div className="bg-purple-50/50 p-3 rounded-lg border-l-4 border-purple-300">
                <div className="text-sm text-gray-700 leading-relaxed">
                  <div className="formatted-response">
                    {formatAIResponse(phrasesAnalysis)}
                    {isLoadingPhrases && (
                      <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse"></span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!phrasesAnalysis && !isLoadingPhrases && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">点击按钮分析句子中的词组搭配</p>
              </div>
            )}
          </div>
        )
      
      case 'grammar':
        return (
          <div className="space-y-3">
            {/* Analyze button */}
            <div className="flex justify-center">
              <button
                onClick={handleAnalyzeGrammar}
                disabled={isLoadingGrammar}
                className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isLoadingGrammar ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                    分析中...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    分析语法
                  </>
                )}
              </button>
            </div>

            {/* Grammar analysis result */}
            {grammarAnalysis && (
              <div className="bg-purple-50/50 p-3 rounded-lg border-l-4 border-purple-300">
                <div className="text-sm text-gray-700 leading-relaxed">
                  <div className="formatted-response">
                    {formatAIResponse(grammarAnalysis)}
                    {isLoadingGrammar && (
                      <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse"></span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!grammarAnalysis && !isLoadingGrammar && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">点击按钮分析句子的语法结构</p>
              </div>
            )}
          </div>
        )
      
      case 'test':
        return (
          <div className="space-y-3">
            <div className="bg-orange-50/50 p-3 rounded-lg border-l-4 border-orange-300">
              <h4 className="text-sm font-semibold text-orange-800 mb-2">练习测试</h4>
              <div className="space-y-2">
                <div className="text-sm text-gray-700 mb-2">
                  根据这个句子生成练习题：
                </div>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-sm">
                    填空练习
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-sm">
                    翻译练习
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  const tabs = [
    { id: 'words' as TabType, label: 'Mots' },
    { id: 'phrases' as TabType, label: 'Expressions' },
    { id: 'grammar' as TabType, label: 'Grammaire' },
    { id: 'test' as TabType, label: 'Test' }
  ]

  return (
    <div
      id={`sentence-card-${query.id}`}
      className={`bg-white rounded-xl shadow-lg border border-gray-200/80 ${isMobile ? 'p-2' : 'p-4'} w-full transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-blue-200`}
      onClick={() => onScrollToHighlight(query)}
    >
      <div>
        {/* Header */}
        <div className={`flex items-center gap-2 ${isMobile ? 'mb-2' : 'mb-3'}`}>
          <span className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'} bg-purple-100 text-purple-800 rounded-full font-semibold`}>
            Phrase
          </span>
          <div className="flex-1"></div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(query.id)
            }}
            className={`text-red-500 hover:text-red-700 hover:bg-red-50 ${isMobile ? 'p-1' : 'p-1.5'} rounded-full transition-all duration-200`}
            title={uiTexts.delete}
          >
            <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Sentence Display */}
        <div className={`bg-gray-50/50 ${isMobile ? 'p-2' : 'p-3'} rounded-lg border-l-4 border-purple-300 ${isMobile ? 'mb-2' : 'mb-4'}`}>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-700 italic leading-relaxed`}>
            "{renderHighlightedSentence()}"
          </p>
          <p className={`text-xs text-gray-500 ${isMobile ? 'mt-1' : 'mt-2'}`}>{query.translation}</p>
        </div>
        
        {/* Tab Navigation */}
        <div className={`border-b border-gray-200 ${isMobile ? 'mb-2' : 'mb-4'}`} onClick={(e) => e.stopPropagation()}>
          <div className={`flex ${isMobile ? 'space-x-0' : 'space-x-1'}`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${isMobile ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} font-medium rounded-t-lg transition-colors duration-200 flex items-center ${isMobile ? 'gap-1' : 'gap-1.5'} ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } ${isMobile ? 'flex-1 justify-center' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <div onClick={(e) => e.stopPropagation()}>
          {renderTabContent()}
        </div>
        
        {/* AI Assistant Section */}
        <div className="mt-4 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2 justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => onAskAI(query)}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Ask AI
              </button>
              {query.ai_notes && (
                <button className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 text-sm rounded-lg hover:bg-purple-100 transition-all duration-200 border border-purple-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
                    <path d="M6 8h8v2H6V8zm0 4h5v2H6v-2z"/>
                  </svg>
                  Notes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}