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
          onClick={handleGenerateCoverLetter}
          variant="primary"
          disabled={!canGenerate()}
          size="sm"
          className="text-xs px-3 py-1"
        >
          {!canGenerate()
            ? 'Complete Resume First'
            : 'Customize Cover Letter'
          }
        </Button>
      </div>

      {/* Second Section - Streaming Display */}
      <div className="px-6 py-2.5 border-b border-neutral-light h-16 flex items-center">
        {isGenerating && (
          <div className="flex-1 bg-surface border border-neutral-light rounded-lg p-2 overflow-hidden">
            <div className="text-xs text-text-secondary line-clamp-2 leading-tight">
              {(streamingContent || '') + '▊'}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
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

      {/* Footer */}
      <div className="px-6 py-4 border-t border-neutral-light bg-surface/50 h-12 flex items-center justify-between">
        <div className="flex items-center text-xs text-text-secondary">
          <span>Status: {isGenerating ? 'Generating' : content ? 'Ready for preview' : 'Waiting to generate'}</span>
          <span className="ml-2">Content: {editedContent.length} chars</span>
          <span className="ml-2">{editedContent.trim().split(/\s+/).filter(word => word.length > 0).length} words</span>
        </div>
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
    </div>
  )
}
