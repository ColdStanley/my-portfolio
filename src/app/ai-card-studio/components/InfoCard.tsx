import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import { useWorkspaceStore } from '../store/workspaceStore'
import Modal from './ui/Modal'
import SettingsModal from './ui/SettingsModal'

interface InfoCardProps {
  columnId: string
  cardId: string
  isTopCard: boolean
  autoOpenSettings?: boolean
  onInsertCard?: (columnId: string, afterCardId: string) => void
  onRunColumnWorkflow?: () => void
  isColumnExecuting?: boolean
}

export default function InfoCard({ 
  columnId,
  cardId,
  isTopCard,
  autoOpenSettings = false,
  onInsertCard,
  onRunColumnWorkflow,
  isColumnExecuting = false
}: InfoCardProps) {
  const { canvases, actions } = useWorkspaceStore()
  const { moveColumn, moveCard, updateColumns, updateCardTitle, updateCardDescription, deleteCard } = actions
  
  // Get current column and card data from Zustand store
  const currentColumn = canvases.flatMap(canvas => canvas.columns).find(col => col.id === columnId)
  const currentCard = currentColumn?.cards.find(card => card.id === cardId)
  
  // Calculate column position for move buttons
  const activeCanvas = canvases.find(canvas => 
    canvas.columns.some(col => col.id === columnId)
  )
  const currentColumnIndex = activeCanvas?.columns.findIndex(col => col.id === columnId) ?? -1
  const totalColumns = activeCanvas?.columns.length ?? 0
  const canMoveLeft = currentColumnIndex > 0
  const canMoveRight = currentColumnIndex < totalColumns - 1
  
  // Calculate card position for move buttons
  const currentCardIndex = currentColumn?.cards.findIndex(card => card.id === cardId) ?? -1
  const totalCards = currentColumn?.cards.length ?? 0
  const canMoveUp = currentCardIndex > 0
  const canMoveDown = currentCardIndex < totalCards - 1
  
  const title = currentCard?.title || ''
  const description = currentCard?.description || ''
  const urls = currentCard?.urls || []
  const [showSettingsTooltip, setShowSettingsTooltip] = useState(false)
  const [settingsTooltipVisible, setSettingsTooltipVisible] = useState(false)
  
  // URLs management state
  const [showUrlsTooltip, setShowUrlsTooltip] = useState(false)
  const [urlsTooltipVisible, setUrlsTooltipVisible] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [isTriggering, setIsTriggering] = useState(false)
  const urlButtonRef = useRef<HTMLButtonElement>(null)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  
  // PDF generation state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleSettingsClick = () => {
    setShowSettingsTooltip(true)
    setTimeout(() => setSettingsTooltipVisible(true), 10)
  }

  const handleCloseSettingsTooltip = () => {
    setSettingsTooltipVisible(false)
    setTimeout(() => setShowSettingsTooltip(false), 250)
  }

  const handleDelete = () => {
    deleteCard(columnId, cardId)
    handleCloseSettingsTooltip()
  }

  // URLs management
  const handleUrlsTooltipOpen = () => {
    setShowUrlsTooltip(true)
    setTimeout(() => setUrlsTooltipVisible(true), 10)
    setNewUrl('')
  }

  const handleUrlsTooltipClose = () => {
    setUrlsTooltipVisible(false)
    setTimeout(() => setShowUrlsTooltip(false), 200)
    setNewUrl('')
  }

  const addUrl = () => {
    if (!newUrl.trim()) return
    
    updateColumns(prev => prev.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId
                ? { ...card, urls: [...(card.urls || []), newUrl.trim()] }
                : card
            )
          }
        : col
    ))
    setNewUrl('')
  }

  const removeUrl = (urlIndex: number) => {
    updateColumns(prev => prev.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId
                ? { ...card, urls: (card.urls || []).filter((_, i) => i !== urlIndex) }
                : card
            )
          }
        : col
    ))
  }

  // Trigger n8n workflows
  const handleTriggerWorkflows = async () => {
    if (!urls.length || isTriggering) return

    setIsTriggering(true)
    
    try {
      const responses = await Promise.allSettled(
        urls.map(url => {
          // Prepare payload - only include text if description has content
          const payload = description.trim() 
            ? { text: description.trim() }
            : {}
          
          return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).then(res => res.text())
        })
      )

      const results = responses
        .map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value
          } else {
            console.error(`URL ${index + 1} failed:`, result.reason)
            return `[URL ${index + 1} failed]`
          }
        })
        .join('\n\n')

      // Update description with results
      updateCardDescription(cardId, results)
    } catch (error) {
      console.error('Trigger failed:', error)
      updateCardDescription(cardId, 'Error: Failed to trigger workflows')
    } finally {
      setIsTriggering(false)
    }
  }

  // Export column function
  const handleExportColumn = () => {
    if (!currentColumn) return

    // Clean temporary states from column data
    const cleanColumn = {
      ...currentColumn,
      cards: currentColumn.cards.map(card => {
        const { deleting, justCreated, isGenerating, ...cleanCard } = card as any
        return cleanCard
      })
    }

    // Create JSON string
    const jsonString = JSON.stringify(cleanColumn, null, 2)
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const timestamp = Date.now()
    
    // Get column title from the first Info Card title
    const columnTitle = title || 'Untitled Column'
    
    const link = document.createElement('a')
    link.href = url
    link.download = `AI Card Studio - ${columnTitle} - ${timestamp}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Auto-open settings for newly created cards
  useEffect(() => {
    if (autoOpenSettings) {
      setTimeout(() => {
        setShowSettingsTooltip(true)
        setTimeout(() => setSettingsTooltipVisible(true), 10)
      }, 100) // Small delay to ensure card is rendered
    }
  }, [autoOpenSettings])

  return (
    <div className="bg-gradient-to-br from-white/95 to-purple-50/30 backdrop-blur-3xl rounded-xl shadow-sm shadow-purple-500/20 border border-white/50 p-4 relative transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-1 group">
      
      {/* PDF Export Button - Top Right, left of Insert button */}
      <button
        onClick={async () => {
          if (!description?.trim() || isGeneratingPDF) return
          
          setIsGeneratingPDF(true)
          
          try {
            console.log('Generating PDF for Info Card:', title)
            
            const response = await fetch('/api/ai-card-studio/generate-pdf', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                cardName: title || 'Info Card',
                aiContent: description,
                generatedAt: new Date().toLocaleString()
              })
            })

            if (!response.ok) {
              throw new Error(`PDF generation failed: ${response.status}`)
            }

            const blob = await response.blob()
            const cleanCardName = (title || 'Info_Card').replace(/[^a-z0-9]/gi, '_')
            const timestamp = new Date().toISOString().split('T')[0]
            const filename = `${cleanCardName}_${timestamp}.pdf`
            
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
        disabled={!description?.trim() || isGeneratingPDF}
      >
        {isGeneratingPDF ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
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

      {/* Settings Button - Top Right */}
      <button
        onClick={handleSettingsClick}
        className="absolute top-4 right-4 w-6 h-6 bg-white/80 hover:bg-purple-50 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 transition-all duration-200 z-10 hover:shadow-lg hover:shadow-purple-200/50 hover:scale-110 hover:-translate-y-0.5"
        title="Card Settings"
        style={{ pointerEvents: 'auto' }}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <div className={isTopCard ? 'border-l-4 border-purple-500 pl-4' : ''}>
        <div className="flex items-center gap-2 mb-4">
          {/* Run All Cards Button - 仅在顶部Info Card且列中有AI工具卡片时显示 */}
          {onRunColumnWorkflow && (
            <button
              onClick={onRunColumnWorkflow}
              disabled={isColumnExecuting}
              className="flex-shrink-0 w-7 h-7 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200"
              title={isColumnExecuting ? "Workflow is running..." : "Run all AI tool cards in this column"}
            >
              {isColumnExecuting ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          )}
          <h2 className={`${isTopCard ? 'text-xl font-bold' : 'text-lg font-medium'} text-purple-600`}>
            {title}
          </h2>
        </div>
      </div>
      
      {/* Trigger Button - only show if URLs are configured, positioned between title and description */}
      {urls.length > 0 && (
        <button
          onClick={handleTriggerWorkflows}
          disabled={isTriggering}
          className="px-3 py-1.5 text-sm bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-md font-medium transition-all duration-200 flex items-center gap-1.5 mb-4"
        >
          {isTriggering ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Triggering...
            </>
          ) : (
            'Trigger'
          )}
        </button>
      )}
      
      <div className={`relative text-gray-600 text-sm transition-all duration-300 ${
        !isDescriptionExpanded && description ? 'max-h-16 overflow-hidden' : 'max-h-fit'
      }`}>
        {/* Expand/Collapse Button - Minimal dropdown arrow */}
        {description && (
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="absolute top-1 right-2 p-1 text-gray-600 hover:text-purple-600 cursor-pointer transition-all duration-200 z-10"
            title={isDescriptionExpanded ? 'Collapse description' : 'Expand description'}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isDescriptionExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
              />
            </svg>
          </button>
        )}
        
        {description ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkBreaks]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-lg font-bold text-gray-800 mb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-base font-semibold text-gray-800 mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-sm font-medium text-gray-800 mb-1" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-600 mb-2 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 text-gray-600" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 text-gray-600" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-gray-800" {...props} />,
                em: ({node, ...props}) => <em className="italic" {...props} />,
                code: ({node, inline, ...props}) => 
                  inline 
                    ? <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                    : <code className="block bg-gray-100 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto whitespace-pre" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-300 pl-3 italic text-gray-600 mb-2" {...props} />,
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
                )
              }}
            >
              {description}
            </ReactMarkdown>
          </div>
        ) : null}
      </div>

      {/* Card Settings Modal - Screen Centered via Portal */}
      <Modal isOpen={showSettingsTooltip} onClose={handleCloseSettingsTooltip} className="w-full max-w-4xl mx-4">
        <SettingsModal
          isVisible={settingsTooltipVisible}
          title={
            <div className="flex items-center gap-2">
              <span>Info Card Settings</span>
              {isTopCard && totalColumns > 1 && (
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => moveColumn(columnId, 'left')}
                    disabled={!canMoveLeft}
                    className="p-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                    title="Move column left"
                  >
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveColumn(columnId, 'right')}
                    disabled={!canMoveRight}
                    className="p-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                    title="Move column right"
                  >
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
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
          headerActions={isTopCard ? (
            <button
              onClick={handleExportColumn}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-all duration-200"
            >
              Download & Share
            </button>
          ) : undefined}
          onClose={handleCloseSettingsTooltip}
          onDelete={handleDelete}
        >
          {/* Card Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Name:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => updateCardTitle(cardId, e.target.value)}
              placeholder="Enter card name..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Description:</label>
              <button
                ref={urlButtonRef}
                onClick={handleUrlsTooltipOpen}
                className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-all duration-200"
                title="Configure URLs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => updateCardDescription(cardId, e.target.value)}
              placeholder="Enter description..."
              className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>


        </SettingsModal>
      </Modal>

      {/* URLs Management Tooltip - Portal style like AI Tool Card options */}
      {showUrlsTooltip && urlButtonRef.current && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop - click to close */}
          <div 
            className="fixed inset-0 z-40"
            onClick={handleUrlsTooltipClose}
          />
          
          {/* Tooltip */}
          <div 
            className={`fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 transform transition-all duration-200 ease-out ${
              urlsTooltipVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{
              top: urlButtonRef.current.getBoundingClientRect().bottom + 8,
              left: Math.min(
                urlButtonRef.current.getBoundingClientRect().left,
                window.innerWidth - 320 - 16
              )
            }}
          >
            <div className="absolute -top-1 left-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-800">Configure URLs</h3>
              <button
                onClick={handleUrlsTooltipClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Add new URL */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://your-n8n-webhook-url"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addUrl()}
              />
              <button
                onClick={addUrl}
                disabled={!newUrl.trim()}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
            
            {/* URLs list */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {urls.length > 0 ? (
                urls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="flex-1 text-sm text-gray-700 truncate" title={url}>
                      {url}
                    </span>
                    <button
                      onClick={() => removeUrl(index)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-150"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400 text-center py-4">
                  No URLs configured
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}