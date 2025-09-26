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
    <div className="bg-white rounded-xl shadow-sm border border-neutral-dark h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-light">
        <h2 className="text-lg font-semibold text-text-primary">Job Description</h2>
        <p className="text-sm text-text-secondary mt-1">
          Paste the job posting here to tailor your resume
        </p>
      </div>

      {/* Job Title Input */}
      <div className="p-4 border-b border-neutral-light">
        <label className="block text-sm font-medium text-text-primary mb-2">
          Job Title
        </label>
        <Input
          type="text"
          defaultValue={jobTitle}
          onChange={handleTitleChange}
          placeholder="e.g. Senior Software Engineer"
          aria-label="Job Title Input"
        />
      </div>

      {/* Job Description Textarea */}
      <div className="flex-1 p-4">
        <label className="block text-sm font-medium text-text-primary mb-2">
          Job Description
        </label>
        <Input
          multiline
          defaultValue={jobDescription}
          onChange={handleDescriptionChange}
          placeholder="Paste the full job description here..."
          className="h-full resize-none leading-relaxed"
          style={{ minHeight: '250px' }}
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