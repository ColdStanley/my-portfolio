'use client'

import { useState, useEffect } from 'react'
import { useLanguageReadingStore } from '../store/useLanguageReadingStore'
import { useFrenchReadingStore } from '../store/useFrenchReadingStore'
import { Language, getUITexts } from '../config/uiText'
import { playText } from '../utils/tts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MobileFrenchSentenceCard from './MobileFrenchSentenceCard'

interface MobileReadingViewProps {
  language: Language
  articleId: number
  content: string
  title?: string
}

interface WordQuery {
  id: number
  word_text: string
  definition: string
  examples: string[]
  part_of_speech?: string
  gender?: string
  root_form?: string
  example_translation?: string
  conjugation_info?: string
  user_notes?: string
  ai_notes?: string
  created_at: string
}

interface SentenceQuery {
  id: number
  sentence_text: string
  translation: string
  analysis: string
  user_notes?: string
  ai_notes?: string
  created_at: string
}

interface AINote {
  id: number
  type: 'word' | 'sentence'
  query_text: string
  ai_notes: string
  created_at: string
}

// French text with TTS component
function FrenchTextWithTTS({ children }: { children: React.ReactNode }) {
  const detectFrenchSentences = (text: string) => {
    const frenchPatterns = [
      /[^.!?]*[àáâäèéêëìíîïòóôöùúûüÿñç][^.!?]*[.!?]/gi,
      /\b(je|tu|il|elle|nous|vous|ils|elles|le|la|les|un|une|des|ce|cette|ces|dans|sur|avec|pour|par|de|du|d'|qui|que|quoi|où|quand|comment|pourquoi|est|sont|avoir|être)\b[^.!?]*[.!?]/gi
    ]
    
    const sentences: { text: string; start: number; end: number }[] = []
    frenchPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const sentence = match[0].trim()
        if (sentence.length > 5) {
          sentences.push({
            text: sentence,
            start: match.index,
            end: match.index + match[0].length
          })
        }
      }
    })
    
    const uniqueSentences = sentences.filter((sentence, index, self) => 
      index === self.findIndex(s => s.text === sentence.text)
    ).sort((a, b) => a.start - b.start)
    
    return uniqueSentences
  }

  const handleFrenchTTS = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await playText(text, 'french', 0.8)
    } catch (error) {
      console.error('French TTS failed:', error)
    }
  }

  const processTextWithTTS = (text: string) => {
    const frenchSentences = detectFrenchSentences(text)
    
    if (frenchSentences.length === 0) {
      return [{ type: 'text', content: text }]
    }

    const result = []
    let lastIndex = 0
    
    frenchSentences.forEach((sentence, index) => {
      if (sentence.start > lastIndex) {
        result.push({
          type: 'text',
          content: text.slice(lastIndex, sentence.start)
        })
      }
      
      result.push({
        type: 'french',
        content: sentence.text,
        key: `french-${index}`
      })
      
      lastIndex = sentence.end
    })
    
    if (lastIndex < text.length) {
      result.push({
        type: 'text',
        content: text.slice(lastIndex)
      })
    }
    
    return result
  }

  if (typeof children === 'string') {
    const processedContent = processTextWithTTS(children)
    
    return (
      <>
        {processedContent.map((item, index) => {
          if (item.type === 'french') {
            return (
              <span key={item.key || index}>
                {item.content}
                <button
                  onClick={(e) => handleFrenchTTS(item.content, e)}
                  className="inline-flex items-center ml-1 p-1 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-all duration-200"
                  title="Play French pronunciation"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )
          } else {
            return <span key={index}>{item.content}</span>
          }
        })}
      </>
    )
  }

  return <>{children}</>
}

