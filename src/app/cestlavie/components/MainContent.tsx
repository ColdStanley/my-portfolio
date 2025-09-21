'use client'

import { useState } from 'react'


interface MainContentProps {
  activeMainTab: string
  onConfigClick?: () => void
}


export default function MainContent({ activeMainTab, onConfigClick }: MainContentProps) {

  const renderCareerContent = () => {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💼</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Career</h2>
          <p className="text-gray-500">Coming soon...</p>
        </div>
      </div>
    )
  }

  const renderLifeContent = () => {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Life</h2>
          <p className="text-gray-500">Coming soon...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeMainTab) {
      case 'life':
        return renderLifeContent()
      case 'career':
        return renderCareerContent()
      case 'study':
        return (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Study</h2>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        )
      default:
        return <div className="flex-1 p-6 text-gray-500">Select a tab to get started.</div>
    }
  }

  return (
    <div className="flex-1 flex relative">
      {renderContent()}
    </div>
  )
}