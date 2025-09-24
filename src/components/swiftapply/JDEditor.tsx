'use client'

import { useCallback } from 'react'
import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import { debounce } from '@/lib/swiftapply/utils'

export default function JDEditor() {
  const { jobDescription, setJobDescription } = useSwiftApplyStore()

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((value: string) => {
      setJobDescription(value)
    }, 300),
    [setJobDescription]
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    // Immediate UI update
    debouncedUpdate(value)
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

      {/* Text Area */}
      <div className="flex-1 p-4">
        <textarea
          defaultValue={jobDescription}
          onChange={handleChange}
          placeholder="Paste the Job Description here..."
          className="w-full h-full resize-none border-none outline-none text-sm lg:text-base text-gray-700 placeholder-gray-400 leading-relaxed"
          style={{ minHeight: '300px' }}
          aria-label="Job Description Input"
        />
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {jobDescription.length} characters
          </span>
          <span>
            {jobDescription.trim().split(/\s+/).filter(word => word.length > 0).length} words
          </span>
        </div>
      </div>
    </div>
  )
}