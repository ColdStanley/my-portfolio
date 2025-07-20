'use client'

import { useReadingStore } from '../store/useReadingStore'

export default function QueryCards() {
  const { wordQueries, sentenceQueries, deleteWordQuery, deleteSentenceQuery } = useReadingStore()
  
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
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-full transition-all duration-300"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                  Sentence
                </span>
                <div className="flex-1"></div>
                <button
                  onClick={() => handleDelete(query.id, 'sentence')}
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
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Translation:</p>
                  <p className="text-sm text-gray-600">{query.translation}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Analysis:</p>
                  <p className="text-sm text-gray-600">{query.analysis}</p>
                </div>
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
                  className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                        Word
                      </span>
                      <h3 className="font-semibold text-gray-900 flex-1">
                        {query.word_text}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSpeak(query.word_text)}
                          className="text-purple-500 hover:text-purple-700 text-lg"
                          title="Play word"
                        >
                          🔊
                        </button>
                        <button
                          onClick={() => handleDelete(query.id, 'word')}
                          className="text-red-500 hover:text-red-700 text-sm"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {query.query_type === 'manual_mark' ? (
                        // Manual mark card - editable notes
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Your Notes:</p>
                          <textarea
                            value={query.user_notes || 'Click to add your notes...'}
                            onChange={(e) => updateWordNotes(query.id, e.target.value)}
                            onBlur={async (e) => {
                              // Save to database
                              try {
                                await fetch('/api/english-reading/update-notes', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    id: query.id,
                                    type: 'word',
                                    notes: e.target.value
                                  })
                                })
                              } catch (error) {
                                console.error('Failed to save notes:', error)
                              }
                            }}
                            className="w-full text-sm text-gray-600 border border-gray-300 rounded p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                            placeholder="Add your notes here..."
                          />
                        </div>
                      ) : (
                        // AI query card - show definition and examples
                        <>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Definition:</p>
                            <p className="text-sm text-gray-600">{query.definition}</p>
                          </div>
                          
                          {query.examples && query.examples.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Examples:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {query.examples.map((example, idx) => (
                                  <li key={idx} className="list-disc list-inside flex items-center justify-between group">
                                    <span className="flex-1">{example}</span>
                                    <button
                                      onClick={() => handleSpeak(example, 0.8)}
                                      className="text-purple-400 hover:text-purple-600 text-sm ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Play example"
                                    >
                                      🔊
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
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
                  className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                        Word
                      </span>
                      <h3 className="font-semibold text-gray-900 flex-1">
                        {query.word_text}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSpeak(query.word_text)}
                          className="text-purple-500 hover:text-purple-700 text-lg"
                          title="Play word"
                        >
                          🔊
                        </button>
                        <button
                          onClick={() => handleDelete(query.id, 'word')}
                          className="text-red-500 hover:text-red-700 text-sm"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {query.query_type === 'manual_mark' ? (
                        // Manual mark card - editable notes
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Your Notes:</p>
                          <textarea
                            value={query.user_notes || 'Click to add your notes...'}
                            onChange={(e) => updateWordNotes(query.id, e.target.value)}
                            onBlur={async (e) => {
                              // Save to database
                              try {
                                await fetch('/api/english-reading/update-notes', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    id: query.id,
                                    type: 'word',
                                    notes: e.target.value
                                  })
                                })
                              } catch (error) {
                                console.error('Failed to save notes:', error)
                              }
                            }}
                            className="w-full text-sm text-gray-600 border border-gray-300 rounded p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                            placeholder="Add your notes here..."
                          />
                        </div>
                      ) : (
                        // AI query card - show definition and examples
                        <>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Definition:</p>
                            <p className="text-sm text-gray-600">{query.definition}</p>
                          </div>
                          
                          {query.examples && query.examples.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Examples:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {query.examples.map((example, idx) => (
                                  <li key={idx} className="list-disc list-inside flex items-center justify-between group">
                                    <span className="flex-1">{example}</span>
                                    <button
                                      onClick={() => handleSpeak(example, 0.8)}
                                      className="text-purple-400 hover:text-purple-600 text-sm ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Play example"
                                    >
                                      🔊
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
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