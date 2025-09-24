'use client'

import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import StepPersonalInfo from './StepPersonalInfo'
import StepTemplates from './StepTemplates'

export default function SettingsModal() {
  const { settingsStep, closeSettings } = useSwiftApplyStore()

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

        {/* Progress Bar */}
        <div className="h-2 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${settingsStep * 50}%` }}
            role="progressbar"
            aria-valuenow={settingsStep * 50}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Step Content */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${(settingsStep - 1) * 100}%)`,
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