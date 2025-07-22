'use client'

import { useState } from 'react'
import { useReadingStore } from '../store/useReadingStore'

export default function QueryCards() {
  const { wordQueries, sentenceQueries, deleteWordQuery, deleteSentenceQuery, updateWordNotes, updateSentenceNotes } = useReadingStore()
  const [editingNotes, setEditingNotes] = useState<{id: number, type: 'word' | 'sentence', notes: string} | null>(null)
  
  const handleSpeak = (text: string, rate: number = 0.8) => {
    // Stop any current speech
    speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = rate
    utterance.pitch = 1
    utterance.volume = 1
    
    speechSynthesis.speak(utterance)
  }
  
  const handleDelete = async (id: number, type: 'word' | 'sentence') => {
    try {
      const res = await fetch(`/api/english-reading/queries?id=${id}&type=${type}`, {
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
    // Find all highlighted elements and locate the one that matches this query
    const highlightedElements = document.querySelectorAll('mark')
    const targetText = type === 'word' ? query.word_text : query.sentence_text
    
    for (const element of highlightedElements) {
      if (element.textContent === targetText) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        // Add temporary highlight effect
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
      const response = await fetch('/api/english-reading/update-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingNotes.id,
          type: editingNotes.type,
          notes: editingNotes.notes
        })
      })

      if (response.ok) {
        // Update local state
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

  const highlightWordInExample = (example: string, wordText: string) => {
    if (!example || !wordText) return example
    
    // Create regex to find the word (case insensitive, word boundaries)
    const regex = new RegExp(`(${wordText})`, 'gi')
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
          <p>Select words or sentences to see explanations here</p>
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
      <div className="space-y-4">
        {/* Sentence queries - full width */}
        {sentences.map((query) => (
          <div
            key={`sentence-${query.id}`}
            id={`sentence-card-${query.id}`}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-full transition-all duration-300 cursor-pointer hover:shadow-xl"
            onClick={() => scrollToHighlight(query, 'sentence')}
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                  Sentence
                </span>
                <div className="flex-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(query.id, 'sentence')
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title="Delete"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Original:</p>
                  <p className="text-sm text-gray-600 italic">"{query.sentence_text}"</p>
                </div>
                
                {query.query_type === 'manual_mark' ? (
                  // Manual mark card - editable notes
                  <div onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Notes:</p>
                    {editingNotes?.id === query.id && editingNotes?.type === 'sentence' ? (
                      <div>
                        <textarea
                          value={editingNotes.notes}
                          onChange={(e) => setEditingNotes({...editingNotes, notes: e.target.value})}
                          className="w-full text-sm text-gray-600 border border-purple-300 rounded p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          placeholder="Click to add your notes..."
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleSaveNotes}
                            className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEditing}
                            className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
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
                        {query.user_notes || 'Click to add your notes...'}
                      </div>
                    )}
                  </div>
                ) : (
                  // AI query card - show translation and analysis
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Translation:</p>
                      <p className="text-sm text-gray-600">{query.translation}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Analysis:</p>
                      <p className="text-sm text-gray-600">{query.analysis}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Word queries - two columns */}
        {words.length > 0 && (
          <div className="flex gap-4">
            {/* Left column */}
            <div className="w-1/2 space-y-4">
              {leftColumnWords.map((query) => (
                <div
                  key={`word-left-${query.id}`}
                  id={`word-card-${query.id}`}
                  className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 transition-all duration-300 cursor-pointer hover:shadow-xl"
                  onClick={() => scrollToHighlight(query, 'word')}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                        Word
                      </span>
                      <h3 className="font-semibold text-gray-900 flex-1">
                        {query.word_text}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSpeak(query.word_text)
                          }}
                          className="text-purple-500 hover:text-purple-700 text-lg"
                          title="Play word"
                        >
                          🔊
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(query.id, 'word')
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {query.query_type === 'manual_mark' ? (
                        // Manual mark card - editable notes
                        <div onClick={(e) => e.stopPropagation()}>
                          <p className="text-sm font-medium text-gray-700 mb-1">Your Notes:</p>
                          {editingNotes?.id === query.id && editingNotes?.type === 'word' ? (
                            <div>
                              <textarea
                                value={editingNotes.notes}
                                onChange={(e) => setEditingNotes({...editingNotes, notes: e.target.value})}
                                className="w-full text-sm text-gray-600 border border-purple-300 rounded p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder="Click to add your notes..."
                                autoFocus
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={handleSaveNotes}
                                  className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEditing}
                                  className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                                >
                                  Cancel
                                </button>
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
                              {query.user_notes || 'Click to add your notes...'}
                            </div>
                          )}
                        </div>
                      ) : (
                        // AI query card - compact layout without labels
                        <div className="space-y-2">
                          {/* Definition */}
                          <div className="text-sm text-gray-700 leading-relaxed">
                            {query.definition}
                          </div>
                          
                          {/* Part of speech and root form */}
                          <div className="flex gap-2 text-xs">
                            {query.part_of_speech && (
                              <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
                                {query.part_of_speech}
                              </span>
                            )}
                            {query.root_form && query.root_form !== query.word_text && (
                              <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
                                → {query.root_form}
                              </span>
                            )}
                          </div>
                          
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
                                  className="text-purple-400 hover:text-purple-600 text-sm opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
                                  title="Play example"
                                >
                                  🔊
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
            <div className="w-1/2 space-y-4">
              {rightColumnWords.map((query) => (
                <div
                  key={`word-right-${query.id}`}
                  id={`word-card-${query.id}`}
                  className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 transition-all duration-300 cursor-pointer hover:shadow-xl"
                  onClick={() => scrollToHighlight(query, 'word')}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                        Word
                      </span>
                      <h3 className="font-semibold text-gray-900 flex-1">
                        {query.word_text}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSpeak(query.word_text)
                          }}
                          className="text-purple-500 hover:text-purple-700 text-lg"
                          title="Play word"
                        >
                          🔊
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(query.id, 'word')
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {query.query_type === 'manual_mark' ? (
                        // Manual mark card - editable notes
                        <div onClick={(e) => e.stopPropagation()}>
                          <p className="text-sm font-medium text-gray-700 mb-1">Your Notes:</p>
                          {editingNotes?.id === query.id && editingNotes?.type === 'word' ? (
                            <div>
                              <textarea
                                value={editingNotes.notes}
                                onChange={(e) => setEditingNotes({...editingNotes, notes: e.target.value})}
                                className="w-full text-sm text-gray-600 border border-purple-300 rounded p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder="Click to add your notes..."
                                autoFocus
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={handleSaveNotes}
                                  className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEditing}
                                  className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                                >
                                  Cancel
                                </button>
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
                              {query.user_notes || 'Click to add your notes...'}
                            </div>
                          )}
                        </div>
                      ) : (
                        // AI query card - compact layout without labels
                        <div className="space-y-2">
                          {/* Definition */}
                          <div className="text-sm text-gray-700 leading-relaxed">
                            {query.definition}
                          </div>
                          
                          {/* Part of speech and root form */}
                          <div className="flex gap-2 text-xs">
                            {query.part_of_speech && (
                              <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
                                {query.part_of_speech}
                              </span>
                            )}
                            {query.root_form && query.root_form !== query.word_text && (
                              <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
                                → {query.root_form}
                              </span>
                            )}
                          </div>
                          
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
                                  className="text-purple-400 hover:text-purple-600 text-sm opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
                                  title="Play example"
                                >
                                  🔊
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