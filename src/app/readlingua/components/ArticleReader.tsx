'use client'

import { useState, useRef } from 'react'
import { marked } from 'marked'
import { Article, useReadLinguaStore } from '../store/useReadLinguaStore'
import { aiApi, queryApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'
import TextSelectionToolbar from './TextSelectionToolbar'
import AIResponseFloatingPanel from './AIResponseFloatingPanel'
import FlagIcon from './FlagIcon'

interface ArticleReaderProps {
  article: Article
}

export default function ArticleReader({ article }: ArticleReaderProps) {
  const [selectedText, setSelectedText] = useState('')
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const [showFloatingPanel, setShowFloatingPanel] = useState(false)
  const [floatingPanelData, setFloatingPanelData] = useState({
    queryType: '',
    aiResponse: '',
    isLoading: false,
    hasError: false
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const { queries, setShowQueryPanel } = useReadLinguaStore()

  const handleTextSelection = () => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    
    if (text && text.length > 0) {
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()
      
      if (rect) {
        setSelectedText(text)
        // Use viewport coordinates directly for fixed positioning
        setSelectionPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        })
        setShowToolbar(true)
      }
    } else {
      setShowToolbar(false)
    }
  }

  const handleQuerySubmit = async (queryType: string, userQuestion?: string) => {
    try {
      let userId = 'anonymous'
      
      // Try to get authenticated user, but don't require it
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          userId = user.id
        }
      } catch (authError) {
        console.log('Using anonymous mode for AI features')
      }

      // Hide toolbar and show floating panel
      setShowToolbar(false)
      setShowFloatingPanel(true)
      setFloatingPanelData({
        queryType,
        aiResponse: '',
        isLoading: true,
        hasError: false
      })

      // Generate highlight ID for later use
      const highlightId = `highlight_${Date.now()}`

      // Get selected AI model and custom prompt templates
      const { selectedAiModel, getCurrentPromptTemplates } = useReadLinguaStore.getState()
      const promptTemplates = getCurrentPromptTemplates()
      const customPrompt = promptTemplates[queryType as keyof typeof promptTemplates]

      let fullResponse = ''

      // Call AI API with streaming
      await aiApi.processQueryStream(
        {
          selected_text: selectedText,
          query_type: queryType,
          user_question: userQuestion,
          source_language: article.source_language,
          native_language: article.native_language,
          ai_model: selectedAiModel,
          custom_prompt_template: customPrompt
        },
        // onChunk - update floating panel in real-time
        (chunk: string) => {
          fullResponse += chunk
          setFloatingPanelData(prev => ({
            ...prev,
            aiResponse: fullResponse,
            isLoading: false
          }))
        },
        // onComplete - save to database and close floating panel
        async (finalResponse: string) => {
          try {
            // Save final query to database
            const newQuery = await queryApi.createQuery({
              article_id: article.id,
              user_id: userId,
              selected_text: selectedText,
              query_type: queryType,
              user_question: userQuestion,
              ai_response: finalResponse,
              text_position: {
                start: 0,
                end: selectedText.length,
                highlight_id: highlightId
              }
            })

            // Add to store and right panel
            useReadLinguaStore.getState().addQuery(newQuery)
            useReadLinguaStore.getState().setSelectedQuery(newQuery)
            setShowQueryPanel(true)
            
            // Final update to floating panel
            setFloatingPanelData(prev => ({
              ...prev,
              aiResponse: finalResponse,
              isLoading: false,
              hasError: false
            }))
            
          } catch (dbError) {
            console.error('Error saving query to database:', dbError)
            // Still show the response but mark as error in console
            setFloatingPanelData(prev => ({
              ...prev,
              aiResponse: finalResponse,
              isLoading: false,
              hasError: false // Don't show error to user if DB save fails
            }))
          }
        },
        // onError - handle streaming errors
        (error: string) => {
          console.error('Streaming error:', error)
          setFloatingPanelData(prev => ({
            ...prev,
            aiResponse: `Error: ${error}. Please try again.`,
            isLoading: false,
            hasError: true
          }))
        }
      )

    } catch (error) {
      console.error('Error processing query:', error)
      setFloatingPanelData(prev => ({
        ...prev,
        aiResponse: 'Failed to process query. Please try again.',
        isLoading: false,
        hasError: true
      }))
    } finally {
      // Clear selection
      window.getSelection()?.removeAllRanges()
    }
  }


  const handleHighlightClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const queryId = target.getAttribute('data-query-id')
    
    if (queryId) {
      const query = queries.find(q => q.id === queryId)
      if (query) {
        useReadLinguaStore.getState().setSelectedQuery(query)
        setShowQueryPanel(true)
      }
    }
  }

  const formatArticleContent = () => {
    // Clean the content first - remove any existing HTML highlights
    let content = article.content
      .replace(/<span[^>]*data-highlight-id[^>]*>([^<]*)<\/span>/g, '$1')
      .replace(/class="bg-purple-[^"]*"/g, '')
      .replace(/data-highlight-id="[^"]*"/g, '')
      .replace(/data-query-id="[^"]*"/g, '')
    
    // Remove any malformed HTML artifacts
    content = content.replace(/>\s*class="[^"]*"\s*</g, '><')
                    .replace(/^\s*class="[^"]*"\s*/g, '')
                    .replace(/\s*class="[^"]*"\s*$/g, '')
    
    // Parse Markdown to HTML
    try {
      // Configure marked options for better rendering
      content = marked.parse(content, {
        breaks: true,        // Convert line breaks to <br>
        gfm: true,          // GitHub Flavored Markdown
        sanitize: false,    // Don't sanitize HTML (we'll handle it)
      })
    } catch (error) {
      console.warn('Markdown parsing failed, using plain text:', error)
      // Fallback: convert line breaks manually if markdown parsing fails
      content = content
        .replace(/\n\n+/g, '</p><p class="mb-4">')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p class="mb-4">')
        .replace(/$/, '</p>')
    }
    
    const highlights = queries.filter(q => q.text_position && q.selected_text)
    
    // Apply highlights by finding text matches instead of using positions
    highlights.forEach((query) => {
      if (query.selected_text && query.text_position?.highlight_id) {
        const searchText = query.selected_text.trim()
        if (searchText && content.includes(searchText)) {
          const highlightSpan = `<span class="article-highlight cursor-pointer" data-highlight-id="${query.text_position.highlight_id}" data-query-id="${query.id}">${searchText}</span>`
          // Only replace the first occurrence to avoid duplicates
          content = content.replace(searchText, highlightSpan)
        }
      }
    })

    return content
  }

  const handlePlayPronunciation = async (text: string) => {
    if (isPlaying) return
    
    setIsPlaying(true)
    try {
      const response = await fetch('/api/readlingua/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          language: article.source_language // Use article's language directly
        })
      })
      
      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        audio.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
        }
        
        audio.onerror = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
        }
        
        await audio.play()
      } else {
        const errorData = await response.json()
        console.error('Failed to get audio:', errorData.error)
        alert(errorData.error || 'Failed to generate pronunciation')
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Error playing pronunciation:', error)
      setIsPlaying(false)
    }
  }

  const handleFloatingPanelClose = () => {
    setShowFloatingPanel(false)
    setFloatingPanelData({
      queryType: '',
      aiResponse: '',
      isLoading: false,
      hasError: false
    })
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Article Header */}
      <div className="flex-shrink-0">
        {/* Article Title Section */}
        <div className="p-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{article.title}</h1>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 font-medium">From:</span>
              <FlagIcon language={article.source_language} size={14} />
              <span>{article.source_language.charAt(0).toUpperCase() + article.source_language.slice(1)}</span>
            </div>
            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 font-medium">To:</span>
              <FlagIcon language={article.native_language} size={14} />
              <span>{article.native_language.charAt(0).toUpperCase() + article.native_language.slice(1)}</span>
            </div>
            <span>•</span>
            <span>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        {/* Spacer */}
        <div className="h-[23px] border-b border-gray-200/30"></div>
      </div>

      {/* Article Content */}
      <div className="flex-1 p-6">
        <div
          ref={contentRef}
          className="text-lg leading-relaxed text-gray-800 select-text whitespace-pre-wrap"
          style={{ 
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto'
          }}
          onMouseUp={handleTextSelection}
          onClick={handleHighlightClick}
          dangerouslySetInnerHTML={{ __html: formatArticleContent() }}
        />
      </div>

      {/* Text Selection Toolbar */}
      {showToolbar && (
        <TextSelectionToolbar
          position={selectionPosition}
          selectedText={selectedText}
          onQuerySubmit={handleQuerySubmit}
          onClose={() => setShowToolbar(false)}
        />
      )}

      {/* AI Response Floating Panel */}
      <AIResponseFloatingPanel
        isVisible={showFloatingPanel}
        selectedText={selectedText}
        queryType={floatingPanelData.queryType}
        aiResponse={floatingPanelData.aiResponse}
        isLoading={floatingPanelData.isLoading}
        hasError={floatingPanelData.hasError}
        onClose={handleFloatingPanelClose}
        onPlayPronunciation={handlePlayPronunciation}
        isPlaying={isPlaying}
      />

      {/* Custom Styles for Article Highlights */}
      <style jsx>{`
        :global(.article-highlight) {
          background: linear-gradient(145deg, #f3e8ff, #e9d5ff);
          border-radius: 4px;
          padding: 2px 6px;
          margin: 0 1px;
          box-shadow: 
            2px 2px 4px rgba(196, 132, 252, 0.2),
            -1px -1px 3px rgba(255, 255, 255, 0.8),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
          color: #7c3aed;
          font-weight: 500;
          transform: translateY(0);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-block;
          position: relative;
        }
        
        :global(.article-highlight:hover) {
          background: linear-gradient(145deg, #ede9fe, #ddd6fe);
          transform: translateY(-1px);
          box-shadow: 
            4px 4px 8px rgba(196, 132, 252, 0.3),
            -2px -2px 4px rgba(255, 255, 255, 0.9),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
          color: #6d28d9;
        }
        
        :global(.article-highlight:active) {
          transform: translateY(0);
          box-shadow: 
            1px 1px 2px rgba(196, 132, 252, 0.3),
            inset 0 2px 4px rgba(147, 51, 234, 0.15);
          background: linear-gradient(145deg, #ddd6fe, #c4b5fd);
        }
        
        :global(.article-highlight.animate-pulse) {
          animation: highlight-flash 1s ease-in-out;
        }
        
        @keyframes highlight-flash {
          0%, 100% { 
            background: linear-gradient(145deg, #f3e8ff, #e9d5ff);
            box-shadow: 
              2px 2px 4px rgba(196, 132, 252, 0.2),
              -1px -1px 3px rgba(255, 255, 255, 0.8);
          }
          50% { 
            background: linear-gradient(145deg, #ede9fe, #ddd6fe);
            box-shadow: 
              4px 4px 12px rgba(196, 132, 252, 0.4),
              -2px -2px 6px rgba(255, 255, 255, 1);
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  )
}