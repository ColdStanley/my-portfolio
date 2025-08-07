'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceRecorderProps {
  onTranscript: (transcript: string, duration: number) => void
  disabled?: boolean
}

export default function VoiceRecorder({ onTranscript, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [duration, setDuration] = useState(0)
  const [practiceCount, setPracticeCount] = useState(0)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<any>(null)
  const startTimeRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const finalTranscriptRef = useRef<string>('')

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
  }, [])

  // Initialize Speech Recognition
  const initializeRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition. Please use Chrome or Edge.')
      return null
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started')
      setIsRecording(true)
      startTimeRef.current = Date.now()
      finalTranscriptRef.current = '' // 重置累积文本
      setTranscript('')
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setDuration(elapsed)
      }, 1000)
    }

    recognition.onresult = (event: any) => {
      let newFinalText = ''
      let interimText = ''

      // 处理所有结果（包括历史结果）
      for (let i = 0; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          newFinalText += transcriptPart
        } else {
          interimText += transcriptPart
        }
      }

      // 更新累积的最终文本
      finalTranscriptRef.current = newFinalText
      
      // 显示：累积的最终文本 + 当前临时文本
      const completeTranscript = finalTranscriptRef.current + interimText
      setTranscript(completeTranscript)
      
      console.log('🎤 Final so far:', finalTranscriptRef.current)
      console.log('🎤 Interim:', interimText)
      console.log('🎤 Complete display:', completeTranscript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      stopRecording()
    }

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended')
      stopRecording()
    }

    return recognition
  }

  const startRecording = () => {
    if (disabled) return
    
    const recognition = initializeRecognition()
    if (!recognition) return

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    setIsRecording(false)
    
    // 使用累积的最终文本发送结果
    const completeText = finalTranscriptRef.current.trim()
    console.log('🎤 Stopping recording, final text:', completeText)
    
    if (completeText) {
      const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000)
      onTranscript(completeText, finalDuration)
      setPracticeCount(prev => prev + 1)
    }
  }

  const resetRecording = () => {
    setTranscript('')
    setDuration(0)
    finalTranscriptRef.current = ''
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-red-600 text-sm">
          <svg className="w-5 h-5 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          Speech recognition not supported.<br/>Please use Chrome or Edge browser.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="text-center space-y-3">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`w-20 h-20 rounded-full text-2xl font-medium flex items-center justify-center transition-all ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? '⏹️' : '🎤'}
        </button>
        
        {/* Duration Display */}
        <div className="text-lg font-mono text-gray-700">
          {formatDuration(duration)}
        </div>
        
        {/* Reset Button */}
        {transcript && !isRecording && (
          <button
            onClick={resetRecording}
            className="w-24 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1 mx-auto"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
            Reset
          </button>
        )}
      </div>

      {/* Practice Stats */}
      {practiceCount > 0 && (
        <div className="text-center text-sm text-gray-500">
          Practice attempts: {practiceCount}
        </div>
      )}

      {/* Live Transcript */}
      {transcript && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Live Transcript:</div>
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            {transcript}
          </div>
        </div>
      )}

      {/* Recording Status */}
      {isRecording && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Recording... Speak clearly in English
          </div>
        </div>
      )}
    </div>
  )
}