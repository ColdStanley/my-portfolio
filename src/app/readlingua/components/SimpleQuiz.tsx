'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useReadLinguaStore } from '../store/useReadLinguaStore'
import { quizManager, QuizSession, QuizQuestion } from '../utils/quizManager'
import { ttsApi } from '../utils/apiClient'

export default function SimpleQuiz() {
  const { queries, selectedArticle } = useReadLinguaStore()
  const [session, setSession] = useState<QuizSession | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect', correctAnswer?: string } | null>(null)
  const [autoPlayTimer, setAutoPlayTimer] = useState<NodeJS.Timeout | null>(null)

  // 订阅Quiz会话变化
  useEffect(() => {
    const unsubscribe = quizManager.subscribe(setSession)
    setSession(quizManager.getCurrentSession()) // 初始化
    return unsubscribe
  }, [])

  // 新题目2秒自动播放
  useEffect(() => {
    if (!session || session.isComplete) return
    
    const currentQuestion = session.questions[session.currentIndex]
    if (currentQuestion && selectedArticle) {
      // 清除之前的定时器
      if (autoPlayTimer) {
        clearTimeout(autoPlayTimer)
      }
      
      // 设置2秒后自动播放
      const timer = setTimeout(() => {
        handlePlayAudio(currentQuestion.text)
      }, 2000)
      
      setAutoPlayTimer(timer)
    }

    return () => {
      if (autoPlayTimer) {
        clearTimeout(autoPlayTimer)
      }
    }
  }, [session?.currentIndex, selectedArticle])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (autoPlayTimer) {
        clearTimeout(autoPlayTimer)
      }
    }
  }, [])

  // 检查是否可以生成Quiz
  const canGenerate = selectedArticle && quizManager.canGenerateQuiz(queries, selectedArticle.source_language)

  // 生成Quiz
  const handleGenerate = useCallback(() => {
    if (!selectedArticle || !canGenerate) return
    
    try {
      quizManager.generateQuestions(queries, selectedArticle.source_language)
      setCurrentAnswer('')
    } catch (error) {
      console.error('Quiz generation failed:', error)
    }
  }, [queries, selectedArticle, canGenerate])

  // 提交答案
  const handleSubmit = useCallback(() => {
    if (!currentAnswer.trim()) return
    
    const session = quizManager.getCurrentSession()
    const currentQuestion = session?.questions[session.currentIndex]
    
    const isCorrect = quizManager.submitAnswer(currentAnswer)
    setCurrentAnswer('') // 清空输入框
    
    // 显示反馈动画
    setFeedback({
      type: isCorrect ? 'correct' : 'incorrect',
      correctAnswer: !isCorrect ? currentQuestion?.text : undefined
    })
    
    // 3秒后隐藏反馈
    setTimeout(() => {
      setFeedback(null)
    }, 3000)
  }, [currentAnswer])


  // 播放发音
  const handlePlayAudio = useCallback(async (text: string) => {
    if (isPlaying || !selectedArticle) return

    setIsPlaying(true)
    try {
      const audioBlob = await ttsApi.getPronunciation(text, selectedArticle.source_language)
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate pronunciation')
      setIsPlaying(false)
    }
  }, [isPlaying, selectedArticle])

  // 处理Enter键提交
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }, [handleSubmit])

  // 当前题目
  const currentQuestion = session ? session.questions[session.currentIndex] : null
  const stats = quizManager.getStats()

  if (!canGenerate) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500 space-y-2">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
          <p className="text-sm">Dictation Quiz Not Available</p>
          {!selectedArticle ? (
            <p className="text-xs text-gray-400">No article selected</p>
          ) : !['english', 'french'].includes(selectedArticle.source_language) ? (
            <p className="text-xs text-gray-400">Language {selectedArticle.source_language} not supported</p>
          ) : queries.length === 0 ? (
            <p className="text-xs text-gray-400">No queries available. Try analyzing some text first.</p>
          ) : (
            <p className="text-xs text-gray-400">No valid queries for dictation</p>
          )}
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ready for Dictation Practice?</h3>
        <p className="text-sm text-gray-600 mb-4">
          {queries.filter(q => q.query_type !== 'ask_ai' && q.selected_text).length} queries available
        </p>
        <button
          onClick={handleGenerate}
          className="px-6 py-2 bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-white rounded-lg font-medium transition-all duration-300"
        >
          Start Quiz
        </button>
      </div>
    )
  }

  if (session.isComplete) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-primary rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Quiz Complete!</h3>
        </div>
        
        {stats && (
          <div className="bg-neutral-light rounded-lg p-4 mb-4">
            <div className="text-2xl font-bold text-primary mb-1">
              {stats.percentage}%
            </div>
            <div className="text-sm text-gray-600">
              {stats.correct} of {stats.total} correct
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Time: {Math.floor(stats.timeSpent / 60)}:{(stats.timeSpent % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => quizManager.restart()}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-primary border border-neutral-mid rounded-lg font-medium"
          >
            Try Again
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-white rounded-lg font-medium"
          >
            New Quiz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{session.currentIndex + 1} of {session.questions.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary to-primary h-2 rounded-full transition-all duration-300" 
            style={{width: `${((session.currentIndex + 1) / session.questions.length) * 100}%`}} 
          />
        </div>
      </div>

      {/* 当前题目 */}
      {currentQuestion && (
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6">
          {/* 单行布局：播放按钮 + 输入框 + 提交按钮 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePlayAudio(currentQuestion.text)}
              disabled={isPlaying}
              className="w-12 h-12 bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
            >
              {isPlaying ? (
                <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                </svg>
              )}
            </button>
            
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type what you hear..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
            
            <button
              onClick={handleSubmit}
              disabled={!currentAnswer.trim()}
              className="w-20 px-4 py-3 bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              Submit
            </button>
          </div>

          {/* 反馈动画区域 */}
          {feedback && (
            <div className={`mt-4 p-4 rounded-lg transition-all duration-500 transform ${
              feedback.type === 'correct' 
                ? 'bg-gradient-to-r from-neutral-light to-neutral-light border-l-4 border-primary'
                : 'bg-gradient-to-r from-neutral-light to-red-50 border-l-4 border-red-400'
            } animate-pulse`}>
              <div className="flex items-center gap-2">
                {feedback.type === 'correct' ? (
                  <svg className="w-6 h-6 text-primary animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                )}
                
                <div className="flex-1">
                  <p className={`font-medium ${feedback.type === 'correct' ? 'text-text-primary' : 'text-red-700'}`}>
                    {feedback.type === 'correct' ? 'Correct!' : 'Incorrect!'}
                  </p>
                  {feedback.correctAnswer && (
                    <p className="text-sm text-gray-600 mt-1">
                      Correct answer: <span className="font-medium text-primary">{feedback.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 统计信息 */}
          {stats && stats.total > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
              <span>Correct: {stats.correct}/{stats.total}</span>
              <span>Accuracy: {stats.percentage}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}