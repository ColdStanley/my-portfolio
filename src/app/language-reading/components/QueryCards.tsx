'use client'

import { useState } from 'react'
import { useLanguageReadingStore } from '../store/useLanguageReadingStore'
import AnimatedButton from './AnimatedButton'
import { Language, getUITexts } from '../config/uiText'

interface CollapsibleContentProps {
  content: string
  maxLength: number
  className?: string
  language: Language
}

function CollapsibleContent({ content, maxLength, className = '', language }: CollapsibleContentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const uiTexts = getUITexts(language)
  
  if (content.length <= maxLength) {
    return <div className={className}>{content}</div>
  }

  return (
    <div className={className}>
      <div>
        {isExpanded ? content : `${content.slice(0, maxLength)}...`}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="text-purple-600 hover:text-purple-800 text-xs mt-1 font-medium transition-colors inline-flex items-center gap-1"
      >
        <span>{isExpanded ? uiTexts.collapse : uiTexts.expand}</span>
        <svg 
          className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )
}

interface QueryCardsProps {
  language: Language
}

export default function QueryCards({ language }: QueryCardsProps) {
  const { wordQueries, sentenceQueries, deleteWordQuery, deleteSentenceQuery, updateWordNotes, updateSentenceNotes } = useLanguageReadingStore()
  const [editingNotes, setEditingNotes] = useState<{id: number, type: 'word' | 'sentence', notes: string} | null>(null)
  const uiTexts = getUITexts(language)

  // Get language-specific speech language code
  const getSpeechLang = (language: Language) => {
    return language === 'french' ? 'fr-FR' : 'en-US'
  }
  
  const handleSpeak = (text: string, rate: number = 0.8) => {
    speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = getSpeechLang(language)
    utterance.rate = rate
    utterance.pitch = 1
    utterance.volume = 1
    
    speechSynthesis.speak(utterance)
  }
  
  const handleDelete = async (id: number, type: 'word' | 'sentence') => {
    try {
      const res = await fetch(`/api/language-reading/queries?id=${id}&type=${type}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        if (type === 'word') {
          deleteWordQuery(id)
        } else {
          deleteSentenceQuery(id)
        }
      }
    } catch (error) {
      console.error('Failed to delete query:', error)
    }
  }

  const scrollToHighlight = (query: any, type: 'word' | 'sentence') => {
    const highlightedElements = document.querySelectorAll('mark')
    const targetText = type === 'word' ? query.word_text : query.sentence_text
    
    for (let element of highlightedElements) {
      if (element.textContent === targetText) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        element.style.boxShadow = '0 0 10px rgba(147, 51, 234, 0.6)'
        setTimeout(() => {
          element.style.boxShadow = ''
        }, 2000)
        break
      }
    }
  }

  const handleStartEditing = (id: number, type: 'word' | 'sentence', currentNotes: string = '') => {
    setEditingNotes({
      id,
      type,
      notes: currentNotes
    })
  }

  const handleSaveNotes = async () => {
    if (!editingNotes) return
    
    try {
      const response = await fetch('/api/language-reading/update-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingNotes.id,
          type: editingNotes.type,
          notes: editingNotes.notes
        })
      })

      if (response.ok) {
        if (editingNotes.type === 'word') {
          updateWordNotes(editingNotes.id, editingNotes.notes)
        } else {
          updateSentenceNotes(editingNotes.id, editingNotes.notes)
        }
        setEditingNotes(null)
      } else {
        console.error('Failed to save notes')
      }
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }

  const handleCancelEditing = () => {
    setEditingNotes(null)
  }

  // Enhanced highlighting function for French accents
  const highlightWordInExample = (example: string, wordText: string) => {
    if (!example || !wordText) return example
    
    // For French, handle accented characters more intelligently
    let searchWord = wordText
    if (language === 'french') {
      // Create pattern that matches both accented and non-accented versions
      searchWord = wordText
        .replace(/[àáâãäå]/g, '[àáâãäåa]')
        .replace(/[èéêë]/g, '[èéêëe]')
        .replace(/[ìíîï]/g, '[ìíîïi]')
        .replace(/[òóôõö]/g, '[òóôõöo]')
        .replace(/[ùúûü]/g, '[ùúûüu]')
        .replace(/[ç]/g, '[çc]')
        .replace(/[ñ]/g, '[ñn]')
    }
    
    const regex = new RegExp(`(${searchWord})`, 'gi')
    return example.replace(regex, '<mark class="bg-purple-200 text-purple-800 px-1 rounded">$1</mark>')
  }

  // Combine and sort queries by creation time
  const allQueries = [
    ...wordQueries.map(q => ({ ...q, type: 'word' as const })),
    ...sentenceQueries.map(q => ({ ...q, type: 'sentence' as const }))
  ].sort((a, b) => a.id - b.id)

  if (allQueries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-2xl mb-2">📖</div>
          <p>{uiTexts.selectForExplanations}</p>
        </div>
      </div>
    )
  }

  // Separate word and sentence queries
  const words = allQueries.filter(q => q.type === 'word')
  const sentences = allQueries.filter(q => q.type === 'sentence')
  
  // Distribute word queries into two columns
  const leftColumnWords = words.filter((_, index) => index % 2 === 0)
  const rightColumnWords = words.filter((_, index) => index % 2 === 1)

  return (
    <div className="h-full overflow-hidden">
      <div className="space-y-6">
        {/* Sentence queries - full width */}
        {sentences.map((query) => (
          <div
            key={`sentence-${query.id}`}
            id={`sentence-card-${query.id}`}
            className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-4 w-full transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-blue-200"
            onClick={() => scrollToHighlight(query, 'sentence')}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1.5 text-xs bg-blue-100 text-blue-800 rounded-full font-semibold">
                  {uiTexts.sentence}
                </span>
                <div className="flex-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(query.id, 'sentence')
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-all duration-200"
                  title={uiTexts.delete}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gray-50/50 p-3 rounded-lg border-l-4 border-blue-300">
                  <p className="text-sm text-gray-700 italic leading-relaxed">"{query.sentence_text}"</p>
                </div>
                
                {query.query_type === 'manual_mark' ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm font-medium text-gray-700 mb-1">{uiTexts.yourNotes}</p>
                    {editingNotes?.id === query.id && editingNotes?.type === 'sentence' ? (
                      <div>
                        <textarea
                          value={editingNotes.notes}
                          onChange={(e) => setEditingNotes({...editingNotes, notes: e.target.value})}
                          className="w-full text-sm text-gray-600 border border-purple-300 rounded p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          placeholder={uiTexts.notesPlaceholder}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <AnimatedButton
                            onClick={handleSaveNotes}
                            variant="primary"
                            size="sm"
                          >
                            {uiTexts.save}
                          </AnimatedButton>
                          <AnimatedButton
                            onClick={handleCancelEditing}
                            variant="secondary"
                            size="sm"
                          >
                            {uiTexts.cancel}
                          </AnimatedButton>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleStartEditing(query.id, 'sentence', query.user_notes || '')}
                        className={`w-full text-sm rounded p-2 min-h-[60px] cursor-text border transition-colors ${
                          query.user_notes 
                            ? 'text-gray-600 border-gray-300 hover:border-purple-300' 
                            : 'text-gray-400 border-gray-200 hover:border-purple-300 italic'
                        }`}
                      >
                        {query.user_notes || uiTexts.notesPlaceholder}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50/50 p-3 rounded-lg">
                      <CollapsibleContent
                        content={query.translation}
                        maxLength={100}
                        className="text-sm text-blue-900 leading-relaxed font-medium"
                        language={language}
                      />
                    </div>
                    
                    <div className="bg-gray-50/30 p-3 rounded-lg">
                      <CollapsibleContent
                        content={query.analysis}
                        maxLength={150}
                        className="text-sm text-gray-700 leading-relaxed"
                        language={language}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Word queries - two columns */}
        {words.length > 0 && (
          <div className="flex gap-6">
            {/* Left column */}
            <div className="w-1/2 space-y-5">
              {leftColumnWords.map((query) => (
                <div
                  key={`word-left-${query.id}`}
                  id={`word-card-${query.id}`}
                  className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-4 transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-purple-200"
                  onClick={() => scrollToHighlight(query, 'word')}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1.5 text-xs bg-purple-100 text-purple-800 rounded-full font-semibold">
                        {uiTexts.word}
                      </span>
                      <h3 className="font-bold text-gray-900 flex-1 text-base">
                        {query.word_text}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSpeak(query.word_text)
                          }}
                          className="text-purple-500 hover:text-purple-700 hover:bg-purple-50 p-1.5 rounded-full transition-all duration-200"
                          title={uiTexts.playWord}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(query.id, 'word')
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-all duration-200"
                          title={uiTexts.delete}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {query.query_type === 'manual_mark' ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <p className="text-sm font-medium text-gray-700 mb-1">{uiTexts.yourNotes}</p>
                          {editingNotes?.id === query.id && editingNotes?.type === 'word' ? (
                            <div>
                              <textarea
                                value={editingNotes.notes}
                                onChange={(e) => setEditingNotes({...editingNotes, notes: e.target.value})}
                                className="w-full text-sm text-gray-600 border border-purple-300 rounded p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder={uiTexts.notesPlaceholder}
                                autoFocus
                              />
                              <div className="flex gap-2 mt-2">
                                <AnimatedButton
                                  onClick={handleSaveNotes}
                                  variant="primary"
                                  size="sm"
                                >
                                  {uiTexts.save}
                                </AnimatedButton>
                                <AnimatedButton
                                  onClick={handleCancelEditing}
                                  variant="secondary"
                                  size="sm"
                                >
                                  {uiTexts.cancel}
                                </AnimatedButton>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => handleStartEditing(query.id, 'word', query.user_notes || '')}
                              className={`w-full text-sm rounded p-2 min-h-[60px] cursor-text border transition-colors ${
                                query.user_notes 
                                  ? 'text-gray-600 border-gray-300 hover:border-purple-300' 
                                  : 'text-gray-400 border-gray-200 hover:border-purple-300 italic'
                              }`}
                            >
                              {query.user_notes || uiTexts.notesPlaceholder}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Definition */}
                          <div className="bg-purple-50/50 p-3 rounded-lg border-l-4 border-purple-300">
                            <CollapsibleContent
                              content={query.definition}
                              maxLength={80}
                              className="text-sm text-gray-800 leading-relaxed font-medium"
                              language={language}
                            />
                          </div>
                          
                          {/* Part of speech, gender, and root form */}
                          <div className="flex gap-2 text-xs flex-wrap">
                            {query.part_of_speech && (
                              <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full font-semibold text-xs">
                                {query.part_of_speech}
                              </span>
                            )}
                            {query.gender && language === 'french' && (
                              <span className="bg-pink-100 text-pink-800 px-3 py-1.5 rounded-full font-semibold text-xs">
                                {query.gender}
                              </span>
                            )}
                            {query.root_form && query.root_form !== query.word_text && (
                              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-semibold text-xs">
                                → {query.root_form}
                              </span>
                            )}
                          </div>
                          
                          {/* French conjugation info */}
                          {query.conjugation_info && language === 'french' && (
                            <div className="text-xs text-gray-500 italic">
                              {query.conjugation_info}
                            </div>
                          )}
                          
                          {/* Example sentence with highlighting and translation */}
                          {query.examples && query.examples.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div 
                                    className="text-sm text-gray-700 mb-1 leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                      __html: highlightWordInExample(query.examples[0], query.word_text)
                                    }}
                                  />
                                  {query.example_translation && (
                                    <div className="text-xs text-gray-500 italic">
                                      {query.example_translation}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSpeak(query.examples[0], 0.8)
                                  }}
                                  className="text-purple-400 hover:text-purple-600 hover:bg-purple-50 p-1.5 rounded-full opacity-70 hover:opacity-100 transition-all duration-200 flex-shrink-0"
                                  title={uiTexts.playExample}
                                >
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Right column */}
            <div className="w-1/2 space-y-5">
              {rightColumnWords.map((query) => (
                <div
                  key={`word-right-${query.id}`}
                  id={`word-card-${query.id}`}
                  className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-4 transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-purple-200"
                  onClick={() => scrollToHighlight(query, 'word')}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1.5 text-xs bg-purple-100 text-purple-800 rounded-full font-semibold">
                        {uiTexts.word}
                      </span>
                      <h3 className="font-bold text-gray-900 flex-1 text-base">
                        {query.word_text}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSpeak(query.word_text)
                          }}
                          className="text-purple-500 hover:text-purple-700 hover:bg-purple-50 p-1.5 rounded-full transition-all duration-200"
                          title={uiTexts.playWord}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(query.id, 'word')
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-all duration-200"
                          title={uiTexts.delete}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {query.query_type === 'manual_mark' ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <p className="text-sm font-medium text-gray-700 mb-1">{uiTexts.yourNotes}</p>
                          {editingNotes?.id === query.id && editingNotes?.type === 'word' ? (
                            <div>
                              <textarea
                                value={editingNotes.notes}
                                onChange={(e) => setEditingNotes({...editingNotes, notes: e.target.value})}
                                className="w-full text-sm text-gray-600 border border-purple-300 rounded p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder={uiTexts.notesPlaceholder}
                                autoFocus
                              />
                              <div className="flex gap-2 mt-2">
                                <AnimatedButton
                                  onClick={handleSaveNotes}
                                  variant="primary"
                                  size="sm"
                                >
                                  {uiTexts.save}
                                </AnimatedButton>
                                <AnimatedButton
                                  onClick={handleCancelEditing}
                                  variant="secondary"
                                  size="sm"
                                >
                                  {uiTexts.cancel}
                                </AnimatedButton>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => handleStartEditing(query.id, 'word', query.user_notes || '')}
                              className={`w-full text-sm rounded p-2 min-h-[60px] cursor-text border transition-colors ${
                                query.user_notes 
                                  ? 'text-gray-600 border-gray-300 hover:border-purple-300' 
                                  : 'text-gray-400 border-gray-200 hover:border-purple-300 italic'
                              }`}
                            >
                              {query.user_notes || uiTexts.notesPlaceholder}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Definition */}
                          <div className="bg-purple-50/50 p-3 rounded-lg border-l-4 border-purple-300">
                            <CollapsibleContent
                              content={query.definition}
                              maxLength={80}
                              className="text-sm text-gray-800 leading-relaxed font-medium"
                              language={language}
                            />
                          </div>
                          
                          {/* Part of speech, gender, and root form */}
                          <div className="flex gap-2 text-xs flex-wrap">
                            {query.part_of_speech && (
                              <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full font-semibold text-xs">
                                {query.part_of_speech}
                              </span>
                            )}
                            {query.gender && language === 'french' && (
                              <span className="bg-pink-100 text-pink-800 px-3 py-1.5 rounded-full font-semibold text-xs">
                                {query.gender}
                              </span>
                            )}
                            {query.root_form && query.root_form !== query.word_text && (
                              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-semibold text-xs">
                                → {query.root_form}
                              </span>
                            )}
                          </div>
                          
                          {/* French conjugation info */}
                          {query.conjugation_info && language === 'french' && (
                            <div className="text-xs text-gray-500 italic">
                              {query.conjugation_info}
                            </div>
                          )}
                          
                          {/* Example sentence with highlighting and translation */}
                          {query.examples && query.examples.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div 
                                    className="text-sm text-gray-700 mb-1 leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                      __html: highlightWordInExample(query.examples[0], query.word_text)
                                    }}
                                  />
                                  {query.example_translation && (
                                    <div className="text-xs text-gray-500 italic">
                                      {query.example_translation}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSpeak(query.examples[0], 0.8)
                                  }}
                                  className="text-purple-400 hover:text-purple-600 hover:bg-purple-50 p-1.5 rounded-full opacity-70 hover:opacity-100 transition-all duration-200 flex-shrink-0"
                                  title={uiTexts.playExample}
                                >
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}