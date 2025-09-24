'use client'

import { useCallback } from 'react'
import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import { debounce } from '@/lib/swiftapply/utils'

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
        <p className="text-sm text-gray-500 mt-1">
          Paste the job posting here to tailor your resume
        </p>
      </div>

      {/* Job Title Input */}
      <div className="p-4 border-b border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title
        </label>
        <input
          type="text"
          defaultValue={jobTitle}
          onChange={handleTitleChange}
          placeholder="e.g. Senior Software Engineer"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-700 placeholder-gray-400"
          aria-label="Job Title Input"
        />
      </div>

      {/* Job Description Textarea */}
      <div className="flex-1 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Description
        </label>
        <textarea
          defaultValue={jobDescription}
          onChange={handleDescriptionChange}
          placeholder="Paste the full job description here..."
          className="w-full h-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-700 placeholder-gray-400 leading-relaxed"
          style={{ minHeight: '250px' }}
          aria-label="Job Description Input"
        />
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
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