'use client'

import { useState, useEffect } from 'react'

interface IELTSTipsProps {
  show: boolean
}

interface Tip {
  english: string
  chinese: string
}

export default function IELTSTips({ show }: IELTSTipsProps) {
  const [tips, setTips] = useState<Tip[]>([])
  const [currentTip, setCurrentTip] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [tipKey, setTipKey] = useState(0)

  // Load tips from JSON file
  useEffect(() => {
    const loadTips = async () => {
      try {
        const response = await fetch('/ielts-tips.json')
        const data = await response.json()
        setTips(data.tips)
        
        // Set initial random tip with random language
        if (data.tips.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.tips.length)
          const randomLanguage = Math.random() < 0.5 ? 'chinese' : 'english'
          setCurrentTip(data.tips[randomIndex][randomLanguage])
          setCurrentIndex(randomIndex)
        }
      } catch (error) {
        console.error('Failed to load IELTS tips:', error)
        setCurrentTip('保持冷静，自然地说话')
      }
    }

    if (show) {
      loadTips()
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [show])

  // Auto scroll through tips with smooth transition
  useEffect(() => {
    if (!show || tips.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const randomIndex = Math.floor(Math.random() * tips.length)
        const randomLanguage = Math.random() < 0.5 ? 'chinese' : 'english'
        setCurrentTip(tips[randomIndex][randomLanguage])
        setTipKey(prev => prev + 1) // Force re-render for animation
        return randomIndex
      })
    }, 7000) // Change tip every 7 seconds

    return () => clearInterval(interval)
  }, [show, tips])

  if (!show && !isVisible) return null

  return (
    <div 
      className={`fixed inset-0 bg-black/30 flex items-center justify-center z-50 transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-10 max-w-lg mx-4 transform transition-all duration-500 ease-out ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Tip Content */}
        <div className="text-center">
          <div 
            key={tipKey}
            className="text-gray-800 leading-relaxed min-h-[100px] flex items-center justify-center text-base font-medium animate-fade-in"
            style={{
              animation: 'fadeInSlide 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}
          >
            {currentTip}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center mt-8 space-x-3">
          {tips.slice(0, 3).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-700 ease-out ${
                index === currentIndex % 3 
                  ? 'bg-purple-500 scale-125' 
                  : 'bg-gray-300 scale-100'
              }`}
            />
          ))}
        </div>

        {/* Processing indicator */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInSlide {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeInSlide 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  )
}