'use client'

import { useReadLinguaStore } from '../store/useReadLinguaStore'

export default function ModelSelector() {
  const { selectedAiModel, setSelectedAiModel } = useReadLinguaStore()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">AI Model:</span>
      <div className="flex rounded-lg border border-gray-200 bg-white">
        <button
          onClick={() => setSelectedAiModel('deepseek')}
          className={`px-3 py-1 text-sm font-medium rounded-l-lg whitespace-nowrap flex items-center gap-1 ${
            selectedAiModel === 'deepseek'
              ? 'bg-purple-500 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          DeepSeek
        </button>
        <button
          onClick={() => setSelectedAiModel('openai')}
          className={`px-3 py-1 text-sm font-medium rounded-r-lg whitespace-nowrap flex items-center gap-1 ${
            selectedAiModel === 'openai'
              ? 'bg-purple-500 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
          </svg>
          OpenAI
        </button>
      </div>
    </div>
  )
}