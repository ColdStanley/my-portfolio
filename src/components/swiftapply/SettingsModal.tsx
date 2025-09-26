'use client'

import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import StepPersonalInfo from './StepPersonalInfo'
import StepTemplates from './StepTemplates'
import Button from '@/components/ui/button'

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
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-dark bg-surface">
          <div>
            <h2 id="settings-title" className="text-lg sm:text-xl font-bold text-text-primary">
              Setup Your Resume
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Step {settingsStep} of 2
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={closeSettings}
            className="w-8 h-8 p-0"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Step Navigation */}
        <div className="px-4 sm:px-6 py-4 bg-surface border-b border-neutral-light">
          <div className="flex items-center justify-center space-x-8">
            {/* Step 1: Personal Info */}
            <button
              onClick={() => openSettings(1)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                settingsStep === 1
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-text-secondary hover:text-primary hover:bg-surface'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                settingsStep === 1
                  ? 'bg-white text-primary'
                  : 'bg-neutral-light text-text-secondary'
              }`}>
                1
              </div>
              <span className="font-medium">Personal Info</span>
            </button>

            {/* Connector Line */}
            <div className="w-16 h-0.5 bg-neutral-light"></div>

            {/* Step 2: Templates */}
            <button
              onClick={() => openSettings(2)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                settingsStep === 2
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-text-secondary hover:text-primary hover:bg-surface'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                settingsStep === 2
                  ? 'bg-white text-primary'
                  : 'bg-neutral-light text-text-secondary'
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