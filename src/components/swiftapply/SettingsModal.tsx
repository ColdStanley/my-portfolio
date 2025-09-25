'use client'

import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import StepPersonalInfo from './StepPersonalInfo'
import StepTemplates from './StepTemplates'

export default function SettingsModal() {
  const { settingsStep, closeSettings, openSettings } = useSwiftApplyStore()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50">
      <div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 id="settings-title" className="text-lg sm:text-xl font-bold text-gray-900">
              Setup Your Resume
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Step {settingsStep} of 2
            </p>
          </div>

          <button
            onClick={closeSettings}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step Navigation */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-center space-x-8">
            {/* Step 1: Personal Info */}
            <button
              onClick={() => openSettings(1)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                settingsStep === 1
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                settingsStep === 1
                  ? 'bg-white text-purple-600'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="font-medium">Personal Info</span>
            </button>

            {/* Connector Line */}
            <div className="w-16 h-0.5 bg-gray-200"></div>

            {/* Step 2: Templates */}
            <button
              onClick={() => openSettings(2)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                settingsStep === 2
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                settingsStep === 2
                  ? 'bg-white text-purple-600'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="font-medium">Templates</span>
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${(settingsStep - 1) * 50}%)`,
              width: '200%'
            }}
          >
            {/* Step 1: Personal Info */}
            <div className="w-1/2 flex-shrink-0">
              <StepPersonalInfo />
            </div>

            {/* Step 2: Templates */}
            <div className="w-1/2 flex-shrink-0">
              <StepTemplates />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}