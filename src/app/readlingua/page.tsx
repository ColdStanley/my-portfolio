'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useReadLinguaStore } from './store/useReadLinguaStore'
import { emailApi } from './utils/apiClient'
import DashboardTab from './components/DashboardTab'
import LearningTab from './components/LearningTab'
import NewNavbar from '@/components/NewNavbar'
import FooterSection from '@/components/FooterSection'
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
  
  // Email states
  const [userEmail, setUserEmail] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // Email sending functionality
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

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendEmail()
    }
  }

  return (
    <>
      <PageTransition>
        <div className="min-h-screen bg-surface">
      {/* Desktop Tab Navigation - Fixed at top */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 py-6 pt-6">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-3 py-3 sm:px-6 sm:py-4 text-center font-medium transition-all duration-300 transform hover:scale-105 text-sm sm:text-base rounded-l-xl shadow-lg ${
                activeTab === 'dashboard'
                  ? 'text-white'
                  : 'text-text-primary bg-white hover:bg-neutral-light'
              }`}
              style={activeTab === 'dashboard' ? { backgroundColor: 'var(--primary)' } : {}}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Articles</span>
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`flex-1 px-3 py-3 sm:px-6 sm:py-4 text-center font-medium transition-all duration-300 transform hover:scale-105 text-sm sm:text-base rounded-r-xl shadow-lg ${
                activeTab === 'learning'
                  ? 'text-white'
                  : 'text-text-primary bg-white hover:bg-neutral-light'
              }`}
              style={activeTab === 'learning' ? { backgroundColor: 'var(--primary)' } : {}}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="hidden sm:inline">Learning</span>
              <span className="sm:hidden">History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-neutral-mid shadow-lg">
        <div className="flex">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 px-4 py-3 flex flex-col items-center gap-1 transition-all ${
              activeTab === 'dashboard'
                ? 'text-primary bg-neutral-light'
                : 'text-text-secondary hover:text-primary'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            <span className="text-xs font-medium">Articles</span>
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`flex-1 px-4 py-3 flex flex-col items-center gap-1 transition-all ${
              activeTab === 'learning'
                ? 'text-primary bg-neutral-light'
                : 'text-text-secondary hover:text-primary'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-xs font-medium">History</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="pb-20 md:pb-0">
        {activeTab === 'dashboard' && (
          <div className="md:max-w-7xl md:mx-auto md:px-4">
            <DashboardTab />
          </div>
        )}
        {activeTab === 'learning' && <LearningTab />}
      </div>

      {/* Email Sending Button - Fixed position, above Ask AI button */}
      {!isLoading && activeTab === 'learning' && (
        <div className="hidden md:block fixed bottom-40 right-6 z-20">
          <button
            onClick={() => setShowEmailPanel(!showEmailPanel)}
            className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group relative"
            title="Send Selected Content"
          >
            <svg
              className="w-5 h-5 text-primary transition-transform duration-200" 
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            
            {/* Badge showing selected content count */}
            {selectedEmailContents.length > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-black text-xs font-bold rounded-full flex items-center justify-center">
                {selectedEmailContents.length}
              </div>
            )}
          </button>
        </div>
      )}
      
      {/* Email Input Panel */}
      {showEmailPanel && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
            onClick={() => setShowEmailPanel(false)}
          />
          
          {/* Email Panel */}
          <div className="fixed bottom-56 right-6 z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl min-w-80 transform transition-all duration-200">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-text-primary">Send Selected Content</span>
                <div className="text-xs text-black bg-accent px-2 py-1 rounded-full font-medium">
                  {selectedEmailContents.length} items
                </div>
                <button
                  onClick={() => setShowEmailPanel(false)}
                  className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedEmailContents.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-4">
                  No content selected. Select text from query history to add to email.
                </div>
              ) : (
                <>
                  {/* Email Input */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      onKeyPress={handleEmailKeyPress}
                      placeholder="Enter your email..."
                      className="flex-1 px-3 py-2 border border-neutral-mid rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-text-muted"
                      disabled={isSendingEmail}
                      autoFocus
                    />
                    <button
                      onClick={handleSendEmail}
                      disabled={!userEmail.trim() || isSendingEmail || selectedEmailContents.length === 0}
                      className="px-4 py-2 bg-primary hover:brightness-110 disabled:bg-neutral-mid disabled:cursor-not-allowed text-white rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition-all"
                    >
                      {isSendingEmail ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Send'
                      )}
                    </button>
                  </div>

                  <div className="mt-2 text-xs text-gray-600 text-center">
                    Send all selected content to your email
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
      
      <FooterSection />
    </div>
      </PageTransition>
    </>
  )
}