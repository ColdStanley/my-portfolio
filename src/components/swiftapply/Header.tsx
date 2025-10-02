'use client'

import { useState, useEffect } from 'react'
import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import Button from '@/components/ui/button'
import { Dropdown, DropdownItem } from '@/components/ui/dropdown'

export default function Header() {
  const { openSettings, openAIParseMode, hasStoredData } = useSwiftApplyStore()
  const [showSetupMenu, setShowSetupMenu] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  // 只在客户端检查是否为新用户，避免 hydration mismatch
  useEffect(() => {
    setIsNewUser(!hasStoredData())
  }, [hasStoredData])


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
          <span className="px-2 py-1 bg-surface rounded-md">Profile Setup</span>
          →
          <span className="px-2 py-1 bg-surface rounded-md">Job Input</span>
          →
          <span className="px-2 py-1 bg-surface rounded-md">Resume (Customization, Edit, PDF Download)</span>
          →
          <span className="px-2 py-1 bg-surface rounded-md">Cover Letter (Customization, Edit, PDF Download)</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-3">

          {/* Setup Button with Dropdown */}
          <div className="relative">
            <Button
              onClick={() => setShowSetupMenu(!showSetupMenu)}
              variant={isNewUser ? "primary" : "secondary"}
              size="sm"
              className={`flex items-center gap-2 ${isNewUser ? 'animate-pulse' : ''}`}
              aria-label="Setup Options"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Setup</span>
            </Button>

            <Dropdown
              isOpen={showSetupMenu}
              onClose={() => setShowSetupMenu(false)}
              align="right"
            >
              <DropdownItem
                onClick={() => {
                  openSettings()
                  setShowSetupMenu(false)
                }}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              >
                Manual Input
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  openAIParseMode()
                  setShowSetupMenu(false)
                }}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                }
              >
                Upload PDF
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

    </header>
  )
}