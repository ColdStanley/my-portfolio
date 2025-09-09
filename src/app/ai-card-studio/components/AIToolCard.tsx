import { useState, useRef, useEffect, memo, useMemo } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { resolveReferences } from '../utils/cardUtils'
import { useWorkspaceStore } from '../store/workspaceStore'
import Modal from './ui/Modal'
import SettingsModal from './ui/SettingsModal'
import PasswordModal from './ui/PasswordModal'
import { hashPassword, verifyPassword } from '../utils/crypto'

interface AIToolCardProps {
  cardId: string
  columnId: string
  autoOpenSettings?: boolean
  onInsertCard?: (columnId: string, afterCardId: string) => void
}

function AIToolCard({ 
  cardId, 
  columnId,
  autoOpenSettings = false,
  onInsertCard
}: AIToolCardProps) {
  const { canvases, actions } = useWorkspaceStore()
  const { moveCard, updateCardButtonName, updateCardPromptText, updateCardOptions, updateCardAiModel, updateCardGeneratedContent, updateCardGeneratingState, deleteCard, updateCardLockStatus, setHasUnsavedChanges } = actions
  
  // Get current card data from Zustand store
  const currentColumn = canvases.flatMap(canvas => canvas.columns).find(col => col.id === columnId)
  const currentCard = currentColumn?.cards.find(card => card.id === cardId)
  
  // Calculate card position for move buttons
  const currentCardIndex = currentColumn?.cards.findIndex(card => card.id === cardId) ?? -1
  const totalCards = currentColumn?.cards.length ?? 0
  const canMoveUp = currentCardIndex > 0
  const canMoveDown = currentCardIndex < totalCards - 1
  
  const buttonName = currentCard?.buttonName || 'Start'
  const promptText = currentCard?.promptText || ''
  
  // Memoize options to prevent infinite loops from object reference changes
  const options = useMemo(() => currentCard?.options || [], [currentCard?.options])
  const aiModel = currentCard?.aiModel || 'deepseek'
  
  // Local state for optimized input performance
  const [localButtonName, setLocalButtonName] = useState(buttonName)
  const [localPromptText, setLocalPromptText] = useState(promptText)
  
  // Local state for manual save architecture
  const [localOptions, setLocalOptions] = useState(options)
  const [localAiModel, setLocalAiModel] = useState(aiModel)
  
  // Update local state when store changes
  useEffect(() => {
    setLocalButtonName(buttonName)
  }, [buttonName])
  
  useEffect(() => {
    setLocalPromptText(promptText)
  }, [promptText])
  
  useEffect(() => {
    setLocalOptions(options)
  }, [options])
  
  useEffect(() => {
    setLocalAiModel(aiModel)
  }, [aiModel])
  const generatedContent = currentCard?.generatedContent || ''
  const isGenerating = currentCard?.isGenerating || false
  const isLocked = currentCard?.isLocked || false
  const passwordHash = currentCard?.passwordHash || ''
  
  const [showPromptTooltip, setShowPromptTooltip] = useState(false)
  const [promptTooltipVisible, setPromptTooltipVisible] = useState(false)
  
  // Lock-related state
  const [passwordModal, setPasswordModal] = useState<{ mode: 'set' | 'verify'; isOpen: boolean; shouldRender: boolean }>({
    mode: 'set',
    isOpen: false,
    shouldRender: false
  })
  const [showLockMessage, setShowLockMessage] = useState(false)
  const [showOptionsTooltip, setShowOptionsTooltip] = useState(false)
  const [showOptionsManageTooltip, setShowOptionsManageTooltip] = useState(false)
  const [optionsManageTooltipVisible, setOptionsManageTooltipVisible] = useState(false)
  const generateButtonRef = useRef<HTMLButtonElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isResponseExpanded, setIsResponseExpanded] = useState(true)
  
  // PDF generation state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  
  // Card save state
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Auto-open settings for newly created cards
  useEffect(() => {
    if (autoOpenSettings) {
      setTimeout(() => {
        setShowPromptTooltip(true)
        setTimeout(() => setPromptTooltipVisible(true), 10)
      }, 100)
    }
  }, [autoOpenSettings])

  // Prevent data loss on page leave and route changes
  useEffect(() => {
    // Check if there are unsaved local changes
    const hasLocalChanges = 
      localButtonName !== buttonName || 
      localPromptText !== promptText ||
      JSON.stringify(localOptions) !== JSON.stringify(options) ||
      localAiModel !== aiModel

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasLocalChanges) {
        e.preventDefault()
        return (e.returnValue = '您有未保存的更改')
      }
    }
    
    const handlePopstate = (event: PopStateEvent) => {
      if (hasLocalChanges) {
        const confirmed = window.confirm('您有未保存的更改，确定要离开吗？')
        if (!confirmed) {
          window.history.pushState(null, '', window.location.href)
          event.preventDefault()
        }
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopstate)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopstate)
    }
  }, [localButtonName, buttonName, localPromptText, promptText, localOptions, options, localAiModel, aiModel])

  // Get previous AIToolCards from current column for reference dropdown
  const referenceCardIndex = currentColumn?.cards.findIndex(card => card.id === cardId) || 0
  const previousCards = currentColumn?.cards
    .slice(0, referenceCardIndex)
    .filter(card => card.type === 'aitool')
    .map(card => ({
      id: card.id,
      buttonName: card.buttonName || 'Unnamed Card',
      order: referenceCardIndex
    })) || []

  // Get Info Cards from current column for reference dropdown
  const infoCards = currentColumn?.cards
    .filter(card => card.type === 'info')
    .map(card => ({
      id: card.id,
      title: card.title || 'Unnamed Info',
      description: card.description || ''
    })) || []

  // Handle textarea input changes (local only, no auto-save)
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setLocalPromptText(newValue)
  }

  // Insert reference at cursor position
  const insertReference = (selectedButtonName: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const cursorPosition = textarea.selectionStart
      const textBefore = localPromptText.substring(0, cursorPosition)
      const textAfter = localPromptText.substring(textarea.selectionEnd)
      const referenceText = `[REF: ${selectedButtonName}]`
      
      const newText = textBefore + referenceText + textAfter
      setLocalPromptText(newText)
      
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
      const textBefore = localPromptText.substring(0, cursorPosition)
      const textAfter = localPromptText.substring(textarea.selectionEnd)
      const referenceText = `[INFO: ${selectedTitle}]`
      
      const newText = textBefore + referenceText + textAfter
      setLocalPromptText(newText)
      
      setTimeout(() => {
        const newCursorPosition = cursorPosition + referenceText.length
        textarea.setSelectionRange(newCursorPosition, newCursorPosition)
        textarea.focus()
      }, 0)
    }
  }

  // Lock/unlock functions
  const handleLockClick = () => {
    if (isLocked) {
      // If locked, show password verification modal to unlock
      setPasswordModal({ mode: 'verify', isOpen: true, shouldRender: true })
    } else {
      // If unlocked, show set password modal to lock
      setPasswordModal({ mode: 'set', isOpen: true, shouldRender: true })
    }
  }

  const handlePasswordSuccess = (password: string) => {
    if (passwordModal.mode === 'set') {
      // Set password and lock card
      const hash = hashPassword(password)
      updateCardLockStatus(cardId, true, hash)
      handlePasswordCancel()
    } else {
      // Verify password to unlock
      if (verifyPassword(password, passwordHash)) {
        // Unlock card
        updateCardLockStatus(cardId, false)
        handlePasswordCancel()
        
        // Auto-open settings after unlocking
        setTimeout(() => {
          setShowPromptTooltip(true)
          setTimeout(() => setPromptTooltipVisible(true), 10)
        }, 100)
      } else {
        // Wrong password - let PasswordModal handle the error display
        throw new Error('Invalid password')
      }
    }
  }

  const handlePasswordCancel = () => {
    setPasswordModal(prev => ({ ...prev, isOpen: false }))
    setTimeout(() => {
      setPasswordModal(prev => ({ ...prev, shouldRender: false }))
    }, 300) // Wait for animation to complete
  }

  // 🔧 卡片保存功能
  const handleCardSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      // 同步当前编辑的值到store
      updateCardButtonName(cardId, localButtonName)
      updateCardPromptText(cardId, localPromptText)
      updateCardOptions(cardId, localOptions)
      updateCardAiModel(cardId, localAiModel)
      
      // 标记全局有未保存更改
      setHasUnsavedChanges(true)
      
      setSaveSuccess(true)
      console.log('🔧 Card saved and marked for cloud sync')
      
      // 2秒后清除成功状态
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Card save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Modified settings click to check for lock
  const handleSettingsClick = () => {
    // If card is locked, show quick message instead
    if (isLocked) {
      setShowLockMessage(true)
      setTimeout(() => setShowLockMessage(false), 2000)
      return
    }
    
    setShowPromptTooltip(true)
    setTimeout(() => setPromptTooltipVisible(true), 10)
  }

  const handleGenerateClick = async (selectedOption?: string) => {
    if (!localPromptText.trim()) return
    
    if ((localOptions || []).length > 0 && !selectedOption) {
      setShowOptionsTooltip(true)
      return
    }
    
    // Set generating state
    updateCardGeneratedContent(cardId, '') // Clear previous content
    updateCardGeneratingState(cardId, true)
    
    try {
      let resolvedPrompt = resolveReferences(localPromptText, canvases, columnId)
      
      // Replace option placeholder with selected value if both exist
      const hasOptions = (localOptions || []).length > 0
      if (hasOptions && selectedOption && typeof selectedOption === 'string') {
        resolvedPrompt = resolvedPrompt.replace(/\{\{option\}\}/g, selectedOption)
      }
      
      const response = await fetch('/api/ai-card-studio/generate', {
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
      let buffer = '' // 添加缓冲区
      
      // 🔧 Claude风格节流更新 - 显示与状态分离
      let lastDisplayUpdate = 0
      const THROTTLE_MS = 100 // 100ms节流
      
      // 等待DOM元素渲染完成
      const waitForElement = async (selector: string, timeout = 1000): Promise<HTMLElement | null> => {
        const start = Date.now()
        while (Date.now() - start < timeout) {
          const element = document.querySelector(selector) as HTMLElement
          if (element) {
            console.log('🔧 Debug: Display element found after', Date.now() - start, 'ms')
            return element
          }
          await new Promise(resolve => setTimeout(resolve, 10))
        }
        console.warn('🔧 Debug: Display element not found after', timeout, 'ms timeout')
        return null
      }
      
      // 等待显示元素渲染
      const displayElement = await waitForElement(`[data-ai-response="${cardId}"]`)
      console.log('🔧 Debug: Display element ready:', !!displayElement, 'for cardId:', cardId)

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        // 将新数据追加到缓冲区
        buffer += decoder.decode(value, { stream: true })
        
        // 按换行符分割，保留最后一个可能不完整的部分
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 最后一行可能不完整，保留到下次处理
        
        // 处理完整的行
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              if (content) {
                fullResponse += content
                console.log('🔧 Debug: Received content chunk:', content.length, 'chars, total:', fullResponse.length)
                
                // 🔧 节流更新显示 - 直接DOM操作，不触发状态更新
                const now = Date.now()
                if (displayElement && now - lastDisplayUpdate > THROTTLE_MS) {
                  displayElement.textContent = fullResponse
                  console.log('🔧 Debug: DOM updated with', fullResponse.length, 'chars')
                  lastDisplayUpdate = now
                } else if (!displayElement) {
                  console.warn('🔧 Debug: Skipping DOM update - element not found')
                } else {
                  console.log('🔧 Debug: Skipping DOM update - throttled')
                }
              }
            } catch {
              // 忽略解析错误，继续处理下一行
              console.warn('Skipping malformed JSON line:', data)
            }
          }
        }
      }
      
      // 处理缓冲区中剩余的最后一行（如果有的话）
      if (buffer.trim() && buffer.startsWith('data: ')) {
        const data = buffer.slice(6).trim()
        if (data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              // 最终显示更新
              if (displayElement) {
                displayElement.textContent = fullResponse
              }
            }
          } catch {
            console.warn('Skipping final malformed JSON:', data)
          }
        }
      }
      
      // 🔧 完成后一次性状态更新和缓存同步  
      updateCardGeneratedContent(cardId, fullResponse, true) // shouldCache = true
      
      setShowOptionsTooltip(false)
    } catch (error) {
      console.error('Error generating content:', error)
      updateCardGeneratedContent(cardId, 'Error generating content. Please try again.')
      updateCardGeneratingState(cardId, false)
    } finally {
      updateCardGeneratingState(cardId, false)
    }
  }

  const handlePromptClick = () => {
    // If card is locked, require password verification first
    if (isLocked) {
      setPasswordModal({ mode: 'verify', isOpen: true })
      return
    }
    
    setShowPromptTooltip(true)
    setTimeout(() => setPromptTooltipVisible(true), 10)
  }

  const handleClosePromptTooltip = () => {
    // 恢复到store原值
    setLocalButtonName(buttonName)
    setLocalPromptText(promptText)
    setLocalOptions(options)
    setLocalAiModel(aiModel)
    
    setPromptTooltipVisible(false)
    setTimeout(() => setShowPromptTooltip(false), 250)
  }

  const handleCloseOptionsManageTooltip = () => {
    setOptionsManageTooltipVisible(false)
    setTimeout(() => setShowOptionsManageTooltip(false), 250)
  }

  return (
    <div className="bg-gradient-to-br from-white/95 to-purple-50/30 backdrop-blur-3xl rounded-xl shadow-sm shadow-purple-500/20 border border-white/50 p-4 pt-6 relative transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-1 group">
      {/* Delete AI Response Button - Top Right, left of PDF button */}
      <button
        onClick={() => {
          if (!generatedContent?.trim()) return
          updateCardGeneratedContent(cardId, '')
        }}
        className="absolute top-4 right-28 w-6 h-6 bg-white/80 hover:bg-purple-50 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 transition-all duration-200 z-10 hover:shadow-lg hover:shadow-purple-200/50 hover:scale-110 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Clear AI response"
        disabled={!generatedContent?.trim()}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* PDF Export Button - Top Right, left of Insert button */}
      <button
        onClick={async () => {
          if (!generatedContent?.trim() || isGeneratingPDF) return
          
          setIsGeneratingPDF(true)
          
          try {
            console.log('Generating PDF for card:', buttonName)
            
            const response = await fetch('/api/ai-card-studio/generate-pdf', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                cardName: buttonName,
                content: generatedContent,  // Send raw markdown content
                generatedAt: new Date().toLocaleString()
              })
            })

            if (!response.ok) {
              throw new Error(`PDF generation failed: ${response.status}`)
            }

            const blob = await response.blob()
            // Frontend controls filename
            const filename = `${buttonName.replace(/[^a-zA-Z0-9\s]/g, '')}_AI_Card.pdf`
            
            // Download the PDF
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            
            console.log('PDF generated successfully:', filename)
          } catch (error) {
            console.error('PDF generation error:', error)
            alert('Failed to generate PDF. Please try again.')
          } finally {
            setIsGeneratingPDF(false)
          }
        }}
        className="absolute top-4 right-20 w-6 h-6 bg-white/80 hover:bg-purple-50 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 transition-all duration-200 z-10 hover:shadow-lg hover:shadow-purple-200/50 hover:scale-110 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
        title={isGeneratingPDF ? "Generating PDF..." : "Export to PDF"}
        disabled={!generatedContent?.trim() || isGeneratingPDF}
      >
        {isGeneratingPDF ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 01 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </button>

      {/* Insert Card Button - Top Right, left of Settings button */}
      <button
        onClick={() => onInsertCard?.(columnId, cardId)}
        className="absolute top-4 right-12 w-6 h-6 bg-white/80 hover:bg-purple-50 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 transition-all duration-200 z-10 hover:shadow-lg hover:shadow-purple-200/50 hover:scale-110 hover:-translate-y-0.5"
        title="Insert card below"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Settings Button */}
      <button
        onClick={handleSettingsClick}
        className="absolute top-4 right-4 w-6 h-6 bg-white/80 hover:bg-purple-50 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 transition-all duration-200 z-10"
        title={isLocked ? "Card is locked - unlock to access settings" : "Card Settings"}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Lock/Unlock Button - Below Settings Button, Right Aligned */}
      <button
        onClick={handleLockClick}
        className="absolute top-12 right-4 w-6 h-6 bg-white/80 hover:bg-purple-50 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 transition-all duration-200 z-10 hover:shadow-lg hover:shadow-purple-200/50 hover:scale-110 hover:-translate-y-0.5"
        title={isLocked ? "Unlock card" : "Lock card"}
        style={{ pointerEvents: 'auto' }}
      >
        {isLocked ? (
          // Locked icon
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : (
          // Unlocked icon
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      {/* Lock Message - Temporary notification */}
      {showLockMessage && (
        <div className="absolute top-14 right-4 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-20 animate-pulse">
          🔒 Card is locked - click unlock first
        </div>
      )}

      {/* Generate Button - Small and refined */}
      <button
        ref={generateButtonRef}
        onClick={() => handleGenerateClick()}
        disabled={isGenerating}
        className="px-3 py-1.5 text-sm bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-md font-medium transition-all duration-200 flex items-center gap-1.5 mb-4"
      >
        {isGenerating && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 01 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 01 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        )}
        {buttonName}
      </button>

      {/* AI Response Area - Always visible with gray background */}
      <div className={`relative p-4 bg-gradient-to-br from-gray-50/80 via-gray-100/40 to-gray-50/60 backdrop-blur-sm rounded-lg transition-all duration-300 border border-gray-200/50 shadow-inner ${
        isResponseExpanded ? 'min-h-fit' : 'min-h-24'
      } ${
        !isResponseExpanded && generatedContent ? 'max-h-24 overflow-hidden' : ''
      }`}>
        {/* Gradient Mask for Collapsed State */}
        {!isResponseExpanded && generatedContent && (
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none z-5"></div>
        )}
        
        {/* Expand/Collapse Button - Minimal dropdown arrow */}
        {generatedContent && (
          <button
            onClick={() => setIsResponseExpanded(!isResponseExpanded)}
            className="absolute top-2 right-2 p-1 text-gray-600 hover:text-purple-600 cursor-pointer transition-all duration-200 z-10"
            title={isResponseExpanded ? 'Collapse response' : 'Expand response'}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isResponseExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
              />
            </svg>
          </button>
        )}
        
        {isGenerating && !generatedContent ? (
          /* Skeleton Shimmer Effect - Only show when generating and no content yet */
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-md bg-[length:200%_100%] animate-shimmer" style={{width: `${85 - i * 10}%`}}></div>
              </div>
            ))}
            {/* Shimmer Animation CSS */}
            <style jsx>{`
              @keyframes shimmer {
                0% {
                  background-position: -200% 0;
                }
                100% {
                  background-position: 200% 0;
                }
              }
              .animate-shimmer {
                animation: shimmer 1.5s ease-in-out infinite;
              }
            `}</style>
          </div>
        ) : generatedContent ? (
          /* Show streaming content with loading indicator when generating */
          <div className="relative">
            {isGenerating && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 01 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 01 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </div>
            )}
            {/* 🔧 流式显示层 - 生成时使用 */}
            {isGenerating && (
              <div 
                className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap"
                data-ai-response={cardId}
              >
                {console.log('🔧 Debug: Streaming layer rendered for cardId:', cardId)}
              </div>
            )}
            
            {/* 🔧 最终显示层 - 完成后使用ReactMarkdown */}
            {!isGenerating && (
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown
                  remarkPlugins={[remarkBreaks, remarkGfm]}
                  components={{
                  h1: ({node, ...props}) => (
                    <h1 className="text-xl font-bold text-gray-800 mb-3 mt-4 first:mt-0 border-b border-gray-200 pb-1" {...props} />
                  ),
                  h2: ({node, ...props}) => (
                    <h2 className="text-lg font-semibold text-gray-800 mb-2 mt-3 first:mt-0" {...props} />
                  ),
                  h3: ({node, ...props}) => (
                    <h3 className="text-base font-medium text-gray-800 mb-2 mt-2 first:mt-0" {...props} />
                  ),
                  h4: ({node, ...props}) => (
                    <h4 className="text-sm font-medium text-gray-800 mb-1 mt-2 first:mt-0" {...props} />
                  ),
                  p: ({node, ...props}) => (
                    <p className="text-gray-600 mb-3 leading-relaxed text-sm" {...props} />
                  ),
                  ul: ({node, ...props}) => (
                    <ul className="list-disc list-inside mb-3 text-gray-600 space-y-1" {...props} />
                  ),
                  ol: ({node, ...props}) => (
                    <ol className="list-decimal list-inside mb-3 text-gray-600 space-y-1" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="text-sm leading-relaxed mb-1" {...props} />
                  ),
                  code: ({node, inline, ...props}) => 
                    inline ? (
                      <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                    ) : (
                      <code className="block bg-gray-100 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto whitespace-pre" {...props} />
                    ),
                  pre: ({node, ...props}) => (
                    <pre className="bg-gray-100 rounded-lg p-3 overflow-x-auto border border-gray-200 my-3" {...props} />
                  ),
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-purple-300 pl-3 italic text-gray-600 mb-2" {...props} />
                  ),
                  strong: ({node, ...props}) => (
                    <strong className="font-semibold text-gray-800" {...props} />
                  ),
                  em: ({node, ...props}) => (
                    <em className="italic" {...props} />
                  ),
                  a: ({ href, children, ...props }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 underline"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  hr: ({node, ...props}) => (
                    <hr className="border-t border-gray-200 my-4" {...props} />
                  ),
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-3">
                      <table className="min-w-full border border-gray-200 rounded-lg" {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => (
                    <thead className="bg-gray-50" {...props} />
                  ),
                  tbody: ({node, ...props}) => (
                    <tbody {...props} />
                  ),
                  tr: ({node, ...props}) => (
                    <tr className="hover:bg-gray-50/50" {...props} />
                  ),
                  th: ({node, ...props}) => (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200" {...props} />
                  ),
                  td: ({node, ...props}) => (
                    <td className="px-3 py-2 text-sm text-gray-600 border-b border-gray-100" {...props} />
                  ),
                  del: ({node, ...props}) => (
                    <del className="line-through text-gray-500" {...props} />
                  ),
                  input: ({node, ...props}) => {
                    const { type, checked, disabled } = props as any;
                    if (type === 'checkbox') {
                      return (
                        <input 
                          type="checkbox" 
                          checked={checked} 
                          disabled={disabled}
                          className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          {...props} 
                        />
                      );
                    }
                    return <input {...props} />;
                  },
                  sup: ({node, ...props}) => (
                    <sup className="text-xs" {...props} />
                  ),
                  sub: ({node, ...props}) => (
                    <sub className="text-xs" {...props} />
                  )
                }}
                >
                  {generatedContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ) : null}
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
          title={
            <div className="flex items-center gap-2">
              <span>AI Tool Card Settings</span>
              {totalCards > 1 && (
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => moveCard(columnId, cardId, 'up')}
                    disabled={!canMoveUp}
                    className="p-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                    title="Move card up"
                  >
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveCard(columnId, cardId, 'down')}
                    disabled={!canMoveDown}
                    className="p-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                    title="Move card down"
                  >
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          }
          onClose={handleClosePromptTooltip}
          onSave={handleCardSave}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
          onDelete={() => {
            // Trigger close animation first
            setPromptTooltipVisible(false)
            setTimeout(() => {
              setShowPromptTooltip(false)
              deleteCard(columnId, cardId)
            }, 250) // Wait for animation to complete
          }}
        >
          {/* Button Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Name:</label>
            <input
              type="text"
              value={localButtonName}
              onChange={(e) => {
                const newValue = e.target.value
                setLocalButtonName(newValue)
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
                value={localAiModel}
                onChange={(e) => {
                  const newModel = e.target.value as 'deepseek' | 'openai'
                  setLocalAiModel(newModel)
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
                value={localPromptText}
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
          {(previousCards.length > 0 || infoCards.length > 0 || true) && (
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
                    {(options || []).length > 0 && (
                      <button
                        onClick={() => {
                          if (textareaRef.current) {
                            const textarea = textareaRef.current
                            const cursorPosition = textarea.selectionStart
                            const textBefore = localPromptText.substring(0, cursorPosition)
                            const textAfter = localPromptText.substring(textarea.selectionEnd)
                            const optionText = '{{option}}'
                            
                            const newText = textBefore + optionText + textAfter
                            setLocalPromptText(newText)
                            
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
                    )}
                    {(options || []).length > 0 && (
                      <span className="px-2 py-1 text-xs text-gray-500 bg-gray-50 rounded">
                        {localOptions.length} option{localOptions.length !== 1 ? 's' : ''} configured
                      </span>
                    )}
                  </div>
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
                        const newOptions = [...localOptions]
                        newOptions[index] = e.target.value
                        setLocalOptions(newOptions)
                      }}
                      placeholder="Enter option..."
                      className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => {
                        const newOptions = localOptions.filter((_, i) => i !== index)
                        setLocalOptions(newOptions)
                      }}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [...localOptions, '']
                    setLocalOptions(newOptions)
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

      {/* Password Modal - Portal to document.body */}
      {passwordModal.shouldRender && createPortal(
        <PasswordModal
          mode={passwordModal.mode}
          isOpen={passwordModal.isOpen}
          onSuccess={handlePasswordSuccess}
          onCancel={handlePasswordCancel}
        />,
        document.body
      )}
    </div>
  )
}

export default memo(AIToolCard)