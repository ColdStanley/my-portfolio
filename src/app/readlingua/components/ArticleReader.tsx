'use client'

import React, { useState, useRef, useMemo, memo } from 'react'
import { Article, useReadLinguaStore } from '../store/useReadLinguaStore'
import { aiApi, queryApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'
import TextSelectionToolbar from './TextSelectionToolbar'
import FlagIcon from './FlagIcon'
import { formatArticleContent } from '../utils/contentCache'

interface ArticleReaderProps {
  article: Article
}

const ArticleReader = memo<ArticleReaderProps>(({ article }) => {
  const [selectedText, setSelectedText] = useState('')
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const [streamingTooltips, setStreamingTooltips] = useState<Map<string, string>>(new Map())
  const contentRef = useRef<HTMLDivElement>(null)
  const { queries, setShowQueryPanel, addAITooltip, updateAITooltip, selectedAiModel, getCurrentPromptTemplates, addQuery } = useReadLinguaStore()

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

      // Hide toolbar 
      setShowToolbar(false)

      // Create stream key for this query
      const streamKey = `${queryType}-${selectedText}-${Date.now()}`
      
      // Calculate center position for new tooltip
      const centerX = window.innerWidth / 2 - Math.min(700, window.innerWidth * 0.9) / 2
      const centerY = window.innerHeight / 2 - Math.min(600, window.innerHeight * 0.85) / 2

      // Add new tooltip to store
      const tooltipId = addAITooltip({
        selectedText: selectedText,
        queryType: queryType,
        aiResponse: '',
        isLoading: true,
        hasError: false,
        position: { x: centerX, y: centerY },
        userQuestion: userQuestion
      })

      // Store tooltip ID for streaming updates
      setStreamingTooltips(prev => new Map(prev.set(streamKey, tooltipId)))

      // Generate highlight ID for later use
      const highlightId = `highlight_${Date.now()}`

      // Get custom prompt templates
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
        // onChunk - update tooltip in real-time
        (chunk: string) => {
          fullResponse += chunk
          updateAITooltip(tooltipId, {
            aiResponse: fullResponse,
            isLoading: true
          })
        },
        // onComplete - save to database
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
            addQuery(newQuery)
            useReadLinguaStore.getState().setSelectedQuery(newQuery)
            setShowQueryPanel(true)
            
            // Final update to tooltip
            updateAITooltip(tooltipId, {
              aiResponse: finalResponse,
              isLoading: false,
              hasError: false
            })
            
          } catch (dbError) {
            console.error('Error saving query to database:', dbError)
            // Still show the response but mark as error in console
            updateAITooltip(tooltipId, {
              aiResponse: finalResponse,
              isLoading: false,
              hasError: false  // Don't show error to user if DB save fails
            })
          }
          
          // Clean up stream key
          setStreamingTooltips(prev => {
            const newMap = new Map(prev)
            newMap.delete(streamKey)
            return newMap
          })
        },
        // onError - handle streaming errors
        (error: string) => {
          console.error('Streaming error:', error)
          updateAITooltip(tooltipId, {
            aiResponse: `Error: ${error}. Please try again.`,
            isLoading: false,
            hasError: true
          })
          
          // Clean up stream key
          setStreamingTooltips(prev => {
            const newMap = new Map(prev)
            newMap.delete(streamKey)
            return newMap
          })
        }
      )

    } catch (error) {
      console.error('Error processing query:', error)
      // Note: Error handling for tooltip is done in the API stream error handler above
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

  // 优化：使用缓存的内容格式化，避免每次渲染都重新处理
  const formattedContent = useMemo(() => {
    return formatArticleContent(article.id, article.content, queries)
  }, [article.id, article.content, queries])



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
          dangerouslySetInnerHTML={{ __html: formattedContent }}
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
}, (prevProps, nextProps) => {
  // 自定义比较函数 - 只在article内容真正改变时重渲染
  return (
    prevProps.article.id === nextProps.article.id &&
    prevProps.article.content === nextProps.article.content &&
    prevProps.article.title === nextProps.article.title &&
    prevProps.article.source_language === nextProps.article.source_language &&
    prevProps.article.native_language === nextProps.article.native_language
  )
})

ArticleReader.displayName = 'ArticleReader'

export default ArticleReader