export default function MobileReadingView({ language, articleId, content, title }: MobileReadingViewProps) {
  const [activeTab, setActiveTab] = useState<'article' | 'words' | 'sentences' | 'ai-notes'>('article')
  const [wordQueries, setWordQueries] = useState<WordQuery[]>([])
  const [sentenceQueries, setSentenceQueries] = useState<SentenceQuery[]>([])
  const [aiNotes, setAiNotes] = useState<AINote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingSentence, setIsCreatingSentence] = useState(false)
  
  // Use different stores based on language
  const globalStore = useLanguageReadingStore()
  const frenchStore = useFrenchReadingStore()
  
  const { highlightedRanges, addSentenceQuery, addHighlight } = language === 'french' ? frenchStore : globalStore
  const uiTexts = getUITexts(language)

  // Fetch data when component mounts or articleId changes
  useEffect(() => {
    fetchMobileData()
  }, [articleId, language])

  const fetchMobileData = async () => {
    setIsLoading(true)
    try {
      // For French, use dedicated store to avoid conflicts
      if (language === 'french') {
        await frenchStore.loadStoredData(articleId, language)
        // Get sentence cards from French store
        setSentenceQueries(frenchStore.frenchSentenceCards)
        setWordQueries([]) // French mobile uses sentence cards, not separate word queries
      } else {
        // Queries API removed - data moved to articles.analysis_records
        console.log('MobileReadingView queries API deprecated')
        setWordQueries([])
        setSentenceQueries([])
      }

      // Fetch AI notes
      const aiNotesResponse = await fetch(`/api/master-language/ai-notes?articleId=${articleId}&language=${language}`)
      if (aiNotesResponse.ok) {
        const aiNotesData = await aiNotesResponse.json()
        const combinedAINotes = [
          ...(aiNotesData.wordQueries || []).map((q: any) => ({
            id: q.id,
            type: 'word' as const,
            query_text: q.word_text,
            ai_notes: q.ai_notes,
            created_at: q.created_at
          })),
          ...(aiNotesData.sentenceQueries || []).map((q: any) => ({
            id: q.id,
            type: 'sentence' as const,
            query_text: q.sentence_text,
            ai_notes: q.ai_notes,
            created_at: q.created_at
          }))
        ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        
        setAiNotes(combinedAINotes)
      }
    } catch (error) {
      console.error('Failed to fetch mobile data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpeak = async (text: string, rate: number = 0.8) => {
    try {
      await playText(text, language, rate)
    } catch (error) {
      console.error('TTS failed:', error)
    }
  }

  // French sentence splitting function (similar to desktop)
  const splitIntoSentences = (text: string) => {
    const sentences = text.split(/([.!?;:])/).filter(Boolean)
    const result: { text: string; start: number; end: number }[] = []
    let currentOffset = 0
    
    for (let i = 0; i < sentences.length; i += 2) {
      const sentenceText = sentences[i]
      const punctuation = sentences[i + 1] || ''
      const fullSentence = sentenceText + punctuation
      
      if (sentenceText.trim()) {
        result.push({
          text: fullSentence,
          start: currentOffset,
          end: currentOffset + fullSentence.length
        })
      }
      currentOffset += fullSentence.length
    }
    
    return result
  }

  // Handle French sentence click for mobile
  const handleFrenchSentenceClick = async (sentence: { text: string; start: number; end: number }) => {
    if (isCreatingSentence) return
    
    // Check if this sentence already has a query
    const existingQuery = sentenceQueries.find(q => 
      q.start_offset <= sentence.start && q.end_offset >= sentence.end
    )
    
    if (existingQuery) {
      // Switch to sentences tab to show existing query
      setActiveTab('sentences')
      return
    }
    
    setIsCreatingSentence(true)
    
    try {
      const res = await fetch('/api/master-language/query-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          sentenceText: sentence.text.trim(),
          startOffset: sentence.start,
          endOffset: sentence.end,
          queryType: 'ai_query',
          language: language
        }),
      })

      const data = await res.json()
      if (data.id) {
        // Add to local state
        setSentenceQueries(prev => [...prev, data])
        
        // Add to appropriate store based on language
        if (language === 'french') {
          frenchStore.addFrenchSentenceCard(data)
          frenchStore.addHighlight('sentence', sentence.start, sentence.end, data.id)
        } else {
          addSentenceQuery(data)
          addHighlight('sentence', sentence.start, sentence.end, data.id)
        }
        
        // Switch to sentences tab to show the new query
        setActiveTab('sentences')
      }
    } catch (error) {
      console.error('Failed to create sentence query:', error)
    } finally {
      setIsCreatingSentence(false)
    }
  }

  const renderHighlightedText = () => {
    // For French, render with sentence-level interaction (similar to desktop)
    if (language === 'french') {
      return content.split('\n').map((paragraph, paragraphIndex) => {
        if (!paragraph.trim()) {
          return <br key={paragraphIndex} />
        }
        
        const sentences = splitIntoSentences(paragraph)
        
        // Calculate the offset of this paragraph in the entire content
        const precedingParagraphs = content.split('\n').slice(0, paragraphIndex)
        const paragraphStartOffset = precedingParagraphs.reduce((acc, p) => acc + p.length + 1, 0)
        
        return (
          <p key={paragraphIndex} className="mb-3 leading-relaxed text-sm">
            {sentences.map((sentence, sentenceIndex) => {
              const globalStart = paragraphStartOffset + sentence.start
              const globalEnd = paragraphStartOffset + sentence.end
              
              // Check if this sentence has any highlights
              const hasHighlight = highlightedRanges.some(range => 
                range.start <= globalStart && range.end >= globalEnd
              )
              
              // Check if creating sentence
              const isCreating = isCreatingSentence
              
              const className = hasHighlight
                ? 'cursor-pointer bg-blue-50 rounded px-1 py-0.5 border border-blue-200'
                : isCreating
                ? 'cursor-wait opacity-50'
                : 'cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded px-1 py-0.5'
              
              return (
                <span
                  key={sentenceIndex}
                  className={className}
                  onClick={() => handleFrenchSentenceClick({
                    text: sentence.text,
                    start: globalStart,
                    end: globalEnd
                  })}
                >
                  {sentence.text}
                </span>
              )
            })}
          </p>
        )
      })
    }

    // Original logic for other languages with highlighting
    if (highlightedRanges.length === 0) {
      return content.split('\n').map((paragraph, index) => (
        paragraph.trim() ? (
          <p key={index} className="mb-3 leading-relaxed text-sm">
            {paragraph}
          </p>
        ) : (
          <br key={index} />
        )
      ))
    }

    // Simple highlighting for mobile (reuse logic from desktop)
    const sortedRanges = [...highlightedRanges].sort((a, b) => a.start - b.start)
    const mergedRanges: Array<{
      start: number
      end: number
      types: Array<'word' | 'sentence'>
    }> = []

    sortedRanges.forEach(range => {
      const lastMerged = mergedRanges[mergedRanges.length - 1]
      
      if (lastMerged && range.start <= lastMerged.end && range.end >= lastMerged.start) {
        lastMerged.start = Math.min(lastMerged.start, range.start)
        lastMerged.end = Math.max(lastMerged.end, range.end)
        if (!lastMerged.types.includes(range.type)) {
          lastMerged.types.push(range.type)
        }
      } else {
        mergedRanges.push({
          start: range.start,
          end: range.end,
          types: [range.type]
        })
      }
    })
    
    let result = ''
    let lastIndex = 0

    mergedRanges.forEach((range) => {
      result += content.slice(lastIndex, range.start)
      
      const hasBoth = range.types.includes('word') && range.types.includes('sentence')
      const hasSentence = range.types.includes('sentence')
      
      let className = ''
      if (hasBoth) {
        className = 'inline-block px-1 py-0.5 rounded bg-purple-100/40 text-purple-800 font-medium'
      } else if (hasSentence) {
        className = 'font-medium text-blue-700'
      } else {
        className = 'inline-block px-1 py-0.5 rounded bg-purple-100/40 text-purple-800'
      }
      
      result += `<span class="${className}">${content.slice(range.start, range.end)}</span>`
      lastIndex = range.end
    })

    result += content.slice(lastIndex)
    
    const formattedResult = result
      .split('\n')
      .map(paragraph => paragraph ? `<p class="mb-3 leading-relaxed text-sm">${paragraph}</p>` : '<br/>')
      .join('')
    
    return <div dangerouslySetInnerHTML={{ __html: formattedResult }} />
  }

  const tabs = [
    { 
      id: 'article', 
      label: '文章', 
      icon: '📖', 
      badge: null,
      labelEn: 'Article'
    },
    { 
      id: 'words', 
      label: '词汇', 
      icon: '📝', 
      badge: wordQueries.length > 0 ? wordQueries.length : null,
      labelEn: 'Words'
    },
    { 
      id: 'sentences', 
      label: '句子', 
      icon: '💬', 
      badge: sentenceQueries.length > 0 ? sentenceQueries.length : null,
      labelEn: 'Sentences'
    },
    { 
      id: 'ai-notes', 
      label: 'AI笔记', 
      icon: '🧠', 
      badge: aiNotes.length > 0 ? aiNotes.length : null,
      labelEn: 'AI Notes'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Tab Navigation - positioned below navbar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg mb-1">{tab.icon}</span>
              <span className="leading-tight">
                {language === 'english' ? tab.labelEn : tab.label}
              </span>
              {tab.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area - with top padding for fixed tabs */}
      <div className="pt-32 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-purple-600">
              <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full"></div>
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="px-4">
            {/* Article Tab */}
            {activeTab === 'article' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {title && (
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                    "{title}"
                  </h2>
                )}
                <div className="prose prose-sm max-w-none text-gray-700">
                  {renderHighlightedText()}
                </div>
              </div>
            )}

            {/* Words Tab */}
            {activeTab === 'words' && (
              <div className="space-y-3">
                {wordQueries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-sm">No word queries yet</p>
                  </div>
                ) : (
                  wordQueries.map((query) => (
                    <div key={query.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-purple-800">
                            {query.word_text}
                          </h3>
                          {query.part_of_speech && (
                            <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium mt-1">
                              {query.part_of_speech}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleSpeak(query.word_text)}
                          className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200"
                          title="Play pronunciation"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed whitespace-pre-wrap">
                        {query.definition}
                      </p>
                      
                      {query.examples && query.examples.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 mb-1 leading-relaxed">
                                {query.examples[0]}
                              </p>
                              {query.example_translation && (
                                <p className="text-xs text-gray-500 italic">
                                  {query.example_translation}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleSpeak(query.examples[0])}
                              className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200 flex-shrink-0"
                              title="Play example"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sentences Tab */}
            {activeTab === 'sentences' && (
              <div className="space-y-3">
                {sentenceQueries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-sm">
                      {language === 'french' ? '点击文章中的句子开始学习' : 'No sentence queries yet'}
                    </p>
                  </div>
                ) : (
                  sentenceQueries.map((query) => (
                    language === 'french' ? (
                      <MobileFrenchSentenceCard
                        key={query.id}
                        query={query}
                        language={language}
                        articleId={articleId}
                        onDelete={(id) => {
                          setSentenceQueries(prev => prev.filter(q => q.id !== id))
                          if (language === 'french') {
                            frenchStore.removeFrenchSentenceCard(id)
                          }
                        }}
                      />
                    ) : (
                      <div key={query.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 italic leading-relaxed border-l-4 border-blue-300 pl-3">
                              "{query.sentence_text}"
                            </p>
                          </div>
                          <button
                            onClick={() => handleSpeak(query.sentence_text)}
                            className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200 flex-shrink-0"
                            title="Play sentence"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                              <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="bg-blue-50/50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-blue-900 leading-relaxed font-medium whitespace-pre-wrap">
                            {query.translation}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50/30 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {query.analysis}
                          </p>
                        </div>
                      </div>
                    )
                  ))
                )}
              </div>
            )}

            {/* AI Notes Tab */}
            {activeTab === 'ai-notes' && (
              <div className="space-y-3">
                {aiNotes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🧠</div>
                    <p className="text-sm">No AI study notes yet</p>
                  </div>
                ) : (
                  aiNotes.map((note) => (
                    <div key={`${note.type}-${note.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${note.type === 'word' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                          <span className="text-xs text-gray-600 uppercase font-medium">
                            {note.type} note
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 bg-white/60 rounded p-2 border-l-3 border-purple-300">
                          "{note.query_text}"
                        </p>
                      </div>
                      
                      <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({children}) => <h1 className="text-base font-bold mt-3 mb-2 text-purple-800 leading-relaxed"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></h1>,
                            h2: ({children}) => <h2 className="text-sm font-bold mt-2 mb-1 text-purple-700 leading-relaxed"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></h2>,
                            h3: ({children}) => <h3 className="text-sm font-semibold mt-2 mb-1 text-purple-600 leading-relaxed"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></h3>,
                            strong: ({children}) => <strong className="font-semibold text-purple-800"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></strong>,
                            ul: ({children}) => <ul className="list-disc list-inside my-2 space-y-0.5 leading-relaxed">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside my-2 space-y-0.5 leading-relaxed">{children}</ol>,
                            li: ({children}) => <li className="text-gray-700 text-sm leading-relaxed"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></li>,
                            p: ({children}) => <p className="mb-2 last:mb-0 text-sm leading-relaxed"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></p>,
                            code: ({children}) => <code className="bg-purple-50 text-purple-800 px-1 py-0.5 rounded text-xs">{children}</code>,
                            blockquote: ({children}) => <blockquote className="border-l-2 border-purple-300 pl-3 italic text-gray-600 text-sm my-2 leading-relaxed"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></blockquote>
                          }}
                        >
                          {note.ai_notes}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}