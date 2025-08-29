'use client'

import { useState, useEffect } from 'react'
import SimpleVoiceRecorder from './SimpleVoiceRecorder'
import IELTSTips from './IELTSTips'
import AskAI from './AskAI'
import TextSelectionToolbar from './TextSelectionToolbar'

interface SelectedEmailContent {
  id: string
  content: string
  type: 'query_response' | 'ai_response' | 'user_query'
  source: 'query_history'
  timestamp: string
  queryId?: string
}

interface BandedContent {
  band6: string
  band7: {
    examples: string
    explanation: string
  }
  band8: {
    examples: string
    explanation: string
  }
}

interface IELTSAnalysis {
  structure_recognition: string
  topic_category: string
  strategy: {
    planning: string
    recommended_structure: string
    phrases: BandedContent
    vocabulary: BandedContent
  }
  common_errors: string
}

interface QuestionData {
  part?: string
  question: string
  analysis: IELTSAnalysis
}

interface BandImprovement {
  direction: string
  examples: string
}

interface AnalysisDimension {
  problems: string
  improvements: {
    band6: BandImprovement
    band7: BandImprovement
    band8: BandImprovement
  }
}

interface AnswerAnalysis {
  content_completeness: AnalysisDimension
  sentence_variety: AnalysisDimension
  vocabulary_range: AnalysisDimension
  grammar_accuracy: AnalysisDimension
  coherence_cohesion: AnalysisDimension
}

interface AnswerData {
  part?: string
  answer: string
  analysis: AnswerAnalysis
}

