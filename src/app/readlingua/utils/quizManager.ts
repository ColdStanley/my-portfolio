// 简洁高效的Quiz管理器
// 替代复杂的Store quiz逻辑和UI状态管理

import type { Query } from '../store/useReadLinguaStore'

export interface QuizQuestion {
  id: string
  text: string // 要听写的原文
  userAnswer: string
  isCorrect: boolean | null
  isAnswered: boolean
  originalQuery: Query
}

export interface QuizSession {
  questions: QuizQuestion[]
  currentIndex: number
  totalCorrect: number
  totalAnswered: number
  isComplete: boolean
  startTime: number
}

class QuizManager {
  private currentSession: QuizSession | null = null
  private listeners: Array<(session: QuizSession | null) => void> = []

  // 生成Quiz题目 - 简化版本，只保留核心功能
  generateQuestions(queries: Query[], language: string): QuizSession {
    // 只支持英文和法文的听写
    const supportedLanguages = ['english', 'french']
    if (!supportedLanguages.includes(language)) {
      throw new Error(`Dictation not supported for ${language}`)
    }

    // 筛选有效的查询：排除ask_ai，必须有selected_text
    const validQueries = queries.filter(q => 
      q.query_type !== 'ask_ai' && 
      q.selected_text && 
      q.selected_text.trim().length > 0
    )

    if (validQueries.length === 0) {
      throw new Error('No valid queries for quiz generation')
    }

    // 打乱顺序并限制数量（最多10题，保持专注）
    const shuffled = [...validQueries].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, Math.min(10, shuffled.length))

    // 生成题目 - 简化逻辑，不需要复杂的AI响应解析
    const questions: QuizQuestion[] = selected.map((query, index) => ({
      id: `quiz-${query.id}-${index}`,
      text: query.selected_text!.trim(),
      userAnswer: '',
      isCorrect: null,
      isAnswered: false,
      originalQuery: query
    }))

    this.currentSession = {
      questions,
      currentIndex: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      isComplete: false,
      startTime: Date.now()
    }

    this.notifyListeners()
    return this.currentSession
  }

  // 提交答案 - 简化逻辑
  submitAnswer(answer: string): boolean {
    if (!this.currentSession || this.currentSession.isComplete) return false

    const session = this.currentSession
    const currentQuestion = session.questions[session.currentIndex]
    
    if (!currentQuestion || currentQuestion.isAnswered) return false

    // 更新题目状态
    currentQuestion.userAnswer = answer.trim()
    currentQuestion.isAnswered = true
    
    // 简化判分逻辑：忽略大小写和标点，只比较主要内容
    const normalizeText = (text: string) => 
      text.toLowerCase()
          .replace(/[^\w\s]/g, '') // 移除标点
          .replace(/\s+/g, ' ')    // 标准化空格
          .trim()

    currentQuestion.isCorrect = normalizeText(currentQuestion.text) === normalizeText(answer)

    // 更新会话统计
    session.totalAnswered++
    if (currentQuestion.isCorrect) {
      session.totalCorrect++
    }

    // 自动进入下一题或结束
    if (session.currentIndex < session.questions.length - 1) {
      session.currentIndex++
    } else {
      session.isComplete = true
    }

    this.notifyListeners()
    return currentQuestion.isCorrect
  }

  // 跳过当前题目
  skipQuestion(): void {
    if (!this.currentSession || this.currentSession.isComplete) return

    const session = this.currentSession
    const currentQuestion = session.questions[session.currentIndex]
    
    if (!currentQuestion || currentQuestion.isAnswered) return

    // 标记为已回答但错误
    currentQuestion.isAnswered = true
    currentQuestion.isCorrect = false
    currentQuestion.userAnswer = '(skipped)'
    
    session.totalAnswered++

    // 进入下一题或结束
    if (session.currentIndex < session.questions.length - 1) {
      session.currentIndex++
    } else {
      session.isComplete = true
    }

    this.notifyListeners()
  }

  // 重新开始当前会话
  restart(): void {
    if (!this.currentSession) return

    const session = this.currentSession
    
    // 重置所有题目状态
    session.questions.forEach(q => {
      q.userAnswer = ''
      q.isCorrect = null
      q.isAnswered = false
    })

    // 重置会话状态
    session.currentIndex = 0
    session.totalCorrect = 0
    session.totalAnswered = 0
    session.isComplete = false
    session.startTime = Date.now()

    this.notifyListeners()
  }

  // 获取当前会话
  getCurrentSession(): QuizSession | null {
    return this.currentSession
  }

  // 获取当前题目
  getCurrentQuestion(): QuizQuestion | null {
    if (!this.currentSession) return null
    return this.currentSession.questions[this.currentSession.currentIndex] || null
  }

  // 获取统计信息
  getStats(): { correct: number, total: number, percentage: number, timeSpent: number } | null {
    if (!this.currentSession) return null

    const session = this.currentSession
    const timeSpent = Math.round((Date.now() - session.startTime) / 1000) // 秒
    const percentage = session.totalAnswered > 0 
      ? Math.round((session.totalCorrect / session.totalAnswered) * 100)
      : 0

    return {
      correct: session.totalCorrect,
      total: session.totalAnswered,
      percentage,
      timeSpent
    }
  }

  // 清除当前会话
  clear(): void {
    this.currentSession = null
    this.notifyListeners()
  }

  // 订阅会话变化
  subscribe(listener: (session: QuizSession | null) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentSession))
  }

  // 判断是否可以生成Quiz
  canGenerateQuiz(queries: Query[], language: string): boolean {
    const supportedLanguages = ['english', 'french']
    if (!supportedLanguages.includes(language)) return false

    const validQueries = queries.filter(q => 
      q.query_type !== 'ask_ai' && 
      q.selected_text && 
      q.selected_text.trim().length > 0
    )

    return validQueries.length > 0
  }
}

// 全局Quiz管理器实例
export const quizManager = new QuizManager()

// React Hook for Quiz管理 (需要在使用时导入React)
export const createUseQuiz = () => {
  return () => {
    if (typeof window === 'undefined') {
      // SSR环境下的fallback
      return {
        session: null,
        currentQuestion: null,
        stats: null,
        actions: {
          generate: () => { throw new Error('Quiz not available in SSR') },
          submit: () => false,
          skip: () => {},
          restart: () => {},
          clear: () => {},
          canGenerate: () => false
        }
      }
    }

    // 这里需要在组件中使用时导入React hooks
    return {
      session: quizManager.getCurrentSession(),
      currentQuestion: quizManager.getCurrentQuestion(),
      stats: quizManager.getStats(),
      actions: {
        generate: (queries: Query[], language: string) => quizManager.generateQuestions(queries, language),
        submit: (answer: string) => quizManager.submitAnswer(answer),
        skip: () => quizManager.skipQuestion(),
        restart: () => quizManager.restart(),
        clear: () => quizManager.clear(),
        canGenerate: (queries: Query[], language: string) => quizManager.canGenerateQuiz(queries, language)
      }
    }
  }
}