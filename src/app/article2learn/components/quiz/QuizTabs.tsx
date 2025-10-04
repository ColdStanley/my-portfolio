'use client'

import { useState } from 'react'
import { theme } from '@/styles/theme.config'
import MatchGame from './MatchGame'
import FillBlankGame from './FillBlankGame'
import ArticleFillGame from './ArticleFillGame'
import WordTranslationMatchGame from './WordTranslationMatchGame'

export default function QuizTabs() {
  const [activeQuizTab, setActiveQuizTab] = useState<'match' | 'fillblank' | 'articlefill' | 'wordtranslation'>('match')

  return (
    <div className="flex h-full flex-col">
      {/* 二级 Tab 导航 */}
      <div className="border-b bg-white px-6" style={{ borderColor: theme.neutralDark }}>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveQuizTab('match')}
            className={`flex-shrink-0 rounded-t-lg border-b-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-out ${
              activeQuizTab === 'match' ? 'shadow-[0_-2px_8px_rgba(0,0,0,0.04)]' : 'hover:bg-neutral-50/50'
            }`}
            style={{
              borderColor: activeQuizTab === 'match' ? theme.primary : 'transparent',
              color: activeQuizTab === 'match' ? theme.primary : theme.textSecondary,
              backgroundColor: activeQuizTab === 'match' ? 'rgb(249, 250, 251)' : 'transparent',
            }}
          >
            Match Game
          </button>

          <button
            onClick={() => setActiveQuizTab('fillblank')}
            className={`flex-shrink-0 rounded-t-lg border-b-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-out ${
              activeQuizTab === 'fillblank' ? 'shadow-[0_-2px_8px_rgba(0,0,0,0.04)]' : 'hover:bg-neutral-50/50'
            }`}
            style={{
              borderColor: activeQuizTab === 'fillblank' ? theme.primary : 'transparent',
              color: activeQuizTab === 'fillblank' ? theme.primary : theme.textSecondary,
              backgroundColor: activeQuizTab === 'fillblank' ? 'rgb(249, 250, 251)' : 'transparent',
            }}
          >
            Fill in Blanks
          </button>

          <button
            onClick={() => setActiveQuizTab('articlefill')}
            className={`flex-shrink-0 rounded-t-lg border-b-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-out ${
              activeQuizTab === 'articlefill' ? 'shadow-[0_-2px_8px_rgba(0,0,0,0.04)]' : 'hover:bg-neutral-50/50'
            }`}
            style={{
              borderColor: activeQuizTab === 'articlefill' ? theme.primary : 'transparent',
              color: activeQuizTab === 'articlefill' ? theme.primary : theme.textSecondary,
              backgroundColor: activeQuizTab === 'articlefill' ? 'rgb(249, 250, 251)' : 'transparent',
            }}
          >
            Article Fill
          </button>

          <button
            onClick={() => setActiveQuizTab('wordtranslation')}
            className={`flex-shrink-0 rounded-t-lg border-b-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-out ${
              activeQuizTab === 'wordtranslation' ? 'shadow-[0_-2px_8px_rgba(0,0,0,0.04)]' : 'hover:bg-neutral-50/50'
            }`}
            style={{
              borderColor: activeQuizTab === 'wordtranslation' ? theme.primary : 'transparent',
              color: activeQuizTab === 'wordtranslation' ? theme.primary : theme.textSecondary,
              backgroundColor: activeQuizTab === 'wordtranslation' ? 'rgb(249, 250, 251)' : 'transparent',
            }}
          >
            Word-Translation Match
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto">
        {activeQuizTab === 'match' && <MatchGame />}
        {activeQuizTab === 'fillblank' && <FillBlankGame />}
        {activeQuizTab === 'articlefill' && <ArticleFillGame />}
        {activeQuizTab === 'wordtranslation' && <WordTranslationMatchGame />}
      </div>
    </div>
  )
}
