'use client'

import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import Button from '@/components/ui/button'

export default function Header() {
  const { openSettings } = useSwiftApplyStore()


  return (
    <header className="h-16 bg-white border-b border-neutral-dark shadow-sm">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm0 6h6v2H7v-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-primary">
            SwiftApply
          </h1>
        </div>

        {/* Usage Flow */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-text-secondary">
          <span className="px-2 py-1 bg-gray-200 rounded-md">Profile Setup</span>
          →
          <span className="px-2 py-1 bg-gray-200 rounded-md">Job Input</span>
          →
          <span className="px-2 py-1 bg-gray-200 rounded-md">Resume Customization</span>
          →
          <span className="px-2 py-1 bg-gray-200 rounded-md">Edit & Preview</span>
          →
          <span className="px-2 py-1 bg-gray-200 rounded-md">Download PDF</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-3">

          {/* Settings Button */}
          <Button
            onClick={() => openSettings()}
            variant="ghost"
            size="sm"
            className="p-2 text-text-secondary hover:text-primary"
            title="Settings"
            aria-label="Open Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Button>
        </div>
      </div>

    </header>
  )
}