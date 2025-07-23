'use client'

import { useState } from 'react'

interface TaskExtensionModalProps {
  isOpen: boolean
  onExtend: (minutes: number) => void
  onComplete: () => void
  taskTitle: string
}

export default function TaskExtensionModal({
  isOpen,
  onExtend,
  onComplete,
  taskTitle
}: TaskExtensionModalProps) {
  const [extensionMinutes, setExtensionMinutes] = useState<string>('15')

  if (!isOpen) return null

  const handleExtend = () => {
    const minutes = parseInt(extensionMinutes) || 15
    onExtend(minutes)
    setExtensionMinutes('15') // Reset to default
  }

  const handleComplete = () => {
    onComplete()
    setExtensionMinutes('15') // Reset to default
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Task Time Reached
          </h3>
          <p className="text-sm text-gray-600">
            "{taskTitle}" has reached its scheduled end time.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-purple-700 mb-2">
            Extend task by (minutes):
          </label>
          <input
            type="number"
            min="1"
            max="120"
            value={extensionMinutes}
            onChange={(e) => setExtensionMinutes(e.target.value)}
            className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                      bg-white text-gray-900"
            placeholder="15"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExtend}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg 
                      hover:bg-purple-700 transition-colors font-medium"
          >
            Extend
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg 
                      hover:bg-gray-200 transition-colors font-medium border border-gray-300"
          >
            Complete Task
          </button>
        </div>
      </div>
    </div>
  )
}