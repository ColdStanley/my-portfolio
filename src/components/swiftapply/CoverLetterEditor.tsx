'use client'

import { useState, useRef, useEffect } from 'react'
import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'

export default function CoverLetterEditor() {
  const {
    personalInfo,
    jobTitle,
    jobDescription,
    ai: { generatedContent },
    coverLetter: { isGenerating, content, streamingContent, error }
  } = useSwiftApplyStore()

  const [editedContent, setEditedContent] = useState('')
  const streamRef = useRef<HTMLDivElement>(null)

  // Update edited content when generated content changes
  useEffect(() => {
    if (content) {
      setEditedContent(content)
    }
  }, [content])

  // Auto scroll to bottom during streaming
  useEffect(() => {
    if (streamRef.current && isGenerating) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight
    }
  }, [content, isGenerating])

  const canGenerate = () => {
    return personalInfo &&
           jobTitle.trim() &&
           jobDescription.trim() &&
           generatedContent?.workExperience &&
           !isGenerating
  }

  const handleGenerateCoverLetter = () => {
    if (!canGenerate()) return

    const { startCoverLetterGeneration } = useSwiftApplyStore.getState()
    startCoverLetterGeneration()
  }

  const handleConfirmAndPreview = () => {
    const { setCoverLetterContent, generateCoverLetterPDF } = useSwiftApplyStore.getState()
    setCoverLetterContent(editedContent)
    generateCoverLetterPDF(editedContent)
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 h-full flex flex-col border border-neutral-dark">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-light h-12 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Cover Letter Editor</h2>
        <Button
          onClick={handleConfirmAndPreview}
          variant="primary"
          size="sm"
          disabled={!content || isGenerating}
          className="text-xs px-3 py-1"
        >
          Confirm & Preview
        </Button>
      </div>

      {/* Second Section - Generation Controls */}
      <div className="px-6 py-2.5 border-b border-neutral-light flex items-center gap-3 h-16">
        <div className="flex-1 flex items-center gap-2">
          {!content && !isGenerating ? (
            <Button
              onClick={handleGenerateCoverLetter}
              variant="primary"
              disabled={!canGenerate()}
              size="sm"
              className="text-xs"
            >
              {!canGenerate()
                ? 'Complete Resume First'
                : 'Customize Cover Letter'
              }
            </Button>
          ) : isGenerating ? (
            <div className="flex items-center gap-2 text-primary">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="text-xs">Generating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-success">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Generated successfully!</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          {/* Streaming Display */}
          {isGenerating && (
            <div className="h-32 bg-surface border border-neutral-light rounded-lg p-4 overflow-hidden">
              <Input
                multiline
                value={(streamingContent || '') + '▊'}
                readOnly
                className="font-mono resize-none leading-relaxed h-full"
                containerClassName="h-full"
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-error/5 border border-error/20 rounded-lg">
              <div className="flex items-center gap-2 text-error text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
              <Button
                onClick={content ? handleConfirmAndPreview : handleGenerateCoverLetter}
                variant="ghost"
                size="sm"
                className="mt-2 text-error hover:text-error"
              >
                {content ? 'Try Preview Again' : 'Retry' }
              </Button>
            </div>
          )}

          {/* Editable Content */}
          <Input
            multiline
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder=""
            className="flex-1 resize-none"
            containerClassName="flex-1"
            disabled={isGenerating}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-neutral-light bg-surface/50 h-12 flex items-center">
        <div className="flex items-center text-xs text-text-secondary w-full">
          <span>Status: {isGenerating ? 'Generating' : content ? 'Ready for preview' : 'Waiting to generate'}</span>
          <span className="ml-2">Content: {editedContent.length} chars</span>
          <span className="ml-2">{editedContent.trim().split(/\s+/).filter(word => word.length > 0).length} words</span>
        </div>
      </div>
    </div>
  )
}