// Question Cards Component
function QuestionCards({ data }: { data: QuestionData }) {
  const [visibleCards, setVisibleCards] = useState<number>(5) // Show all cards immediately
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  
  const handleCardFlip = (cardNumber: number) => {
    setFlippedCards(prev => new Set([...prev, cardNumber]))
  }

  const getPartColor = (part?: string) => {
    switch (part) {
      case 'Part1': return 'bg-purple-500'
      case 'Part2': return 'bg-purple-600'  
      case 'Part3': return 'bg-purple-700'
      default: return 'bg-purple-600'
    }
  }

  return (
    <div className="space-y-4">
      {/* Question Card */}
      {visibleCards >= 1 && (
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-purple-700">
              Question
            </h4>
            {data.part && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                {data.part}
              </span>
            )}
          </div>
          <div className="text-gray-800 bg-gray-50 p-4 rounded-lg">
            {data.question || 'Question content will appear here...'}
          </div>
        </div>
      )}

      {/* Analysis Card */}
      {visibleCards >= 2 && (
        <div 
          className={`bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fade-in card-flip-container ${
            flippedCards.has(2) ? '' : 'cursor-pointer hover:shadow-2xl'
          }`}
          onClick={() => !flippedCards.has(2) && handleCardFlip(2)}
        >
          {!flippedCards.has(2) ? (
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-purple-700">Question Analysis</h4>
                <div className="animate-pulse">
                  <svg className="w-6 h-6 text-purple-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Click to view analysis</p>
            </div>
          ) : (
            <div className="space-y-4 card-flip-enter-active">
              <div>
                <h4 className="font-medium text-purple-700 mb-2">Structure Recognition</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{data.analysis.structure_recognition}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-purple-700 mb-2">Topic Category</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">{data.analysis.topic_category}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Strategy Card */}
      {visibleCards >= 3 && (
        <div 
          className={`bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fade-in transition-all duration-600 transform-gpu perspective-1000 ${
            flippedCards.has(3) ? '' : 'cursor-pointer hover:shadow-2xl'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
          onClick={() => !flippedCards.has(3) && handleCardFlip(3)}
        >
          <div className={`transition-transform duration-600 ease-in-out ${
            flippedCards.has(3) ? 'rotateY-180' : ''
          }`} style={{ transformStyle: 'preserve-3d' }}>
            
            {/* Front Side - Title Only */}
            <div className={`${flippedCards.has(3) ? 'hidden' : 'block'}`}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-purple-700">Answer Strategy</h4>
                <div className="animate-pulse">
                  <svg className="w-6 h-6 text-purple-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Click to view strategy</p>
            </div>
            
            {/* Back Side - Full Content */}
            <div className={`${flippedCards.has(3) ? 'block' : 'hidden'} space-y-4`}>
              <div>
                <h4 className="font-medium text-purple-700 mb-2">Planning Approach</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{data.analysis.strategy.planning}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-purple-700 mb-2">Recommended Structure</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{data.analysis.strategy.recommended_structure}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Language Tools Card */}
      {visibleCards >= 4 && (
        <LanguageToolsCard 
          phrases={data.analysis.strategy.phrases}
          vocabulary={data.analysis.strategy.vocabulary}
          isFlipped={flippedCards.has(4)}
          onFlip={() => handleCardFlip(4)}
        />
      )}

      {/* Common Errors Card */}
      {visibleCards >= 5 && (
        <div 
          className={`bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fade-in transition-all duration-600 transform-gpu perspective-1000 ${
            flippedCards.has(5) ? '' : 'cursor-pointer hover:shadow-2xl'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
          onClick={() => !flippedCards.has(5) && handleCardFlip(5)}
        >
          <div className={`transition-transform duration-600 ease-in-out ${
            flippedCards.has(5) ? 'rotateY-180' : ''
          }`} style={{ transformStyle: 'preserve-3d' }}>
            
            {/* Front Side - Title Only */}
            <div className={`${flippedCards.has(5) ? 'hidden' : 'block'}`}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-purple-700">Common Errors</h4>
                <div className="animate-pulse">
                  <svg className="w-6 h-6 text-purple-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Click to view errors</p>
            </div>
            
            {/* Back Side - Full Content */}
            <div className={`${flippedCards.has(5) ? 'block' : 'hidden'}`}>
              <h4 className="font-medium text-purple-700 mb-2">Common Errors</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-line">{data.analysis.common_errors}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Answer Cards Component
function AnswerCards({ data }: { data: AnswerData }) {
  const [visibleCards, setVisibleCards] = useState<number>(6) // Show all cards immediately
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  
  const handleCardFlip = (cardNumber: number) => {
    setFlippedCards(prev => new Set([...prev, cardNumber]))
  }

  const getPartColor = (part?: string) => {
    switch (part) {
      case 'Part1': return 'bg-purple-500'
      case 'Part2': return 'bg-purple-600'  
      case 'Part3': return 'bg-purple-700'
      default: return 'bg-purple-600'
    }
  }

  return (
    <div className="space-y-4">
      {/* User Answer Card */}
      {visibleCards >= 1 && (
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-purple-700">
              Your Answer
            </h4>
            {data.part && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                {data.part}
              </span>
            )}
          </div>
          <div className="text-gray-800 bg-gray-50 p-4 rounded-lg">
            {data.answer || 'Your answer will appear here...'}
          </div>
        </div>
      )}

      {/* Content Completeness Card */}
      {visibleCards >= 2 && (
        <AnalysisDimensionCard 
          title="Content Completeness"
          dimension={data.analysis.content_completeness}
          cardNumber={2}
          isFlipped={flippedCards.has(2)}
          onFlip={() => handleCardFlip(2)}
        />
      )}

      {/* Sentence Variety Card */}
      {visibleCards >= 3 && (
        <AnalysisDimensionCard 
          title="Sentence Variety"
          dimension={data.analysis.sentence_variety}
          cardNumber={3}
          isFlipped={flippedCards.has(3)}
          onFlip={() => handleCardFlip(3)}
        />
      )}

      {/* Vocabulary Range Card */}
      {visibleCards >= 4 && (
        <AnalysisDimensionCard 
          title="Vocabulary Range"
          dimension={data.analysis.vocabulary_range}
          cardNumber={4}
          isFlipped={flippedCards.has(4)}
          onFlip={() => handleCardFlip(4)}
        />
      )}

      {/* Grammar Accuracy Card */}
      {visibleCards >= 5 && (
        <AnalysisDimensionCard 
          title="Grammar Accuracy"
          dimension={data.analysis.grammar_accuracy}
          cardNumber={5}
          isFlipped={flippedCards.has(5)}
          onFlip={() => handleCardFlip(5)}
        />
      )}

      {/* Coherence & Cohesion Card */}
      {visibleCards >= 6 && (
        <AnalysisDimensionCard 
          title="Coherence & Cohesion"
          dimension={data.analysis.coherence_cohesion}
          cardNumber={6}
          isFlipped={flippedCards.has(6)}
          onFlip={() => handleCardFlip(6)}
        />
      )}
    </div>
  )
}

// Analysis Dimension Card Component  
function AnalysisDimensionCard({ title, dimension, cardNumber, isFlipped, onFlip }: { 
  title: string, 
  dimension: AnalysisDimension,
  cardNumber: number,
  isFlipped: boolean,
  onFlip: () => void
}) {
  const [problemsVisible, setProblemsVisible] = useState(true)
  const [improvementsVisible, setImprovementsVisible] = useState(true)
  const [improvementsBand, setImprovementsBand] = useState<'band6' | 'band7' | 'band8'>('band6')

  const getBandColor = (band: string) => {
    switch (band) {
      case 'band6': return 'bg-purple-500'
      case 'band7': return 'bg-purple-600' 
      case 'band8': return 'bg-purple-700'
      default: return 'bg-purple-600'
    }
  }

  const getBandLabel = (band: string) => {
    switch (band) {
      case 'band6': return 'Band 6'
      case 'band7': return 'Band 7'
      case 'band8': return 'Band 8' 
      default: return band
    }
  }

  return (
    <div 
      className={`bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fade-in card-flip-container ${
        isFlipped ? '' : 'cursor-pointer hover:shadow-2xl'
      }`}
      onClick={() => !isFlipped && onFlip()}
    >
      {!isFlipped ? (
        <div>
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-purple-700">{title}</h4>
            <div className="animate-pulse">
              <svg className="w-6 h-6 text-purple-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Click to view analysis</p>
        </div>
      ) : (
        <div className="card-flip-enter-active">
          <h4 className="font-medium text-purple-700 mb-4">
            {title}
          </h4>
          
          {/* Vertical Layout - Problems Above, Improvements Below */}
          <div className="space-y-6">
            
            {/* Problems Section */}
            <div>
              <button
                onClick={() => setProblemsVisible(!problemsVisible)}
                className={`w-32 px-3 py-1 rounded-lg font-medium text-sm transition-all duration-200 mb-3 ${
                  problemsVisible
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Problems
              </button>
              
              {/* Problems Content */}
              {problemsVisible && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {dimension.problems}
                  </div>
                </div>
              )}
            </div>
            
            {/* Improvements Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setImprovementsVisible(!improvementsVisible)}
                  className={`w-32 px-3 py-1 rounded-lg font-medium text-sm transition-all duration-200 ${
                    improvementsVisible
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Improvements
                </button>
                
                {/* Band Buttons */}
                <div className="flex gap-1">
                  {(['band6', 'band7', 'band8'] as const).map((band) => (
                    <button
                      key={band}
                      onClick={() => {
                        setImprovementsBand(band)
                        setImprovementsVisible(true)
                      }}
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        improvementsVisible && improvementsBand === band
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {getBandLabel(band)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Improvements Content */}
              {improvementsVisible && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-700">
                      <strong>Direction:</strong> {dimension.improvements[improvementsBand].direction}
                    </div>
                    <div className="text-gray-700">
                      <strong>Examples:</strong> {dimension.improvements[improvementsBand].examples}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

// Language Tools Card Component
function LanguageToolsCard({ phrases, vocabulary, isFlipped, onFlip }: { 
  phrases: BandedContent, 
  vocabulary: BandedContent,
  isFlipped: boolean,
  onFlip: () => void 
}) {
  const [phrasesVisible, setPhrasesVisible] = useState(true)
  const [vocabularyVisible, setVocabularyVisible] = useState(true)
  const [phrasesBand, setPhrasesBand] = useState<'band6' | 'band7' | 'band8'>('band6')
  const [vocabularyBand, setVocabularyBand] = useState<'band6' | 'band7' | 'band8'>('band6')

  const getBandColor = (band: string) => {
    switch (band) {
      case 'band6': return 'bg-purple-500'
      case 'band7': return 'bg-purple-600' 
      case 'band8': return 'bg-purple-700'
      default: return 'bg-purple-600'
    }
  }

  const getBandLabel = (band: string) => {
    switch (band) {
      case 'band6': return 'Band 6'
      case 'band7': return 'Band 7'
      case 'band8': return 'Band 8' 
      default: return band
    }
  }

  const currentPhrasesBand = phrasesBand
  const currentVocabularyBand = vocabularyBand

  return (
    <div 
      className={`bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 animate-fade-in card-flip-container ${
        isFlipped ? '' : 'cursor-pointer hover:shadow-2xl'
      }`}
      onClick={() => !isFlipped && onFlip()}
    >
      {!isFlipped ? (
        <div>
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-purple-700">Language Tools</h4>
            <div className="animate-pulse">
              <svg className="w-6 h-6 text-purple-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Click to unlock tools</p>
        </div>
      ) : (
        <div className="card-flip-enter-active">
          <h4 className="font-medium text-purple-700 mb-4">Language Tools</h4>
          
          {/* Vertical Layout - Phrases Above, Vocabulary Below */}
          <div className="space-y-6">
            
            {/* Phrases Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setPhrasesVisible(!phrasesVisible)}
                  className={`w-24 px-3 py-1 rounded-lg font-medium text-sm transition-all duration-200 ${
                    phrasesVisible
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Phrases
                </button>
                
                {/* Phrases Band Buttons */}
                <div className="flex gap-1">
                  {(['band6', 'band7', 'band8'] as const).map((band) => (
                    <button
                      key={band}
                      onClick={() => {
                        setPhrasesBand(band)
                        setPhrasesVisible(true)
                      }}
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        phrasesVisible && phrasesBand === band
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {getBandLabel(band)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Phrases Content */}
              {phrasesVisible && (
                <div className="bg-gray-50 rounded-lg p-4">
                  {phrasesBand === 'band6' ? (
                    <div className="text-sm text-gray-700">
                      <strong>Examples:</strong> {phrases.band6}
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-700">
                        <strong>Examples:</strong> {phrases[phrasesBand].examples}
                      </div>
                      <div>
                        <strong>Explanation:</strong> 
                        <div className="mt-1 whitespace-pre-line text-gray-600">
                          {phrases[phrasesBand].explanation.replace(/\|/g, '\n')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Vocabulary Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setVocabularyVisible(!vocabularyVisible)}
                  className={`w-24 px-3 py-1 rounded-lg font-medium text-sm transition-all duration-200 ${
                    vocabularyVisible
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Vocabulary
                </button>
                
                {/* Vocabulary Band Buttons */}
                <div className="flex gap-1">
                  {(['band6', 'band7', 'band8'] as const).map((band) => (
                    <button
                      key={band}
                      onClick={() => {
                        setVocabularyBand(band)
                        setVocabularyVisible(true)
                      }}
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        vocabularyVisible && vocabularyBand === band
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {getBandLabel(band)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Vocabulary Content */}
              {vocabularyVisible && (
                <div className="bg-gray-50 rounded-lg p-4">
                  {vocabularyBand === 'band6' ? (
                    <div className="text-sm text-gray-700">
                      <strong>Examples:</strong> {vocabulary.band6}
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-700">
                        <strong>Examples:</strong> {vocabulary[vocabularyBand].examples}
                      </div>
                      <div>
                        <strong>Explanation:</strong> 
                        <div className="mt-1 whitespace-pre-line text-gray-600">
                          {vocabulary[vocabularyBand].explanation.replace(/\|/g, '\n')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function IELTSSpeaking() {
  const [questionResponse, setQuestionResponse] = useState('')
  const [answerResponse, setAnswerResponse] = useState('')
  const [isQuestionLoading, setIsQuestionLoading] = useState(false)
  const [isAnswerLoading, setIsAnswerLoading] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  
  // localStorage keys
  const QUESTION_STORAGE_KEY = 'ielts-question-response'
  const ANSWER_STORAGE_KEY = 'ielts-answer-response'
  const SELECTED_PART_KEY = 'ielts-selected-part'
  const USER_ANSWER_KEY = 'ielts-user-answer'
  
  // Text selection states  
  const [selectedText, setSelectedText] = useState('')
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null)
  const [showSelectionToolbar, setShowSelectionToolbar] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Email collection states (like Readlingua)
  const [selectedEmailContents, setSelectedEmailContents] = useState<SelectedEmailContent[]>([])
  const [showEmailPanel, setShowEmailPanel] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // Environment-aware webhook URLs (following JD2CV Full pattern)
  const questionWebhookUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5678/webhook/3bcd7132-a248-4700-af8c-e01d81a9d00a'
    : 'https://agentworkflow.stanleyhi.com/webhook/3bcd7132-a248-4700-af8c-e01d81a9d00a'
    
  const answerWebhookUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5678/webhook/682c8778-cd25-4c44-8c5b-421c599348ed'
    : 'https://agentworkflow.stanleyhi.com/webhook/682c8778-cd25-4c44-8c5b-421c599348ed'

  // Restore data from localStorage on component mount
  useEffect(() => {
    const savedQuestion = localStorage.getItem(QUESTION_STORAGE_KEY)
    const savedAnswer = localStorage.getItem(ANSWER_STORAGE_KEY)
    const savedPart = localStorage.getItem(SELECTED_PART_KEY)
    const savedUserAnswer = localStorage.getItem(USER_ANSWER_KEY)
    
    if (savedQuestion) setQuestionResponse(savedQuestion)
    if (savedAnswer) setAnswerResponse(savedAnswer)
    if (savedPart) setSelectedPart(savedPart)
    if (savedUserAnswer) setUserAnswer(savedUserAnswer)
  }, [])

  // Save data to localStorage when states change
  useEffect(() => {
    if (questionResponse) {
      localStorage.setItem(QUESTION_STORAGE_KEY, questionResponse)
    }
  }, [questionResponse])

  useEffect(() => {
    if (answerResponse) {
      localStorage.setItem(ANSWER_STORAGE_KEY, answerResponse)
    }
  }, [answerResponse])

  useEffect(() => {
    if (selectedPart) {
      localStorage.setItem(SELECTED_PART_KEY, selectedPart)
    }
  }, [selectedPart])

  useEffect(() => {
    if (userAnswer) {
      localStorage.setItem(USER_ANSWER_KEY, userAnswer)
    }
  }, [userAnswer])

  // Email collection functions (copied from Readlingua)
  const addToEmailSelection = (content: Omit<SelectedEmailContent, 'id' | 'timestamp'>) => {
    const id = `email-content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const timestamp = new Date().toISOString()
    
    const newContent: SelectedEmailContent = {
      ...content,
      id,
      timestamp
    }
    
    setSelectedEmailContents(prev => [...prev, newContent])
  }

  const removeFromEmailSelection = (id: string) => {
    setSelectedEmailContents(prev => prev.filter(content => content.id !== id))
  }

  const clearEmailSelection = () => {
    setSelectedEmailContents([])
  }


  // Parse structured question response (direct JSON parsing)
  const formatQuestionResponse = (rawResponse: string) => {
    try {
      const parsed = JSON.parse(rawResponse)
      
      // Handle direct object format (n8n strong constraint)
      if (parsed.part && parsed.analysis) {
        return {
          part: parsed.part,
          question: parsed.question || '',
          analysis: parsed.analysis
        }
      }
    } catch (error) {
      console.error('JSON parsing error:', error)
    }
    return null
  }

  // Generate question by part (following JD2CV Full pattern)
  const generateQuestion = async (part: string) => {
    setIsQuestionLoading(true)
    setQuestionResponse('')
    setSelectedPart(part)
    
    try {
      // Create AbortController for 180s timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000) // 180 seconds
      
      try {
        const response = await fetch(questionWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text: `Generate an IELTS Speaking Part ${part} question` 
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId) // Clear timeout on success

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to generate question`)
        }
        
        const data = await response.text()
        setQuestionResponse(data)
      } catch (timeoutError) {
        clearTimeout(timeoutId)
        throw timeoutError // Re-throw to outer catch
      }
    } catch (error) {
      console.error('Error generating question:', error)
      if (error.name === 'AbortError') {
        setQuestionResponse('Error: Request timed out. Please try again.')
      } else {
        setQuestionResponse(`Error: ${error.message || 'Failed to generate question'}`)
      }
    } finally {
      setIsQuestionLoading(false)
    }
  }

  // Parse structured answer response (direct JSON parsing)
  const formatAnswerResponse = (rawResponse: string) => {
    try {
      const parsed = JSON.parse(rawResponse)
      
      // Handle direct object format (n8n strong constraint)
      if (parsed.part && parsed.analysis) {
        return {
          part: parsed.part,
          answer: parsed.answer || '',
          analysis: parsed.analysis
        }
      }
    } catch (error) {
      console.error('JSON parsing error:', error)
    }
    return null
  }

  // Submit answer for analysis (following JD2CV Full pattern)
  const submitAnswer = async () => {
    if (!userAnswer.trim() || !selectedPart) return

    setIsAnswerLoading(true)
    setAnswerResponse('')
    
    const answerWithPart = `Part ${selectedPart} - ${userAnswer}`
    
    try {
      // Create AbortController for 180s timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000) // 180 seconds
      
      try {
        const response = await fetch(answerWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text: answerWithPart 
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId) // Clear timeout on success

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to analyze answer`)
        }
        
        const data = await response.text()
        setAnswerResponse(data)
      } catch (timeoutError) {
        clearTimeout(timeoutId)
        throw timeoutError // Re-throw to outer catch
      }
    } catch (error) {
      console.error('Error analyzing answer:', error)
      if (error.name === 'AbortError') {
        setAnswerResponse('Error: Request timed out. Please try again.')
      } else {
        setAnswerResponse(`Error: ${error.message || 'Failed to analyze answer'}`)
      }
    } finally {
      setIsAnswerLoading(false)
    }
  }

  // Handle voice transcript
  const handleVoiceTranscript = (transcript: string) => {
    setUserAnswer(prev => prev ? prev + ' ' + transcript : transcript)
  }

  // TTS functionality
  const handlePlayPronunciation = async (text: string) => {
    if (isPlaying || !text.trim()) return
    
    setIsPlaying(true)
    try {
      const response = await fetch('/api/readlingua/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text.trim(),
          language: 'english' // Default to English
        })
      })
      
      if (response.ok) {
        const audioBlob = await response.blob()
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
      } else {
        const errorData = await response.json()
        console.error('Failed to get audio:', errorData.error)
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Error playing pronunciation:', error)
      setIsPlaying(false)
    }
  }

  // Handle text selection for toolbar (updated from Readlingua)
  const handleTextSelection = () => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    
    if (text && text.length > 0) {
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()
      
      if (rect) {
        setSelectedText(text)
        // Use viewport coordinates directly for fixed positioning
        setSelectionPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        })
        setShowSelectionToolbar(true)
      }
    } else {
      setShowSelectionToolbar(false)
    }
  }

  const handleSelectionPronunciation = async () => {
    if (selectedText) {
      await handlePlayPronunciation(selectedText)
      // Hide toolbar after click
      setShowSelectionToolbar(false)
      // Clear selection
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleAddToEmail = () => {
    if (selectedText) {
      // Add selected text to email collection (like Readlingua)
      addToEmailSelection({
        content: selectedText,
        type: 'ai_response', // Could be enhanced to detect actual type
        source: 'query_history'
      })
      
      // Hide toolbar after selection
      setShowSelectionToolbar(false)
      // Clear text selection
      window.getSelection()?.removeAllRanges()
    }
  }

  // Hide selection toolbar when clicking outside
  const handleDocumentClick = (e: MouseEvent) => {
    const target = e.target as Element
    if (!target.closest('.selection-toolbar') && !target.closest('.selectable-text')) {
      setShowSelectionToolbar(false)
    }
  }

  // Add document click listener
  useEffect(() => {
    document.addEventListener('click', handleDocumentClick)
    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  // Email sending functionality
  const collectStudyData = () => {
    const studyData: any = {}
    
    // Collect question data
    if (questionResponse && selectedPart) {
      const formatted = formatQuestionResponse(questionResponse)
      if (formatted) {
        studyData.question = {
          part: selectedPart,
          content: formatted.question,
          analysis: formatted.analysis
        }
      }
    }
    
    // Collect answer data
    if (answerResponse && userAnswer) {
      const formatted = formatAnswerResponse(answerResponse)
      if (formatted) {
        studyData.userAnswer = {
          content: userAnswer,
          analysis: formatted.analysis
        }
      }
    }
    
    // Note: Ask AI queries would be collected from a global store in real implementation
    // For now, we'll just send what we have
    
    return studyData
  }

  const handleSendEmail = async () => {
    if (!userEmail.trim() || isSendingEmail || selectedEmailContents.length === 0) return

    setIsSendingEmail(true)
    
    try {
      const response = await fetch('/api/readlingua/send-selected-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedContents: selectedEmailContents,
          userEmail: userEmail.trim()
        })
      })

      if (response.ok) {
        alert('Selected content sent successfully!')
        setShowEmailPanel(false)
        setUserEmail('')
        clearEmailSelection()
      } else {
        alert('Failed to send email. Please try again.')
      }
    } catch (error) {
      console.error('Email sending error:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendEmail()
    }
  }

  return (
    <div 
      className="h-full bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 selectable-text"
      onMouseUp={handleTextSelection}
    >
      <style jsx>{`
        .animate-fade-in {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .card-flip-container {
          transition: opacity 0.3s ease-in-out;
        }
        
        .card-flip-enter {
          opacity: 0;
          transform: scale(0.95);
        }
        
        .card-flip-enter-active {
          opacity: 1;
          transform: scale(1);
          transition: all 0.3s ease-out;
        }
        
        @keyframes clickPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .click-hint:hover {
          animation: clickPulse 1s ease-in-out infinite;
        }
      `}</style>
      {/* IELTS Tips Tooltip */}
      <IELTSTips show={isQuestionLoading || isAnswerLoading} />
      
      {/* Ask AI Component - Hidden when IELTS Tips is showing */}
      <AskAI show={!isQuestionLoading && !isAnswerLoading} />
      
      {/* Email Collection Button - Above Ask AI (like Readlingua) */}
      {!isQuestionLoading && !isAnswerLoading && (
        <div className="fixed bottom-[88px] right-6 z-20">
          <button
            onClick={() => setShowEmailPanel(!showEmailPanel)}
            className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group relative"
            style={{
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
            title="Send Selected Content"
          >
            <svg 
              className="w-5 h-5 text-purple-500 transition-transform duration-200" 
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            
            {/* Badge showing selected content count (like Readlingua) */}
            {selectedEmailContents.length > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
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
          <div className="fixed bottom-[152px] right-6 z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl min-w-80 transform transition-all duration-200"
            style={{
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Send Selected Content</span>
                <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
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
                  No content selected. Select text to add to email collection.
                </div>
              ) : (
                <>
                  {/* Email Input */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      onKeyDown={handleEmailKeyDown}
                      placeholder="Enter your email..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                      disabled={isSendingEmail}
                      autoFocus
                    />
                    <button
                      onClick={handleSendEmail}
                      disabled={!userEmail.trim() || isSendingEmail || selectedEmailContents.length === 0}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition-all"
                    >
                      {isSendingEmail ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Sending
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send
                        </>
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
      
      <div className="h-full flex gap-6">
        
        {/* Left Column - Question Generation */}
        <div className="flex-1 bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 flex flex-col">
          {/* Title and Part Buttons in one row */}
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Question</h2>
            <div className="flex gap-3 ml-8">
              {['1', '2', '3'].map((part) => (
                <button
                  key={part}
                  onClick={() => generateQuestion(part)}
                  disabled={isQuestionLoading}
                  className={`w-20 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 shadow-md hover:shadow-lg ${
                    isQuestionLoading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      : selectedPart === part
                      ? 'bg-purple-600 text-white shadow-purple-200'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  Part {part}
                </button>
              ))}
            </div>
          </div>

          {/* Question Response - Direct Cards Display */}
          <div className="flex-1">
            {isQuestionLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-sm">Generating question...</div>
              </div>
            ) : questionResponse ? (
              (() => {
                const formatted = formatQuestionResponse(questionResponse)
                if (formatted && formatted.analysis) {
                  return <QuestionCards data={formatted} />
                } else {
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-mono">
                        {questionResponse}
                      </pre>
                    </div>
                  )
                }
              })()
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-400 text-sm">
                Click a Part button to generate an IELTS question...
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Answer Analysis */}
        <div className="flex-1 bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 flex flex-col">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Answer</h2>
            <div className="flex items-center gap-4 ml-8">
              <button
                onClick={submitAnswer}
                disabled={!userAnswer.trim() || !selectedPart || isAnswerLoading}
                className={`w-20 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 shadow-md hover:shadow-lg ${
                  !userAnswer.trim() || !selectedPart || isAnswerLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {isAnswerLoading ? 'Analyzing...' : 'Submit'}
              </button>
              <span className="text-xs text-gray-500">Click microphone to record speech</span>
            </div>
          </div>
          
          {/* Recording Area */}
          <div className="mb-4">
            <div className="relative">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Start recording or type your answer here..."
                rows={4}
                className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none transition-colors"
              />
              <div className="absolute top-3 right-3">
                <SimpleVoiceRecorder onTranscript={handleVoiceTranscript} />
              </div>
            </div>
          </div>

          {/* Analysis Response - Answer Cards Display */}
          <div className="flex-1">
            {isAnswerLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-sm">Analyzing your answer...</div>
              </div>
            ) : answerResponse ? (
              (() => {
                const formatted = formatAnswerResponse(answerResponse)
                if (formatted && formatted.analysis) {
                  return <AnswerCards data={formatted} />
                } else {
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-mono">
                        {answerResponse}
                      </pre>
                    </div>
                  )
                }
              })()
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-400 text-sm">
                {!selectedPart 
                  ? 'First generate a question from the left panel, then record or type your answer...'
                  : 'Record or type your answer, then click Submit to get analysis...'
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Selection Toolbar (like Readlingua) */}
      {showSelectionToolbar && selectionPosition && (
        <TextSelectionToolbar
          position={selectionPosition}
          selectedText={selectedText}
          onPlayPronunciation={handleSelectionPronunciation}
          onAddToEmail={handleAddToEmail}
          onClose={() => setShowSelectionToolbar(false)}
          supportsPronunciation={true}
          isPlaying={isPlaying}
        />
      )}
    </div>
  )
}