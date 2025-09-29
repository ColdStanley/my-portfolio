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

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value
    debouncedUpdateDescription(value)
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 h-full flex flex-col border border-neutral-dark">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-light h-12 flex items-center">
        <h2 className="text-lg font-semibold text-text-primary">Job Description</h2>
      </div>

      {/* Job Title Input */}
      <div className="px-6 py-2.5 border-b border-neutral-light flex items-center gap-3 h-16">
        <label className="text-sm font-semibold text-text-primary whitespace-nowrap">
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
      <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
        <label className="block text-sm font-semibold text-text-primary mb-3">
          Job Description
        </label>
        <Input
          multiline
          value={jobDescription}
          onChange={handleDescriptionChange}
          placeholder="Paste the full job description here..."
          className="resize-none leading-relaxed flex-1"
          containerClassName="flex-1"
          aria-label="Job Description Input"
        />
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-4 border-t border-neutral-light bg-surface/50 h-12 flex items-center">
        <div className="flex items-center justify-between text-xs text-text-secondary w-full">
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
