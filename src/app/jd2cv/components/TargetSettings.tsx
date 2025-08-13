import { useState } from 'react'

interface TargetSettingsProps {
  targets: {
    dailyNewJD: number
    dailyApplications: number
    weeklyApplications: number
    monthlyApplications: number
  }
  onUpdate: (targets: Partial<{
    dailyNewJD: number
    dailyApplications: number
    weeklyApplications: number
    monthlyApplications: number
  }>) => void
  isOpen: boolean
  onClose: () => void
}

export default function TargetSettings({ targets, onUpdate, isOpen, onClose }: TargetSettingsProps) {
  const [localTargets, setLocalTargets] = useState(targets)

  const handleSave = () => {
    onUpdate(localTargets)
    onClose()
  }

  const handleCancel = () => {
    setLocalTargets(targets)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Target Settings</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily New JD Target
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={localTargets.dailyNewJD}
              onChange={(e) => setLocalTargets(prev => ({ 
                ...prev, 
                dailyNewJD: Math.max(1, parseInt(e.target.value) || 1)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Applications Target
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={localTargets.dailyApplications}
              onChange={(e) => setLocalTargets(prev => ({ 
                ...prev, 
                dailyApplications: Math.max(1, parseInt(e.target.value) || 1)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weekly Applications Target
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={localTargets.weeklyApplications}
              onChange={(e) => setLocalTargets(prev => ({ 
                ...prev, 
                weeklyApplications: Math.max(1, parseInt(e.target.value) || 1)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Applications Target
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={localTargets.monthlyApplications}
              onChange={(e) => setLocalTargets(prev => ({ 
                ...prev, 
                monthlyApplications: Math.max(1, parseInt(e.target.value) || 1)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}