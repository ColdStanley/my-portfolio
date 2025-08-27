'use client'

import { useState, useRef } from 'react'

interface SimpleVoiceRecorderProps {
  onTranscript: (transcript: string) => void
}

export default function SimpleVoiceRecorder({ onTranscript }: SimpleVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef<string>('')

  const initializeRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      return null
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsRecording(true)
      finalTranscriptRef.current = ''
    }

    recognition.onresult = (event: any) => {
      let finalText = ''
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript
        }
      }
      finalTranscriptRef.current = finalText
    }

    recognition.onend = () => {
      setIsRecording(false)
      if (finalTranscriptRef.current.trim()) {
        onTranscript(finalTranscriptRef.current.trim())
      }
    }

    recognition.onerror = () => {
      setIsRecording(false)
    }

    return recognition
  }

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    } else {
      const recognition = initializeRecognition()
      if (recognition) {
        recognitionRef.current = recognition
        recognition.start()
      }
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <button
      onClick={toggleRecording}
      className={`p-2 rounded transition-colors ${
        isRecording 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-gray-600'
      }`}
      title={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
      </svg>
    </button>
  )
}