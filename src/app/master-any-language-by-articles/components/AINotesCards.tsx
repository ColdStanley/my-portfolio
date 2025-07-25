'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Language } from '../config/uiText'
import { playText } from '../utils/tts'

interface AINotesCardsProps {
  language: Language
  articleId: number
}

export interface AINotesCardsRef {
  refreshData: () => void
}

interface WordQuery {
  id: number
  word_text: string
  ai_notes: string
  created_at: string
}

interface SentenceQuery {
  id: number
  sentence_text: string
  ai_notes: string
  created_at: string
}

// French text with TTS component (reused from AIDialog)
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
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
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

const AINotesCards = forwardRef<AINotesCardsRef, AINotesCardsProps>(({ language, articleId }, ref) => {
  const [wordQueries, setWordQueries] = useState<WordQuery[]>([])
  const [sentenceQueries, setSentenceQueries] = useState<SentenceQuery[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchAINotesData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/language-reading/ai-notes?articleId=${articleId}&language=${language}`)
      if (response.ok) {
        const data = await response.json()
        setWordQueries(data.wordQueries || [])
        setSentenceQueries(data.sentenceQueries || [])
      }
    } catch (error) {
      console.error('Failed to fetch AI notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    refreshData: fetchAINotesData
  }))

  useEffect(() => {
    fetchAINotesData()
  }, [articleId, language])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-purple-600">
          <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
          <span className="text-sm">Loading AI notes...</span>
        </div>
      </div>
    )
  }

  const totalNotes = wordQueries.length + sentenceQueries.length

  if (totalNotes === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No AI study notes yet</p>
        <p className="text-gray-400 text-xs mt-1">Save AI responses to see them here</p>
      </div>
    )
  }

  // Combine and sort by creation time
  const allNotes = [
    ...wordQueries.map(q => ({ ...q, type: 'word' as const })),
    ...sentenceQueries.map(q => ({ ...q, type: 'sentence' as const }))
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500 mb-3">
        {totalNotes} saved AI note{totalNotes !== 1 ? 's' : ''}
      </div>
      
      {allNotes.map((note) => (
        <div
          key={`${note.type}-${note.id}`}
          className="border border-purple-100 rounded-lg p-4 bg-purple-50/30 hover:bg-purple-50/50 transition-colors"
        >
          {/* Note Header */}
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
          
          {/* Original Query Text */}
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 bg-white/60 rounded p-2 border-l-3 border-purple-300">
              "{note.type === 'word' ? note.word_text : note.sentence_text}"
            </p>
          </div>
          
          {/* AI Response Content */}
          <div className="text-sm text-gray-700 prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({children}) => <h1 className="text-base font-bold mt-4 mb-3 text-purple-800 leading-relaxed"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></h1>,
                h2: ({children}) => <h2 className="text-sm font-bold mt-3 mb-2 text-purple-700 leading-relaxed"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></h2>,
                h3: ({children}) => <h3 className="text-sm font-semibold mt-3 mb-2 text-purple-600 leading-relaxed"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></h3>,
                strong: ({children}) => <strong className="font-semibold text-purple-800"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></strong>,
                ul: ({children}) => <ul className="list-disc list-inside my-3 space-y-1 leading-relaxed">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside my-3 space-y-1 leading-relaxed">{children}</ol>,
                li: ({children}) => <li className="text-gray-700 text-sm leading-relaxed"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></li>,
                p: ({children}) => <p className="mb-3 last:mb-0 text-sm leading-relaxed"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></p>,
                code: ({children}) => <code className="bg-purple-50 text-purple-800 px-1 py-0.5 rounded text-xs">{children}</code>,
                blockquote: ({children}) => <blockquote className="border-l-3 border-purple-300 pl-4 italic text-gray-600 text-sm my-3 leading-relaxed"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></blockquote>,
                br: () => <br className="my-1" />
              }}
            >
              {note.ai_notes}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  )
})

AINotesCards.displayName = 'AINotesCards'

export default AINotesCards