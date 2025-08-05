'use client'

import { useState, useRef } from 'react'
import { marked } from 'marked'
import { Article, useReadLinguaStore } from '../store/useReadLinguaStore'
import { aiApi, queryApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'
import TextSelectionToolbar from './TextSelectionToolbar'

interface ArticleReaderProps {
  article: Article
}

export default function ArticleReader({ article }: ArticleReaderProps) {
  const [selectedText, setSelectedText] = useState('')
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
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
        setSelectionPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
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

      setShowToolbar(false)
      setShowQueryPanel(true)

      // Get selected AI model and custom prompt templates
      const { selectedAiModel, promptTemplates } = useReadLinguaStore.getState()
      const customPrompt = promptTemplates[queryType as keyof typeof promptTemplates]

      // Call AI API
      const aiResult = await aiApi.processQuery({
        selected_text: selectedText,
        query_type: queryType,
        user_question: userQuestion,
        source_language: article.source_language,
        native_language: article.native_language,
        ai_model: selectedAiModel,
        custom_prompt_template: customPrompt
      })

      // Generate highlight ID and position
      const highlightId = `highlight_${Date.now()}`
      const selection = window.getSelection()
      const range = selection?.getRangeAt(0)
      const textPosition = {
        start: 0, // TODO: Calculate actual position
        end: selectedText.length,
        highlight_id: highlightId
      }

      // Save query to database
      const newQuery = await queryApi.createQuery({
        article_id: article.id,
        user_id: userId,
        selected_text: selectedText,
        query_type: queryType,
        user_question: userQuestion,
        ai_response: aiResult.ai_response,
        text_position: textPosition
      })

      // Add to store
      useReadLinguaStore.getState().addQuery(newQuery)
      useReadLinguaStore.getState().setSelectedQuery(newQuery)

    } catch (error) {
      console.error('Error processing query:', error)
      alert('Failed to process query. Please try again.')
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
      console.log('Original content:', content.substring(0, 200) + '...')
      
      // Configure marked options for better rendering
      content = marked.parse(content, {
        breaks: true,        // Convert line breaks to <br>
        gfm: true,          // GitHub Flavored Markdown
        sanitize: false,    // Don't sanitize HTML (we'll handle it)
      })
      
      console.log('Parsed content:', content.substring(0, 200) + '...')
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
          const highlightSpan = `<span class="bg-purple-200 cursor-pointer hover:bg-purple-300 transition-colors rounded px-1" data-highlight-id="${query.text_position.highlight_id}" data-query-id="${query.id}">${searchText}</span>`
          // Only replace the first occurrence to avoid duplicates
          content = content.replace(searchText, highlightSpan)
        }
      }
    })

    return content
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Article Header */}
      <div className="p-6 pb-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
          <div className="text-sm text-gray-500">
            Learning: {article.source_language.toUpperCase()} | 
            Native: {article.native_language.toUpperCase()} | 
            {new Date(article.created_at).toLocaleDateString()}
          </div>
        </div>
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
    </div>
  )
}