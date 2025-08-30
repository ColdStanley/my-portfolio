import { useState, useRef, useContext, useEffect } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import { Column } from '../types'
import { CardContext } from './CardContext'
import { resolveReferences, checkReferences } from '../utils/cardUtils'
import Modal from './ui/Modal'
import SettingsModal from './ui/SettingsModal'

interface AIToolCardProps {
  cardId: string
  order: number
  columnId: string
  buttonName: string
  promptText: string
  options?: string[]
  aiModel?: 'deepseek' | 'openai'
  onDelete: (cardId: string) => void
  autoOpenSettings?: boolean
  onButtonNameChange: (cardId: string, newName: string, currentName: string) => string
  updateColumns: (updater: (prev: Column[]) => Column[]) => void
  currentColumn: Column
  allColumns: Column[]
}

export default function AIToolCard({ 
  cardId, 
  order,
  columnId,
  buttonName: initialButtonName,
  promptText: initialPromptText,
  options: initialOptions,
  aiModel: initialAiModel = 'deepseek',
  onDelete,
  autoOpenSettings = false,
  onButtonNameChange,
  updateColumns,
  currentColumn,
  allColumns
}: AIToolCardProps) {
  const cardContext = useContext(CardContext)
  const [showPromptTooltip, setShowPromptTooltip] = useState(false)
  const [promptTooltipVisible, setPromptTooltipVisible] = useState(false)
  const [showOptionsTooltip, setShowOptionsTooltip] = useState(false)
  const generateButtonRef = useRef<HTMLButtonElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [buttonName, setButtonName] = useState(initialButtonName)
  const [promptText, setPromptText] = useState(initialPromptText)
  const [aiModel, setAiModel] = useState<'deepseek' | 'openai'>(initialAiModel)
  const [options, setOptions] = useState<string[]>(() => {
    return Array.isArray(initialOptions) ? initialOptions : []
  })
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize card in context
  useEffect(() => {
    if (cardContext) {
      cardContext.addCard({
        id: cardId,
        buttonName,
        generatedContent,
        order
      })
    }
  }, [cardId])

  // Update card when content changes
  useEffect(() => {
    if (cardContext) {
      cardContext.updateCard(cardId, { 
        buttonName, 
        generatedContent 
      })
    }
  }, [buttonName, generatedContent])

  // Auto-open settings for newly created cards
  useEffect(() => {
    if (autoOpenSettings) {
      setTimeout(() => {
        setShowPromptTooltip(true)
        setTimeout(() => setPromptTooltipVisible(true), 10)
      }, 100)
    }
  }, [autoOpenSettings])

  // Get previous AIToolCards from current column for reference dropdown
  const currentCardIndex = currentColumn.cards.findIndex(card => card.id === cardId)
  const previousCards = currentColumn.cards
    .slice(0, currentCardIndex)
    .filter(card => card.type === 'aitool')
    .map(card => ({
      id: card.id,
      buttonName: card.buttonName || 'Unnamed Card',
      order: currentCardIndex
    }))

  // Handle textarea input changes
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setPromptText(newText)
    
    updateColumns(prev => prev.map(col => 
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId
                ? { ...card, promptText: newText }
                : card
            )
          }
        : col
    ))
  }

  // Insert reference at cursor position
  const insertReference = (selectedButtonName: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const cursorPosition = textarea.selectionStart
      const textBefore = promptText.substring(0, cursorPosition)
      const textAfter = promptText.substring(textarea.selectionEnd)
      const referenceText = `[REF: ${selectedButtonName}]`
      
      const newText = textBefore + referenceText + textAfter
      setPromptText(newText)
      
      updateColumns(prev => prev.map(col => 
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map(card =>
                card.id === cardId
                  ? { ...card, promptText: newText }
                  : card
              )
            }
          : col
      ))
      
      setTimeout(() => {
        const newCursorPosition = cursorPosition + referenceText.length
        textarea.setSelectionRange(newCursorPosition, newCursorPosition)
        textarea.focus()
      }, 0)
    }
  }

  const handleGenerateClick = async (selectedOption?: string) => {
    if (!promptText.trim()) return
    
    if ((options || []).length > 0 && !selectedOption) {
      setShowOptionsTooltip(true)
      return
    }
    
    setIsGenerating(true)
    setGeneratedContent('')
    
    try {
      let resolvedPrompt = resolveReferences(promptText, allColumns)
      
      // Replace option placeholder with selected value if both exist
      const hasOptions = (options || []).length > 0
      if (hasOptions && selectedOption && typeof selectedOption === 'string') {
        resolvedPrompt = resolvedPrompt.replace(/\{\{option\}\}/g, selectedOption)
      }
      
      const response = await fetch('/api/ai-agent/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: resolvedPrompt,
          model: aiModel,
          stream: true
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body reader')
      }

      const decoder = new TextDecoder()
      let fullResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              if (content) {
                fullResponse += content
                setGeneratedContent(fullResponse)
                
                updateColumns(prev => prev.map(col => 
                  col.id === columnId
                    ? {
                        ...col,
                        cards: col.cards.map(card =>
                          card.id === cardId
                            ? { ...card, generatedContent: fullResponse }
                            : card
                        )
                      }
                    : col
                ))
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError)
            }
          }
        }
      }
      
      setShowOptionsTooltip(false)
    } catch (error) {
      console.error('Error generating content:', error)
      setGeneratedContent('Error generating content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePromptClick = () => {
    setShowPromptTooltip(true)
    setTimeout(() => setPromptTooltipVisible(true), 10)
  }

  const handleClosePromptTooltip = () => {
    setPromptTooltipVisible(false)
    setTimeout(() => setShowPromptTooltip(false), 250)
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 relative">
      {/* Settings Button */}
      <button
        onClick={handlePromptClick}
        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-200 z-10"
        title="Card Settings"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Generate Button */}
      <button
        ref={generateButtonRef}
        onClick={() => handleGenerateClick()}
        disabled={isGenerating}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 mb-4"
      >
        {isGenerating ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Generating...
          </>
        ) : (
          buttonName
        )}
      </button>

      {/* Generated Content */}
      {generatedContent && (
        <div className="mt-4 p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200">
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-lg font-bold text-gray-800 mb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-base font-semibold text-gray-800 mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-sm font-medium text-gray-800 mb-1" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-700 mb-2 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 text-gray-700" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 text-gray-700" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                code: ({node, inline, ...props}) => 
                  inline ? 
                    <code className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded text-xs font-mono" {...props} /> :
                    <code className="block bg-gray-100 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto whitespace-pre" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-300 pl-3 italic text-gray-600 mb-2" {...props} />
              }}
            >
              {generatedContent}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Options Tooltip */}
      {showOptionsTooltip && (options || []).length > 0 && generateButtonRef.current && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3"
          style={{
            top: generateButtonRef.current.getBoundingClientRect().bottom + 8,
            left: generateButtonRef.current.getBoundingClientRect().left
          }}
        >
          <div className="absolute -top-1 left-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
          <div className="flex flex-col gap-2 min-w-32">
            {(options || []).map((optionValue, index) => (
              <button
                key={index}
                onClick={() => {
                  handleGenerateClick(optionValue)
                  setShowOptionsTooltip(false)
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-150 text-left"
              >
                {optionValue}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Settings Modal */}
      <Modal isOpen={showPromptTooltip} onClose={handleClosePromptTooltip}>
        <SettingsModal
          isVisible={promptTooltipVisible}
          title="AI Tool Card Settings"
          onClose={handleClosePromptTooltip}
          onDelete={() => onDelete(cardId)}
        >
          {/* Button Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Name:</label>
            <input
              type="text"
              value={buttonName}
              onBlur={(e) => {
                const newName = e.target.value
                const uniqueName = onButtonNameChange(cardId, newName, buttonName)
                
                if (uniqueName !== newName) {
                  setButtonName(uniqueName)
                }
                
                updateColumns(prev => prev.map(col => 
                  col.id === columnId
                    ? {
                        ...col,
                        cards: col.cards.map(card =>
                          card.id === cardId
                            ? { ...card, buttonName: uniqueName }
                            : card
                        )
                      }
                    : col
                ))
              }}
              onChange={(e) => {
                setButtonName(e.target.value)
              }}
              placeholder="Enter button name..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Prompt */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Prompt:</label>
              <select
                value={aiModel}
                onChange={(e) => {
                  const newModel = e.target.value as 'deepseek' | 'openai'
                  setAiModel(newModel)
                  
                  updateColumns(prev => prev.map(col => 
                    col.id === columnId
                      ? {
                          ...col,
                          cards: col.cards.map(card =>
                            card.id === cardId
                              ? { ...card, aiModel: newModel }
                              : card
                          )
                        }
                      : col
                  ))
                }}
                className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="deepseek">DeepSeek</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={promptText}
                onChange={handlePromptChange}
                placeholder="Enter your AI prompt here..."
                className="w-full min-h-32 p-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                style={{
                  minHeight: '128px',
                  maxHeight: '256px',
                  lineHeight: '1.5'
                }}
              />
            </div>
          </div>

          {/* Insert Reference */}
          {previousCards.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Insert Reference:</label>
              <div className="flex flex-wrap gap-2">
                {previousCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => insertReference(card.buttonName)}
                    className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    {card.buttonName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Options Management */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Options (use {{option}} in prompt):</label>
            <div className="space-y-2">
              {(options || []).map((optionValue, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={optionValue}
                    onChange={(e) => {
                      const newOptions = [...(options || [])]
                      newOptions[index] = e.target.value
                      setOptions(newOptions)
                      
                      updateColumns(prev => prev.map(col => 
                        col.id === columnId
                          ? {
                              ...col,
                              cards: col.cards.map(card =>
                                card.id === cardId
                                  ? { ...card, options: newOptions }
                                  : card
                              )
                            }
                          : col
                      ))
                    }}
                    placeholder="Enter option..."
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => {
                      const newOptions = (options || []).filter((_, i) => i !== index)
                      setOptions(newOptions)
                      
                      updateColumns(prev => prev.map(col => 
                        col.id === columnId
                          ? {
                              ...col,
                              cards: col.cards.map(card =>
                                card.id === cardId
                                  ? { ...card, options: newOptions }
                                  : card
                              )
                            }
                          : col
                      ))
                    }}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(options || []), '']
                  setOptions(newOptions)
                  
                  updateColumns(prev => prev.map(col => 
                    col.id === columnId
                      ? {
                          ...col,
                          cards: col.cards.map(card =>
                            card.id === cardId
                              ? { ...card, options: newOptions }
                              : card
                          )
                        }
                      : col
                  ))
                }}
                className="w-full px-3 py-1 text-sm text-purple-600 border border-purple-200 rounded hover:bg-purple-50 transition-colors"
              >
                + Add Option
              </button>
            </div>
          </div>
        </SettingsModal>
      </Modal>
    </div>
  )
}