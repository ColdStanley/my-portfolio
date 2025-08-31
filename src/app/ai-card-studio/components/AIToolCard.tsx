import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import { resolveReferences } from '../utils/cardUtils'
import { useWorkspaceStore } from '../store/workspaceStore'
import Modal from './ui/Modal'
import SettingsModal from './ui/SettingsModal'

interface AIToolCardProps {
  cardId: string
  order: number
  columnId: string
  onDelete: (cardId: string) => void
  autoOpenSettings?: boolean
  onButtonNameChange: (cardId: string, newName: string) => void
  onButtonNameBlur: (cardId: string) => void
  onPromptChange: (cardId: string, newPrompt: string) => void
  onOptionsChange: (cardId: string, newOptions: string[]) => void
  onAiModelChange: (cardId: string, newModel: 'deepseek' | 'openai') => void
  onGeneratedContentChange: (cardId: string, newContent: string) => void
  onGeneratingStateChange: (cardId: string, isGenerating: boolean) => void
}

export default function AIToolCard({ 
  cardId, 
  order,
  columnId,
  onDelete,
  autoOpenSettings = false,
  onButtonNameChange,
  onButtonNameBlur,
  onPromptChange,
  onOptionsChange,
  onAiModelChange,
  onGeneratedContentChange,
  onGeneratingStateChange
}: AIToolCardProps) {
  const { columns, actions } = useWorkspaceStore()
  const { saveWorkspace } = actions
  
  // Get current card data from Zustand store
  const currentColumn = columns.find(col => col.id === columnId)
  const currentCard = currentColumn?.cards.find(card => card.id === cardId)
  
  const buttonName = currentCard?.buttonName || 'Start'
  const promptText = currentCard?.promptText || ''
  const options = currentCard?.options || []
  const aiModel = currentCard?.aiModel || 'deepseek'
  const generatedContent = currentCard?.generatedContent || ''
  const isGenerating = currentCard?.isGenerating || false
  const [showPromptTooltip, setShowPromptTooltip] = useState(false)
  const [promptTooltipVisible, setPromptTooltipVisible] = useState(false)
  const [showOptionsTooltip, setShowOptionsTooltip] = useState(false)
  const [showOptionsManageTooltip, setShowOptionsManageTooltip] = useState(false)
  const [optionsManageTooltipVisible, setOptionsManageTooltipVisible] = useState(false)
  const generateButtonRef = useRef<HTMLButtonElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)


  // Save function
  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      await saveWorkspace()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000) // Hide success message after 2s
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

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
  const currentCardIndex = currentColumn?.cards.findIndex(card => card.id === cardId) || 0
  const previousCards = currentColumn?.cards
    .slice(0, currentCardIndex)
    .filter(card => card.type === 'aitool')
    .map(card => ({
      id: card.id,
      buttonName: card.buttonName || 'Unnamed Card',
      order: currentCardIndex
    })) || []

  // Get Info Cards from current column for reference dropdown
  const infoCards = currentColumn?.cards
    .filter(card => card.type === 'info')
    .map(card => ({
      id: card.id,
      title: card.title || 'Unnamed Info',
      description: card.description || ''
    })) || []

  // Handle textarea input changes
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptChange(cardId, e.target.value)
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
      onPromptChange(cardId, newText)
      
      setTimeout(() => {
        const newCursorPosition = cursorPosition + referenceText.length
        textarea.setSelectionRange(newCursorPosition, newCursorPosition)
        textarea.focus()
      }, 0)
    }
  }

  // Insert Info Card reference at cursor position
  const insertInfoReference = (selectedTitle: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const cursorPosition = textarea.selectionStart
      const textBefore = promptText.substring(0, cursorPosition)
      const textAfter = promptText.substring(textarea.selectionEnd)
      const referenceText = `[INFO: ${selectedTitle}]`
      
      const newText = textBefore + referenceText + textAfter
      onPromptChange(cardId, newText)
      
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
    
    // Set generating state
    onGeneratedContentChange(cardId, '') // Clear previous content
    onGeneratingStateChange(cardId, true)
    
    try {
      let resolvedPrompt = resolveReferences(promptText, columns)
      
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
                onGeneratedContentChange(cardId, fullResponse)
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
      onGeneratedContentChange(cardId, 'Error generating content. Please try again.')
      onGeneratingStateChange(cardId, false)
    } finally {
      onGeneratingStateChange(cardId, false)
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

  const handleCloseOptionsManageTooltip = () => {
    setOptionsManageTooltipVisible(false)
    setTimeout(() => setShowOptionsManageTooltip(false), 250)
  }

  return (
    <div className="bg-gradient-to-br from-white/95 to-purple-50/30 backdrop-blur-3xl rounded-xl shadow-sm shadow-purple-500/20 border border-white/50 p-4 relative">
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

      {/* Generate Button - Small and refined */}
      <button
        ref={generateButtonRef}
        onClick={() => handleGenerateClick()}
        disabled={isGenerating}
        className="px-3 py-1.5 text-sm bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-md font-medium transition-all duration-200 flex items-center gap-1.5 mb-4"
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

      {/* AI Response Area - Always visible with gray background */}
      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/30 backdrop-blur-sm rounded-lg min-h-24">
        {generatedContent ? (
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
        ) : null
        }
      </div>

      {/* Options Tooltip */}
      {showOptionsTooltip && (options || []).length > 0 && generateButtonRef.current && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop - click to close */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowOptionsTooltip(false)}
          />
          
          {/* Tooltip */}
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
          </div>
        </>,
        document.body
      )}

      {/* Settings Modal */}
      <Modal isOpen={showPromptTooltip} onClose={handleClosePromptTooltip} className="w-full max-w-4xl mx-4">
        <SettingsModal
          isVisible={promptTooltipVisible}
          title="AI Tool Card Settings"
          onClose={handleClosePromptTooltip}
          onDelete={() => onDelete(cardId)}
          onSave={handleSave}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
        >
          {/* Button Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Name:</label>
            <input
              type="text"
              value={buttonName}
              onChange={(e) => onButtonNameChange(cardId, e.target.value)}
              onBlur={() => onButtonNameBlur(cardId)}
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
                  onAiModelChange(cardId, newModel)
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

          {/* Insert Reference - Three Column Layout */}
          {(previousCards.length > 0 || infoCards.length > 0 || (options || []).length > 0) && (
            <div className="mb-4">
              <div className="flex gap-4">
                {/* Left 1/3 - AI Cards */}
                <div className="flex-1">
                  {previousCards.length > 0 && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Insert Reference from AI Cards</label>
                      <div className="flex flex-wrap gap-2">
                        {previousCards.map((card) => (
                          <button
                            key={card.id}
                            onClick={() => insertReference(card.buttonName)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            {card.buttonName}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Middle 1/3 - Info Cards */}
                <div className="flex-1">
                  {infoCards.length > 0 && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Insert Reference from Info Cards</label>
                      <div className="flex flex-wrap gap-2">
                        {infoCards.map((card) => (
                          <button
                            key={card.id}
                            onClick={() => insertInfoReference(card.title)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            {card.title}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Right 1/3 - Options */}
                <div className="flex-1">
                  {(options || []).length > 0 && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options (click Insert Option to add to prompt):
                        <button
                          onClick={() => {
                            setShowOptionsManageTooltip(true)
                            setTimeout(() => setOptionsManageTooltipVisible(true), 10)
                          }}
                          className="inline-block ml-1 p-0.5 text-gray-400 hover:text-gray-600 transition-colors align-middle"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            if (textareaRef.current) {
                              const textarea = textareaRef.current
                              const cursorPosition = textarea.selectionStart
                              const textBefore = promptText.substring(0, cursorPosition)
                              const textAfter = promptText.substring(textarea.selectionEnd)
                              const optionText = '{{option}}'
                              
                              const newText = textBefore + optionText + textAfter
                              onPromptChange(cardId, newText)
                              
                              setTimeout(() => {
                                const newCursorPosition = cursorPosition + optionText.length
                                textarea.setSelectionRange(newCursorPosition, newCursorPosition)
                                textarea.focus()
                              }, 0)
                            }
                          }}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          Insert Option
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}


        </SettingsModal>
      </Modal>

      {/* Options Management Tooltip */}
      {showOptionsManageTooltip && typeof document !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-40 bg-black/20" />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className={`bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md w-full mx-4 pointer-events-auto transform transition-all duration-200 ease-out ${
              optionsManageTooltipVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Manage Options</h3>
                <button
                  onClick={handleCloseOptionsManageTooltip}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-2">
                {(options || []).map((optionValue, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={optionValue}
                      onChange={(e) => {
                        const newOptions = [...options]
                        newOptions[index] = e.target.value
                        onOptionsChange(cardId, newOptions)
                      }}
                      placeholder="Enter option..."
                      className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => {
                        const newOptions = options.filter((_, i) => i !== index)
                        onOptionsChange(cardId, newOptions)
                      }}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [...options, '']
                    onOptionsChange(cardId, newOptions)
                  }}
                  className="w-full px-3 py-1 text-sm text-purple-600 border border-purple-200 rounded hover:bg-purple-50 transition-colors"
                >
                  + Add Option
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}