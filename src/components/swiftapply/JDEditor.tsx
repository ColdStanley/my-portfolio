'use client'

import { useCallback } from 'react'
import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import { debounce } from '@/lib/swiftapply/utils'
import Input from '@/components/ui/input'

export default function JDEditor() {
  const { jobTitle, jobDescription, setJobTitle, setJobDescription } = useSwiftApplyStore()

  // Debounced update functions
  const debouncedUpdateTitle = useCallback(
    debounce((value: string) => {
      setJobTitle(value)
    }, 300),
    [setJobTitle]
  )

  const debouncedUpdateDescription = useCallback(
    debounce((value: string) => {
      setJobDescription(value)
    }, 300),
    [setJobDescription]
  )

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    debouncedUpdateTitle(value)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    debouncedUpdateDescription(value)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--neutral-dark)] h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-light">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Job Description</h2>
      </div>

      {/* Job Title Input */}
      <div className="px-4 py-4 border-b border-neutral-light flex items-center gap-3">
        <label className="text-sm font-medium text-[var(--text-primary)] whitespace-nowrap">
          Job Title
        </label>
        <Input
          type="text"
          defaultValue={jobTitle}
          onChange={handleTitleChange}
          placeholder="e.g. Senior Software Engineer"
          aria-label="Job Title Input"
          containerClassName="flex-1"
        />
      </div>

      {/* Job Description Textarea */}
      <div className="flex-1 min-h-0 flex flex-col px-4 pb-2">
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Job Description
        </label>
        <Input
          multiline
          defaultValue={jobDescription}
          onChange={handleDescriptionChange}
          placeholder="Paste the full job description here..."
          className="flex-1 min-h-0 resize-none leading-relaxed"
          containerClassName="flex-1 min-h-0 flex"
          aria-label="Job Description Input"
        />
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-neutral-light bg-surface/50">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>
            Title: {jobTitle.length} chars
          </span>
          <span>
            Description: {jobDescription.length} chars
          </span>
          <span>
            {jobDescription.trim().split(/\s+/).filter(word => word.length > 0).length} words
          </span>
        </div>
      </div>
    </div>
  )
}
