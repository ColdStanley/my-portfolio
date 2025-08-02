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
}

type TabType = 'words' | 'phrases' | 'grammar' | 'test'

interface WordQuery {
  id: string
  word: string
  response: string
  isStreaming: boolean
  timestamp: number
}

interface PhraseQuery {
  id: string
  phrase: string
  response: string
  isStreaming: boolean
  timestamp: number
}

export default function FrenchSentenceCard({ 
  query, 
  language, 
  articleId,
  onDelete, 
  onScrollToHighlight
}: FrenchSentenceCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('words')
  const [wordQueries, setWordQueries] = useState<WordQuery[]>([])
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
  const [wordInput, setWordInput] = useState('')
  const [phraseQueries, setPhraseQueries] = useState<PhraseQuery[]>([])
  const [selectedPhraseId, setSelectedPhraseId] = useState<string | null>(null)
  const [phraseInput, setPhraseInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [typewriterText, setTypewriterText] = useState<{[key: string]: string}>({})
  const [typewriterTimers, setTypewriterTimers] = useState<{[key: string]: NodeJS.Timeout}>({})
  const [showTypewriter, setShowTypewriter] = useState<{[key: string]: boolean}>({})
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

  // Cleanup typewriter timers on unmount
  React.useEffect(() => {
    return () => {
      Object.values(typewriterTimers).forEach(timer => {
        if (timer) clearTimeout(timer)
      })
    }
  }, [typewriterTimers])

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
    const processedText = text.replace(/^(#{1,3})\s+(.+)$/gm, '$2')
    
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
      const remaining = content
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
      setSelectedWordId(existingQuery.id) // Select existing word
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
    setSelectedWordId(queryId) // Select the new word
    setWordInput('')
    setIsLoading(true)

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/master-language/smart-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'simple',
          selectedText: word.trim(),
          contextSentence: query.sentence_text,
          language: language,
          nativeLanguage: 'chinese',
          articleId: articleId
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`API request failed: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('Received word query data:', data)
      
      // Format the response for display
      const formattedResponse = data.definition || data.analysis || 'No analysis available'
      
      // Update the query with the response
      setWordQueries(prev => 
        prev.map(q => 
          q.id === queryId 
            ? { ...q, response: formattedResponse, isStreaming: false }
            : q
        )
      )

      // Start typewriter effect
      if (formattedResponse) {
        startTypewriterEffect(queryId, formattedResponse)
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

  // Handle phrase query submission
  const handlePhraseQuery = async (phrase: string) => {
    if (!phrase.trim() || isLoading) return
    
    // Check if phrase already exists
    const existingQuery = phraseQueries.find(q => q.phrase.toLowerCase() === phrase.trim().toLowerCase())
    if (existingQuery) {
      setPhraseInput('')
      setSelectedPhraseId(existingQuery.id) // Select existing phrase
      return
    }

    const queryId = Date.now().toString()
    const newQuery: PhraseQuery = {
      id: queryId,
      phrase: phrase.trim(),
      response: '',
      isStreaming: true,
      timestamp: Date.now()
    }

    // Add new query to the top of the list
    setPhraseQueries(prev => [newQuery, ...prev])
    setSelectedPhraseId(queryId) // Select the new phrase
    setPhraseInput('')
    setIsLoading(true)

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/master-language/smart-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'deep',
          selectedText: phrase.trim(),
          contextSentence: query.sentence_text,
          language: language,
          nativeLanguage: 'chinese',
          articleId: articleId
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`API request failed: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('Received phrase query data:', data)
      
      // Format the response for display
      const formattedResponse = data.definition || data.analysis || 'No analysis available'
      
      // Update the query with the response
      setPhraseQueries(prev => 
        prev.map(q => 
          q.id === queryId 
            ? { ...q, response: formattedResponse, isStreaming: false }
            : q
        )
      )

      // Start typewriter effect
      if (formattedResponse) {
        startTypewriterEffect(queryId, formattedResponse)
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted, remove the query
        setPhraseQueries(prev => prev.filter(q => q.id !== queryId))
      } else {
        console.error('Phrase query failed:', error)
        // Update with error message
        setPhraseQueries(prev => 
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

  const handlePhraseInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handlePhraseQuery(phraseInput)
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

  // Handle word deletion
  const handleDeleteWord = (wordId: string) => {
    setWordQueries(prev => {
      const filtered = prev.filter(q => q.id !== wordId)
      // If deleting currently selected word, select another one or clear selection
      if (selectedWordId === wordId) {
        setSelectedWordId(filtered.length > 0 ? filtered[0].id : null)
      }
      return filtered
    })
  }

  // Handle phrase deletion
  const handleDeletePhrase = (phraseId: string) => {
    setPhraseQueries(prev => {
      const filtered = prev.filter(q => q.id !== phraseId)
      // If deleting currently selected phrase, select another one or clear selection
      if (selectedPhraseId === phraseId) {
        setSelectedPhraseId(filtered.length > 0 ? filtered[0].id : null)
      }
      return filtered
    })
  }

  // Auto-select first word when wordQueries changes and no word is selected
  React.useEffect(() => {
    if (wordQueries.length > 0 && !selectedWordId) {
      setSelectedWordId(wordQueries[0].id)
    }
  }, [wordQueries, selectedWordId])

  // Auto-select first phrase when phraseQueries changes and no phrase is selected
  React.useEffect(() => {
    if (phraseQueries.length > 0 && !selectedPhraseId) {
      setSelectedPhraseId(phraseQueries[0].id)
    }
  }, [phraseQueries, selectedPhraseId])

  // Start typewriter effect for a word
  const startTypewriterEffect = (wordId: string, content: string) => {
    // Clear existing timer for this word
    if (typewriterTimers[wordId]) {
      clearTimeout(typewriterTimers[wordId])
    }

    // Wait 2 seconds then start typewriter
    const delayTimer = setTimeout(() => {
      setShowTypewriter(prev => ({ ...prev, [wordId]: true }))
      setTypewriterText(prev => ({ ...prev, [wordId]: '' }))
      
      let index = 0
      const typeWriter = () => {
        if (index < content.length) {
          setTypewriterText(prev => ({ 
            ...prev, 
            [wordId]: content.substring(0, index + 1) 
          }))
          index++
          const timer = setTimeout(typeWriter, 30)
          setTypewriterTimers(prev => ({ ...prev, [wordId]: timer }))
        }
      }
      typeWriter()
    }, 2000)
    
    setTypewriterTimers(prev => ({ ...prev, [wordId]: delayTimer }))
  }

  // Format markdown content
  const formatMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-800 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-purple-700">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-purple-800">$1</code>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
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
        // Queries API removed - phrase analysis moved to articles.analysis_records
        console.log('FrenchSentenceCard phrase queries API deprecated')
        if (phrasesResponse.ok) {
          const phrasesData = await phrasesResponse.json()
          if (phrasesData && phrasesData.length > 0) {
            setPhrasesAnalysis(phrasesData[0].analysis)
          }
        }

        // Queries API removed - grammar analysis moved to articles.analysis_records
        console.log('FrenchSentenceCard grammar queries API deprecated')
        if (grammarResponse.ok) {
          const grammarData = await grammarResponse.json()
          if (grammarData && grammarData.length > 0) {
            setGrammarAnalysis(grammarData[0].analysis)
          }
        }

        // Queries API removed - word queries moved to articles.analysis_records
        console.log('FrenchSentenceCard word queries API deprecated')
        if (wordsResponse.ok) {
          const wordsData = await wordsResponse.json()
          if (wordsData && wordsData.length > 0) {
            // Filter word queries that fall within this sentence's range
            const sentenceWordQueries = wordsData.filter((item: any) => 
              item.start_offset >= query.start_offset && 
              item.end_offset <= query.end_offset
            )
            
            const savedWordQueries = sentenceWordQueries.map((item: any) => ({
              id: item.id.toString(),
              word: item.word_text,
              response: item.definition || item.analysis || 'No definition available',
              isStreaming: false,
              timestamp: new Date(item.created_at).getTime()
            }))
            setWordQueries(savedWordQueries)
          }
        }

        // Queries API removed - phrase queries moved to articles.analysis_records
        console.log('FrenchSentenceCard phrase word queries API deprecated')
        if (phraseQueriesResponse.ok) {
          const phraseQueriesData = await phraseQueriesResponse.json()
          if (phraseQueriesData && phraseQueriesData.length > 0) {
            // Filter phrase queries that fall within this sentence's range and have phrase type
            const sentencePhraseQueries = phraseQueriesData.filter((item: any) => 
              item.start_offset >= query.start_offset && 
              item.end_offset <= query.end_offset &&
              (item.query_type === 'phrase_query' || item.analysis_mode === 'phrase')
            )
            
            const savedPhraseQueries = sentencePhraseQueries.map((item: any) => ({
              id: item.id.toString(),
              phrase: item.word_text,
              response: item.definition || item.analysis || 'No analysis available',
              isStreaming: false,
              timestamp: new Date(item.created_at).getTime()
            }))
            setPhraseQueries(savedPhraseQueries)
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
      const response = await fetch('/api/master-language/smart-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'deep',
          selectedText: query.sentence_text,
          contextSentence: query.sentence_text,
          language: language,
          nativeLanguage: 'chinese',
          articleId: articleId
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
      const response = await fetch('/api/master-language/smart-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'grammar',
          selectedText: query.sentence_text,
          contextSentence: query.sentence_text,
          language: language,
          nativeLanguage: 'chinese',
          articleId: articleId
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
          await fetch('/api/master-language/save-phrase-analysis', {
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
        setGrammarAnalysis('Analyse échouée, veuillez réessayer')
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
                  placeholder="Entrez un mot à rechercher..."
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

            {/* Left-Right Tab Layout */}
            <div className="flex gap-4 h-80">
              {/* Left Panel - Word Tabs */}
              <div className="w-1/4 border-r border-gray-200 pr-3">
                <div className="space-y-1 max-h-full overflow-y-auto">
                  {wordQueries.map((wordQuery) => (
                    <div
                      key={wordQuery.id}
                      onClick={() => setSelectedWordId(wordQuery.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedWordId === wordQuery.id
                          ? 'bg-purple-100 border border-purple-300'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {wordQuery.word}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSpeak(wordQuery.word)
                          }}
                          disabled={playingText === wordQuery.word}
                          className="text-purple-500 hover:text-purple-700 disabled:opacity-50 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteWord(wordQuery.id)
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {wordQueries.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-8">
                      Aucun mot recherché
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Word Content */}
              <div className="flex-1 pl-4">
                {selectedWordId ? (
                  (() => {
                    const selectedWord = wordQueries.find(q => q.id === selectedWordId)
                    if (!selectedWord) return null
                    
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-4 h-full overflow-y-auto">
                        <div className="mb-4">
                          <h4 className="font-semibold text-purple-800 text-lg">
                            {selectedWord.word}
                          </h4>
                        </div>
                        
                        {selectedWord.isStreaming ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                            <span>Analyse en cours...</span>
                          </div>
                        ) : showTypewriter[selectedWord.id] ? (
                          <div className="prose prose-sm max-w-none">
                            <div 
                              className="text-xs text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: formatMarkdown(typewriterText[selectedWord.id] || '')
                              }}
                            />
                            {typewriterText[selectedWord.id] && typewriterText[selectedWord.id].length < selectedWord.response.length && (
                              <span className="inline-block w-1.5 h-3 bg-purple-500 ml-1 animate-pulse rounded-sm"></span>
                            )}
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            <div 
                              className="text-xs text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: formatMarkdown(selectedWord.response)
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })()
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    Sélectionnez un mot pour voir son analyse
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      
      case 'phrases':
        return (
          <div className="space-y-3">
            {/* Phrase input search box */}
            <form onSubmit={handlePhraseInputSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={phraseInput}
                  onChange={(e) => setPhraseInput(e.target.value)}
                  placeholder="Entrez une expression à rechercher..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!phraseInput.trim() || isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700 disabled:text-gray-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Left-Right Tab Layout for Phrases */}
            <div className="flex gap-4 h-80">
              {/* Left Panel - Phrase Tabs (wider than words for longer phrases) */}
              <div className="w-1/3 border-r border-gray-200 pr-3">
                <div className="space-y-1 max-h-full overflow-y-auto">
                  {phraseQueries.map((phraseQuery) => (
                    <div
                      key={phraseQuery.id}
                      onClick={() => setSelectedPhraseId(phraseQuery.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedPhraseId === phraseQuery.id
                          ? 'bg-purple-100 border border-purple-300'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {phraseQuery.phrase}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSpeak(phraseQuery.phrase)
                          }}
                          disabled={playingText === phraseQuery.phrase}
                          className="text-purple-500 hover:text-purple-700 disabled:opacity-50 transition-colors flex-shrink-0"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePhrase(phraseQuery.id)
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {phraseQueries.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-8">
                      Aucune expression recherchée
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Phrase Content */}
              <div className="flex-1 pl-4">
                {selectedPhraseId ? (
                  (() => {
                    const selectedPhrase = phraseQueries.find(q => q.id === selectedPhraseId)
                    if (!selectedPhrase) return null
                    
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-4 h-full overflow-y-auto">
                        <div className="mb-4">
                          <h4 className="font-semibold text-purple-800 text-lg">
                            {selectedPhrase.phrase}
                          </h4>
                        </div>
                        
                        {selectedPhrase.isStreaming ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                            <span>Analyse en cours...</span>
                          </div>
                        ) : showTypewriter[selectedPhrase.id] ? (
                          <div className="prose prose-sm max-w-none">
                            <div 
                              className="text-xs text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: formatMarkdown(typewriterText[selectedPhrase.id] || '')
                              }}
                            />
                            {typewriterText[selectedPhrase.id] && typewriterText[selectedPhrase.id].length < selectedPhrase.response.length && (
                              <span className="inline-block w-1.5 h-3 bg-purple-500 ml-1 animate-pulse rounded-sm"></span>
                            )}
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            <div 
                              className="text-xs text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: formatMarkdown(selectedPhrase.response)
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })()
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    Sélectionnez une expression pour voir son analyse
                  </div>
                )}
              </div>
            </div>
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
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Analyser la grammaire
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
                <p className="text-sm">Cliquez sur le bouton pour analyser la grammaire de cette phrase</p>
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
        
        {/* AI Notes display */}
        {query.ai_notes && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 mb-2">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
                <path d="M6 8h8v2H6V8zm0 4h5v2H6v-2z"/>
              </svg>
              <span className="text-sm font-medium text-purple-600">AI Notes</span>
            </div>
            <div className="bg-purple-50/30 p-3 rounded-lg">
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {query.ai_notes}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}