'use client'

import { useState, type KeyboardEvent } from 'react'
import { toast } from 'sonner'
import { useReadLinguaStore } from './store/useReadLinguaStore'
import { emailApi } from './utils/apiClient'
import DashboardTab from './components/DashboardTab'
import LearningTab from './components/LearningTab'
import PageTransition from '@/components/PageTransition'

export default function ReadLinguaPage() {
  const {
    activeTab,
    setActiveTab,
    selectedEmailContents,
    showEmailPanel,
    setShowEmailPanel,
    clearEmailSelection,
    isLoading
  } = useReadLinguaStore()

  const [userEmail, setUserEmail] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [nativeLanguage, setNativeLanguage] = useState('chinese')
  const [learningLanguage, setLearningLanguage] = useState('english')

  const handleSendEmail = async () => {
    if (!userEmail.trim() || isSendingEmail || selectedEmailContents.length === 0) return

    setIsSendingEmail(true)

    try {
      await emailApi.sendSelectedContent({
        selectedContents: selectedEmailContents,
        userEmail: userEmail.trim()
      })

      toast.success('Selected content sent successfully!')
      setShowEmailPanel(false)
      setUserEmail('')
      clearEmailSelection()
    } catch (error) {
      console.error('Email sending error:', error)
      toast.error('Failed to send email. Please try again.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleEmailKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendEmail()
    }
  }

  const renderLanguageSelect = () => (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-text-secondary">From:</span>
      <select
        value={learningLanguage}
        onChange={(event) => setLearningLanguage(event.target.value)}
        className="border border-border px-2 py-1 text-text-primary focus:border-primary focus:outline-none"
      >
        <option value="english">English</option>
        <option value="chinese">中文</option>
        <option value="french">Français</option>
        <option value="japanese">日本語</option>
        <option value="korean">한국어</option>
        <option value="russian">Русký</option>
        <option value="spanish">Español</option>
        <option value="arabic">العربية</option>
      </select>

      <span className="text-text-secondary">→</span>

      <span className="text-text-secondary">To:</span>
      <select
        value={nativeLanguage}
        onChange={(event) => setNativeLanguage(event.target.value)}
        className="border border-border px-2 py-1 text-text-primary focus:border-primary focus:outline-none"
      >
        <option value="chinese">中文</option>
        <option value="english">English</option>
        <option value="french">Français</option>
        <option value="japanese">日本語</option>
        <option value="korean">한국어</option>
        <option value="russian">Русký</option>
        <option value="spanish">Español</option>
        <option value="arabic">العربية</option>
      </select>
    </div>
  )

  return (
    <PageTransition>
      <div className="flex h-screen flex-col overflow-hidden bg-surface">
        <header className="hidden flex-shrink-0 border-b border-border md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('learning')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'learning'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                Learning
              </button>
            </div>

            {activeTab === 'dashboard' && renderLanguageSelect()}
          </div>
        </header>

        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface md:hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-1 flex-col items-center gap-1 px-4 py-3 ${
                activeTab === 'dashboard' ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <span className="text-xs">Articles</span>
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`flex flex-1 flex-col items-center gap-1 px-4 py-3 ${
                activeTab === 'learning' ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <span className="text-xs">History</span>
            </button>
          </div>
        </nav>

        <main className="flex-1 min-h-0 overflow-hidden pb-20 md:pb-0">
          {activeTab === 'dashboard' ? (
            <div className="h-full min-h-0 md:mx-auto md:max-w-7xl md:px-4">
              <DashboardTab
                nativeLanguage={nativeLanguage}
                learningLanguage={learningLanguage}
              />
            </div>
          ) : (
            <LearningTab />
          )}
        </main>

        {!isLoading && activeTab === 'learning' && (
          <div className="fixed bottom-40 right-6 z-20 hidden md:block">
            <button
              onClick={() => setShowEmailPanel(!showEmailPanel)}
              className="relative flex h-10 w-10 items-center justify-center border border-border bg-surface"
              title="Send Selected Content"
            >
              <svg className="h-4 w-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>

              {selectedEmailContents.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {selectedEmailContents.length}
                </span>
              )}
            </button>
          </div>
        )}

        {showEmailPanel && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setShowEmailPanel(false)}
              aria-label="Close email panel"
            />

            <div className="fixed bottom-56 right-6 z-50 min-w-80 border border-border bg-surface">
              <div className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-text-primary">Send Selected Content</span>
                  <span className="rounded-full bg-accent px-2 py-1 text-xs font-medium text-black">
                    {selectedEmailContents.length} items
                  </span>
                  <button
                    onClick={() => setShowEmailPanel(false)}
                    className="ml-auto rounded p-1 transition-colors hover:bg-gray-100"
                  >
                    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {selectedEmailContents.length === 0 ? (
                  <div className="py-4 text-center text-sm text-gray-500">
                    No content selected. Select text from query history to add to email.
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(event) => setUserEmail(event.target.value)}
                        onKeyPress={handleEmailKeyPress}
                        placeholder="Enter your email..."
                        className="flex-1 rounded-lg border border-neutral-mid px-3 py-2 text-sm placeholder-text-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isSendingEmail}
                        autoFocus
                      />
                      <button
                        onClick={handleSendEmail}
                        disabled={!userEmail.trim() || isSendingEmail || selectedEmailContents.length === 0}
                        className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-neutral-mid"
                      >
                        {isSendingEmail ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          'Send'
                        )}
                      </button>
                    </div>

                    <p className="mt-2 text-center text-xs text-gray-600">
                      Send all selected content to your email
                    </p>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}
